export default function CodeBlock({ block }) {
  return (
    <div className="content-block">
      <pre className="code-block">
        <code>{block.text}</code>
      </pre>
    </div>
  );
}
