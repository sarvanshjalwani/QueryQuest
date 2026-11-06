import { useCallback, useEffect, useState } from "react";
import { getSolvedQuestionIds } from "./attempts";

export function useQuestionProgress(userId) {
  const [progress, setProgress] = useState(() => ({
    userId,
    solvedQuestionIds: new Set(),
    progressError: "",
  }));

  useEffect(() => {
    let active = true;

    getSolvedQuestionIds(userId)
      .then((ids) => {
        if (active) setProgress({ userId, solvedQuestionIds: ids, progressError: "" });
      })
      .catch((error) => {
        if (active) {
          setProgress({
            userId,
            solvedQuestionIds: new Set(),
            progressError: error.message || "Unable to load solved questions.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const markQuestionSolved = useCallback((questionId) => {
    setProgress((current) => ({
      userId,
      solvedQuestionIds: new Set(
        current.userId === userId ? current.solvedQuestionIds : []
      ).add(String(questionId)),
      progressError: current.userId === userId ? current.progressError : "",
    }));
  }, [userId]);

  const currentProgress = progress.userId === userId
    ? progress
    : { solvedQuestionIds: new Set(), progressError: "" };

  return { ...currentProgress, markQuestionSolved };
}
