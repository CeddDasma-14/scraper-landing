/**
 * DailyReport.gs
 * Sends a daily summary email with all new drops, price changes, and stock updates
 * from the past 24 hours. Run via a daily time-based trigger.
 */

/**
 * Main function — reads yesterday's data from sheets and sends a summary email.
 * Triggered daily at a set hour via setupDailyReportTrigger().
 */
function sendDailyReport() {
  try {
    if (!CONFIG.ALERTS.ENABLED || !CONFIG.ALERTS.EMAIL) {
      Logger.log('sendDailyReport: Alerts disabled or no email set. Skipping.');
      return;
    }

    Logger.log('sendDailyReport: Building report...');

    var cutoff      = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago
    var newDrops    = getRecentNewDrops(cutoff);
    var priceChanges = getRecentPriceChanges(cutoff);

    if (newDrops.length === 0 && priceChanges.length === 0) {
      Logger.log('sendDailyReport: Nothing to report in the last 24h. No email sent.');
      return;
    }

    var subject = '[Scraper] Daily Report — ' + new Date().toDateString();
    var body    = buildDailyReportBody(newDrops, priceChanges);

    var options = { htmlBody: body };
    if (CONFIG.ALERTS.CC_EMAILS && CONFIG.ALERTS.CC_EMAILS.length > 0) {
      options.cc = CONFIG.ALERTS.CC_EMAILS.join(',');
    }
    GmailApp.sendEmail(CONFIG.ALERTS.EMAIL, subject, '', options);
    Logger.log('sendDailyReport: Report sent. New drops: ' + newDrops.length + ' | Price changes: ' + priceChanges.length);

  } catch (e) {
    Logger.log('Error in sendDailyReport: ' + e.message);
  }
}

// ─── DATA READERS ─────────────────────────────────────────────────────────────

/**
 * Pull new drops from the New Drops sheet within the cutoff window.
 * @param {Date} cutoff
 * @returns {Array} array of row arrays
 */
function getRecentNewDrops(cutoff) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.NEW_DROPS);
    if (!sheet || sheet.getLastRow() <= 1) return [];

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();

    return data.filter(function(row) {
      var ts = new Date(row[0]);
      return ts >= cutoff;
    });

  } catch (e) {
    Logger.log('Error in getRecentNewDrops: ' + e.message);
    return [];
  }
}

/**
 * Pull price changes from the Price History sheet within the cutoff window.
 * @param {Date} cutoff
 * @returns {Array} array of row arrays
 */
function getRecentPriceChanges(cutoff) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.PRICE_HISTORY);
    if (!sheet || sheet.getLastRow() <= 1) return [];

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();

    return data.filter(function(row) {
      var ts = new Date(row[0]);
      return ts >= cutoff;
    });

  } catch (e) {
    Logger.log('Error in getRecentPriceChanges: ' + e.message);
    return [];
  }
}

// ─── EMAIL BUILDER ────────────────────────────────────────────────────────────

function buildDailyReportBody(newDrops, priceChanges) {
  try {
    var dropsSection   = buildDropsSection(newDrops);
    var changesSection = buildChangesSection(priceChanges);

    // Pull latest AI insight from sheet if available
    var aiSection = '';
    try {
      var aiSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AI Insights');
      if (aiSheet && aiSheet.getLastRow() > 1) {
        var latestInsight = aiSheet.getRange(aiSheet.getLastRow(), 4).getValue();
        if (latestInsight) aiSection = buildInsightEmailSection(latestInsight);
      }
    } catch (aiErr) {
      Logger.log('DailyReport: Could not load AI insight — ' + aiErr.message);
    }

    var summary =
      '<div style="display:flex;gap:16px;margin-bottom:24px;">' +
        buildStatCard('New Products', newDrops.length, '#c6f6d5', '#276749') +
        buildStatCard('Price Changes', priceChanges.length, '#bee3f8', '#2b6cb0') +
      '</div>';

    return buildEmailWrapper(
      'Daily Scraper Report',
      'Last 24 hours · ' + new Date().toDateString(),
      summary + aiSection + dropsSection + changesSection
    );

  } catch (e) {
    Logger.log('Error in buildDailyReportBody: ' + e.message);
    return 'Daily report ready. Check your Google Sheet for details.';
  }
}

function buildStatCard(label, value, bg, color) {
  return '<div style="flex:1;background:' + bg + ';border-radius:10px;padding:16px 20px;text-align:center;">' +
    '<div style="font-size:28px;font-weight:bold;color:' + color + ';">' + value + '</div>' +
    '<div style="font-size:13px;color:' + color + ';margin-top:4px;">' + label + '</div>' +
  '</div>';
}

function buildDropsSection(newDrops) {
  try {
    if (newDrops.length === 0) return '';

    // Cap display at 20 to keep email manageable
    var display = newDrops.slice(0, 20);
    var more    = newDrops.length > 20 ? '<p style="color:#666;font-size:13px;">...and ' + (newDrops.length - 20) + ' more. Check your sheet for the full list.</p>' : '';

    var rows = display.map(function(row) {
      // row: [Timestamp, Store, ProductID, Title, Price, CompareAtPrice, Available, Tags, ImageURL, ProductURL]
      var image = row[8] ? '<img src="' + row[8] + '" width="60" style="border-radius:4px;vertical-align:middle;">' : '';
      var inStock = row[6] === true || String(row[6]).toUpperCase() === 'TRUE';

      return '<tr style="border-bottom:1px solid #eee;">' +
        '<td style="padding:8px;">' + image + '</td>' +
        '<td style="padding:8px;">' +
          '<a href="' + row[9] + '" style="font-weight:bold;color:#1a1a2e;text-decoration:none;font-size:13px;">' + row[3] + '</a><br>' +
          '<span style="color:#888;font-size:11px;">' + row[1] + '</span>' +
        '</td>' +
        '<td style="padding:8px;font-weight:bold;font-size:13px;">$' + parseFloat(row[4]).toFixed(2) + '</td>' +
        '<td style="padding:8px;">' +
          (inStock
            ? '<span style="background:#c6f6d5;color:#276749;padding:2px 7px;border-radius:10px;font-size:11px;">In Stock</span>'
            : '<span style="background:#fed7d7;color:#9b2c2c;padding:2px 7px;border-radius:10px;font-size:11px;">Sold Out</span>') +
        '</td>' +
        '</tr>';
    }).join('');

    return '<h2 style="color:#1a1a2e;font-size:16px;margin:0 0 12px;">New Products (' + newDrops.length + ')</h2>' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">' +
        '<thead><tr style="background:#f7fafc;">' +
          '<th style="padding:8px;text-align:left;font-size:11px;color:#666;"></th>' +
          '<th style="padding:8px;text-align:left;font-size:11px;color:#666;">PRODUCT</th>' +
          '<th style="padding:8px;text-align:left;font-size:11px;color:#666;">PRICE</th>' +
          '<th style="padding:8px;text-align:left;font-size:11px;color:#666;">STOCK</th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' + more;

  } catch (e) {
    Logger.log('Error in buildDropsSection: ' + e.message);
    return '';
  }
}

function buildChangesSection(changes) {
  try {
    if (changes.length === 0) return '';

    var rows = changes.map(function(row) {
      // row: [Timestamp, Store, ProductID, Title, OldPrice, NewPrice, Change%]
      var oldPrice = parseFloat(row[4]);
      var newPrice = parseFloat(row[5]);
      var isDown   = newPrice < oldPrice;

      return '<tr style="border-bottom:1px solid #eee;">' +
        '<td style="padding:8px;font-size:13px;font-weight:bold;color:#1a1a2e;">' + row[3] + '<br><span style="font-size:11px;color:#888;font-weight:normal;">' + row[1] + '</span></td>' +
        '<td style="padding:8px;text-decoration:line-through;color:#999;font-size:13px;">$' + oldPrice.toFixed(2) + '</td>' +
        '<td style="padding:8px;font-weight:bold;font-size:13px;">$' + newPrice.toFixed(2) + '</td>' +
        '<td style="padding:8px;font-weight:bold;color:' + (isDown ? '#38a169' : '#e53e3e') + ';font-size:13px;">' + row[6] + '</td>' +
        '</tr>';
    }).join('');

    return '<h2 style="color:#1a1a2e;font-size:16px;margin:0 0 12px;">Price Changes (' + changes.length + ')</h2>' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">' +
        '<thead><tr style="background:#f7fafc;">' +
          '<th style="padding:8px;text-align:left;font-size:11px;color:#666;">PRODUCT</th>' +
          '<th style="padding:8px;text-align:left;font-size:11px;color:#666;">OLD</th>' +
          '<th style="padding:8px;text-align:left;font-size:11px;color:#666;">NEW</th>' +
          '<th style="padding:8px;text-align:left;font-size:11px;color:#666;">CHANGE</th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>';

  } catch (e) {
    Logger.log('Error in buildChangesSection: ' + e.message);
    return '';
  }
}
