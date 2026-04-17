import { useState } from "react";

export default function PromptForm({ onSubmit, isLoading }) {
  const [topic, setTopic] = useState("");

  const submit = (event) => {
    event.preventDefault();
    onSubmit(topic);
  };

  return (
    <form className="prompt-form" onSubmit={submit}>
      <label htmlFor="topic">What do you want to learn?</label>
      <textarea
        id="topic"
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        placeholder="Try: Intro to React Hooks, Basics of Copyright Law, Python for Data Cleaning..."
      />
      <div className="button-row">
        <button className="action-button" disabled={isLoading || topic.trim().length < 3}>
          {isLoading ? "Generating course..." : "Generate course"}
        </button>
        <span className="muted">3-6 modules, rich lessons, quizzes, readings, and video prompts.</span>
      </div>
    </form>
  );
}
