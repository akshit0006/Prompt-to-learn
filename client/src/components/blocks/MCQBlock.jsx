import { useState } from "react";

export default function MCQBlock({ block }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="content-block quiz-block">
      <h3>{block.question}</h3>
      {(block.options || []).map((option, index) => {
        const hasAnswered = selected !== null;
        const isCorrect = index === block.answer;
        const isSelected = selected === index;

        return (
          <button
            className={[
              "quiz-option",
              hasAnswered && isCorrect ? "correct" : "",
              hasAnswered && isSelected && !isCorrect ? "incorrect" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            key={option}
            onClick={() => setSelected(index)}
          >
            {option}
          </button>
        );
      })}
      {selected !== null && <p className="muted">{block.explanation}</p>}
    </div>
  );
}
