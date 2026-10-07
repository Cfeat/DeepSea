export default function Breadcrumb({
  label,
  topic,
}: {
  label: string;
  topic?: string;
}) {
  return (
    <nav className="breadcrumb" aria-label="当前位置">
      <a href="#home">首页</a>
      <span aria-hidden="true">/</span>
      {topic ? (
        <>
          <a href="#topics">{label}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{topic}</span>
        </>
      ) : (
        <span aria-current="page">{label}</span>
      )}
    </nav>
  );
}
