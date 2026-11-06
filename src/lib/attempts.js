import { supabase } from "./supabase";

const LOCAL_SOLVED_QUESTIONS_KEY = "queryquest.solvedQuestions";

export async function saveAttempt({ userId, question, correct }) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("query_attempts").insert({
    user_id: userId,
    question_id: String(question.id),
    question_title: question.title,
    difficulty: question.difficulty,
    is_correct: correct,
  });

  if (error) throw error;
}

export async function getSolvedQuestionIds(userId) {
  if (userId) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase
      .from("question_progress")
      .select("question_id")
      .eq("user_id", userId);
    if (error) throw error;
    return new Set(data.map((row) => String(row.question_id)));
  }

  try {
    const savedIds = JSON.parse(localStorage.getItem(LOCAL_SOLVED_QUESTIONS_KEY) || "[]");
    if (!Array.isArray(savedIds)) throw new Error("Saved progress has an invalid format.");
    return new Set(savedIds.map(String));
  } catch (error) {
    console.error("Unable to load locally saved question progress:", error);
    return new Set();
  }
}

export async function markQuestionSolved(userId, question) {
  const questionId = String(question.id);

  if (userId) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.from("question_progress").upsert({
      user_id: userId,
      question_id: questionId,
      question_title: question.title,
      difficulty: question.difficulty,
      solved_at: new Date().toISOString(),
    }, { onConflict: "user_id,question_id" });
    if (error) throw error;
    return;
  }

  try {
    const solvedIds = await getSolvedQuestionIds(null);
    solvedIds.add(questionId);
    localStorage.setItem(LOCAL_SOLVED_QUESTIONS_KEY, JSON.stringify([...solvedIds]));
  } catch (error) {
    console.error("Unable to save locally solved question:", error);
    throw error;
  }
}
