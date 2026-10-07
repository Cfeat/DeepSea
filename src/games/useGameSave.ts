import { useEffect, useState } from "react";
import { writeStorage } from "../utils/storage";

export function readGameSave<S>(
  key: string,
  decode: (raw: unknown) => S | null,
): { state: S | null; warning: string } {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { state: null, warning: "" };
    if (raw.length > 300000)
      return {
        state: null,
        warning: "这份存档太大，无法读取。可以重新开始，或导入之前导出的存档。",
      };
    const state = decode(JSON.parse(raw));
    return {
      state,
      warning: state
        ? ""
        : "旧存档或损坏的存档无法读取。可以重新开始，或导入之前导出的存档。",
    };
  } catch {
    return {
      state: null,
      warning: "暂时无法读取浏览器存档。这次仍可游玩，也可以导出存档带走进度。",
    };
  }
}
export function useGameSave<S>(
  key: string,
  decode: (raw: unknown) => S | null,
  encode: (state: S) => unknown,
) {
  const [initial] = useState(() => readGameSave(key, decode));
  const [state, setState] = useState<S | null>(initial.state);
  const [warning, setWarning] = useState(initial.warning);
  useEffect(() => {
    if (state && !writeStorage(key, encode(state)))
      setWarning("浏览器暂时不能保存进度，离开前请导出存档。");
  }, [state, key, encode]);
  function importSave(raw: string): boolean {
    if (raw.length > 300000) {
      setWarning("存档超过大小限制，未导入。");
      return false;
    }
    try {
      const next = decode(JSON.parse(raw));
      if (!next) {
        setWarning("这份存档格式不正确，或不属于这个游戏。当前进度已保留。");
        return false;
      }
      setState(next);
      setWarning("");
      return true;
    } catch {
      setWarning("存档不是有效的 JSON 文件，当前进度已保留。");
      return false;
    }
  }
  function reset() {
    setState(null);
    setWarning("");
    try {
      localStorage.removeItem(key);
    } catch {
      setWarning("浏览器暂时不能清除旧存档，可以直接开始新一局。");
    }
  }
  return { state, setState, warning, setWarning, importSave, reset };
}
export function exportGameSave(filename: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
