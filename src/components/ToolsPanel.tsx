import { FileText, Sparkles, Code, Brain, PenTool, Globe, BarChart3, Share2 } from "lucide-react";

const tools = [
  { icon: FileText, label: "Summarize Article", color: "text-primary" },
  { icon: Sparkles, label: "Generate Presentation", color: "text-accent" },
  { icon: PenTool, label: "Write Blog Post", color: "text-primary" },
  { icon: Code, label: "Create Code", color: "text-accent" },
  { icon: BarChart3, label: "Business Plan", color: "text-primary" },
  { icon: Brain, label: "Explain Topic", color: "text-accent" },
  { icon: Globe, label: "Translate", color: "text-primary" },
  { icon: Share2, label: "Social Posts", color: "text-accent" },
];

export function ToolsPanel() {
  return (
    <div className="hidden w-64 border-l border-border bg-card p-4 xl:block">
      <h3 className="mb-4 text-sm font-heading font-semibold text-foreground">AI Tools</h3>
      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.label}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted p-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-surface-elevated hover:text-foreground"
          >
            <tool.icon className={`h-4 w-4 shrink-0 ${tool.color}`} />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
