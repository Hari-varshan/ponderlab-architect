import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Processing…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ponder-muted">
      <Loader2 className="h-8 w-8 animate-spin text-ponder-cyan" />
      <p className="text-sm tracking-wide">{label}</p>
    </div>
  );
}
