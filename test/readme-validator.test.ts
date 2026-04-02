import test from "node:test";
import assert from "node:assert/strict";

import { parseReadme } from "../src/readme-parser.js";
import { validateReadme } from "../src/readme-validator.js";

const validReadme = `# Free Crypto APIs

> Curated free and free-trial crypto APIs.

## Quick Index

- [Featured Free APIs](#featured-free-apis)
- [Market Data](#market-data)
- [Exchange & Trading](#exchange--trading)
- [Wallets & Portfolio](#wallets--portfolio)
- [DeFi & NFT](#defi--nft)
- [Payments](#payments)
- [Infrastructure](#infrastructure)
- [News & Analytics](#news--analytics)
- [Methodology](#methodology)
- [Contributing](#contributing)

## Featured Free APIs

### Market Data
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Alpha](https://alpha.test/docs) | Prices and market snapshots | Free tier with API key | \`apiKey\` | [Docs](https://alpha.test/docs) |

### Exchange & Trading
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Beta Trade](https://beta.test/docs) | Trading and market data | Public market data and free trial for private routes | \`Mixed\` | [Docs](https://beta.test/docs) |

### Wallets & Portfolio
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [CoinStats](https://coinstats.test/docs) | Wallets and portfolio tracking | Free plan with monthly credits | \`apiKey\` | [Docs](https://coinstats.test/docs) |

### DeFi & NFT
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Delta](https://delta.test/docs) | DeFi positions and NFT data | Free developer tier | \`apiKey\` | [Docs](https://delta.test/docs) |

### Payments
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Echo Pay](https://echo.test/docs) | Crypto checkout | Free sandbox for testing | \`apiKey\` | [Docs](https://echo.test/docs) |

### Infrastructure
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Foxtrot Node](https://foxtrot.test/docs) | RPC and indexing | Free tier with request caps | \`apiKey\` | [Docs](https://foxtrot.test/docs) |

### News & Analytics
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Gamma News](https://gamma.test/docs) | News and sentiment data | Public endpoint for headlines | No | [Docs](https://gamma.test/docs) |

## Full Catalog

### Market Data
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Alpha](https://alpha.test/docs) | Prices and market snapshots | Free tier with API key | \`apiKey\` | [Docs](https://alpha.test/docs) |

### Exchange & Trading
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Beta Trade](https://beta.test/docs) | Trading and market data | Public market data and free trial for private routes | \`Mixed\` | [Docs](https://beta.test/docs) |

### Wallets & Portfolio
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [CoinStats](https://coinstats.test/docs) | Wallets and portfolio tracking | Free plan with monthly credits | \`apiKey\` | [Docs](https://coinstats.test/docs) |

### DeFi & NFT
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Delta](https://delta.test/docs) | DeFi positions and NFT data | Free developer tier | \`apiKey\` | [Docs](https://delta.test/docs) |

### Payments
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Echo Pay](https://echo.test/docs) | Crypto checkout | Free sandbox for testing | \`apiKey\` | [Docs](https://echo.test/docs) |

### Infrastructure
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Foxtrot Node](https://foxtrot.test/docs) | RPC and indexing | Free tier with request caps | \`apiKey\` | [Docs](https://foxtrot.test/docs) |

### News & Analytics
| API | What It Is Good For | Free Plan | Auth | Docs |
|---|---|---|---|---|
| [Gamma News](https://gamma.test/docs) | News and sentiment data | Public endpoint for headlines | No | [Docs](https://gamma.test/docs) |

## Methodology

Only APIs with clearly documented free access paths are included.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
`;

test("parseReadme collects featured and full catalog categories", () => {
  const parsed = parseReadme(validReadme);

  assert.equal(parsed.title, "Free Crypto APIs");
  assert.equal(parsed.featured.categories.length, 7);
  assert.equal(parsed.fullCatalog.categories.length, 7);
  assert.equal(parsed.fullCatalog.categories[2]?.name, "Wallets & Portfolio");
  assert.equal(parsed.fullCatalog.categories[2]?.rows[0]?.apiName, "CoinStats");
});

test("validateReadme accepts a valid README structure", () => {
  const issues = validateReadme(validReadme);
  assert.deepEqual(issues, []);
});

test("validateReadme rejects duplicate providers in the full catalog", () => {
  const duplicated = validReadme.replace(
    "## Full Catalog\n\n### Market Data\n| API | What It Is Good For | Free Plan | Auth | Docs |\n|---|---|---|---|---|\n| [Alpha](https://alpha.test/docs) | Prices and market snapshots | Free tier with API key | `apiKey` | [Docs](https://alpha.test/docs) |",
    "## Full Catalog\n\n### Market Data\n| API | What It Is Good For | Free Plan | Auth | Docs |\n|---|---|---|---|---|\n| [Alpha](https://alpha.test/docs) | Prices and market snapshots | Free tier with API key | `apiKey` | [Docs](https://alpha.test/docs) |\n| [Alpha](https://alpha.test/docs) | Backup listing for test purposes | Free tier with API key | `apiKey` | [Docs](https://alpha.test/docs) |",
  );

  const issues = validateReadme(duplicated);

  assert.ok(issues.some((issue) => issue.includes("Duplicate API in full catalog: Alpha")));
});

test("validateReadme rejects featured entries missing from the full catalog", () => {
  const fullCatalogWithoutAlpha = "## Full Catalog\n\n### Market Data\n| API | What It Is Good For | Free Plan | Auth | Docs |\n|---|---|---|---|---|\n\n### Exchange & Trading";
  const missing = validReadme.replace(
    "## Full Catalog\n\n### Market Data\n| API | What It Is Good For | Free Plan | Auth | Docs |\n|---|---|---|---|---|\n| [Alpha](https://alpha.test/docs) | Prices and market snapshots | Free tier with API key | `apiKey` | [Docs](https://alpha.test/docs) |\n\n### Exchange & Trading",
    fullCatalogWithoutAlpha,
  );

  const issues = validateReadme(missing);

  assert.ok(issues.some((issue) => issue.includes("Featured API missing from full catalog: Alpha")));
});

test("validateReadme rejects rows without a clearly free-plan note", () => {
  const noFreePlan = validReadme.replace(
    "| [Echo Pay](https://echo.test/docs) | Crypto checkout | Free sandbox for testing | `apiKey` | [Docs](https://echo.test/docs) |",
    "| [Echo Pay](https://echo.test/docs) | Crypto checkout | Paid account required | `apiKey` | [Docs](https://echo.test/docs) |",
  );

  const issues = validateReadme(noFreePlan);

  assert.ok(issues.some((issue) => issue.includes("Free Plan note must describe documented free access: Echo Pay")));
});

test("validateReadme rejects invalid auth values", () => {
  const invalidAuth = validReadme.replace(
    "| [Foxtrot Node](https://foxtrot.test/docs) | RPC and indexing | Free tier with request caps | `apiKey` | [Docs](https://foxtrot.test/docs) |",
    "| [Foxtrot Node](https://foxtrot.test/docs) | RPC and indexing | Free tier with request caps | `Token` | [Docs](https://foxtrot.test/docs) |",
  );

  const issues = validateReadme(invalidAuth);

  assert.ok(issues.some((issue) => issue.includes("Invalid Auth value `Token` for API: Foxtrot Node")));
});
