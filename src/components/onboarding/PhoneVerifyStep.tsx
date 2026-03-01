import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Phone, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthCapabilities } from "@/hooks/useAuthCapabilities";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

interface PhoneVerifyStepProps {
  onNext: (verified: boolean) => void;
}

const PhoneVerifyStep = ({ onNext }: PhoneVerifyStepProps) => {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { data: authCapabilities, refetch: refetchAuthCapabilities, isFetching: checkingAuthCapabilities } = useAuthCapabilities();
  const { data: featureFlags } = useFeatureFlags();
  const requirePhoneVerificationEnabled = featureFlags?.requirePhoneVerification ?? true;
  const phoneProviderUnavailable = authCapabilities?.phoneEnabled === false;
  const allowFallbackContinue = phoneProviderUnavailable && !requirePhoneVerificationEnabled;
  const blockInStrictMode = phoneProviderUnavailable && requirePhoneVerificationEnabled;

  const formatAuPhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0")) return "+61" + digits.slice(1);
    if (digits.startsWith("61")) return "+" + digits;
    if (digits.startsWith("+61")) return digits;
    return "+61" + digits;
  };

  const handleSendOtp = async () => {
    const formatted = formatAuPhone(phone);
    if (formatted.length < 12) {
      toast({ title: "Invalid number", description: "Please enter an Australian mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (error) throw error;
      setOtpSent(true);
      toast({ title: "Code sent", description: "Check your phone for a verification code." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast({ title: "Something went wrong", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      const formatted = formatAuPhone(phone);
      const { error } = await supabase.auth.verifyOtp({
        phone: formatted,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      onNext(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast({ title: "Invalid code", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (blockInStrictMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center px-6"
      >
        <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
          Phone verification is unavailable
        </h2>
        <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
          Our SMS provider is currently unavailable. Phone verification is required in strict mode.
          Please retry shortly.
        </p>
        <Button
          variant="gold"
          size="lg"
          onClick={() => void refetchAuthCapabilities()}
          disabled={checkingAuthCapabilities}
          className="w-full max-w-sm"
        >
          {checkingAuthCapabilities ? "Checking..." : "Retry verification check"}
        </Button>
      </motion.div>
    );
  }

  if (allowFallbackContinue) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center px-6"
      >
        <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
          Phone verification is temporarily offline
        </h2>
        <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
          Continuity mode is active while our SMS provider is unavailable.
          You can continue onboarding and verify your phone later.
        </p>
        <Button variant="gold" size="lg" onClick={() => onNext(false)} className="w-full max-w-sm">
          Continue for now
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center px-6"
    >
      <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
        {otpSent ? "Verify your number" : "Add your phone"}
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
        {otpSent
          ? "Enter the 6-digit code we just sent."
          : "Phone verification keeps Verity safe and bot-free. We never share your number."}
      </p>

      {!otpSent ? (
        <div className="w-full max-w-sm space-y-4">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="04XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-11 h-12 bg-card border-border"
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
            />
          </div>
          <Button
            variant="gold"
            size="lg"
            onClick={handleSendOtp}
            className="group w-full"
            disabled={loading || phone.length < 8}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Send verification code
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-12 bg-card border-border text-center text-lg tracking-[0.5em] font-mono"
            onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
          />
          <Button
            variant="gold"
            size="lg"
            onClick={handleVerifyOtp}
            className="group w-full"
            disabled={loading || otp.length < 6}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Verify
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default PhoneVerifyStep;
