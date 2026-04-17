import { useEffect, useState } from "react";
import { apiRequest } from "../../utils/api.js";

export default function VideoBlock({ block, getToken }) {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const query = block.query || block.url || block.text || "lesson tutorial";

  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      try {
        const token = await getToken();
        const payload = await apiRequest(`/api/youtube?query=${encodeURIComponent(query)}`, {
          token
        });
        if (isMounted) setVideos(payload.videos || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    };

    loadVideo();
    return () => {
      isMounted = false;
    };
  }, [query, getToken]);

  const firstVideo = videos[0];

  return (
    <div className="content-block video-frame">
      {firstVideo?.embedUrl ? (
        <iframe
          title={firstVideo.title}
          src={firstVideo.embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="video-fallback">
          <a
            className="action-button alt"
            href={
              firstVideo?.url ||
              `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
            }
            target="_blank"
            rel="noreferrer"
          >
            Find videos for {query}
          </a>
          {error && <p className="muted">{error}</p>}
        </div>
      )}
    </div>
  );
}
