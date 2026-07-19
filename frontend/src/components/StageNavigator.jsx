import { Check, Circle, FileOutput, Layers, Sparkles, Type } from "lucide-react";

const STAGES = [
  { id: 1, label: "Concept", icon: Sparkles },
  { id: 2, label: "Title", icon: Type },
  { id: 3, label: "Metadata", icon: Layers },
  { id: 4, label: "Export", icon: FileOutput },
];

export default function StageNavigator({ currentStage }) {
  return (
    <nav className="mb-10" aria-label="Workflow progress">
      <ol className="flex items-center justify-between gap-2">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isComplete = currentStage > stage.id;
          const isActive = currentStage === stage.id;
          const isLast = index === STAGES.length - 1;

          return (
            <li key={stage.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border transition-all",
                    isComplete
                      ? "border-ponder-cyan bg-ponder-cyan/20 text-ponder-cyan shadow-glow-sm"
                      : isActive
                        ? "border-ponder-cyan bg-ponder-cyan/10 text-ponder-cyan shadow-glow"
                        : "border-ponder-border bg-ponder-surface text-ponder-muted",
                  ].join(" ")}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : isActive ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={[
                    "text-xs font-medium uppercase tracking-wider",
                    isActive || isComplete ? "text-ponder-cyan" : "text-ponder-muted",
                  ].join(" ")}
                >
                  {stage.id}. {stage.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={[
                    "mx-2 mb-6 h-px flex-1",
                    isComplete ? "bg-ponder-cyan/60" : "bg-ponder-border",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
