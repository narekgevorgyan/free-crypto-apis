export const REQUIRED_CATEGORIES = [
  "Market Data",
  "Exchange & Trading",
  "Wallets & Portfolio",
  "DeFi & NFT",
  "Payments",
  "Infrastructure",
  "News & Analytics",
] as const;

export type CatalogCategoryName = (typeof REQUIRED_CATEGORIES)[number];

export type ReadmeRow = {
  apiName: string;
  columns: string[];
};

export type CatalogCategory = {
  name: string;
  rows: ReadmeRow[];
};

export type ParsedReadme = {
  title: string;
  sections: Set<string>;
  catalog: {
    categories: CatalogCategory[];
  };
};

const SECTION_HEADING_PATTERN = /^## (.+)$/gm;
const CATEGORY_HEADING_PATTERN = /^### (.+)$/gm;

function extractSectionContent(readme: string, startHeading: string, endHeading: string): string {
  const startToken = `## ${startHeading}`;
  const endToken = `## ${endHeading}`;
  const startIndex = readme.indexOf(startToken);

  if (startIndex === -1) {
    return "";
  }

  const afterStart = readme.slice(startIndex + startToken.length);
  const endIndex = afterStart.indexOf(endToken);

  return endIndex === -1 ? afterStart : afterStart.slice(0, endIndex);
}

function extractSections(readme: string): Set<string> {
  const sections = new Set<string>();

  for (const match of readme.matchAll(SECTION_HEADING_PATTERN)) {
    sections.add(match[1]!.trim());
  }

  return sections;
}

function parseRow(line: string): ReadmeRow | null {
  const columns = line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

  if (columns.length !== 5) {
    return null;
  }

  const apiNameMatch = columns[0]?.match(/\[([^\]]+)\]\([^)]+\)/);
  const apiName = apiNameMatch?.[1]?.trim() ?? columns[0] ?? "";

  return {
    apiName,
    columns,
  };
}

function parseCategoryRows(block: string): ReadmeRow[] {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));

  return lines
    .filter((line) => !line.includes("---") && !line.includes("API |"))
    .map((line) => parseRow(line))
    .filter((row): row is ReadmeRow => row !== null);
}

function parseCategories(section: string): CatalogCategory[] {
  const matches = [...section.matchAll(CATEGORY_HEADING_PATTERN)];
  const categories: CatalogCategory[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const nextMatch = matches[index + 1];
    const startIndex = match.index ?? 0;
    const endIndex = nextMatch?.index ?? section.length;
    const block = section.slice(startIndex, endIndex);

    categories.push({
      name: match[1]!.trim(),
      rows: parseCategoryRows(block),
    });
  }

  return categories;
}

export function parseReadme(readme: string): ParsedReadme {
  const titleMatch = readme.match(/^# (.+)$/m);

  return {
    title: titleMatch?.[1]?.trim() ?? "",
    sections: extractSections(readme),
    catalog: {
      categories: parseCategories(extractSectionContent(readme, "API Categories", "Methodology")),
    },
  };
}
