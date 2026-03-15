/* ============================================
   NewsOnGold — Demo Disclaimer Banner
   Auto-injects into every page.
   To remove: delete this script tag from all
   HTML files (or delete this file entirely).
   ============================================ */

(function () {
  const BANNER_ID = 'nog-demo-banner';

  // Don't inject twice
  if (document.getElementById(BANNER_ID)) return;

  const style = document.createElement('style');
  style.textContent = `
    #${BANNER_ID} {
      width: 100%;
      background: #1a1a2e;
      border-bottom: 2px solid #e74c3c;
      padding: 7px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-family: 'Source Sans 3', Arial, sans-serif;
      font-size: 0.78rem;
      color: #ccc;
      box-sizing: border-box;
      z-index: 99999;
      position: relative;
      flex-wrap: wrap;
    }
    #${BANNER_ID} .nog-banner-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    #${BANNER_ID} .nog-banner-badge {
      background: #e74c3c;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 3px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
    }
    #${BANNER_ID} .nog-banner-text {
      color: #bbb;
      line-height: 1.4;
    }
    #${BANNER_ID} .nog-banner-text strong {
      color: #fff;
      font-weight: 600;
    }
    #${BANNER_ID} .nog-banner-links {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-shrink: 0;
    }
    #${BANNER_ID} .nog-banner-links a {
      color: #e8c96a;
      font-size: 0.75rem;
      text-decoration: none;
      white-space: nowrap;
    }
    #${BANNER_ID} .nog-banner-links a:hover {
      text-decoration: underline;
    }
    #${BANNER_ID} .nog-banner-close {
      background: none;
      border: 1px solid #444;
      color: #888;
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 3px;
      cursor: pointer;
      white-space: nowrap;
      font-family: inherit;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    #${BANNER_ID} .nog-banner-close:hover {
      border-color: #e74c3c;
      color: #e74c3c;
    }
    @media (max-width: 600px) {
      #${BANNER_ID} { font-size: 0.72rem; padding: 8px 12px; }
      #${BANNER_ID} .nog-banner-links { display: none; }
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.id = BANNER_ID;
  banner.setAttribute('role', 'note');
  banner.setAttribute('aria-label', 'Demo site disclaimer');
  banner.innerHTML = `
    <div class="nog-banner-left">
      <span class="nog-banner-badge">⚠️ Demo</span>
      <span class="nog-banner-text">
        <strong>This is a template/demo website.</strong>
        All ads, content, and prices shown are for demonstration purposes only.
        Any ad banners displayed are placeholders and will be replaced or removed after the demo period.
      </span>
    </div>
    <div class="nog-banner-links">
      <a href="/pages/about.html">About this project</a>
      <a href="/pages/disclaimer.html">Full Disclaimer</a>
    </div>
    <button class="nog-banner-close" id="nog-banner-close-btn" aria-label="Dismiss banner">✕ Dismiss</button>
  `;

  // Insert as very first element inside <body>
  document.body.insertBefore(banner, document.body.firstChild);

  // Dismiss button
  document.getElementById('nog-banner-close-btn').addEventListener('click', function () {
    banner.style.display = 'none';
    // Remember dismissed for this browser session only
    try { sessionStorage.setItem('nog_demo_dismissed', '1'); } catch(e) {}
  });

  // Respect previous dismiss in same session
  try {
    if (sessionStorage.getItem('nog_demo_dismissed') === '1') {
      banner.style.display = 'none';
    }
  } catch(e) {}

})();
