export default function ParagraphBlock({ block }) {
  return (
    <div className="content-block">
      <p>{block.text}</p>
    </div>
  );
}
