# Vercel Production Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Wrightyard website to `https://wrightyard.vercel.app` from the GitHub repository with automatic production deploys.

**Architecture:** The Next.js app stays at the repository root and is imported into Vercel from `PrinceAscending/Wrightyard-web`. The Discord gateway bot remains a separate persistent-host service under `bot/`; it is not deployed to Vercel.

**Tech Stack:** Next.js 16.4.4, React 19, TypeScript, MongoDB Atlas, Vercel CLI/GitHub integration, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-03-vercel-deployment-design.md`

## Global Constraints

- Never commit, print, or upload `.env.local` or `bot/.env`.
- Production origin: `https://wrightyard.vercel.app` unless Vercel rejects the name.
- The bot is not hosted on Vercel.
- Credential rotation is deferred; do not rotate or alter existing credentials during this deployment.
- All production env values are entered directly into Vercel's encrypted store.

## Review Focus

- A build that succeeds locally but fails on Vercel because of missing env values.
- OAuth redirecting to localhost because `NEXT_PUBLIC_SITE_URL` was not set before deploy.
- Git accidentally including `.env.local`, `bot/.env`, or build output.
- A Vercel project name collision producing a different `vercel.app` subdomain.
- Production API routes failing because MongoDB or Discord envs were omitted.

---

### Task 1: Repository production hardening

**Files:**
- Modify: `package.json`
- Create: `.nvmrc`
- Create: `.vercelignore`
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`

**Interfaces:**
- Produces: CI that runs site `npm ci`, `npm run typecheck`, `npm run build`; bot CI in `bot/` with `npm ci`, `npm run typecheck`, `npm run build`.

- [x] Add `"engines": { "node": "22.x" }` to the root package.
- [x] Add `.nvmrc` containing `22`.
- [x] Add `.vercelignore` excluding bot runtime, dependencies, builds, and env files.
- [x] Add GitHub Actions CI with separate site and bot jobs.
- [x] Update README deployment section with the production URL and post-launch rotation note.

### Task 2: Preflight and secret scan

- [x] Run `npm run typecheck` and `npm run build` at the root.
- [x] Run `npm run typecheck` and `npm run build` in `bot/`.
- [x] Confirm `git status --ignored` excludes `.env.local`, `bot/.env`, `node_modules`, `.next`, `bot/dist`.
- [x] Scan tracked candidates for credential-like strings.
- [x] Commit repository hardening.
- [x] Push `main` to `origin`.

### Task 3: Vercel project and environment

- [x] Install/link Vercel CLI.
- [x] Authenticate to Vercel.
- [x] Import/link `PrinceAscending/Wrightyard-web` as project `wrightyard`.
- [x] Add production env vars from `.env.local` without printing values.
- [x] Confirm `wrightyard.vercel.app` is assigned.
- [x] Run a production deployment.
- [x] Connect the GitHub repository for automatic `main` deploys if not already connected.

### Task 4: Production OAuth

- [x] Add `https://wrightyard.vercel.app/api/auth/callback` to the Discord application.
- [x] Ensure `NEXT_PUBLIC_SITE_URL=https://wrightyard.vercel.app`.
- [x] Redeploy if the env was added after the first build.
- [x] Complete a real Discord sign-in against production.

### Task 5: Production verification and handoff

- [x] Verify `/`, `/status`, `/dispatch`, `/login`, `/dashboard`, `/admin` at desktop and mobile widths.
- [x] Verify `/api/status` reports Mongo and the bot state correctly.
- [x] Verify unauthenticated `/dashboard` and `/admin` redirect.
- [x] Verify a brief submission path without leaving test data.
- [x] Record the deployment URL and remaining bot-host steps in README/report.
