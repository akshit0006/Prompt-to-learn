import { useMemo, useState } from "react";
import { apiRequest, flattenLessonText } from "../utils/api.js";

export default function HinglishAudioPlayer({ lesson, getToken }) {
  const [narration, setNarration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const audioUrl = useMemo(() => {
    if (!narration?.audioBase64 || !narration?.mimeType) return null;
    return `data:${narration.mimeType};base64,${narration.audioBase64}`;
  }, [narration]);

  const generateAudio = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = await getToken();
      const payload = await apiRequest("/api/audio/hinglish", {
        method: "POST",
        token,
        body: { text: flattenLessonText(lesson) }
      });
      setNarration(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="audio-panel">
      <div className="button-row">
        <button className="action-button alt" onClick={generateAudio} disabled={isLoading}>
          {isLoading ? "Creating narration..." : "Explain in Hinglish"}
        </button>
        <span className="muted">Gemini translation and TTS when the API key is configured.</span>
      </div>
      {error && <p className="muted">{error}</p>}
      {narration?.transcript && <p>{narration.transcript}</p>}
      {audioUrl && <audio controls src={audioUrl} />}
    </section>
  );
}
