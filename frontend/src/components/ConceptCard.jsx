import { Clock, Heart, Layers, Sparkles } from "lucide-react";

export default function ConceptCard({ concept, onSelect, disabled }) {
  return (
    <article className="ponder-card flex flex-col gap-4">
      <header className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-widest text-ponder-cyan/80">
          {concept.use_case}
        </p>
        <h3 className="text-lg font-semibold text-white">{concept.concept_name}</h3>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-md border border-ponder-border px-2 py-1 text-ponder-muted">
          <Clock className="h-3.5 w-3.5" />
          {concept.duration_hours}h
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-ponder-border px-2 py-1 text-ponder-muted">
          <Layers className="h-3.5 w-3.5" />
          {concept.noise_stack}
        </span>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-slate-300">{concept.video_idea}</p>

      <p className="text-sm leading-relaxed text-slate-200">
        <Heart className="mr-1 inline h-3.5 w-3.5 text-ponder-cyan" />
        {concept.audience_benefit_reasoning}
      </p>

      <p className="text-xs text-ponder-muted">
        <Sparkles className="mr-1 inline h-3 w-3 text-ponder-blue" />
        {concept.differentiator}
      </p>

      <button
        type="button"
        className="ponder-btn-primary mt-2 w-full"
        onClick={() => onSelect(concept)}
        disabled={disabled}
      >
        Select this Concept
      </button>
    </article>
  );
}
