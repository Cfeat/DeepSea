export function readIds(key: string, allowed: string[]): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === "string" && allowed.includes(id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
export function readDiveDepth(): number {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("deepsea-depth") || "null",
    );
    return typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= 11000
      ? Math.round(value)
      : 0;
  } catch {
    return 0;
  }
}
export function writeStorage(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
