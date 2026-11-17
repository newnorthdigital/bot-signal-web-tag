# Bot Signal by New North: GTM web tag template

A Google Tag Manager web tag that records browser behaviour a server can't see, for the [Bot Score by New North](https://github.com/newnorthdigital/nnd-bot-score) server-side variable.

Version 2 loads New North's observer (`https://monitor.newnorth.nl/o.js`), the same script the NND Tag Monitor uses. It watches how the page is used and reports letters, never positions, timings, keys, text or identifiers, in two places: the dataLayer event `nnd_visitor_signal` with `nnd_hs: "2.<letters>"`, and the first-party cookie `_nnd_hs` (30 minutes, widest domain the browser accepts, so a same-site server container receives it).

## Letters (`2.<letters>`, sorted)

| Letter | Meaning |
| --- | --- |
| `d` | `navigator.webdriver` is true |
| `p` | a global an automation framework leaves on the page (Playwright, Selenium, PhantomJS) |
| `z` | Chrome's own brand list names HeadlessChrome, whatever the user agent says |
| `b` | keys in a burst: 3+ key gaps, median under 10 ms |
| `e` | even typing: 4+ gaps, mean 20 ms or more, spread under 3 ms |
| `i` | text inserted with no key pressed |
| `k` | a keypress with no keydown before it |
| `u` | an untrusted (script-dispatched) click or key |
| `j` | a 400 px pointer jump in one move |
| `r` | a scripted straight pointer line |
| `s` | scrolled more than a viewport with no input at all (not judged in the first second, on reload or back/forward, when the page was already scrolled, or while a large iframe in view could have taken the input) |
| `m` | an AI agent's on-page overlay (Claude in Chrome, Codex) |
| `x` | an AI agent's browser global |
| `q` | too little input to judge |

[Bot Score by New North](https://github.com/newnorthdigital/nnd-bot-score) turns these into a score and a class (human, agent, crawler, bot). Input letters need two together to reach its default threshold and never count on a purchase. An agent's own traces make it an agent, a customer, not a bot.

Version 1 (`1.<flags>`: `i` input seen, `s` scripted scroll, `w` webdriver) is still served from jsDelivr at `@1.0.0` for containers that installed it.

## Installation

### Gallery (recommended)

1. In GTM, click **New Tag → Tag Configuration → Discover more tag types in the Community Template Gallery**
2. Search for **Bot Signal** (publisher: New North Digital)
3. Click **Add to workspace**

### Manual

1. Download `template.tpl` from this repo
2. In GTM, go to **Templates → New** in the *Tag Templates* section
3. Click the overflow menu → **Import** and select the `.tpl` file

## Setup

1. Create a tag with the **Bot Signal by New North** template and fire it on **All Pages**.
2. In the server container, add the **Bot Score by New North** variable. It reads the cookie by itself when the server container runs on a same-site subdomain (e.g. `sst.example.com`).
3. Server container on another domain? Create a **1st-party cookie** variable for `_nnd_hs` in the web container and add it as event parameter `nnd_hs` on your GA4 event tags (an Event Settings variable works), so it is read fresh on every event.
4. Run Bot Score in score mode first and watch the distribution before blocking anything.

Behaviour arrives after the landing `page_view`, so use the score to hold back conversions and to label traffic, not to block the first hit. A bot that drives a real mouse or wheel isn't caught by this signal; Bot Score's IP and header checks cover other cases.

## Field reference

| Field | Default | Purpose |
| --- | --- | --- |
| **Consent behaviour** | Follow GTM Consent Mode | Wait for `analytics_storage`, or load immediately. Bots never answer a consent banner, so waiting means most bots get no letters and Bot Score falls back to its header and IP checks; loading before consent reads device information and writes a cookie without consent, which needs your own legal basis. |
| **Log to console** | off | Debug logging in GTM Preview. |

## Permissions

- `inject_script`: `https://monitor.newnorth.nl/o.js*` only. The script is served unversioned, so a fix reaches every container without a template update; add `monitor.newnorth.nl` to a strict CSP `script-src`.
- `access_consent`: read `analytics_storage`
- `logging`: debug only

Version 1's script, [`bot-signal.js`](./bot-signal.js), stays in this repo for containers pinned to `@1.0.0`.

## Resources

- [Bot Score by New North](https://github.com/newnorthdigital/nnd-bot-score) (server-side variable)

## Author

Created and maintained by [Freek Kampen](https://freekkampen.com) at [New North Digital](https://newnorth.nl).

## License

Apache 2.0, see [LICENSE](./LICENSE).
