import { Atom, Github } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(56,189,248,0.08), transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.15)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />

      <header className="relative border-b border-ponder-border/80 bg-ponder-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-ponder-cyan/40 bg-ponder-cyan/10 shadow-glow-sm">
              <Atom className="h-5 w-5 text-ponder-cyan" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Ponder Lab Content Architect
              </h1>
              <p className="text-xs text-ponder-muted">
                Scientific audio · human-in-the-loop pipeline
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1 text-xs text-ponder-muted sm:flex">
            <Github className="h-3.5 w-3.5" />
            Internal tool
          </span>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
