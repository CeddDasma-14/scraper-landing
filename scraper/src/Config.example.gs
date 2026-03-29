/**
 * Config.gs
 * Central configuration. Edit here to change behaviour across all scripts.
 */

var CONFIG = {

  // Sheet tab names — must match what setupSheets() creates
  SHEETS: {
    STORES:        'Stores',
    PRODUCTS:      'Products',
    PRICE_HISTORY: 'Price History',
    NEW_DROPS:     'New Drops'
  },

  // Shopify API
  SCRAPE: {
    LIMIT:           250,    // Max products per page (Shopify max is 250)
    MAX_PAGES:       10,     // Safety cap — 250 x 10 = 2,500 products per store
    REQUEST_DELAY:   1000,   // ms between paginated requests (avoid rate limiting)
  },

  // Claude AI — get your key at console.anthropic.com
  AI: {
    ENABLED:  true,
    API_KEY:  '',   // ← Add your Anthropic API key here (console.anthropic.com)
    MODEL:    'claude-haiku-4-5-20251001',  // Fast + cheap for daily insights
    MAX_TOKENS: 1024
  },

  // Alerts — set ENABLED to true and add your Gmail address to activate
  ALERTS: {
    ENABLED:          true,   // Flip to false to disable all emails
    EMAIL:            '',     // ← PUT YOUR GMAIL ADDRESS HERE
    CC_EMAILS:        [],     // ← Additional recipients e.g. ['team@gmail.com', 'boss@gmail.com']
    SEND_ON_NEW_DROP: true,   // Instant alert when new product detected
    SEND_ON_PRICE:    true,   // Instant alert when price changes
    DAILY_REPORT_HOUR: 8      // Hour to send daily digest (8 = 8am)
  },

  // ─── PLAN TIER ───────────────────────────────────────────────────────────
  // Set this per client. Copy-paste the matching block below into PLAN: { }
  //
  // BASIC (₱800/mo)
  //   TIER: 'basic', MAX_STORES: 1, SCRAPE_INTERVAL_HOURS: 24,
  //   STOCK_TRACKING: false, AI_ENABLED: false
  //
  // STANDARD (₱2,000/mo)
  //   TIER: 'standard', MAX_STORES: 3, SCRAPE_INTERVAL_HOURS: 6,
  //   STOCK_TRACKING: true, AI_ENABLED: true
  //
  // PREMIUM (₱3,500/mo)
  //   TIER: 'premium', MAX_STORES: 999, SCRAPE_INTERVAL_HOURS: 1,
  //   STOCK_TRACKING: true, AI_ENABLED: true
  // ─────────────────────────────────────────────────────────────────────────
  PLAN: {
    TIER:                  'premium',  // ← SET CLIENT TIER HERE
    MAX_STORES:            999,        // basic=1  |  standard=3  |  premium=999
    SCRAPE_INTERVAL_HOURS: 1,          // basic=24 |  standard=6  |  premium=1
    STOCK_TRACKING:        true,       // basic=false | standard=true | premium=true
    AI_ENABLED:            true,       // basic=false | standard=true | premium=true
    KEYWORD_FILTER:        []          // [] = all products. ['shoes','bag'] = filter by keyword
  }

};
