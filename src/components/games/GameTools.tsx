import { useId, useRef, useState } from "react";

export default function GameTools({
  onExport,
  onImport,
  onRestart,
  warning,
  active,
}: {
  onExport: () => void;
  onImport: (raw: string) => boolean;
  onRestart: () => void;
  warning: string;
  active: boolean;
}) {
  const [confirm, setConfirm] = useState<"restart" | "import" | null>(null);
  const [importRaw, setImportRaw] = useState("");
  const [status, setStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  async function readFile(file?: File) {
    if (!file) return;
    if (file.size > 300000) {
      setStatus("文件太大，未读取。请选择导出的游戏存档。");
      return;
    }
    try {
      const text = await file.text();
      setImportRaw(text);
      setConfirm("import");
      setStatus("");
    } catch {
      setStatus("文件读取失败，请重新选择。");
    }
    if (input.current) input.current.value = "";
  }
  return (
    <div className="game-tools">
      <div className="game-tools-row">
        <a href="#games">← 游乐场</a>
        <span className="save-indicator">
          {active
            ? warning
              ? "可导出存档保留进度"
              : "进度自动保存在此浏览器"
            : "两个游戏的存档互不影响"}
        </span>
        {active && <button onClick={onExport}>导出存档</button>}
        <button onClick={() => input.current?.click()}>导入存档</button>
        {active && (
          <button onClick={() => setConfirm("restart")}>重新开始</button>
        )}
        <input
          ref={input}
          hidden
          type="file"
          accept="application/json,.json"
          tabIndex={-1}
          aria-label="选择游戏存档"
          onChange={(event) => void readFile(event.target.files?.[0])}
        />
      </div>
      {(warning || status) && (
        <p className="game-warning" role="status">
          {warning || status}
        </p>
      )}
      {confirm && (
        <div className="game-confirm" role="region" aria-labelledby={id}>
          <strong id={id}>
            {confirm === "restart" ? "开始新一局？" : "用这份存档继续？"}
          </strong>
          <p>
            当前游戏的进度会被替换。
            {active
              ? "如果想保留这次进度，可以先导出存档。"
              : "另一个游戏不受影响。"}
          </p>
          <div>
            <button
              className="game-button"
              onClick={() => {
                if (confirm === "restart") {
                  onRestart();
                  setStatus("");
                  setConfirm(null);
                } else if (onImport(importRaw)) {
                  setConfirm(null);
                  setStatus("存档已导入，可以继续游玩。");
                }
              }}
            >
              确认{confirm === "restart" ? "重新开始" : "导入"}
            </button>
            <button
              className="game-button secondary"
              onClick={() => setConfirm(null)}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
