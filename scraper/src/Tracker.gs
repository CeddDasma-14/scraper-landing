/**
 * Tracker.gs
 * Compares freshly scraped products against the existing log.
 * Collects all changes then writes them in batch — avoids the 6-min timeout.
 */

/**
 * Process scraped products, detect changes, and batch-write everything to Sheets.
 * @param {Array} products  - normalized products from parseProduct()
 * @param {Map}   existing  - loaded from loadExistingProducts()
 * @returns {Object} summary { newCount, priceChanges, stockChanges }
 */
function processProducts(products, existing) {
  var summary      = { newCount: 0, priceChanges: 0, stockChanges: 0 };
  var newProducts  = [];
  var priceChanges = [];

  try {
    // ── KEYWORD FILTER ───────────────────────────────────────────────────────
    var keywords = CONFIG.PLAN.KEYWORD_FILTER;
    if (keywords && keywords.length > 0) {
      products = products.filter(function(p) {
        if (!p) return false;
        var text = (p.title + ' ' + (p.type || '') + ' ' + (p.tags || '')).toLowerCase();
        return keywords.some(function(kw) {
          return text.indexOf(kw.toLowerCase()) !== -1;
        });
      });
      Logger.log('processProducts: Keyword filter active — ' + products.length + ' products match [' + keywords.join(', ') + '].');
    }

    products.forEach(function(product) {
      if (!product) return;

      try {
        var key = product.store + '|' + product.id;

        if (!existing.has(key)) {
          // ── NEW PRODUCT ──────────────────────────────────────────────────
          newProducts.push(product);
          existing.set(key, product);  // prevent duplicate in same run
          summary.newCount++;

        } else {
          var saved      = existing.get(key);
          var hasChanges = false;

          // ── PRICE CHANGE ─────────────────────────────────────────────────
          if (saved.price !== product.price) {
            priceChanges.push({ product: product, oldPrice: saved.price });
            summary.priceChanges++;
            hasChanges = true;
          }

          // ── STOCK CHANGE (standard/premium only) ─────────────────────────
          if (CONFIG.PLAN.STOCK_TRACKING && saved.available !== product.available) {
            summary.stockChanges++;
            hasChanges = true;
          }

          if (hasChanges) {
            updateProductRow(saved.rowIndex, product);
          }
        }

      } catch (innerError) {
        Logger.log('Error processing product [id:' + (product && product.id) + ']: ' + innerError.message);
      }
    });

    // ── BATCH WRITES ─────────────────────────────────────────────────────────
    batchAppendProducts(newProducts);
    batchLogNewDrops(newProducts);
    batchLogPriceChanges(priceChanges);

    Logger.log('processProducts SUMMARY — New: ' + summary.newCount + ' | Price changes: ' + summary.priceChanges + ' | Stock changes: ' + summary.stockChanges);

    // Return summary + raw arrays so Main.gs can pass them to alert functions
    return { summary: summary, newProducts: newProducts, priceChanges: priceChanges };

  } catch (e) {
    Logger.log('Error in processProducts: ' + e.message);
    return { summary: summary, newProducts: [], priceChanges: [] };
  }
}
