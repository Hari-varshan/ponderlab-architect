import { AlertCircle, ArrowRight, CheckCircle2, RotateCcw, Wand2 } from "lucide-react";
import ConceptCard from "./components/ConceptCard.jsx";
import Layout from "./components/Layout.jsx";
import StageNavigator from "./components/StageNavigator.jsx";
import Spinner from "./components/ui/Spinner.jsx";
import { useWorkflow, WORKFLOW_STATES } from "./hooks/useWorkflow.js";

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button type="button" className="text-red-300 hover:text-white" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}

export default function App() {
  const workflow = useWorkflow();
  const {
    state,
    vibe,
    setVibe,
    concepts,
    titles,
    bundle,
    updateBundle,
    error,
    clearError,
    historyCount,
    currentStage,
    isLoading,
    resetWorkflow,
    startIdeasGeneration,
    selectConcept,
    selectTitle,
    commitToRepository,
    WORKFLOW_STATES: STATES,
  } = workflow;

  return (
    <Layout>
      <StageNavigator currentStage={currentStage} />
      <ErrorBanner message={error} onDismiss={clearError} />

      {/* Stage 1: Concept */}
      {(currentStage === 1 || state === STATES.SELECTING_IDEA) && (
        <section className="space-y-8">
          <div className="ponder-card max-w-2xl">
            <label htmlFor="vibe" className="mb-2 block text-sm font-medium text-slate-200">
              Creative vibe
            </label>
            <textarea
              id="vibe"
              className="ponder-textarea"
              rows={3}
              placeholder="e.g. deep REM sleep, layered pink+brown, cave-like warmth, 8 hours…"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              disabled={isLoading}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="ponder-btn-primary"
                onClick={startIdeasGeneration}
                disabled={isLoading || !vibe.trim()}
              >
                <Wand2 className="h-4 w-4" />
                Generate Concepts
                <ArrowRight className="h-4 w-4" />
              </button>
              {historyCount > 0 && (
                <span className="text-xs text-ponder-muted">
                  Loaded {historyCount} rows from repository memory
                </span>
              )}
            </div>
          </div>

          {state === STATES.GENERATING_IDEAS && (
            <Spinner label="Architecting 3 unique sound-design concepts…" />
          )}

          {state === STATES.SELECTING_IDEA && concepts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {concepts.map((concept) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  onSelect={selectConcept}
                  disabled={isLoading}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Stage 2: Title */}
      {currentStage === 2 && (
        <section className="space-y-6">
          {state === STATES.GENERATING_TITLES && (
            <Spinner label="Crafting bracket-formatted title options…" />
          )}

          {state === STATES.SELECTING_TITLE && (
            <>
              <p className="text-sm text-ponder-muted">
                Selected video idea:{" "}
                <span className="text-slate-200">{bundle.idea?.concept_name}</span>
              </p>
              {bundle.idea?.video_idea && (
                <p className="text-xs leading-relaxed text-ponder-muted">
                  {bundle.idea.video_idea}
                </p>
              )}
              <ul className="space-y-3">
                {titles.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className="ponder-card w-full text-left transition hover:border-ponder-cyan/50 hover:shadow-glow-sm"
                      onClick={() => selectTitle(t.text)}
                      disabled={isLoading}
                    >
                      <span className="font-mono text-sm text-slate-100">{t.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Stage 3: Metadata loading */}
      {state === STATES.GENERATING_METADATA && (
        <Spinner label="Generating SEO description, tags, and thumbnail prompt…" />
      )}

      {/* Stage 4: Review & Export */}
      {(currentStage === 4 || state === STATES.REVIEWING_BUNDLE) &&
        state !== STATES.GENERATING_METADATA && (
          <section className="space-y-6">
            {state === STATES.SUCCESS ? (
              <div className="ponder-card flex flex-col items-center gap-4 py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-ponder-cyan" />
                <h2 className="text-xl font-semibold text-white">Committed to Repository</h2>
                <p className="max-w-md text-sm text-ponder-muted">
                  Your finalized bundle was appended to the Ponder Lab Video Memory Repository.
                </p>
                <button type="button" className="ponder-btn-primary" onClick={resetWorkflow}>
                  <RotateCcw className="h-4 w-4" />
                  Start New Session
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-ponder-muted">
                  Review and tweak every field before committing to the Google Sheet.
                </p>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-200">
                    Video Idea
                    <textarea
                      className="ponder-textarea mt-2"
                      rows={4}
                      value={bundle.ideaSummary}
                      onChange={(e) => updateBundle({ ideaSummary: e.target.value })}
                      disabled={state === STATES.SAVING}
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-200">
                    Title
                    <textarea
                      className="ponder-textarea mt-2"
                      rows={2}
                      value={bundle.title}
                      onChange={(e) => updateBundle({ title: e.target.value })}
                      disabled={state === STATES.SAVING}
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-200">
                    Description
                    <textarea
                      className="ponder-textarea mt-2"
                      rows={10}
                      value={bundle.description}
                      onChange={(e) => updateBundle({ description: e.target.value })}
                      disabled={state === STATES.SAVING}
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-200">
                    Tags (comma-separated)
                    <textarea
                      className="ponder-textarea mt-2"
                      rows={3}
                      value={
                        Array.isArray(bundle.tags)
                          ? bundle.tags.join(", ")
                          : bundle.tags
                      }
                      onChange={(e) =>
                        updateBundle({
                          tags: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      disabled={state === STATES.SAVING}
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-200">
                    Thumbnail Prompt
                    <textarea
                      className="ponder-textarea mt-2"
                      rows={5}
                      value={bundle.thumbnail}
                      onChange={(e) => updateBundle({ thumbnail: e.target.value })}
                      disabled={state === STATES.SAVING}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    className="ponder-btn-primary"
                    onClick={commitToRepository}
                    disabled={state === STATES.SAVING}
                  >
                    {state === STATES.SAVING ? "Saving…" : "Commit to Repository"}
                  </button>
                  <button
                    type="button"
                    className="ponder-btn-ghost"
                    onClick={resetWorkflow}
                    disabled={state === STATES.SAVING}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>

                {state === STATES.SAVING && <Spinner label="Appending row to Google Sheet…" />}
              </>
            )}
          </section>
        )}
    </Layout>
  );
}
