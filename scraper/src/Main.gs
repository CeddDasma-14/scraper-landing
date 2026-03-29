/**
 * Main.gs
 * Entry point for the scraper. Run scrapeAllStores() manually or via trigger.
 * Run setupTriggers() once to enable full daily automation.
 */

// ─── MAIN SCRAPE ─────────────────────────────────────────────────────────────

/**
 * Main function — scrapes all active stores, processes changes, sends alerts.
 */
function scrapeAllStores() {
  try {
    Logger.log('=== scrapeAllStores START ===');
    var startTime = new Date();

    var stores   = loadActiveStores();
    var existing = loadExistingProducts();

    if (stores.length === 0) {
      Logger.log('scrapeAllStores: No active stores found. Add stores to the Stores sheet.');
      return;
    }

    // ── PLAN: STORE CAP ───────────────────────────────────────────────────────
    if (stores.length > CONFIG.PLAN.MAX_STORES) {
      Logger.log('scrapeAllStores: Plan cap — only scraping first ' + CONFIG.PLAN.MAX_STORES + ' store(s). Upgrade plan to add more.');
      stores = stores.slice(0, CONFIG.PLAN.MAX_STORES);
    }

    var totalSummary  = { newCount: 0, priceChanges: 0, stockChanges: 0 };
    var allNewProducts = [];
    var allPriceChanges = [];

    stores.forEach(function(store) {
      try {
        Logger.log('--- Scraping: ' + store.name + ' (' + store.url + ') ---');

        var rawProducts = fetchAllProducts(store.url);

        if (!rawProducts || rawProducts.length === 0) {
          Logger.log('scrapeAllStores: No products returned for ' + store.name);
          return;
        }

        var normalized = rawProducts.map(function(p) {
          return parseProduct(p, store.name, store.url);
        }).filter(Boolean);

        Logger.log('scrapeAllStores [' + store.name + ']: ' + normalized.length + ' products parsed.');

        var result = processProducts(normalized, existing);
        totalSummary.newCount     += result.summary.newCount;
        totalSummary.priceChanges += result.summary.priceChanges;
        totalSummary.stockChanges += result.summary.stockChanges;
        allNewProducts  = allNewProducts.concat(result.newProducts);
        allPriceChanges = allPriceChanges.concat(result.priceChanges);

        // Stamp last scraped time on Stores sheet
        if (store.rowIndex) updateLastScraped(store.rowIndex);

      } catch (storeError) {
        Logger.log('Error scraping store [' + store.name + ']: ' + storeError.message);
      }
    });

    // ── AI INSIGHTS (standard/premium only) ──────────────────────────────────
    var insight = '';
    if (CONFIG.AI.ENABLED && CONFIG.AI.API_KEY && (allNewProducts.length > 0 || allPriceChanges.length > 0)) {
      insight = generateInsights(allNewProducts, allPriceChanges);
    }

    // ── REFRESH DASHBOARD ─────────────────────────────────────────────────────
    buildDashboard();

    // ── SEND ALERTS ───────────────────────────────────────────────────────────
    if (CONFIG.ALERTS.SEND_ON_NEW_DROP && allNewProducts.length > 0) {
      sendNewDropAlert(allNewProducts);
    }
    if (CONFIG.ALERTS.SEND_ON_PRICE && allPriceChanges.length > 0) {
      sendPriceChangeAlert(allPriceChanges);
    }

    var elapsed = ((new Date() - startTime) / 1000).toFixed(1);
    Logger.log('=== scrapeAllStores DONE in ' + elapsed + 's ===');
    Logger.log('TOTAL — New: ' + totalSummary.newCount + ' | Price changes: ' + totalSummary.priceChanges + ' | Stock changes: ' + totalSummary.stockChanges);

  } catch (e) {
    Logger.log('Error in scrapeAllStores: ' + e.message);
  }
}

// ─── TRIGGER SETUP ───────────────────────────────────────────────────────────

/**
 * Run once to set up both triggers:
 * 1. Daily scrape at 8am
 * 2. Daily report email at 9am
 */
function setupTriggers() {
  try {
    deleteTriggers_();

    var intervalHours = CONFIG.PLAN.SCRAPE_INTERVAL_HOURS;

    if (intervalHours >= 24) {
      // Basic — once daily
      ScriptApp.newTrigger('scrapeAllStores')
        .timeBased()
        .everyDays(1)
        .atHour(CONFIG.ALERTS.DAILY_REPORT_HOUR)
        .create();
    } else {
      // Standard (6h) or Premium (1h) — use everyHours
      ScriptApp.newTrigger('scrapeAllStores')
        .timeBased()
        .everyHours(intervalHours)
        .create();
    }

    // Daily report always runs once a day
    ScriptApp.newTrigger('sendDailyReport')
      .timeBased()
      .everyDays(1)
      .atHour(CONFIG.ALERTS.DAILY_REPORT_HOUR + 1)
      .create();

    Logger.log('setupTriggers: Scrape every ' + intervalHours + 'h | Daily report at ' + (CONFIG.ALERTS.DAILY_REPORT_HOUR + 1) + 'am. Tier: ' + CONFIG.PLAN.TIER);

  } catch (e) {
    Logger.log('Error in setupTriggers: ' + e.message);
  }
}

/**
 * Remove all existing project triggers (prevents duplicates on re-run).
 */
function deleteTriggers_() {
  try {
    var triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function(trigger) {
      ScriptApp.deleteTrigger(trigger);
    });
    Logger.log('deleteTriggers_: Removed ' + triggers.length + ' existing trigger(s).');
  } catch (e) {
    Logger.log('Error in deleteTriggers_: ' + e.message);
  }
}

// ─── MENU ────────────────────────────────────────────────────────────────────

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Shopify Scraper')
      .addItem('Run Scrape Now', 'scrapeAllStores')
      .addItem('Send Daily Report Now', 'sendDailyReport')
      .addItem('Refresh Dashboard', 'buildDashboard')
      .addSeparator()
      .addItem('Setup Sheets', 'setupSheets')
      .addItem('Setup Daily Triggers', 'setupTriggers')
      .addToUi();
  } catch (e) {
    Logger.log('Error in onOpen: ' + e.message);
  }
}
