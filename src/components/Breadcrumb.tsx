export default function Breadcrumb({
  label,
  topic,
  parent = "topics",
}: {
  label: string;
  topic?: string;
  parent?: string;
}) {
  return (
    <nav className="breadcrumb" aria-label="当前位置">
      <a href="#home">首页</a>
      <span aria-hidden="true">/</span>
      {topic ? (
        <>
          <a href={`#${parent}`}>{label}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{topic}</span>
        </>
      ) : (
        <span aria-current="page">{label}</span>
      )}
    </nav>
  );
}
