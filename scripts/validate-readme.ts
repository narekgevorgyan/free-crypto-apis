import { readFile } from "node:fs/promises";

import { validateReadme } from "../src/readme-validator.js";

async function main(): Promise<void> {
  const filename = process.argv[2];

  if (!filename) {
    console.error("Usage: tsx scripts/validate-readme.ts <README.md>");
    process.exit(1);
  }

  const readme = await readFile(filename, "utf8");
  const issues = validateReadme(readme);

  if (issues.length > 0) {
    console.error("README validation failed:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(`README validation passed for ${filename}`);
}

void main();
