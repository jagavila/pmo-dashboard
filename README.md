# pmo-dashboard

Ticket dashboard for projects tracked in GitHub by the PMO framework: sprints (milestones), tickets (issues) and their status.

## Run locally

1. Create `.env` next to `compose.yaml` (it is git-ignored and kept out of the image):
   ```
   TOKEN_GITHUB=github_pat_...
   REPOS=owner/repo,owner/other-repo
   ```
   Token: fine-grained, the project repos only, **Issues: read-only**. For the In progress / In review
   columns (read from the Projects board), use a classic token with `repo` and `read:project` instead.
2. `docker compose up -d --build`
3. Open http://localhost:8080

The server reads the token from the environment and calls GitHub itself; the token never reaches
the browser. The port is bound to 127.0.0.1 only.

Without Docker: `node --env-file=.env serve.mjs`.
