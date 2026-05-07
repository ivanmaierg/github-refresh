# CWS — Privacy tab

Paste-ready values for every field on the **Privacy** tab of the CWS developer dashboard, in form order.

---

## 1. Single purpose description (max 1000 chars)

```
Automatically refresh idle GitHub tabs after a configurable period of inactivity, and notify users when an active GitHub tab has not been refreshed for a configurable amount of time.
```

---

## 2. Permission justifications

### `tabs`

```
Required to (1) read the URL of each tab so we can determine whether it is a GitHub page that matches a user-configured URL pattern, (2) detect which tab is currently active versus inactive (the core trigger for auto-refresh), and (3) call chrome.tabs.reload() on tabs that have exceeded the user's idle threshold. The extension does not read, modify, or transmit page content.
```

### `storage`

```
Required to persist user preferences (refresh threshold, reminder threshold, URL patterns, on/off toggles) in chrome.storage.sync so they roam across the user's signed-in Chrome browsers, and to track per-tab timestamps (last focused, last reloaded) in chrome.storage.session so refresh and reminder timing survives service-worker termination. No data leaves the user's browser.
```

### `alarms`

```
Required because Manifest V3 service workers cannot use setInterval or setTimeout reliably (the worker is terminated between events). chrome.alarms is used to schedule a periodic 30-second check that evaluates each tracked tab against its idle and reminder thresholds.
```

### `notifications`

```
Required to show an optional desktop notification when an active GitHub tab has not been refreshed within the user's reminder threshold. Notifications can be disabled in the extension's popup. The notification body contains only the elapsed time and a generic message — no page content or personal data.
```

### `webNavigation`

```
Required to detect GitHub's in-page (Turbo Frame) navigation. GitHub uses client-side routing for many transitions (e.g. clicking between PRs in a list does not fire a full page reload), so chrome.webNavigation.onHistoryStateUpdated is needed to correctly reset the "last refreshed" timestamp when the user navigates within GitHub. Without this, the reminder timer would fire incorrectly on long-lived tabs.
```

### Host permission

> Hosts: `https://github.com/*`, `https://*.github.com/*`

```
The extension's sole function is to manage tabs on GitHub. Host access is limited to github.com and its subdomains; the extension has no permission to read, modify, or interact with any other website. URL-pattern filters configured by the user further narrow which github.com pages the extension acts on.
```

---

## 3. Remote code

Select **"No, I am not using Remote code"**.

No justification needed. All JavaScript is bundled at build time — no `eval()`, no `<script>` tags fetching from external URLs, no dynamic imports from CDNs.

---

## 4. Data usage — leave every box **UNCHECKED**

| Category | Action |
|---|---|
| Personally identifiable information | ☐ unchecked |
| Health information | ☐ unchecked |
| Financial and payment information | ☐ unchecked |
| Authentication information | ☐ unchecked |
| Personal communications | ☐ unchecked |
| Location | ☐ unchecked |
| Web history | ☐ unchecked |
| User activity | ☐ unchecked |
| Website content | ☐ unchecked |

The extension reads tab URLs locally only — it never transmits, stores remotely, or analyzes page content. None of these categories apply.

---

## 5. Certifications — check **all three**

- ☑ I do not sell or transfer user data to third parties, outside of the approved use cases
- ☑ I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes

All three are true — the extension transmits zero data, has a single purpose, and does no credit/lending work.

---

## 6. Privacy policy URL (required)

```
https://ivanmaierg.github.io/github-refresh/PRIVACY.html
```

The page is live and serves a 200 — already verified.

---

## After this tab

Click **Save draft** (top right). Then go to:

1. **Distribution** tab — Visibility: **Public**, Regions: **All regions**, Pricing: **Free**
2. **Submit for review** (top right of the dashboard)

Review takes 1–3 business days.
