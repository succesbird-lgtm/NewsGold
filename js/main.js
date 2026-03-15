/* ============================================
   NewsOnGold — Main JavaScript
   Gold Price Fetcher, Calculator, UI
   ============================================ */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  metalApiKey: '156e8eae74c27cc2b2d44af0c0ae2c91',
  refreshInterval: 300000, // 5 minutes
  siteName: 'NewsOnGold',
};

// ============================================
// GOLD PRICE MODULE
// ============================================
const GoldPrice = (() => {

  // Fallback demo prices (used if API fails)
  let prices = {
    USD: { value: 3200.00, change: -0.83, symbol: '$',  flag: '🇺🇸', label: 'US', sub: 'Gold / US Dollar' },
    EUR: { value: 2950.00, change: +0.68, symbol: '€',  flag: '🇪🇺', label: 'EU', sub: 'Gold / Euro'      },
    GBP: { value: 2500.00, change: +0.83, symbol: '£',  flag: '🇬🇧', label: 'GB', sub: 'Gold / British Pound' },
    BRL: { value: 18500.00, change: +0.45, symbol: 'R$', flag: '🇧🇷', label: 'BR', sub: 'Gold / Real'     },
  };

  // Live silver / platinum / palladium (updated from API)
  let otherMetals = {
    XAG: { usd: 32.50  },
    XPT: { usd: 980.00 },
    XPD: { usd: 980.00 },
  };

  // ------------------------------------------
  // FETCH LIVE PRICES
  // API: metalpriceapi.com
  // base=USD so all rates are "units per 1 USD"
  // e.g. XAUUSD = troy oz of gold per 1 USD  → invert to get USD per oz
  //      EURUSD = EUR per 1 USD               → invert to get USD per EUR
  // ------------------------------------------
  async function fetchLivePrices() {
    try {
      const url =
        `https://api.metalpriceapi.com/v1/latest` +
        `?api_key=${CONFIG.metalApiKey}` +
        `&base=USD` +
        `&currencies=EUR,GBP,BRL,XAU,XAG,XPT,XPD`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (!json.success || !json.rates) throw new Error('Bad response from API');

      const r = json.rates;

      // r.XAUUSD = how many troy oz you get for $1  → invert = USD price per oz
      const goldUSD = (r.XAUUSD && r.XAUUSD > 0) ? (1 / r.XAUUSD) : prices.USD.value;

      // r.EURUSD = how many EUR per $1 → USD per EUR = 1/r.EURUSD
      // Gold in EUR = goldUSD / (1/r.EURUSD) = goldUSD * r.EURUSD
      const goldEUR = (r.EURUSD && r.EURUSD > 0) ? goldUSD * r.EURUSD : prices.EUR.value;
      const goldGBP = (r.GBPUSD && r.GBPUSD > 0) ? goldUSD * r.GBPUSD : prices.GBP.value;
      const goldBRL = (r.BRLUSD && r.BRLUSD > 0) ? goldUSD * r.BRLUSD : prices.BRL.value;

      prices.USD.value = parseFloat(goldUSD.toFixed(2));
      prices.EUR.value = parseFloat(goldEUR.toFixed(2));
      prices.GBP.value = parseFloat(goldGBP.toFixed(2));
      prices.BRL.value = parseFloat(goldBRL.toFixed(2));

      // Other metals (same invert logic: 1/rate = USD price per oz)
      if (r.XAGUSD && r.XAGUSD > 0) otherMetals.XAG.usd = parseFloat((1 / r.XAGUSD).toFixed(2));
      if (r.XPTUSD && r.XPTUSD > 0) otherMetals.XPT.usd = parseFloat((1 / r.XPTUSD).toFixed(2));
      if (r.XPDUSD && r.XPDUSD > 0) otherMetals.XPD.usd = parseFloat((1 / r.XPDUSD).toFixed(2));

      console.log('✅ Live prices loaded:', {
        goldUSD: prices.USD.value,
        goldEUR: prices.EUR.value,
        goldGBP: prices.GBP.value,
        goldBRL: prices.BRL.value,
        silverUSD: otherMetals.XAG.usd,
      });

      return true;

    } catch (err) {
      console.warn('⚠️ MetalPriceAPI fetch failed — using fallback prices.', err.message);
      return false;
    }
  }

  // ------------------------------------------
  // RENDER MAIN GOLD PRICE CARDS
  // ------------------------------------------
  function renderPrices() {
    const grid = document.getElementById('goldPricesGrid');
    if (!grid) return;

    const displayCurrencies = ['USD', 'EUR', 'GBP'];
    grid.innerHTML = displayCurrencies.map(cur => {
      const p = prices[cur];
      if (!p || !p.value || isNaN(p.value)) return '';
      const isUp = p.change >= 0;
      const changeStr = (isUp ? '+' : '') + p.change.toFixed(2) + '%';
      return `
        <div class="price-card">
          <div class="currency-flag">${p.flag}</div>
          <div class="currency-label">${p.label}</div>
          <div class="currency-name">${p.sub}</div>
          <div class="price-value">${p.symbol}${p.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span class="price-change ${isUp ? 'up' : 'down'}">${changeStr}</span>
        </div>
      `;
    }).join('');
  }

  // ------------------------------------------
  // RENDER SCROLLING TICKER
  // ------------------------------------------
  function renderTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    const GRAMS_PER_OZ = 31.1035;

    // Safe divide helper — never returns NaN
    function safeDiv(value, divisor) {
      if (!value || isNaN(value) || !divisor) return null;
      const result = value / divisor;
      return isNaN(result) ? null : parseFloat(result.toFixed(2));
    }

    const goldUSD  = prices.USD.value;
    const goldEUR  = prices.EUR.value;
    const goldBRL  = prices.BRL.value;
    const silverUSD = otherMetals.XAG.usd;
    const platUSD  = otherMetals.XPT.usd;
    const palladUSD = otherMetals.XPD.usd;

    const metals = [
      {
        name: 'GOLD (oz)',
        usd: goldUSD,
        unit: '/oz',
        change: prices.USD.change,
        up: prices.USD.change >= 0,
      },
      {
        name: 'GOLD (g)',
        usd: safeDiv(goldUSD, GRAMS_PER_OZ),
        unit: '/g',
        change: -0.83,
        up: false,
      },
      {
        name: 'GOLD (BRL)',
        usd: null,
        brl: goldBRL,
        unit: '/oz',
        change: +0.45,
        up: true,
      },
      {
        name: 'SILVER (XAG)',
        usd: silverUSD,
        unit: '/oz',
        change: +0.31,
        up: true,
      },
      {
        name: 'PLATINUM',
        usd: platUSD,
        unit: '/oz',
        change: -1.24,
        up: false,
      },
      {
        name: 'PALLADIUM',
        usd: palladUSD,
        unit: '/oz',
        change: +0.56,
        up: true,
      },
    ];

    const items = metals.map(m => {
      // Pick the display price
      let displayPrice = null;
      let symbol = '$';

      if (m.brl && !isNaN(m.brl) && m.brl > 0) {
        displayPrice = m.brl;
        symbol = 'R$';
      } else if (m.usd && !isNaN(m.usd) && m.usd > 0) {
        displayPrice = m.usd;
        symbol = '$';
      }

      // Skip if no valid price
      if (!displayPrice) return '';

      const priceStr = `${symbol}${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${m.unit}`;
      const changeStr = (m.up ? '+' : '') + m.change.toFixed(2) + '%';

      return `
        <div class="ticker-item">
          <span class="metal-name">${m.name}</span>
          <span class="price">${priceStr}</span>
          <span class="change ${m.up ? 'up' : 'down'}">${changeStr}</span>
          <span class="sparkline">${m.up ? '↗' : '↘'}</span>
        </div>
      `;
    }).filter(Boolean); // remove any empty strings

    // Duplicate for seamless infinite scroll
    track.innerHTML = [...items, ...items].join('');
  }

  // ------------------------------------------
  // INIT
  // ------------------------------------------
  async function init() {
    // Show fallback prices immediately while fetching
    renderPrices();
    renderTicker();

    // Then fetch live and re-render
    await fetchLivePrices();
    renderPrices();
    renderTicker();
    showRefreshFeedback();

    // Auto-refresh every 5 minutes
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
        showRefreshFeedback();
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
  const purity = {
    '24K (99.9%)': 0.999,
    '22K (91.6%)': 0.916,
    '21K (87.5%)': 0.875,
    '18K (75.0%)': 0.750,
    '14K (58.3%)': 0.583,
    '10K (41.7%)': 0.417,
    '9K (37.5%)':  0.375,
  };

  const GRAMS_PER_OZ = 31.1035;

  function calculate() {
    const weightInput   = document.getElementById('calcWeight');
    const puritySelect  = document.getElementById('calcPurity');
    const currencySelect = document.getElementById('calcCurrency');
    const resultBox     = document.getElementById('calcResult');
    const resultValue   = document.getElementById('calcResultValue');

    if (!weightInput || !puritySelect || !currencySelect) return;

    const weight = parseFloat(weightInput.value);
    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid weight in grams.');
      return;
    }

    const selectedPurity = purity[puritySelect.value] || 0.999;
    const currency       = currencySelect.value;
    const currentPrices  = GoldPrice.prices();
    const pricePerOz     = currentPrices[currency]?.value || 3200.00;
    const symbol         = currentPrices[currency]?.symbol || '$';

    const pricePerGram = pricePerOz / GRAMS_PER_OZ;
    const rawValue     = weight * pricePerGram * selectedPurity;

    resultValue.textContent = symbol + rawValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mainNav');
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', mobileNav.classList.contains('open'));
      });
    }

    const searchBtn     = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch   = document.getElementById('closeSearch');

    if (searchBtn && searchOverlay) {
      searchBtn.addEventListener('click', e => {
        e.preventDefault();
        searchOverlay.classList.add('open');
        setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
      });
    }
    if (closeSearch && searchOverlay) {
      closeSearch.addEventListener('click', () => searchOverlay.classList.remove('open'));
      searchOverlay.addEventListener('click', e => {
        if (e.target === searchOverlay) searchOverlay.classList.remove('open');
      });
    }

    // Highlight active nav link
    const path = window.location.pathname;
    document.querySelectorAll('.main-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (path.endsWith('/') && href === '/index.html')) {
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
  const el   = document.getElementById('readingTime');
  if (!body || !el) return;
  const words = body.innerText.trim().split(/\s+/).length;
  const mins  = Math.ceil(words / 200);
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
