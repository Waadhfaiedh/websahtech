import api from "./api";

// ─── Endpoints (adjust paths once backend exists) ─────────────
const ENDPOINTS = {
  list: "admins/reviews",
  mine: "users/reviews/mine",
  create: "users/reviews",
  delete: (id) => `admins/reviews/${id}`,
  deleteMine: (id) => `users/reviews/${id}`,
};

// ─── Review categories (used by both admin filter and specialist form) ───
export const REVIEW_CATEGORIES = [
  { value: "GENERAL", label: "Général" },
  { value: "UX", label: "Expérience utilisateur" },
  { value: "PERFORMANCE", label: "Performance" },
  { value: "BUG", label: "Bug / Problème technique" },
  { value: "FEATURE_REQUEST", label: "Suggestion de fonctionnalité" },
  { value: "SUPPORT", label: "Support" },
  { value: "COMPLAINT", label: "Réclamation" },
];

export const getCategoryLabel = (value) =>
  REVIEW_CATEGORIES.find((c) => c.value === value)?.label ?? value;

// ─── Admin: list all reviews ──────────────────────────────────
export const fetchAllReviews = async () => {
  const res = await api.get(ENDPOINTS.list);
  return res.data.data ?? res.data;
};

// ─── Specialist: list my reviews ──────────────────────────────
export const fetchMyReviews = async () => {
  const res = await api.get(ENDPOINTS.mine);
  return res.data.data ?? res.data;
};

// ─── Specialist: submit a new review ──────────────────────────
export const createReview = async ({ rating, category, text }) => {
  const res = await api.post(ENDPOINTS.create, { rating, category, text });
  return res.data.data ?? res.data;
};

// ─── Admin: delete a review ───────────────────────────────────
export const deleteReview = async (id) => {
  const res = await api.delete(ENDPOINTS.delete(id));
  return res.data;
};

// ─── Specialist: delete their own review ──────────────────────
export const deleteMyReview = async (id) => {
  const res = await api.delete(ENDPOINTS.deleteMine(id));
  return res.data;
};

export default {
  fetchAllReviews,
  fetchMyReviews,
  createReview,
  deleteReview,
  deleteMyReview,
  REVIEW_CATEGORIES,
  getCategoryLabel,
};