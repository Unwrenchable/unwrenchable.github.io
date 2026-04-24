# Unwrenchable

Shadow coder from the grid. Building clean tools, interactive prototypes, web utilities, game logic, and automation scripts. No fluff — just deployable code that runs silent.

Most work stays under the radar. Some echoes are live. Dig deep if you're hunting the real vault.

## Quick Links

- **Portfolio / Pages Site**: [unwrenchable.github.io](https://unwrenchable.github.io)

- **Live Demos / Tools**
  - [Reverse Phone Search](https://reverse-phone-search.vercel.app/) — Lookup names, carriers, spam info from phone numbers
  - [9DTTT.com](https://9dttt.com) — Multi-dimensional Tic-Tac-Toe game portal (9-board strategic twist)
  - [htowncountry.com](https://htowncountry-com.onrender.com) — Simple responsive landing example
  - (More utilities & prototypes wake on demand via Render/Vercel — check portfolio section below)

- **GitHub**: [github.com/Unwrenchable](https://github.com/Unwrenchable)
- **X / Contact**: [@AtomicFizzCaps](https://x.com/AtomicFizzCaps) — DMs open for collabs or gigs

## Current Focus (March 2026)

- Web utilities & lookup tools (JS/Python)
- Game logic & prototypes (especially multi-dimensional or strategic variants)
- Automation bots & AI scripting
- Router/security optimizers
- Emerging chain/game support tools (EVM/Solana/XRP experiments)

High activity lately: 3k+ contributions last year, heavy commits across JS/Python/TypeScript.

## Highlighted Projects

| Project | Description | Tech | Status / Demo |
|---------|-------------|------|---------------|
| **ATOMIC-FIZZ-CAPS-VAULT-77-WASTELAND-GPS** | Core pride-and-joy project — wasteland-themed GPS/exploration system (game/world-building vibes) | JavaScript | Active dev • Hidden layers (Easter egg territory) |
| **reverse-phone-search** | Reverse phone lookup app — name/carrier/spam detection | Python + Vercel | [Live](https://reverse-phone-search.vercel.app/) |
| **9dttt** | Forked/enhanced 9-Dimensional Tic-Tac-Toe prototype & portal | JavaScript | [Live portal](https://9dttt.com) |
| **fluffy-memory** | Web app to find medical aid/programs that accept insurance + onboarding help | JavaScript | Concept stage • User-focused finder |
| **speedRouter** | Modem UI to optimize connection/security settings + VPN/speed test | Python | Render deploy (may sleep) |
| **overseer-bot-ai** (+ overseer-bot-ui) | AI/bot framework for oversight & automation | Python | Tooling layer |
| **FizzSwap** | DEX prototype supporting Atomic Fizz Caps game ecosystem (multi-chain) | TypeScript | Early dev |
| **cookbook** | Real-time idea testing & creation across chains | TypeScript | Active |
| **LustLink** | Adult video streaming/broadcast + tipping platform | JavaScript | Concept |
| **AnyaBikini** | Website for bikini brand | JavaScript | Static site |
| **improved-enigma** | File converter/tool | Python | Utility |
| **crispy-octo-guacamole** | Trivia game night app | JavaScript | Fun prototype |

More repos in the vault — some private, some sleeping. Check [Repositories tab](https://github.com/Unwrenchable?tab=repositories) for full list.

## Services / Gigs (Freelance)

Open for select projects:
- Quick websites / landing pages (Starter: $750–$950)
- Full-stack web tools & apps (JS/Node/Python)
- Interactive/game prototypes
- Automation bots & scripts
- Custom utilities (lookup tools, optimizers, etc.)

Details & pricing → DM on X or see live portfolio site (if deployed).

## Tech Stack Snapshot

- **Frontend**: HTML/CSS/JS, React/Next.js (when needed)
- **Backend/Tools**: Node, Python (automation/AI)
- **Deploys**: Vercel, Render, Netlify, GitHub Pages
- **Other**: TypeScript, game logic systems, chain experiments

## Find the Easter Egg

The deepest project isn't on the surface.  
Keep exploring the game world — coordinates hidden in plain sight.  
Vault echoes await those who dig.

---

Built & maintained in the shadows.  
Last update: March 2026  
© Unwrenchable

---

## Contact Form Setup (one-time)

The contact form on the site submits directly to **GitHub Issues** — no third-party services.

### 1. Create the `contact-form` label
Go to **github.com/Unwrenchable/unwrenchable.github.io → Issues → Labels** and create a label named exactly `contact-form` (color #84cc16 looks good).

### 2. Create a GitHub fine-grained PAT for form submissions
Go to **GitHub → Settings → Developer settings → Fine-grained personal access tokens → Generate new token**.
- Repository access: only `unwrenchable.github.io`
- Permissions → Repository → **Issues: Read & Write**

Copy the token and paste it into `index.html` where it says `YOUR_GITHUB_PAT_HERE` inside `FORM_CONFIG`.

### 3. Create a GitHub PAT for the admin panel
Same steps as above (can reuse the same token, or create a separate one).  
You enter this token in the **GITHUB PAT** field when you log into `admin.html`. It is stored only in `sessionStorage` — never in source code.

### 4. Set up email notifications (optional)
Add these three secrets to **Settings → Secrets and variables → Actions**:

| Secret name      | Value |
|------------------|-------|
| `EMAIL_USERNAME` | Your Gmail address |
| `EMAIL_PASSWORD` | A Gmail [App Password](https://myaccount.google.com/apppasswords) |
| `NOTIFY_EMAIL`   | The address that should receive alerts |

The workflow in `.github/workflows/contact-form-notify.yml` fires automatically whenever a new `contact-form` issue is opened.
