(function () {
  'use strict';
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
  var endpoint = 'https://api.yash0.in/events';

  function makeId() {
    if (crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
  }

  function stored(storage, key) {
    try {
      var value = storage.getItem(key);
      if (!value) { value = makeId(); storage.setItem(key, value); }
      return value;
    } catch (_) { return makeId(); }
  }

  var visitorId = stored(localStorage, 'yash0_visitor');
  var sessionId = stored(sessionStorage, 'yash0_session');
  var lastPage = '';
  var milestones = {};

  function source() {
    if (!document.referrer) return '';
    try {
      var host = new URL(document.referrer).hostname.replace(/^www\./, '');
      return host.endsWith('yash0.in') ? 'Internal' : host;
    } catch (_) { return ''; }
  }

  function send(type, details) {
    var payload = JSON.stringify(Object.assign({
      visitorId: visitorId,
      sessionId: sessionId,
      type: type,
      page: location.pathname + location.search,
      referrer: source()
    }, details || {}));
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: 'text/plain;charset=UTF-8' }));
    } else {
      fetch(endpoint, { method: 'POST', body: payload, headers: { 'content-type': 'text/plain;charset=UTF-8' }, keepalive: true }).catch(function () {});
    }
  }

  function pageview() {
    var page = location.pathname + location.search;
    if (page === lastPage) return;
    lastPage = page;
    milestones = {};
    send('pageview', { target: document.title, targetText: document.title });
  }

  document.addEventListener('click', function (event) {
    var element = event.target.closest('a,button');
    if (!element) return;
    var href = element.tagName === 'A' ? element.getAttribute('href') || '' : '';
    var label = (element.getAttribute('aria-label') || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
    send(element.tagName === 'A' ? 'click' : 'interaction', { target: href || element.dataset.view || element.className || 'button', targetText: label });
  }, { capture: true, passive: true });

  addEventListener('scroll', function () {
    var available = document.documentElement.scrollHeight - innerHeight;
    if (available <= 0) return;
    var depth = Math.round(scrollY / available * 100);
    [50, 90].forEach(function (mark) {
      if (depth >= mark && !milestones[mark]) { milestones[mark] = true; send('interaction', { target: 'scroll', targetText: 'Scrolled ' + mark + '%' }); }
    });
  }, { passive: true });

  var originalPushState = history.pushState;
  history.pushState = function () { originalPushState.apply(history, arguments); setTimeout(pageview, 0); };
  addEventListener('popstate', pageview);
  setTimeout(function () { send('interaction', { target: 'engaged', targetText: '30 second visit' }); }, 30000);
  pageview();
})();
