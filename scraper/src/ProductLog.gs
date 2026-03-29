/**
 * ProductLog.gs
 * All read/write operations against the Google Sheets data store.
 * Uses batch writes (setValues) instead of appendRow per product — much faster.
 */

// ─── READ ────────────────────────────────────────────────────────────────────

/**
 * Load all existing products from the Products sheet into a Map keyed by "store|productId".
 * @returns {Map} key → row object
 */
function loadExistingProducts() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.PRODUCTS);
    var existing = new Map();

    if (!sheet || sheet.getLastRow() <= 1) {
      return existing;
    }

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues();

    data.forEach(function(row, i) {
      var store     = row[0];
      var productId = String(row[1]);
      if (store && productId) {
        existing.set(store + '|' + productId, {
          rowIndex:       i + 2,
          store:          store,
          id:             productId,
          title:          row[2],
          handle:         row[3],
          vendor:         row[4],
          type:           row[5],
          price:          parseFloat(row[6]) || 0,
          compareAtPrice: parseFloat(row[7]) || 0,
          available:      row[8],
          tags:           row[9],
          imageUrl:       row[10],
          productUrl:     row[11],
          firstSeen:      row[12],
          lastUpdated:    row[13],
          description:    row[14] || ''
        });
      }
    });

    Logger.log('loadExistingProducts: Loaded ' + existing.size + ' existing products.');
    return existing;

  } catch (e) {
    Logger.log('Error in loadExistingProducts: ' + e.message);
    return new Map();
  }
}

/**
 * Load all active store URLs from the Stores sheet.
 * @returns {Array} array of { name, url } objects
 */
function loadActiveStores() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.STORES);
    var stores = [];

    if (!sheet || sheet.getLastRow() <= 1) {
      Logger.log('loadActiveStores: No stores found in sheet.');
      return stores;
    }

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();

    data.forEach(function(row, i) {
      var name     = String(row[0]).trim();
      var url      = String(row[1]).trim();
      var active   = String(row[2]).toUpperCase();
      var currency = String(row[4]).trim() || '$';
      if (name && url && active === 'TRUE') {
        stores.push({ name: name, url: url, rowIndex: i + 2, currency: currency });
      }
    });

    Logger.log('loadActiveStores: Found ' + stores.length + ' active store(s).');
    return stores;

  } catch (e) {
    Logger.log('Error in loadActiveStores: ' + e.message);
    return [];
  }
}

/**
 * Returns a map of store name → currency symbol from the Stores sheet.
 * @returns {Object} e.g. { 'Gymshark': '$', 'iStore PH': '₱' }
 */
function loadStoreCurrencyMap() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.STORES);
    var map = {};
    if (!sheet || sheet.getLastRow() <= 1) return map;
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    data.forEach(function(row) {
      var name     = String(row[0]).trim();
      var currency = String(row[4]).trim() || '$';
      if (name) map[name] = currency;
    });
    return map;
  } catch (e) {
    Logger.log('Error in loadStoreCurrencyMap: ' + e.message);
    return {};
  }
}

/**
 * Stamp the "Last Scraped" time in column D of the Stores sheet for a given store.
 * @param {number} rowIndex - 1-indexed row of the store
 */
function updateLastScraped(rowIndex) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.STORES);
    sheet.getRange(rowIndex, 4).setValue(new Date());
  } catch (e) {
    Logger.log('Error in updateLastScraped: ' + e.message);
  }
}

// ─── BATCH WRITE ─────────────────────────────────────────────────────────────

/**
 * Batch-append all new products in one shot — much faster than appendRow per product.
 * @param {Array} products - array of normalized product objects
 */
function batchAppendProducts(products) {
  try {
    if (!products || products.length === 0) return;

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.PRODUCTS);
    var now   = new Date();

    var rows = products.map(function(p) {
      return [
        p.store, p.id, p.title, p.handle, p.vendor, p.type,
        p.price, p.compareAtPrice, p.available, p.tags,
        p.imageUrl, p.productUrl, now, now, p.description || ''
      ];
    });

    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, 15).setValues(rows);

    Logger.log('batchAppendProducts: Wrote ' + rows.length + ' new products.');

  } catch (e) {
    Logger.log('Error in batchAppendProducts: ' + e.message);
  }
}

/**
 * Batch-append all new drops in one shot.
 * @param {Array} products - array of normalized product objects
 */
function batchLogNewDrops(products) {
  try {
    if (!products || products.length === 0) return;

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.NEW_DROPS);
    var now   = new Date();

    var rows = products.map(function(p) {
      return [
        now, p.store, p.id, p.title, p.price,
        p.compareAtPrice, p.available, p.tags, p.imageUrl, p.productUrl
      ];
    });

    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, 10).setValues(rows);

    Logger.log('batchLogNewDrops: Logged ' + rows.length + ' new drops.');

  } catch (e) {
    Logger.log('Error in batchLogNewDrops: ' + e.message);
  }
}

/**
 * Batch-append price changes in one shot.
 * @param {Array} changes - array of { product, oldPrice }
 */
function batchLogPriceChanges(changes) {
  try {
    if (!changes || changes.length === 0) return;

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.PRICE_HISTORY);
    var now   = new Date();

    var rows = changes.map(function(c) {
      var changePct = c.oldPrice > 0
        ? (((c.product.price - c.oldPrice) / c.oldPrice) * 100).toFixed(2) + '%'
        : 'N/A';
      return [now, c.product.store, c.product.id, c.product.title, c.oldPrice, c.product.price, changePct];
    });

    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, 7).setValues(rows);

    Logger.log('batchLogPriceChanges: Logged ' + rows.length + ' price changes.');

  } catch (e) {
    Logger.log('Error in batchLogPriceChanges: ' + e.message);
  }
}

/**
 * Update price, availability and last-updated for a single existing product row.
 * @param {number} rowIndex - 1-indexed sheet row
 * @param {Object} updatedProduct
 */
function updateProductRow(rowIndex, updatedProduct) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.PRODUCTS);
    sheet.getRange(rowIndex, 7, 1, 3).setValues([[updatedProduct.price, updatedProduct.compareAtPrice, updatedProduct.available]]);
    sheet.getRange(rowIndex, 14).setValue(new Date());
  } catch (e) {
    Logger.log('Error in updateProductRow [row:' + rowIndex + ']: ' + e.message);
  }
}
