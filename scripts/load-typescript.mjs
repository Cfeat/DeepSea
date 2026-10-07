import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import ts from "typescript";
const cache = new Map();
export function moduleUrl(file) {
  file = resolve(file);
  if (cache.has(file)) return cache.get(file);
  let code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  code = code.replace(/import\.meta\.env\.BASE_URL/g, "'/DeepSea/'");
  code = code.replace(
    /from ['"](\.[^'"]+)['"]/g,
    (_, specifier) =>
      `from '${moduleUrl(resolve(dirname(file), `${specifier}.ts`))}'`,
  );
  code += `\n//# sourceURL=${file.replace(/\\/g, "/")}\n`;
  const url = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  cache.set(file, url);
  return url;
}
