import axios from "axios";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:8001";

export async function analyzeWithAI(analysisReq) {
  const url = `${AI_API_URL}/analyze`;
  const token = JSON.parse(localStorage.getItem("sahtech_user") || "{}").accessToken;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(url, analysisReq, { headers });
  return res.data;
}

export default { analyzeWithAI };
