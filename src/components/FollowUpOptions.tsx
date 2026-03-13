import { motion } from "framer-motion";
import { Search, Calculator, Code, FileText, ImageIcon, Sparkles } from "lucide-react";

interface FollowUpOption {
  label: string;
  query: string;
}

interface FollowUpOptionsProps {
  options: FollowUpOption[];
  onSelect: (query: string) => void;
  accentColor?: string;
  icon?: React.ElementType;
}

const letters = ["A", "B", "C", "D", "E", "F"];

export function FollowUpOptions({ options, onSelect, accentColor = "primary", icon: Icon = Search }: FollowUpOptionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Choose a topic to explore further:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.slice(0, 6).map((option, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.query)}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {letters[i]}
            </span>
            <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
              {option.label}
            </span>
            <Icon className="h-3.5 w-3.5 shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
