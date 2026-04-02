import { readFile } from "node:fs/promises";

const SUCCESS_STATUS_CODES = new Set([200, 201, 202, 204, 301, 302, 303, 307, 308, 401, 403, 405, 429]);
const REQUEST_TIMEOUT_MS = 15000;
const MAX_CONCURRENCY = 8;

function extractLinks(markdown: string): string[] {
  const matches = markdown.match(/\[[^\]]+\]\((https:\/\/[^)\s]+)\)/g) ?? [];
  const links = matches
    .map((match) => match.match(/\((https:\/\/[^)\s]+)\)/)?.[1])
    .filter((value): value is string => Boolean(value));

  return [...new Set(links)];
}

async function fetchWithTimeout(url: string, method: "HEAD" | "GET"): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "free-crypto-apis-link-validator/1.0",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function validateLink(url: string): Promise<string | null> {
  try {
    const headResponse = await fetchWithTimeout(url, "HEAD");

    if (SUCCESS_STATUS_CODES.has(headResponse.status)) {
      return null;
    }

    const getResponse = await fetchWithTimeout(url, "GET");

    if (SUCCESS_STATUS_CODES.has(getResponse.status)) {
      return null;
    }

    return `${url} returned ${getResponse.status}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `${url} failed: ${message}`;
  }
}

async function main(): Promise<void> {
  const filename = process.argv[2];

  if (!filename) {
    console.error("Usage: tsx scripts/validate-links.ts <README.md>");
    process.exit(1);
  }

  const markdown = await readFile(filename, "utf8");
  const links = extractLinks(markdown);
  const failures: string[] = [];
  let index = 0;

  async function worker(): Promise<void> {
    while (index < links.length) {
      const link = links[index];
      index += 1;

      if (!link) {
        return;
      }

      const failure = await validateLink(link);
      process.stdout.write(failure ? `FAIL ${link}\n` : `OK   ${link}\n`);

      if (failure) {
        failures.push(failure);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, links.length) }, () => worker()));

  if (failures.length > 0) {
    console.error("Link validation failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`Validated ${links.length} unique links from ${filename}`);
}

void main();
