# Deployment Guide — unwrenchable.github.io

Full setup and deployment reference for the portfolio site. Covers GitHub Pages, the contact-form-to-Issues pipeline, the admin panel, email notifications, and the Vercel API fallback.

---

## Table of Contents

1. [How the Stack Works](#1-how-the-stack-works)
2. [Prerequisites](#2-prerequisites)
3. [One-Time GitHub Setup](#3-one-time-github-setup)
   - 3a. [Create the `contact-form` label](#3a-create-the-contact-form-label)
   - 3b. [Create a fine-grained PAT (FORM_TOKEN)](#3b-create-a-fine-grained-pat-form_token)
   - 3c. [Add FORM_TOKEN as a repo secret](#3c-add-form_token-as-a-repo-secret)
   - 3d. [Switch Pages source to GitHub Actions](#3d-switch-pages-source-to-github-actions)
4. [Admin Panel Setup](#4-admin-panel-setup)
5. [Email Notification Setup (Optional)](#5-email-notification-setup-optional)
6. [Deploying the Site](#6-deploying-the-site)
7. [Vercel API Route (api/contact.js)](#7-vercel-api-route-apicontactjs)
8. [How the Contact Form Works End-to-End](#8-how-the-contact-form-works-end-to-end)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. How the Stack Works

| Layer | Tech | Purpose |
|-------|------|---------|
| Static site | HTML / Tailwind CSS / vanilla JS | Portfolio, contact form UI |
| Deployment | GitHub Actions → GitHub Pages | Build & serve the site |
| Contact form backend | GitHub Issues API (via injected PAT) | Stores submissions as Issues |
| Admin panel | `admin.html` + GitHub Issues API | Read / close / reply to submissions |
| Email alerts | `dawidd6/action-send-mail` GitHub Action | Notify owner of new submissions |
| Optional API | Vercel (`api/contact.js`) | Server-side fallback route |

The contact form in `index.html` calls the GitHub Issues API directly from the browser using a token that is injected at build time — the token is stored as a repo secret and is **never committed to source**.

---

## 2. Prerequisites

- A GitHub account with owner access to this repository
- Git installed locally (`git --version`)
- A browser — no build tools (Node, npm, etc.) are required for the static site

---

## 3. One-Time GitHub Setup

### 3a. Create the `contact-form` label

The workflows and the API route tag every contact submission with this label.

1. Go to **github.com/Unwrenchable/unwrenchable.github.io → Issues → Labels**
2. Click **New label**
3. Set:
   - **Label name**: `contact-form` *(exact spelling, lowercase)*
   - **Color**: `#84cc16` (lime — matches the site theme)
4. Click **Create label**

> **Why this matters:** The `contact-form-notify.yml` workflow fires on `issues: labeled` and checks `github.event.label.name == 'contact-form'`. If the label doesn't exist or is spelled differently the notification email will never send.

---

### 3b. Create a fine-grained PAT (FORM_TOKEN)

This token lets the contact form create Issues on your behalf.

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
   Direct URL: <https://github.com/settings/tokens?type=beta>
2. Click **Generate new token**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Token name | `unwrenchable-form-token` (or any label you'll recognise) |
   | Expiration | Set a reminder — 90 days is a safe default; you can choose "No expiration" |
   | Resource owner | Your personal account |
   | Repository access | **Only select repositories → unwrenchable.github.io** |
4. Under **Repository permissions**, find **Issues** and set it to **Read and Write**
5. All other permissions can stay at *No access*
6. Click **Generate token**
7. **Copy the token immediately** — GitHub shows it only once

> ⚠️ Do not paste the token into any file, chat, or commit message.

---

### 3c. Add FORM_TOKEN as a repo secret

1. Go to **Settings → Secrets and variables → Actions** in this repo
2. Click **New repository secret**
3. Set:
   - **Name**: `FORM_TOKEN`
   - **Secret**: paste the token you copied in step 3b
4. Click **Add secret**

The deploy workflow (`deploy.yml`) reads this secret and runs:

```sh
sed -i "s|YOUR_GITHUB_PAT_HERE|${FORM_TOKEN}|g" index.html
```

This replaces the placeholder string in `index.html` with the real token at build time, so the deployed page can make authenticated GitHub API calls while the source stays clean.

---

### 3d. Switch Pages source to GitHub Actions

1. Go to **Settings → Pages** in this repo
2. Under **Build and deployment → Source**, select **GitHub Actions**
3. Save

From this point on, every push to `main` triggers the deploy workflow and publishes the site automatically. You can also trigger a deploy manually from **Actions → Deploy to GitHub Pages → Run workflow**.

---

## 4. Admin Panel Setup

`admin.html` is a protected page that lets you read, close, and reply to contact-form Issues without leaving the browser.

**No secrets are pre-configured for the admin panel.** Authentication happens at runtime:

1. Navigate to `https://unwrenchable.github.io/admin.html`
2. Enter the **GitHub PAT** in the login field when prompted
   - You can reuse the `FORM_TOKEN` PAT from step 3b (it already has Issues read/write)
   - Or generate a separate fine-grained PAT with the same permissions for extra separation
3. Click **Login** — the token is stored only in `sessionStorage` and is cleared when you close the tab

> The admin panel never sends the token anywhere except the GitHub API (`api.github.com`). It is not logged, stored in cookies, or sent to any third party.

---

## 5. Email Notification Setup (Optional)

When a new contact-form Issue is opened, the `contact-form-notify.yml` workflow can send you an email automatically.

### 5a. Create a Gmail App Password

Regular Gmail passwords won't work with SMTP. You need an App Password:

1. Enable 2-Step Verification on the Google account you want to send from (<https://myaccount.google.com/security>)
2. Go to <https://myaccount.google.com/apppasswords>
3. Select app **Mail**, device **Other (custom name)**, name it `unwrenchable-notify`
4. Copy the 16-character password

### 5b. Add the three email secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret name | Value |
|-------------|-------|
| `EMAIL_USERNAME` | The Gmail address you send *from* (e.g. `you@gmail.com`) |
| `EMAIL_PASSWORD` | The 16-character App Password from step 5a |
| `NOTIFY_EMAIL` | The address you want alerts *sent to* (can be the same address) |

> If you use a provider other than Gmail, update `server_address` and `server_port` in `.github/workflows/contact-form-notify.yml`.

### 5c. How the notification fires

The workflow triggers on `issues: labeled`. Every time an issue receives the `contact-form` label the workflow:

1. Parses the issue body to extract name, email, and message
2. Sends a formatted email to `NOTIFY_EMAIL`
3. Includes a direct link to the Issue and to the admin panel

If the three email secrets are not set, the workflow will fail silently (the step errors, but the Issue is already created so no submission is lost).

---

## 6. Deploying the Site

### Push to main (automatic)

```sh
git add .
git commit -m "your change description"
git push origin main
```

The `deploy.yml` workflow starts within seconds. Watch progress at:  
**Actions → Deploy to GitHub Pages**

Deployment takes ~30–60 seconds. The live site is at <https://unwrenchable.github.io>.

### Manual deploy (no code change)

1. Go to **Actions → Deploy to GitHub Pages**
2. Click **Run workflow → Run workflow**

### What the workflow does

```
checkout → validate FORM_TOKEN secret → inject token into index.html
→ rsync site files to /tmp/site (excludes .git and .github)
→ upload Pages artifact → deploy to GitHub Pages
```

The `.github` directory (workflows, README) is intentionally excluded from the deployed artifact so workflow files are not publicly served.

---

## 7. Vercel API Route (api/contact.js)

`api/contact.js` is an optional server-side handler that can be deployed to Vercel as a fallback if you ever need to avoid embedding the token in the browser at all.

### Deploy to Vercel

1. Import the repo at <https://vercel.com/new>
2. Vercel auto-detects `vercel.json` and sets up the `/api/contact` route
3. Go to **Project Settings → Environment Variables** and add:
   | Variable | Value |
   |----------|-------|
   | `GITHUB_PAT` | A fine-grained PAT with **Issues: Read & Write** AND **Contents: Read & Write** on this repo |

   > ⚠️ **Both permissions are required.** `Issues: Read & Write` creates the contact-form issue. `Contents: Read & Write` uploads file attachments to the `uploads/` folder via the GitHub Contents API. If you only grant Issues permission, attachment uploads will silently fail and the issue body will show `_(upload failed)_`.
4. Redeploy — the route is now live at `https://<your-vercel-app>.vercel.app/api/contact`

### Route behaviour

- Accepts `POST` with JSON body `{ name, email, message, file? }`
  - `file` is optional: `{ name: string, type: string, data: base64string }`
- If a file is provided, uploads it to `uploads/` in the repository via the GitHub Contents API, then links it in the issue body
- Creates a GitHub Issue with the `contact-form` label
- Returns `{ success: true, issueUrl: "..." }` on success
- Returns an appropriate HTTP error status on failure

> The GitHub Pages site currently calls the GitHub API directly from the browser using the injected token. The Vercel route is a separate deployment and is not used by the default Pages setup.

---

## 8. How the Contact Form Works End-to-End

```
Visitor fills in form → JS collects name / email / message / optional file
  → (optional) FileReader encodes attachment as base64
  → POST https://unwrenchable-github-io.vercel.app/api/contact
     Body: { name, email, message, file?: { name, type, data } }

  Inside the Vercel function:
    ① If a file is attached:
         PUT https://api.github.com/repos/Unwrenchable/unwrenchable.github.io/contents/uploads/<timestamp>-<rand>-<filename>
         Authorization: Bearer GITHUB_PAT  (needs Contents: Read & Write)
         → File stored in the repo; HTML URL added to issue body
    ② POST https://api.github.com/repos/Unwrenchable/unwrenchable.github.io/issues
         Authorization: Bearer GITHUB_PAT  (needs Issues: Read & Write)
         Body: { title: "[Contact Form] <name>", body: "...", labels: ["contact-form"] }
         → Issue created

  → Issue gets "contact-form" label
  → contact-form-notify.yml fires (if email secrets are set)
  → Email sent to NOTIFY_EMAIL
  → Admin reads/closes issue via admin.html
```

---

## 9. Troubleshooting

### Deploy workflow fails: `FORM_TOKEN secret is not set`

The `validate FORM_TOKEN secret is set` step explicitly checks for the secret.

**Fix:** Complete [step 3b](#3b-create-a-fine-grained-pat-form_token) and [step 3c](#3c-add-form_token-as-a-repo-secret), then re-run the workflow.

---

### Contact form shows an error on submission

Open the browser console (F12 → Console) and look for the API response.

| Error | Likely cause | Fix |
|-------|-------------|-----|
| `401 Unauthorized` | Token is expired or wrong | Regenerate PAT, update `FORM_TOKEN` secret, redeploy |
| `403 Forbidden` | Token lacks Issues write permission | Regenerate PAT with Issues: Read & Write |
| `404 Not Found` | Wrong repo name in the API URL | Check `api/contact.js` and the inline fetch in `index.html` |
| `422 Unprocessable Entity` | `contact-form` label doesn't exist | Complete [step 3a](#3a-create-the-contact-form-label) |
| `CORS error` | Only happens when testing locally | Use a local server (`python3 -m http.server`) or test on the deployed site |

---

### Attachment upload fails — issue body shows `_(upload failed)_`

The contact form issue is created but the attached file is not stored and the issue body contains `_(upload failed)_`.

**Cause:** The `GITHUB_PAT` Vercel environment variable does not have `Contents: Read & Write` permission. Attachment uploads use the GitHub Contents API, which is a separate permission from `Issues: Read & Write`.

**Fix:**
1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Either edit the existing `GITHUB_PAT` token or generate a new one
3. Under **Repository permissions** for `unwrenchable.github.io`, set **both**:
   - **Issues**: Read & Write
   - **Contents**: Read & Write
4. Copy the (new) token
5. Go to your Vercel project → **Settings → Environment Variables**
6. Update `GITHUB_PAT` with the new token value
7. **Redeploy** the Vercel project so the new environment variable takes effect

---

### Email notifications not arriving

1. Confirm all three secrets (`EMAIL_USERNAME`, `EMAIL_PASSWORD`, `NOTIFY_EMAIL`) are set — Settings → Secrets and variables → Actions
2. Check the workflow run: **Actions → Contact Form Notification** — expand the "Send email notification" step for SMTP errors
3. If using Gmail, confirm 2FA is enabled and the App Password is 16 characters with no spaces
4. Check spam / junk folder

---

### Admin panel shows "Unauthorized" or blank

- The session token may have expired or the tab was closed and `sessionStorage` was cleared
- Re-enter your PAT on the login screen
- Confirm the PAT still has Issues: Read & Write permissions (it may have expired)

---

### Pages site is not updating after a push

1. Check **Actions** — the workflow may have failed
2. Confirm **Settings → Pages → Source** is set to **GitHub Actions** (not a branch)
3. If the workflow succeeded but the site looks stale, hard-refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) to bypass browser cache

---

### Token accidentally committed to source

1. **Immediately revoke the token** — go to GitHub → Settings → Developer settings → Personal access tokens, find the token, click **Delete**
2. Remove the token value from the commit (rewrite history or simply replace it with the placeholder `YOUR_GITHUB_PAT_HERE`)
3. Generate a new PAT and update the `FORM_TOKEN` secret
4. Force-push the cleaned branch if necessary

> GitHub automatically scans public repos for exposed tokens and will revoke them, but don't rely on that — revoke manually and rotate immediately.

---

*Last updated: April 2026*
