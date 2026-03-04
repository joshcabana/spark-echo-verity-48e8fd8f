import { motion } from "framer-motion";
import { FileText, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface ReplayCardProps {
  replay: {
    id: string;
    spark_id: string;
    status: string;
    duration_seconds: number;
    created_at: string;
    partner_name: string;
  };
  index: number;
  isSubscriber: boolean;
  onView: (replay: ReplayCardProps["replay"]) => void;
  onUpgrade: () => void;
}

const ReplayCard = ({ replay, index, isSubscriber, onView, onUpgrade }: ReplayCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-4 flex items-center gap-4">
          {/* Icon area */}
          <div className="relative w-16 h-16 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
            {!isSubscriber ? (
              <button onClick={onUpgrade} className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-lg">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </button>
            ) : (
              <button onClick={() => onView(replay)} className="w-full h-full flex items-center justify-center hover:bg-primary/10 rounded-lg transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{replay.partner_name}</p>
            <p className="text-xs text-muted-foreground">
              {replay.duration_seconds}s moment · {formatDistanceToNow(new Date(replay.created_at), { addSuffix: true })}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Session notes & AI insights
            </p>
          </div>

          {/* CTA for non-subscribers */}
          {!isSubscriber && (
            <Button variant="outline" size="sm" onClick={onUpgrade} className="shrink-0 text-xs">
              Unlock
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReplayCard;
