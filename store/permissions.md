# Permission justifications

The Chrome Web Store now requires a free-text justification for each declared permission, host permission, and the "Single Purpose" field. Paste these directly into the corresponding fields.

---

## Single purpose

```
Automatically refresh idle GitHub tabs after a configurable period of inactivity, and notify users when an active GitHub tab has not been refreshed for a configurable amount of time.
```

---

## `tabs` permission

```
Required to (1) read the URL of each tab so we can determine whether it is a GitHub page that matches a user-configured URL pattern, (2) detect which tab is currently active versus inactive (the core trigger for auto-refresh), and (3) call chrome.tabs.reload() on tabs that have exceeded the user's idle threshold. The extension does not read, modify, or transmit page content.
```

---

## `storage` permission

```
Required to persist user preferences (refresh threshold, reminder threshold, URL patterns, on/off toggles) in chrome.storage.sync so they roam across the user's signed-in Chrome browsers, and to track per-tab timestamps (last focused, last reloaded) in chrome.storage.session so refresh and reminder timing survives service-worker termination. No data leaves the user's browser.
```

---

## `alarms` permission

```
Required because Manifest V3 service workers cannot use setInterval or setTimeout reliably (the worker is terminated between events). chrome.alarms is used to schedule a periodic 30-second check that evaluates each tracked tab against its idle and reminder thresholds.
```

---

## `notifications` permission

```
Required to show an optional desktop notification when an active GitHub tab has not been refreshed within the user's reminder threshold. Notifications can be disabled in the extension's popup. The notification body contains only the elapsed time and a generic message — no page content or personal data.
```

---

## `webNavigation` permission

```
Required to detect GitHub's in-page (Turbo Frame) navigation. GitHub uses client-side routing for many transitions (e.g. clicking between PRs in a list does not fire a full page reload), so chrome.webNavigation.onHistoryStateUpdated is needed to correctly reset the "last refreshed" timestamp when the user navigates within GitHub. Without this, the reminder timer would fire incorrectly on long-lived tabs.
```

---

## Host permission: `https://github.com/*`, `https://*.github.com/*`

```
The extension's sole function is to manage tabs on GitHub. Host access is limited to github.com and its subdomains; the extension has no permission to read, modify, or interact with any other website. URL-pattern filters configured by the user further narrow which github.com pages the extension acts on.
```

---

## Data usage disclosure (declarations form)

Tick the boxes as follows:

| Question | Answer |
|---|---|
| Does this extension collect or use **personally identifiable information**? | **No** |
| Does this extension collect or use **health information**? | No |
| Does this extension collect or use **financial and payment information**? | No |
| Does this extension collect or use **authentication information** (passwords, tokens, etc.)? | No |
| Does this extension collect or use **personal communications** (emails, texts, chat messages)? | No |
| Does this extension collect or use **location** data? | No |
| Does this extension collect or use **web history**? | No |
| Does this extension collect or use **user activity** (clicks, keypresses, scroll events, etc.)? | No |
| Does this extension collect or use **website content** (text, images, audio, video)? | No |

Then certify the three statements:

- ☑ I do not sell or transfer user data to third parties, outside of the approved use cases.
- ☑ I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes.

(All three are true — the extension transmits no data, period.)
