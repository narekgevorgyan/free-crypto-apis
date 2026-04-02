import { parseReadme, REQUIRED_CATEGORIES, type ReadmeRow } from "./readme-parser.js";

const REQUIRED_SECTIONS = [
  "Quick Index",
  "Featured Free APIs",
  "Full Catalog",
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

  const featuredCategoryNames = parsed.featured.categories.map((category) => category.name);
  const fullCategoryNames = parsed.fullCatalog.categories.map((category) => category.name);

  for (const category of REQUIRED_CATEGORIES) {
    if (!featuredCategoryNames.includes(category)) {
      issues.push(`Missing featured category: ${category}`);
    }

    if (!fullCategoryNames.includes(category)) {
      issues.push(`Missing full catalog category: ${category}`);
    }
  }

  for (const category of parsed.featured.categories) {
    validateRows(category.rows, issues);
  }

  for (const category of parsed.fullCatalog.categories) {
    validateRows(category.rows, issues);
  }

  const fullCatalogNames = new Set<string>();

  for (const category of parsed.fullCatalog.categories) {
    for (const row of category.rows) {
      if (fullCatalogNames.has(row.apiName)) {
        issues.push(`Duplicate API in full catalog: ${row.apiName}`);
      } else {
        fullCatalogNames.add(row.apiName);
      }
    }
  }

  for (const category of parsed.featured.categories) {
    for (const row of category.rows) {
      if (!fullCatalogNames.has(row.apiName)) {
        issues.push(`Featured API missing from full catalog: ${row.apiName}`);
      }
    }
  }

  return issues;
}
