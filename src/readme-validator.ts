import { parseReadme, REQUIRED_CATEGORIES, type ReadmeRow } from "./readme-parser.js";

const REQUIRED_SECTIONS = [
  "Quick Index",
  "API Categories",
  "Methodology",
  "Contributing",
] as const;

const ALLOWED_AUTH_VALUES = new Set([
  "No",
  "apiKey",
  "OAuth",
  "User-Agent",
  "X-Mashape-Key",
  "Mixed",
]);

const FREE_PLAN_PATTERN =
  /\b(free|trial|public|sandbox|open source|no monthly fee|no-key|no key)\b/i;

function normalizeAuth(value: string): string {
  return value.replaceAll("`", "").trim();
}

function hasMarkdownHttpsLink(value: string): boolean {
  return /\[[^\]]+\]\(https:\/\/[^)]+\)/.test(value);
}

function compareApiNames(left: string, right: string): number {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function validateRows(rows: ReadmeRow[], issues: string[]): void {
  for (const row of rows) {
    const [apiCell, description, freePlan, auth, docsCell] = row.columns;
    const normalizedAuth = normalizeAuth(auth ?? "");

    if (!apiCell || !description || !freePlan || !auth || !docsCell) {
      issues.push(`Incomplete row for API: ${row.apiName}`);
      continue;
    }

    if (!FREE_PLAN_PATTERN.test(freePlan)) {
      issues.push(`Free Plan note must describe documented free access: ${row.apiName}`);
    }

    if (!ALLOWED_AUTH_VALUES.has(normalizedAuth)) {
      issues.push(`Invalid Auth value \`${normalizedAuth}\` for API: ${row.apiName}`);
    }

    if (!hasMarkdownHttpsLink(apiCell)) {
      issues.push(`API cell must contain an https docs link for API: ${row.apiName}`);
    }

    if (!hasMarkdownHttpsLink(docsCell)) {
      issues.push(`Docs cell must contain an https docs link for API: ${row.apiName}`);
    }
  }
}

export function validateReadme(readme: string): string[] {
  const parsed = parseReadme(readme);
  const issues: string[] = [];

  if (parsed.title !== "Free Crypto APIs") {
    issues.push("README title must be `# Free Crypto APIs`.");
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!parsed.sections.has(section)) {
      issues.push(`Missing required section: ${section}`);
    }
  }

  if (parsed.sections.has("Featured Free APIs")) {
    issues.push("Featured Free APIs section is no longer allowed.");
  }

  const catalogCategoryNames = parsed.catalog.categories.map((category) => category.name);

  for (const category of REQUIRED_CATEGORIES) {
    if (!catalogCategoryNames.includes(category)) {
      issues.push(`Missing category: ${category}`);
    }
  }

  for (const category of parsed.catalog.categories) {
    validateRows(category.rows, issues);

    for (let index = 1; index < category.rows.length; index += 1) {
      const previous = category.rows[index - 1];
      const current = category.rows[index];

      if (!previous || !current) {
        continue;
      }

      if (compareApiNames(previous.apiName, current.apiName) > 0) {
        issues.push(
          `Category must be alphabetical: ${category.name} has \`${previous.apiName}\` before \`${current.apiName}\``,
        );
      }
    }
  }

  const catalogNames = new Set<string>();

  for (const category of parsed.catalog.categories) {
    for (const row of category.rows) {
      if (catalogNames.has(row.apiName)) {
        issues.push(`Duplicate API in categories list: ${row.apiName}`);
      } else {
        catalogNames.add(row.apiName);
      }
    }
  }

  return issues;
}
