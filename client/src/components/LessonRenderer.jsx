import CodeBlock from "./blocks/CodeBlock.jsx";
import HeadingBlock from "./blocks/HeadingBlock.jsx";
import MCQBlock from "./blocks/MCQBlock.jsx";
import ParagraphBlock from "./blocks/ParagraphBlock.jsx";
import VideoBlock from "./blocks/VideoBlock.jsx";

export default function LessonRenderer({ content = [], getToken }) {
  return (
    <div>
      {content.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") return <HeadingBlock block={block} key={key} />;
        if (block.type === "code") return <CodeBlock block={block} key={key} />;
        if (block.type === "video") return <VideoBlock block={block} key={key} getToken={getToken} />;
        if (block.type === "mcq") return <MCQBlock block={block} key={key} />;
        return <ParagraphBlock block={block} key={key} />;
      })}
    </div>
  );
}
