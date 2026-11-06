/*! Bot Signal by New North | Apache-2.0 | https://github.com/newnorthdigital/bot-signal-web-tag */
// Records behaviour evidence the server cannot see, as flags in the
// first-party cookie _nnd_hs ("1.<flags>", session-scoped, no identifiers):
//   i = real input seen (wheel, touch, key, pointer, mouse move, click)
//   s = page scrolled more than one viewport with no input at all (scripted scroll)
//   w = navigator.webdriver is true (browser under automation)
// The Bot Score sGTM variable reads the cookie (or the nnd_hs event parameter).
(function (w, d) {
  if (w.__nndBotSignal) return;
  w.__nndBotSignal = 1;

  var NAME = '_nnd_hs';
  var MAX_AGE = 1800; // 30 min sliding, like a GA session
  var SETTLE_MS = 1000; // ignore scroll restoration / #hash jumps right after load or route change
  var INPUTS = ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown', 'mousedown', 'mousemove', 'click'];
  var opts = { capture: true, passive: true };

  // Union of every _nnd_hs copy (other tabs, other domain levels), sorted.
  var read = function () {
    var out = '';
    var re = /(?:^|;\s*)_nnd_hs=1\.([a-z]*)/g;
    var m;
    while ((m = re.exec(d.cookie))) {
      for (var j = 0; j < m[1].length; j++) if (out.indexOf(m[1][j]) === -1) out += m[1][j];
    }
    return out.split('').sort().join('');
  };
  var flags = read();
  var has = function (f) { return flags.indexOf(f) !== -1; };

  // Write on the widest domain the browser accepts (same idea as gtag's
  // cookie_domain 'auto') so a same-site sGTM subdomain receives it.
  var write = function () {
    var v = NAME + '=1.' + flags + ';path=/;max-age=' + MAX_AGE + ';samesite=lax' +
      (location.protocol === 'https:' ? ';secure' : '');
    var parts = location.hostname.split('.');
    for (var k = parts.length - 2; k >= 0; k--) {
      d.cookie = v + ';domain=' + parts.slice(k).join('.');
      if (read() === flags) return;
    }
    d.cookie = v; // localhost / IP / public-suffix fallback: host-only
  };
  // Merge what other tabs wrote first, so one tab never erases another's 'i'.
  var set = function (f) {
    var merged = read();
    for (var j = 0; j < flags.length; j++) if (merged.indexOf(flags[j]) === -1) merged += flags[j];
    if (merged.indexOf(f) === -1) merged += f;
    flags = merged.split('').sort().join('');
    write();
  };

  if (w.navigator && w.navigator.webdriver === true && !has('w')) set('w');
  else if (flags) write(); // refresh the sliding expiry on every page

  if (has('i')) return; // human evidence already in this session: nothing more to learn

  // Inconclusive pages: we arrived after the visitor already scrolled (late
  // load behind a consent banner) or the browser restores a position (reload,
  // back/forward). Input before we loaded is invisible, so don't judge.
  var nav = w.performance && performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  var judge = w.scrollY === 0 && !(nav && (nav.type === 'reload' || nav.type === 'back_forward'));

  // An iframe swallows the touch/wheel events of a gesture that starts on it
  // (scroll chaining still scrolls the page), so that input is invisible to us.
  // Only an on-screen, visible iframe covering a quarter of the viewport counts:
  // an off-screen 300x250 ad or a hidden helper frame does not.
  var frames = d.getElementsByTagName('iframe');
  var iframeInView = function () {
    var vw = w.innerWidth, vh = w.innerHeight;
    for (var j = 0; j < frames.length; j++) {
      var r = frames[j].getBoundingClientRect();
      var ow = Math.min(r.right, vw) - Math.max(r.left, 0);
      var oh = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (ow > 0 && oh > 0 && ow * oh >= vw * vh / 4) {
        var cs = w.getComputedStyle(frames[j]);
        if (cs.visibility !== 'hidden' && cs.opacity !== '0') return true;
      }
    }
    return false;
  };
  var sawIframe = false;

  var travelled = 0;
  var lastY = w.scrollY;
  var settled = false;
  var timer;
  var resettle = function () {
    settled = false;
    clearTimeout(timer);
    timer = setTimeout(function () { settled = true; lastY = w.scrollY; }, SETTLE_MS);
  };
  resettle();

  var stop = function () {
    INPUTS.forEach(function (t) { w.removeEventListener(t, onInput, opts); });
    w.removeEventListener('scroll', onScroll, opts);
    w.removeEventListener('popstate', resettle);
    w.removeEventListener('hashchange', resettle);
  };
  var onInput = function (e) { if (e.isTrusted === false) return; set('i'); stop(); }; // ignore page-dispatched fakes
  var onScroll = function () {
    if (!settled) return;
    // No scroll-anchoring guard needed: anchoring only moves a page that is
    // already scrolled, and without input that first scroll was either a
    // script (counts) or a restore (excluded above).
    travelled += Math.abs(w.scrollY - lastY);
    lastY = w.scrollY;
    if (!sawIframe && frames.length && iframeInView()) sawIframe = true;
    if (travelled > w.innerHeight) {
      w.removeEventListener('scroll', onScroll, opts);
      if (!sawIframe) set('s');
    }
  };

  INPUTS.forEach(function (t) { w.addEventListener(t, onInput, opts); });
  w.addEventListener('popstate', resettle); // SPA back/forward restores scroll
  w.addEventListener('hashchange', resettle);
  if (judge) w.addEventListener('scroll', onScroll, opts);
})(window, document);
