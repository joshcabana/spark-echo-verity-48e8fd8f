import { useState, useEffect, useRef, useCallback } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
  ILocalVideoTrack,
} from "agora-rtc-sdk-ng";

interface UseAgoraCallParams {
  appId: string;
  channel: string;
  token: string | null;
  uid: number;
  enabled: boolean;
}

/**
 * Creates an anonymized video track by drawing the camera feed to a canvas
 * with a heavy pixelation filter, then capturing the canvas as a MediaStream.
 * This ensures the remote user never receives the raw camera stream pre-Spark.
 */
function createAnonymizedTrack(
  cameraTrack: ICameraVideoTrack,
  canvas: HTMLCanvasElement,
): { processedTrack: MediaStreamTrack; stopLoop: () => void } {
  const ctx = canvas.getContext("2d")!;
  const video = document.createElement("video");
  video.srcObject = new MediaStream([cameraTrack.getMediaStreamTrack()]);
  video.muted = true;
  video.playsInline = true;
  video.play();

  canvas.width = 320;
  canvas.height = 240;

  let running = true;

  const draw = () => {
    if (!running) return;

    // Draw camera frame at very low resolution for pixelation
    const pixelSize = 12;
    const w = canvas.width / pixelSize;
    const h = canvas.height / pixelSize;

    ctx.imageSmoothingEnabled = false;
    // Draw small
    ctx.drawImage(video, 0, 0, w, h);
    // Scale back up — creates pixelation effect
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  const stream = canvas.captureStream(15);
  const processedTrack = stream.getVideoTracks()[0];

  return {
    processedTrack,
    stopLoop: () => {
      running = false;
      video.pause();
      video.srcObject = null;
    },
  };
}

export function useAgoraCall({ appId, channel, token, uid, enabled }: UseAgoraCallParams) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localTracksRef = useRef<{
    audio: IMicrophoneAudioTrack | null;
    video: ICameraVideoTrack | null;
    customTrack: ILocalVideoTrack | null;
  }>({
    audio: null,
    video: null,
    customTrack: null,
  });
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const stopLoopRef = useRef<(() => void) | null>(null);

  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = useCallback(async () => {
    if (!appId || !channel || !enabled) return;

    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (remoteUser: IAgoraRTCRemoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === "video" && remoteVideoRef.current) {
          remoteUser.videoTrack?.play(remoteVideoRef.current);
          setIsRemoteConnected(true);
        }
        if (mediaType === "audio") {
          remoteUser.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (_remoteUser: IAgoraRTCRemoteUser, mediaType) => {
        if (mediaType === "video") {
          setIsRemoteConnected(false);
        }
      });

      client.on("user-left", () => {
        setIsRemoteConnected(false);
      });

      await client.join(appId, channel, token || null, uid);

      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      localTracksRef.current.audio = audioTrack;
      localTracksRef.current.video = videoTrack;

      // Create anonymized track from canvas processing
      const { processedTrack, stopLoop } = createAnonymizedTrack(videoTrack, canvasRef.current);
      stopLoopRef.current = stopLoop;

      const customVideoTrack = AgoraRTC.createCustomVideoTrack({
        mediaStreamTrack: processedTrack,
      });
      localTracksRef.current.customTrack = customVideoTrack;

      // Play original camera locally so user sees themselves clearly
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Publish anonymized track to remote users
      await client.publish([audioTrack, customVideoTrack]);
      setIsJoined(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to join call";
      console.error("Agora join error:", err);
      setError(message);
      const { audio, video, customTrack } = localTracksRef.current;
      audio?.close();
      video?.close();
      customTrack?.close();
      localTracksRef.current = { audio: null, video: null, customTrack: null };
      stopLoopRef.current?.();
      stopLoopRef.current = null;
      if (clientRef.current) {
        try { await clientRef.current.leave(); } catch { /* ignore */ }
        clientRef.current = null;
      }
    }
  }, [appId, channel, token, uid, enabled]);

  /**
   * Swap from anonymized track to raw camera track (mutual Spark reveal).
   * Called externally when server confirms mutual Spark.
   */
  const revealIdentity = useCallback(async () => {
    const client = clientRef.current;
    const rawVideo = localTracksRef.current.video;
    const anonTrack = localTracksRef.current.customTrack;

    if (!client || !rawVideo || !anonTrack || isRevealed) return;

    try {
      // Unpublish anonymized, publish raw camera
      await client.unpublish(anonTrack);
      anonTrack.close();
      stopLoopRef.current?.();
      stopLoopRef.current = null;

      await client.publish(rawVideo);
      localTracksRef.current.customTrack = null;
      setIsRevealed(true);
    } catch (err) {
      console.error("Failed to reveal identity track:", err);
    }
  }, [isRevealed]);

  const leave = useCallback(async () => {
    const { audio, video, customTrack } = localTracksRef.current;
    audio?.close();
    video?.close();
    customTrack?.close();
    localTracksRef.current = { audio: null, video: null, customTrack: null };
    stopLoopRef.current?.();
    stopLoopRef.current = null;

    if (clientRef.current) {
      await clientRef.current.leave();
      clientRef.current = null;
    }
    setIsJoined(false);
    setIsRemoteConnected(false);
    setIsRevealed(false);
  }, []);

  const toggleMic = useCallback(async () => {
    const track = localTracksRef.current.audio;
    if (track) {
      await track.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  }, [micOn]);

  const toggleCamera = useCallback(async () => {
    const track = localTracksRef.current.video;
    if (track) {
      await track.setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  }, [cameraOn]);

  useEffect(() => {
    if (enabled && appId && channel) {
      join();
    }
    return () => {
      leave();
    };
  }, [enabled, appId, channel, join, leave]);

  return {
    localVideoRef,
    remoteVideoRef,
    isRemoteConnected,
    isJoined,
    isRevealed,
    micOn,
    cameraOn,
    error,
    leave,
    toggleMic,
    toggleCamera,
    revealIdentity,
  };
}
