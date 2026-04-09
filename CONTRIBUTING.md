# Contributing to Free Crypto APIs

This repository is for developers looking for cryptocurrency APIs they can realistically try without talking to sales first.

Pull requests that market paid-only APIs, vague "contact us" enterprise offerings, or tools with no clearly documented free access path will be closed.

## Inclusion Standard

An API is eligible only if its official docs or developer pages clearly document at least one of these:

- a free tier
- a free trial
- a free sandbox
- public no-auth endpoints
- a free self-hosted or open-source access path

If the free story is unclear, do not add it yet.

## Entry Format

Each row uses this format:

| API | What It Is Good For | Free Plan | Auth | Docs |
| --- | --- | --- | --- | --- |
| [API Name](https://example.com/docs) | Short use-case summary | Plain-English note about the documented free path | `apiKey` | [Docs](https://example.com/docs) |

## Required Rules

- Use the API's official documentation or developer portal, not blog posts, review sites, or mirrors.
- The `Free Plan` column must explain how the free access works in plain English.
- Keep API names consistent and do not add duplicate providers anywhere in the categorized list.
- Put the API in the single category that best matches its primary use case.
- Use one API addition or one focused cleanup per pull request.
- Search the README first so you do not add a duplicate provider.

## Auth Values

Use one of these values only:

- `No`
- `apiKey`
- `OAuth`
- `User-Agent`
- `X-Mashape-Key`
- `Mixed`

Use `Mixed` when the API has free public endpoints plus authenticated or private endpoints.

## Pull Request Tips

- Keep descriptions short and specific.
- Prefer official wording for the free-plan note, but rewrite it so humans can scan it quickly.
- Run `npm test` and `npm run validate:readme` before opening the pull request.
- Run `npm run validate:links` when you are changing docs URLs or doing link cleanup.

Thanks for helping keep the list genuinely useful.
