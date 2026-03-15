/* ============================================
   NewsOnGold — Main JavaScript
   Gold Price Fetcher, Calculator, UI
   ============================================ */

// ============================================
// CONFIGURATION — Edit these values
// ============================================
const CONFIG = {
  // Free gold price APIs (no key needed for basic):
  // Primary: goldapi.io (requires free key) — replace YOUR_KEY
  // Fallback: static demo prices
  goldApiKey: '',          // Add your goldapi.io key here (free tier available)
  metalApiKey: '',         // OR add metalpriceapi.com key
  refreshInterval: 300000, // 5 minutes
  siteName: 'NewsOnGold',
};

// ============================================
// GOLD PRICE MODULE
// ============================================
const GoldPrice = (() => {
  // Fallback / demo prices (updated manually or via API)
  let prices = {
    USD: { value: 2045.71, change: -0.83, symbol: '$', flag: '🇺🇸', label: 'US', sub: 'Gold / US Dollar' },
    EUR: { value: 1882.05, change: +0.68, symbol: '€', flag: '🇪🇺', label: 'EU', sub: 'Gold / Euro' },
    GBP: { value: 1616.11, change: +0.83, symbol: '£', flag: '🇬🇧', label: 'GB', sub: 'Gold / British Pound' },
    BRL: { value: 10230.00, change: +0.45, symbol: 'R$', flag: '🇧🇷', label: 'BR', sub: 'Gold / Real' },
  };

  // Try fetching live price from a free endpoint
  async function fetchLivePrices() {
    try {
      // Using a free, no-auth CORS proxy approach with metals-api public demo
      // For production: replace with your actual API key from goldapi.io (free)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      // goldprice.org open API (no key needed, CORS-friendly)
      const res = await fetch(
        'https://data-asg.goldprice.org/GetData/USD-XAU,EUR-XAU,GBP-XAU,BRL-XAU/1',
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (!res.ok) throw new Error('API error');
      const json = await res.json();

      if (json && json.items && json.items.length > 0) {
        const item = json.items[0];
        // goldprice returns price per troy oz
        const currencies = ['USD', 'EUR', 'GBP', 'BRL'];
        const vals = item.split(',');
        currencies.forEach((cur, i) => {
          if (vals[i]) {
            prices[cur].value = parseFloat(vals[i]);
          }
        });
        return true;
      }
    } catch (err) {
      console.log('Live price fetch failed, using demo data:', err.message);
    }
    return false;
  }

  function renderPrices() {
    const grid = document.getElementById('goldPricesGrid');
    if (!grid) return;

    const displayCurrencies = ['USD', 'EUR', 'GBP'];
    grid.innerHTML = displayCurrencies.map(cur => {
      const p = prices[cur];
      const isUp = p.change >= 0;
      const changeStr = (isUp ? '+' : '') + p.change.toFixed(2) + '%';
      return `
        <div class="price-card">
          <div class="currency-flag">${p.flag}</div>
          <div class="currency-label">${p.label}</div>
          <div class="currency-name">${p.sub}</div>
          <div class="price-value">${p.symbol}${p.value.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
          <span class="price-change ${isUp ? 'up' : 'down'}">${changeStr}</span>
        </div>
      `;
    }).join('');
  }

  function renderTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    const metals = [
      { name: 'GOLD (XAU)', prices: { USD: prices.USD.value, EUR: prices.EUR.value }, unit: '/oz' },
      { name: 'SILVER (XAG)', prices: { USD: 24.32, EUR: 22.18 }, unit: '/oz' },
      { name: 'PLATINUM', prices: { USD: 958.40, EUR: 876.50 }, unit: '/oz' },
      { name: 'PALLADIUM', prices: { USD: 1024.00, EUR: 936.00 }, unit: '/oz' },
      { name: 'GOLD (g)', prices: { USD: (prices.USD.value / 31.1035).toFixed(2), EUR: (prices.EUR.value / 31.1035).toFixed(2) }, unit: '/g' },
      { name: 'GOLD (BRL)', prices: { BRL: prices.BRL.value }, unit: '/oz' },
    ];

    const changes = ['-0.83%', '+0.31%', '-1.24%', '+0.56%', '-0.83%', '+0.45%'];
    const directions = [false, true, false, true, false, true];

    const items = metals.map((m, i) => {
      const priceStr = m.prices.USD
        ? `$${parseFloat(m.prices.USD).toLocaleString('en-US', {minimumFractionDigits:2})}${m.unit}`
        : `R$${parseFloat(m.prices.BRL).toLocaleString('en-US', {minimumFractionDigits:2})}${m.unit}`;
      return `
        <div class="ticker-item">
          <span class="metal-name">${m.name}</span>
          <span class="price">${priceStr}</span>
          <span class="change ${directions[i] ? 'up' : 'down'}">${changes[i]}</span>
          <span class="sparkline">${directions[i] ? '↗' : '↘'}</span>
        </div>
      `;
    });

    // Duplicate for seamless loop
    track.innerHTML = [...items, ...items].join('');
  }

  async function init() {
    await fetchLivePrices();
    renderPrices();
    renderTicker();

    // Auto-refresh
    setInterval(async () => {
      await fetchLivePrices();
      renderPrices();
      renderTicker();
      showRefreshFeedback();
    }, CONFIG.refreshInterval);

    // Manual refresh button
    const btn = document.getElementById('btnRefresh');
    if (btn) {
      btn.addEventListener('click', async () => {
        btn.textContent = 'Refreshing...';
        btn.disabled = true;
        await fetchLivePrices();
        renderPrices();
        renderTicker();
        btn.textContent = 'Refresh';
        btn.disabled = false;
      });
    }
  }

  function showRefreshFeedback() {
    const ts = document.getElementById('lastUpdated');
    if (ts) {
      const now = new Date();
      ts.textContent = 'Updated ' + now.toLocaleTimeString();
    }
  }

  return { init, prices: () => prices };
})();

// ============================================
// GOLD CALCULATOR MODULE
// ============================================
const GoldCalc = (() => {
  // Gold purity multipliers
  const purity = {
    '24K (99.9%)': 0.999,
    '22K (91.6%)': 0.916,
    '21K (87.5%)': 0.875,
    '18K (75.0%)': 0.750,
    '14K (58.3%)': 0.583,
    '10K (41.7%)': 0.417,
    '9K (37.5%)':  0.375,
  };

  // Grams per troy ounce
  const GRAMS_PER_OZ = 31.1035;

  function calculate() {
    const weightInput = document.getElementById('calcWeight');
    const puritySelect = document.getElementById('calcPurity');
    const currencySelect = document.getElementById('calcCurrency');
    const resultBox = document.getElementById('calcResult');
    const resultValue = document.getElementById('calcResultValue');

    if (!weightInput || !puritySelect || !currencySelect) return;

    const weight = parseFloat(weightInput.value);
    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid weight in grams.');
      return;
    }

    const selectedPurity = purity[puritySelect.value] || 0.999;
    const currency = currencySelect.value;
    const currentPrices = GoldPrice.prices();
    const pricePerOz = currentPrices[currency]?.value || 2045.71;
    const symbol = currentPrices[currency]?.symbol || '$';

    // Calculate: (weight_g / g_per_oz) * purity * price_per_oz
    const pricePerGram = pricePerOz / GRAMS_PER_OZ;
    const rawValue = weight * pricePerGram * selectedPurity;

    resultValue.textContent = symbol + rawValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    resultBox.classList.add('visible');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function init() {
    const btn = document.getElementById('btnCalculate');
    if (btn) btn.addEventListener('click', calculate);

    const input = document.getElementById('calcWeight');
    if (input) {
      input.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
    }
  }

  return { init };
})();

// ============================================
// NAVIGATION MODULE
// ============================================
const Nav = (() => {
  function init() {
    // Mobile hamburger
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mainNav');
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', mobileNav.classList.contains('open'));
      });
    }

    // Search overlay
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');

    if (searchBtn && searchOverlay) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.classList.add('open');
        setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
      });
    }
    if (closeSearch && searchOverlay) {
      closeSearch.addEventListener('click', () => searchOverlay.classList.remove('open'));
      searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) searchOverlay.classList.remove('open');
      });
    }

    // Active nav link
    const path = window.location.pathname;
    document.querySelectorAll('.main-nav a').forEach(link => {
      if (link.getAttribute('href') === path ||
          (path.endsWith('/') && link.getAttribute('href') === '/index.html')) {
        link.classList.add('active');
      }
    });
  }

  return { init };
})();

// ============================================
// READING TIME
// ============================================
function addReadingTime() {
  const body = document.querySelector('.article-page-body');
  const el = document.getElementById('readingTime');
  if (!body || !el) return;
  const words = body.innerText.trim().split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  el.textContent = mins + ' min read';
}

// ============================================
// SMOOTH ANCHOR SCROLL
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  GoldPrice.init();
  GoldCalc.init();
  addReadingTime();
  initSmoothScroll();
});
