import { build } from "esbuild";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
const temp = await fs.mkdtemp(path.join(os.tmpdir(), "eco-bi-"));
try {
  const bundle = path.join(temp, "data.mjs");
  await build({
    stdin: {
      contents:
        'export {createSeed} from "./src/data/seed.ts";export {buildBiTables,biCsv} from "./src/utils/biExport.ts";',
      resolveDir: process.cwd(),
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: bundle,
  });
  const { createSeed, buildBiTables, biCsv } = await import(
    pathToFileURL(bundle)
  );
  const tables = buildBiTables(createSeed().events);
  await fs.mkdir("public/bi", { recursive: true });
  for (const table of Object.values(tables))
    await fs.writeFile(`public/bi/${table.name}.csv`, biCsv(table));
  console.log(
    `已匯出 ${tables.events.rows.length} 筆事件、${tables.monthly.rows.length} 筆月度來源彙總`,
  );
} finally {
  await fs.rm(temp, { recursive: true, force: true });
}
