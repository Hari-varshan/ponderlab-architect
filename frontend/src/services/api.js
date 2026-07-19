import axios from "axios";

const client = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
  timeout: 120000,
});

export async function generateIdeas(vibe) {
  const { data } = await client.post("/api/v1/ideas/generate", { vibe });
  return data;
}

export async function generateTitles(idea) {
  const { data } = await client.post("/api/v1/titles/generate", { idea });
  return data;
}

export async function generateMetadata(idea, title) {
  const { data } = await client.post("/api/v1/metadata/generate", { idea, title });
  return data;
}

export async function generateThumbnail(payload) {
  const { data } = await client.post("/api/v1/metadata/thumbnail", payload);
  return data;
}

export async function saveToRepository(payload) {
  const { data } = await client.post("/api/v1/repository/save", {
    idea: payload.idea,
    title: payload.title,
    description: payload.description,
    tags: payload.tags,
    thumbnail: payload.thumbnail,
  });
  return data;
}

export function getErrorMessage(error) {
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
    }
    return JSON.stringify(detail);
  }
  return error.message || "An unexpected error occurred";
}
