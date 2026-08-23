# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- Create an issue with `gh issue create`.
- Read an issue with `gh issue view <number> --comments`.
- List issues with `gh issue list`.
- Comment with `gh issue comment`.
- Apply or remove labels with `gh issue edit`.
- Close issues with `gh issue close`.

Infer the repository from `git remote -v`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

- **Map:** create one issue labelled `wayfinder:map` containing Destination, Notes, Decisions so far, Not yet specified, and Out of scope.
- **Child ticket:** create an issue with one `wayfinder:<type>` label and link it as a GitHub sub-issue of the map. If sub-issues are unavailable, add it to a task list in the map and begin its body with `Part of <map URL>`.
- **Blocking:** use GitHub native issue dependencies. Add a blocker through `repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by` with the blocker's numeric database id. If dependencies are unavailable, add a `Blocked by:` line containing named issue links.
- **Frontier:** list the map's open, unassigned child issues and exclude those with open blockers. The first remaining child in map order is the next ticket.
- **Claim:** assign the child issue to the driving developer before any work.
- **Resolve:** post the answer as a comment, close the child issue, and append a named link with a one-line gist to the map's Decisions so far.
