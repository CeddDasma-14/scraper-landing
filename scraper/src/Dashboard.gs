/**
 * Dashboard.gs
 * Builds and refreshes a live Google Sheets dashboard with summary stats and charts.
 * Run buildDashboard() once to create it, then it auto-refreshes on each scrape.
 */

/**
 * Build or refresh the entire dashboard sheet.
 */
function buildDashboard() {
  try {
    Logger.log('buildDashboard: Starting...');

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateDashboardSheet(ss);

    sheet.clearContents();
    sheet.clearFormats();

    // Clear existing charts
    sheet.getCharts().forEach(function(c) { sheet.removeChart(c); });

    writeDashboardHeader(sheet);
    writeSummaryStats(sheet, ss);
    writeTopCategories(sheet, ss);
    writePriceRangeBreakdown(sheet, ss);
    writeStockSummary(sheet, ss);
    writeRecentDrops(sheet, ss);
    writePriceHistoryChart(sheet, ss);
    writeStoreBreakdown(sheet, ss);

    Logger.log('buildDashboard: Done.');

  } catch (e) {
    Logger.log('Error in buildDashboard: ' + e.message);
  }
}

// ─── SHEET SETUP ─────────────────────────────────────────────────────────────

function getOrCreateDashboardSheet(ss) {
  try {
    var sheet = ss.getSheetByName('Dashboard');
    if (!sheet) {
      sheet = ss.insertSheet('Dashboard', 0); // Insert as first tab
    }
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 150);
    sheet.setColumnWidth(5, 150);
    sheet.setColumnWidth(6, 40);  // gap column
    sheet.setColumnWidth(7, 180);
    sheet.setColumnWidth(8, 120);
    sheet.setColumnWidth(9, 120);
    sheet.setColumnWidth(10, 120);
    sheet.setColumnWidth(11, 180);
    return sheet;
  } catch (e) {
    Logger.log('Error in getOrCreateDashboardSheet: ' + e.message);
    throw e;
  }
}

// ─── SECTIONS ────────────────────────────────────────────────────────────────

function writeDashboardHeader(sheet) {
  try {
    sheet.getRange('A1:E1').merge()
      .setValue('SHOPIFY SCRAPER — LIVE DASHBOARD')
      .setFontSize(16).setFontWeight('bold')
      .setBackground('#1a1a2e').setFontColor('#ffffff')
      .setHorizontalAlignment('center');

    sheet.getRange('A2:E2').merge()
      .setValue('Last updated: ' + new Date().toLocaleString())
      .setFontSize(10).setFontColor('#888888')
      .setHorizontalAlignment('center');

    sheet.setRowHeight(1, 45);
    sheet.setRowHeight(2, 25);
  } catch (e) {
    Logger.log('Error in writeDashboardHeader: ' + e.message);
  }
}

function writeSummaryStats(sheet, ss) {
  try {
    var productsSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    var newDropsSheet = ss.getSheetByName(CONFIG.SHEETS.NEW_DROPS);
    var priceSheet    = ss.getSheetByName(CONFIG.SHEETS.PRICE_HISTORY);

    var totalProducts  = productsSheet ? Math.max(0, productsSheet.getLastRow() - 1) : 0;
    var totalDrops     = newDropsSheet ? Math.max(0, newDropsSheet.getLastRow() - 1) : 0;
    var totalChanges   = priceSheet    ? Math.max(0, priceSheet.getLastRow() - 1)    : 0;

    // Count in-stock
    var inStock = 0;
    if (productsSheet && productsSheet.getLastRow() > 1) {
      var available = productsSheet.getRange(2, 9, productsSheet.getLastRow() - 1, 1).getValues();
      available.forEach(function(row) {
        if (row[0] === true || String(row[0]).toUpperCase() === 'TRUE') inStock++;
      });
    }

    writeStatBlock(sheet, 4, 1, 'Total Products',  totalProducts, '#e8f5e9', '#2e7d32');
    writeStatBlock(sheet, 4, 2, 'New Drops Logged', totalDrops,   '#e3f2fd', '#1565c0');
    writeStatBlock(sheet, 4, 3, 'Price Changes',    totalChanges,  '#fff3e0', '#e65100');
    writeStatBlock(sheet, 4, 4, 'In Stock',          inStock,      '#f3e5f5', '#6a1b9a');
    writeStatBlock(sheet, 4, 5, 'Sold Out',          totalProducts - inStock, '#fce4ec', '#880e4f');

    sectionHeader(sheet, 3, 1, 5, 'SUMMARY STATS');

  } catch (e) {
    Logger.log('Error in writeSummaryStats: ' + e.message);
  }
}

function writeStatBlock(sheet, row, col, label, value, bg, color) {
  try {
    sheet.getRange(row, col).setValue(label)
      .setFontSize(9).setFontColor('#666666').setHorizontalAlignment('center');
    sheet.getRange(row + 1, col).setValue(value)
      .setFontSize(22).setFontWeight('bold').setFontColor(color)
      .setHorizontalAlignment('center').setBackground(bg);
    sheet.setRowHeight(row + 1, 50);
  } catch (e) {
    Logger.log('Error in writeStatBlock: ' + e.message);
  }
}

function writeTopCategories(sheet, ss) {
  try {
    var productsSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (!productsSheet || productsSheet.getLastRow() <= 1) return;

    var data      = productsSheet.getRange(2, 6, productsSheet.getLastRow() - 1, 1).getValues();
    var counts    = {};

    data.forEach(function(row) {
      var type = row[0] || 'Uncategorized';
      counts[type] = (counts[type] || 0) + 1;
    });

    var sorted = Object.keys(counts).map(function(k) {
      return [k, counts[k]];
    }).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 8);

    var startRow = 8;
    sectionHeader(sheet, startRow, 1, 3, 'TOP CATEGORIES');

    sheet.getRange(startRow + 1, 1).setValue('Category').setFontWeight('bold').setBackground('#f5f5f5');
    sheet.getRange(startRow + 1, 2).setValue('Products').setFontWeight('bold').setBackground('#f5f5f5');
    sheet.getRange(startRow + 1, 3).setValue('% of Total').setFontWeight('bold').setBackground('#f5f5f5');

    var total = data.length;
    sorted.forEach(function(item, i) {
      var r   = startRow + 2 + i;
      var pct = ((item[1] / total) * 100).toFixed(1) + '%';
      sheet.getRange(r, 1).setValue(item[0]);
      sheet.getRange(r, 2).setValue(item[1]).setHorizontalAlignment('center');
      sheet.getRange(r, 3).setValue(pct).setHorizontalAlignment('center');
      if (i % 2 === 0) {
        sheet.getRange(r, 1, 1, 3).setBackground('#fafafa');
      }
    });

  } catch (e) {
    Logger.log('Error in writeTopCategories: ' + e.message);
  }
}

function writePriceRangeBreakdown(sheet, ss) {
  try {
    var productsSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (!productsSheet || productsSheet.getLastRow() <= 1) return;

    var prices = productsSheet.getRange(2, 7, productsSheet.getLastRow() - 1, 1).getValues();
    var buckets = { 'Under $25': 0, '$25-$50': 0, '$50-$100': 0, '$100-$150': 0, 'Over $150': 0 };

    prices.forEach(function(row) {
      var p = parseFloat(row[0]) || 0;
      if      (p < 25)  buckets['Under $25']++;
      else if (p < 50)  buckets['$25-$50']++;
      else if (p < 100) buckets['$50-$100']++;
      else if (p < 150) buckets['$100-$150']++;
      else              buckets['Over $150']++;
    });

    var startRow = 8;
    sectionHeader(sheet, startRow, 4, 5, 'PRICE RANGE BREAKDOWN');

    sheet.getRange(startRow + 1, 4).setValue('Range').setFontWeight('bold').setBackground('#f5f5f5');
    sheet.getRange(startRow + 1, 5).setValue('Products').setFontWeight('bold').setBackground('#f5f5f5');

    Object.keys(buckets).forEach(function(key, i) {
      var r = startRow + 2 + i;
      sheet.getRange(r, 4).setValue(key);
      sheet.getRange(r, 5).setValue(buckets[key]).setHorizontalAlignment('center');
      if (i % 2 === 0) sheet.getRange(r, 4, 1, 2).setBackground('#fafafa');
    });

  } catch (e) {
    Logger.log('Error in writePriceRangeBreakdown: ' + e.message);
  }
}

function writeStockSummary(sheet, ss) {
  try {
    var productsSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (!productsSheet || productsSheet.getLastRow() <= 1) return;

    var data = productsSheet.getRange(2, 9, productsSheet.getLastRow() - 1, 1).getValues();
    var inStock = 0, soldOut = 0;

    data.forEach(function(row) {
      if (row[0] === true || String(row[0]).toUpperCase() === 'TRUE') inStock++;
      else soldOut++;
    });

    var total   = inStock + soldOut;
    var inPct   = total > 0 ? ((inStock / total) * 100).toFixed(1) + '%' : '0%';
    var outPct  = total > 0 ? ((soldOut / total) * 100).toFixed(1) + '%' : '0%';

    var startRow = 18;
    sectionHeader(sheet, startRow, 4, 5, 'STOCK STATUS');

    sheet.getRange(startRow + 1, 4).setValue('In Stock').setBackground('#e8f5e9');
    sheet.getRange(startRow + 1, 5).setValue(inStock + ' (' + inPct + ')').setBackground('#e8f5e9').setHorizontalAlignment('center');
    sheet.getRange(startRow + 2, 4).setValue('Sold Out').setBackground('#fce4ec');
    sheet.getRange(startRow + 2, 5).setValue(soldOut + ' (' + outPct + ')').setBackground('#fce4ec').setHorizontalAlignment('center');

  } catch (e) {
    Logger.log('Error in writeStockSummary: ' + e.message);
  }
}

function writeRecentDrops(sheet, ss) {
  try {
    var newDropsSheet = ss.getSheetByName(CONFIG.SHEETS.NEW_DROPS);
    if (!newDropsSheet || newDropsSheet.getLastRow() <= 1) return;

    var lastRow     = newDropsSheet.getLastRow();
    var count       = Math.min(10, lastRow - 1);
    var data        = newDropsSheet.getRange(lastRow - count + 1, 1, count, 10).getValues().reverse();
    var currencyMap = loadStoreCurrencyMap();

    var startRow = 22;
    sectionHeader(sheet, startRow, 1, 5, 'RECENT NEW DROPS');

    var headers = ['Date', 'Store', 'Product', 'Price', 'Stock'];
    headers.forEach(function(h, i) {
      sheet.getRange(startRow + 1, i + 1).setValue(h).setFontWeight('bold').setBackground('#f5f5f5');
    });

    data.forEach(function(row, i) {
      var r        = startRow + 2 + i;
      var inStock  = row[6] === true || String(row[6]).toUpperCase() === 'TRUE';
      var storeName = row[1];
      var symbol   = currencyMap[storeName] || '$';
      sheet.getRange(r, 1).setValue(row[0] instanceof Date ? row[0].toLocaleDateString() : row[0]);
      sheet.getRange(r, 2).setValue(storeName);
      sheet.getRange(r, 3).setValue(row[3]);
      sheet.getRange(r, 4).setValue(symbol + parseFloat(row[4]).toFixed(2));
      sheet.getRange(r, 5).setValue(inStock ? 'In Stock' : 'Sold Out')
        .setFontColor(inStock ? '#2e7d32' : '#c62828');
      if (i % 2 === 0) sheet.getRange(r, 1, 1, 5).setBackground('#fafafa');
    });

  } catch (e) {
    Logger.log('Error in writeRecentDrops: ' + e.message);
  }
}

function writePriceHistoryChart(sheet, ss) {
  try {
    var priceSheet = ss.getSheetByName(CONFIG.SHEETS.PRICE_HISTORY);
    if (!priceSheet || priceSheet.getLastRow() <= 1) return;

    var count   = Math.min(20, priceSheet.getLastRow() - 1);
    var lastRow = priceSheet.getLastRow();
    // Fetch last 20 price changes: [Timestamp, Store, ProductID, Title, OldPrice, NewPrice, Change%]
    var data    = priceSheet.getRange(lastRow - count + 1, 1, count, 7).getValues().reverse();

    var startRow = 35;
    sectionHeader(sheet, startRow, 1, 5, 'RECENT PRICE HISTORY');

    var headers = ['Date', 'Store', 'Product', 'Old Price', 'New Price', 'Change'];
    headers.forEach(function(h, i) {
      if (i < 5) sheet.getRange(startRow + 1, i + 1).setValue(h).setFontWeight('bold').setBackground('#f5f5f5');
    });
    // Use col F for Change (6th)
    sheet.getRange(startRow + 1, 6).setValue('Change').setFontWeight('bold').setBackground('#f5f5f5');

    data.forEach(function(row, i) {
      var r      = startRow + 2 + i;
      var isDown = parseFloat(row[5]) < parseFloat(row[4]);
      sheet.getRange(r, 1).setValue(row[0] instanceof Date ? row[0].toLocaleDateString() : row[0]);
      sheet.getRange(r, 2).setValue(row[1]);
      sheet.getRange(r, 3).setValue(row[3]);
      sheet.getRange(r, 4).setValue(row[4]);
      sheet.getRange(r, 5).setValue(row[5]);
      sheet.getRange(r, 6).setValue(row[6])
        .setFontColor(isDown ? '#2e7d32' : '#c62828').setFontWeight('bold');
      if (i % 2 === 0) sheet.getRange(r, 1, 1, 6).setBackground('#fafafa');
    });

  } catch (e) {
    Logger.log('Error in writePriceHistoryChart: ' + e.message);
  }
}

function writeStoreBreakdown(sheet, ss) {
  try {
    var productsSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (!productsSheet || productsSheet.getLastRow() <= 1) return;

    var data   = productsSheet.getRange(2, 1, productsSheet.getLastRow() - 1, 9).getValues();
    var stores = {};

    data.forEach(function(row) {
      var store     = String(row[0]).trim();
      var price     = parseFloat(row[6]) || 0;
      var available = row[8] === true || String(row[8]).toUpperCase() === 'TRUE';
      var type      = String(row[5]).trim() || 'Uncategorized';

      if (!stores[store]) stores[store] = { total: 0, inStock: 0, priceSum: 0, categories: {} };
      stores[store].total++;
      if (available) stores[store].inStock++;
      stores[store].priceSum += price;
      stores[store].categories[type] = (stores[store].categories[type] || 0) + 1;
    });

    var storeNames = Object.keys(stores);
    var startRow   = 3;   // aligns with top of existing dashboard content
    var startCol   = 7;   // column G — right side panel

    sectionHeader(sheet, startRow, startCol, startCol + 4, 'STORE BREAKDOWN');

    var headers = ['Store', 'Products', 'In Stock %', 'Avg Price', 'Top Category'];
    headers.forEach(function(h, i) {
      sheet.getRange(startRow + 1, startCol + i).setValue(h).setFontWeight('bold').setBackground('#f5f5f5');
    });

    storeNames.forEach(function(name, i) {
      var s          = stores[name];
      var r          = startRow + 2 + i;
      var inStockPct = s.total > 0 ? ((s.inStock / s.total) * 100).toFixed(1) + '%' : '0%';
      var avgPrice   = s.total > 0 ? '$' + (s.priceSum / s.total).toFixed(2) : '$0';
      var topCat     = Object.keys(s.categories).sort(function(a, b) {
        return s.categories[b] - s.categories[a];
      })[0] || 'N/A';

      sheet.getRange(r, startCol).setValue(name);
      sheet.getRange(r, startCol + 1).setValue(s.total).setHorizontalAlignment('center');
      sheet.getRange(r, startCol + 2).setValue(inStockPct).setHorizontalAlignment('center');
      sheet.getRange(r, startCol + 3).setValue(avgPrice).setHorizontalAlignment('center');
      sheet.getRange(r, startCol + 4).setValue(topCat);
      if (i % 2 === 0) sheet.getRange(r, startCol, 1, 5).setBackground('#fafafa');
    });

    // Chart data in cols M-N (out of the way)
    var chartDataRow = startRow + 2 + storeNames.length + 2;
    sheet.getRange(chartDataRow, 13).setValue('Store').setFontWeight('bold');
    sheet.getRange(chartDataRow, 14).setValue('Products').setFontWeight('bold');
    storeNames.forEach(function(name, i) {
      sheet.getRange(chartDataRow + 1 + i, 13).setValue(name);
      sheet.getRange(chartDataRow + 1 + i, 14).setValue(stores[name].total);
    });

    var dataRange = sheet.getRange(chartDataRow, 13, storeNames.length + 1, 2);
    var chart = sheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(dataRange)
      .setPosition(startRow + 2 + storeNames.length + 1, startCol, 0, 0)
      .setOption('title', 'Products by Store')
      .setOption('width', 500)
      .setOption('height', 260)
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { title: 'Number of Products' })
      .setOption('colors', ['#1a1a2e'])
      .build();

    sheet.insertChart(chart);

  } catch (e) {
    Logger.log('Error in writeStoreBreakdown: ' + e.message);
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sectionHeader(sheet, row, startCol, endCol, title) {
  try {
    sheet.getRange(row, startCol, 1, endCol - startCol + 1).merge()
      .setValue(title)
      .setFontWeight('bold').setFontSize(10)
      .setBackground('#1a1a2e').setFontColor('#ffffff')
      .setHorizontalAlignment('left');
    sheet.setRowHeight(row, 28);
  } catch (e) {
    Logger.log('Error in sectionHeader: ' + e.message);
  }
}
