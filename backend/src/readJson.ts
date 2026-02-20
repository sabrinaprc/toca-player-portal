import fs from "fs/promises";
import path from "path";

export async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function dataPath(...parts: string[]) {
  return path.join(process.cwd(), "data", ...parts);
}