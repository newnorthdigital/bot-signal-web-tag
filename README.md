# Bot Signal by New North: GTM web tag template

A Google Tag Manager web tag that records browser behaviour a server can't see, for the [Bot Score by New North](https://github.com/newnorthdigital/nnd-bot-score) server-side variable.

Bots that load real pages often scroll the page with `window.scrollTo`. That fires `scroll` events but no wheel, touch, key or pointer events. A person who scrolls always produces one of those. This tag spots the difference and writes it to a first-party cookie, so the server container can score the session.

## Features

- **Scripted-scroll detection**: flags a session that scrolled more than one viewport without any real input
- **Automation flag**: flags `navigator.webdriver`
- **Cautious with real people**: events dispatched by page code (`isTrusted` false) don't count as input. The script does not judge scrolling in the first second after load or a route change, on reloads and back/forward visits, when it loads after the visitor already scrolled (e.g. behind a consent banner), or while an on-screen iframe covering a quarter of the viewport (video, map, form) could have swallowed the input
- **No identifiers**: the cookie `_nnd_hs` holds flags only, lives 30 minutes (sliding) and is set on the widest domain the browser accepts so a same-site server container receives it
- **Consent Mode built in**: by default the tag waits for `analytics_storage`
- **Small**: about 2 KB, listeners are passive and removed once real input is seen

## Cookie format

`_nnd_hs = 1.<flags>`, with flags:

| Flag | Meaning |
| --- | --- |
| `i` | Real input seen in this session (wheel, touch, key, pointer, mouse move, click) |
| `s` | Scrolled more than one viewport with no input at all |
| `w` | `navigator.webdriver` is true |

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
| **Consent behaviour** | Follow GTM Consent Mode | Wait for `analytics_storage`, or load immediately if you gate consent elsewhere. |
| **Log to console** | off | Debug logging in GTM Preview. |

## Permissions

- `inject_script`: `https://cdn.jsdelivr.net/gh/newnorthdigital/bot-signal-web-tag@1.0.0/bot-signal.js` only (the pinned release of `bot-signal.js` from this repo)
- `access_consent`: read `analytics_storage`
- `logging`: debug only

The script itself is [`bot-signal.js`](./bot-signal.js) in this repo; the template loads a tagged release through jsDelivr.

## Resources

- [Bot Score by New North](https://github.com/newnorthdigital/nnd-bot-score) (server-side variable)

## Author

Created and maintained by [Freek Kampen](https://freekkampen.com) at [New North Digital](https://newnorth.nl).

## License

Apache 2.0, see [LICENSE](./LICENSE).
