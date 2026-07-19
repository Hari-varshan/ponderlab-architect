import { useCallback, useState } from "react";
import {
  generateIdeas,
  generateMetadata,
  generateThumbnail,
  generateTitles,
  getErrorMessage,
  saveToRepository,
} from "../services/api.js";

export const WORKFLOW_STATES = {
  IDLE: "IDLE",
  GENERATING_IDEAS: "GENERATING_IDEAS",
  SELECTING_IDEA: "SELECTING_IDEA",
  GENERATING_TITLES: "GENERATING_TITLES",
  SELECTING_TITLE: "SELECTING_TITLE",
  GENERATING_METADATA: "GENERATING_METADATA",
  REVIEWING_BUNDLE: "REVIEWING_BUNDLE",
  SAVING: "SAVING",
  SUCCESS: "SUCCESS",
};

const initialBundle = {
  idea: null,
  ideaSummary: "",
  title: "",
  description: "",
  tags: [],
  thumbnail: "",
};

export function useWorkflow() {
  const [state, setState] = useState(WORKFLOW_STATES.IDLE);
  const [vibe, setVibe] = useState("");
  const [concepts, setConcepts] = useState([]);
  const [titles, setTitles] = useState([]);
  const [bundle, setBundle] = useState(initialBundle);
  const [error, setError] = useState(null);
  const [historyCount, setHistoryCount] = useState(0);

  const clearError = useCallback(() => setError(null), []);

  const updateBundle = useCallback((patch) => {
    setBundle((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(WORKFLOW_STATES.IDLE);
    setVibe("");
    setConcepts([]);
    setTitles([]);
    setBundle(initialBundle);
    setError(null);
    setHistoryCount(0);
  }, []);

  const startIdeasGeneration = useCallback(async () => {
    if (!vibe.trim()) {
      setError("Describe a vibe or creative direction first.");
      return;
    }
    setError(null);
    setState(WORKFLOW_STATES.GENERATING_IDEAS);
    try {
      const data = await generateIdeas(vibe.trim());
      setConcepts(data.concepts || []);
      setHistoryCount(data.history_count ?? 0);
      setState(WORKFLOW_STATES.SELECTING_IDEA);
    } catch (err) {
      setError(getErrorMessage(err));
      setState(WORKFLOW_STATES.IDLE);
    }
  }, [vibe]);

  const selectConcept = useCallback(async (concept) => {
    const summary = concept.video_idea || [
      concept.concept_name,
      concept.noise_stack,
      `${concept.duration_hours}h · ${concept.use_case}`,
      concept.audience_benefit_reasoning,
    ]
      .filter(Boolean)
      .join(" — ");

    updateBundle({
      idea: concept,
      ideaSummary: summary,
    });
    setError(null);
    setState(WORKFLOW_STATES.GENERATING_TITLES);
    try {
      const data = await generateTitles(concept);
      setTitles(data.titles || []);
      setState(WORKFLOW_STATES.SELECTING_TITLE);
    } catch (err) {
      setError(getErrorMessage(err));
      setState(WORKFLOW_STATES.SELECTING_IDEA);
    }
  }, [updateBundle]);

  const selectTitle = useCallback(
    async (titleText) => {
      updateBundle({ title: titleText });
      setError(null);
      setState(WORKFLOW_STATES.GENERATING_METADATA);
      try {
        const data = await generateMetadata(bundle.idea, titleText);
        updateBundle({
          description: data.description || "",
          tags: data.tags || [],
        });

        const thumb = await generateThumbnail({
          idea: bundle.idea,
          title: titleText,
          description: data.description || "",
          tags: data.tags || [],
        });
        updateBundle({ thumbnail: thumb.thumbnail_prompt || "" });
        setState(WORKFLOW_STATES.REVIEWING_BUNDLE);
      } catch (err) {
        setError(getErrorMessage(err));
        setState(WORKFLOW_STATES.SELECTING_TITLE);
      }
    },
    [bundle.idea, updateBundle]
  );

  const commitToRepository = useCallback(async () => {
    if (!bundle.idea || !bundle.title) {
      setError("Missing required fields before save.");
      return;
    }
    setError(null);
    setState(WORKFLOW_STATES.SAVING);
    try {
      const ideaText =
        bundle.ideaSummary ||
        JSON.stringify(bundle.idea, null, 2);

      await saveToRepository({
        idea: ideaText,
        title: bundle.title,
        description: bundle.description,
        tags: bundle.tags,
        thumbnail: bundle.thumbnail,
      });
      setState(WORKFLOW_STATES.SUCCESS);
    } catch (err) {
      setError(getErrorMessage(err));
      setState(WORKFLOW_STATES.REVIEWING_BUNDLE);
    }
  }, [bundle]);

  const currentStage = (() => {
    switch (state) {
      case WORKFLOW_STATES.IDLE:
      case WORKFLOW_STATES.GENERATING_IDEAS:
      case WORKFLOW_STATES.SELECTING_IDEA:
        return 1;
      case WORKFLOW_STATES.GENERATING_TITLES:
      case WORKFLOW_STATES.SELECTING_TITLE:
        return 2;
      case WORKFLOW_STATES.GENERATING_METADATA:
        return 3;
      case WORKFLOW_STATES.REVIEWING_BUNDLE:
      case WORKFLOW_STATES.SAVING:
      case WORKFLOW_STATES.SUCCESS:
        return 4;
      default:
        return 1;
    }
  })();

  const isLoading = [
    WORKFLOW_STATES.GENERATING_IDEAS,
    WORKFLOW_STATES.GENERATING_TITLES,
    WORKFLOW_STATES.GENERATING_METADATA,
    WORKFLOW_STATES.SAVING,
  ].includes(state);

  return {
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
    WORKFLOW_STATES,
  };
}
