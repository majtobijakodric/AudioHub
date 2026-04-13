---
name: docs-update
description: Update project documentation to match the current codebase and user-facing behavior. Use this skill when features, routes, setup steps, scripts, environment variables, or workflows change and the docs in `docs/` or `README.md` need to be added, corrected, reorganized, or expanded.
license: Complete terms in LICENSE.txt
---

This skill keeps project documentation accurate, beginner-friendly, and aligned with the repository's current behavior.

Use it whenever code changes affect setup, API behavior, scripts, configuration, files, architecture, or any workflow that users or contributors rely on.

## Primary Goal

Update the smallest set of documentation files needed so the docs match reality.

## Source Of Truth

Before editing docs, verify details from the codebase instead of guessing.

Check the current implementation for:
- Routes, request and response shapes, and status codes
- Scripts in `package.json`
- Environment variables and startup requirements
- Storage paths, generated files, and important directories
- Repo structure and any referenced commands

If the code and existing docs disagree, prefer the code.

## Documentation Rules

Follow the repository guidance in `.github/copilot-instructions.md`:
- Documentation lives in `docs/` and must be indexed from `README.md`
- Keep one topic per file and use lowercase file names
- Write for beginners first and define terms before using them heavily
- Use numbered steps for setup and operations flows
- Include copy-paste-ready commands and expected outcomes where useful
- Cross-link related docs instead of duplicating the same explanation

## How To Update Docs

1. Identify which documentation is affected.
2. Confirm the current behavior from code, config, scripts, or tests.
3. Update existing docs before creating new files.
4. Add a new doc only when the topic does not fit an existing file.
5. If you add a new doc file, link it from `README.md` in the Documentation section.
6. Keep examples realistic and consistent with the current project.

## Writing Standards

- Use clear headings that describe the section content
- Prefer short paragraphs and direct language
- State prerequisites explicitly
- Show concrete examples for requests, commands, or file paths
- Mention important caveats, but avoid filler and repetition
- Do not document behavior that is not implemented

## API Documentation Checklist

When updating API docs, confirm and document:
- Method and route path
- Purpose of the endpoint
- Required request headers, params, and body fields
- Success status codes and response shapes
- Common error cases and status codes
- Related frontend or client usage notes only if they help clarify behavior

## Setup Documentation Checklist

When updating setup or operations docs, confirm and document:
- Required tools and versions if they matter
- Environment variables that must exist
- Install, generate, migrate, build, and run commands
- Expected verification steps
- Common failure cases users are likely to hit

## Keep Changes Tight

- Prefer correcting inaccurate text over rewriting entire files
- Preserve working links and existing structure unless there is a clear improvement
- Avoid adding speculative sections such as future work or optional architecture notes unless requested

The result should be documentation that a new contributor can follow without needing to inspect the code first.
