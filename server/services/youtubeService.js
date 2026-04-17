import { env } from "../config/env.js";
import { supabase } from "../config/supabase.js";

const memoryCache = new Map();

export const searchVideos = async (query) => {
  const normalizedQuery = query.toLowerCase();
  const cached = await getCachedVideos(normalizedQuery);

  if (cached) return cached;

  if (!env.hasYouTube) {
    const fallback = buildFallbackVideos(query);
    await cacheVideos(normalizedQuery, fallback);
    return fallback;
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "3");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("safeSearch", "moderate");
  url.searchParams.set("key", env.youtubeApiKey);

  const response = await fetch(url);
  if (!response.ok) {
    const fallback = buildFallbackVideos(query);
    await cacheVideos(normalizedQuery, fallback);
    return fallback;
  }

  const payload = await response.json();
  const videos = (payload.items || []).map((item) => ({
    title: item.snippet?.title || "Educational video",
    videoId: item.id?.videoId,
    embedUrl: item.id?.videoId ? `https://www.youtube.com/embed/${item.id.videoId}` : null,
    url: item.id?.videoId ? `https://www.youtube.com/watch?v=${item.id.videoId}` : null,
    channelTitle: item.snippet?.channelTitle
  }));

  const resolvedVideos = videos.length ? videos : buildFallbackVideos(query);
  await cacheVideos(normalizedQuery, resolvedVideos);
  return resolvedVideos;
};

const buildFallbackVideos = (query) => [
  {
    title: `Search YouTube for ${query}`,
    videoId: null,
    embedUrl: null,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  }
];

const getCachedVideos = async (query) => {
  if (memoryCache.has(query)) return memoryCache.get(query);
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("youtube_cache")
    .select("videos")
    .eq("query", query)
    .maybeSingle();

  if (error) {
    console.warn("YouTube cache read failed.", error.message);
    return null;
  }

  return data?.videos || null;
};

const cacheVideos = async (query, videos) => {
  memoryCache.set(query, videos);
  if (!supabase) return;

  const { error } = await supabase.from("youtube_cache").upsert({
    query,
    videos,
    updated_at: new Date().toISOString()
  });

  if (error) console.warn("YouTube cache write failed.", error.message);
};
