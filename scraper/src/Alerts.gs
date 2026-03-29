/**
 * Alerts.gs
 * Sends Gmail alerts when new products drop or prices change.
 * Called automatically by Tracker after each scrape run.
 */

/**
 * Send an instant email alert for new product drops.
 * @param {Array} newProducts - array of normalized product objects
 */
function sendNewDropAlert(newProducts) {
  try {
    if (!CONFIG.ALERTS.ENABLED || !CONFIG.ALERTS.EMAIL) {
      Logger.log('sendNewDropAlert: Alerts disabled or no email set. Skipping.');
      return;
    }

    if (!newProducts || newProducts.length === 0) return;

    var subject = '[Scraper] ' + newProducts.length + ' New Product Drop(s) Detected!';
    var body    = buildNewDropEmailBody(newProducts);

    var options = { htmlBody: body };
    if (CONFIG.ALERTS.CC_EMAILS && CONFIG.ALERTS.CC_EMAILS.length > 0) {
      options.cc = CONFIG.ALERTS.CC_EMAILS.join(',');
    }
    GmailApp.sendEmail(CONFIG.ALERTS.EMAIL, subject, '', options);
    Logger.log('sendNewDropAlert: Sent alert for ' + newProducts.length + ' new product(s).');

  } catch (e) {
    Logger.log('Error in sendNewDropAlert: ' + e.message);
  }
}

/**
 * Send an email alert for price changes.
 * @param {Array} changes - array of { product, oldPrice }
 */
function sendPriceChangeAlert(changes) {
  try {
    if (!CONFIG.ALERTS.ENABLED || !CONFIG.ALERTS.EMAIL) {
      Logger.log('sendPriceChangeAlert: Alerts disabled or no email set. Skipping.');
      return;
    }

    if (!changes || changes.length === 0) return;

    var subject = '[Scraper] ' + changes.length + ' Price Change(s) Detected!';
    var body    = buildPriceChangeEmailBody(changes);

    var options = { htmlBody: body };
    if (CONFIG.ALERTS.CC_EMAILS && CONFIG.ALERTS.CC_EMAILS.length > 0) {
      options.cc = CONFIG.ALERTS.CC_EMAILS.join(',');
    }
    GmailApp.sendEmail(CONFIG.ALERTS.EMAIL, subject, '', options);
    Logger.log('sendPriceChangeAlert: Sent alert for ' + changes.length + ' price change(s).');

  } catch (e) {
    Logger.log('Error in sendPriceChangeAlert: ' + e.message);
  }
}

// ─── EMAIL BUILDERS ──────────────────────────────────────────────────────────

function buildNewDropEmailBody(products) {
  try {
    var total    = products.length;
    var preview  = products.slice(0, 20);
    var overflow = total > 20 ? total - 20 : 0;

    var rows = preview.map(function(p) {
      var image = p.imageUrl
        ? '<img src="' + p.imageUrl + '" width="80" style="border-radius:6px;vertical-align:middle;margin-right:10px;">'
        : '';
      var discount = p.compareAtPrice > p.price
        ? ' <span style="color:#e53e3e;font-size:12px;margin-left:6px;">WAS $' + p.compareAtPrice.toFixed(2) + '</span>'
        : '';

      return '<tr style="border-bottom:1px solid #eee;">' +
        '<td style="padding:10px 8px;">' + image + '</td>' +
        '<td style="padding:10px 8px;">' +
          '<a href="' + p.productUrl + '" style="font-weight:bold;color:#1a1a2e;text-decoration:none;">' + p.title + '</a><br>' +
          '<span style="color:#666;font-size:12px;">' + p.store + ' · ' + (p.type || 'General') + '</span>' +
        '</td>' +
        '<td style="padding:10px 8px;font-weight:bold;color:#38a169;">$' + p.price.toFixed(2) + discount + '</td>' +
        '<td style="padding:10px 8px;">' +
          (p.available
            ? '<span style="background:#c6f6d5;color:#276749;padding:2px 8px;border-radius:12px;font-size:12px;">In Stock</span>'
            : '<span style="background:#fed7d7;color:#9b2c2c;padding:2px 8px;border-radius:12px;font-size:12px;">Sold Out</span>') +
        '</td>' +
        '<td style="padding:10px 8px;"><a href="' + p.productUrl + '" style="background:#1a1a2e;color:#fff;padding:6px 12px;border-radius:6px;text-decoration:none;font-size:12px;">View →</a></td>' +
        '</tr>';
    }).join('');

    var overflowNote = overflow > 0
      ? '<p style="text-align:center;color:#666;font-size:13px;margin-top:16px;">...and <strong>' + overflow + ' more</strong> new products. <a href="https://docs.google.com/spreadsheets" style="color:#1a1a2e;">View all in Google Sheets →</a></p>'
      : '';

    return buildEmailWrapper(
      'New Product Drop Alert',
      total + ' new product(s) detected',
      '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' +
        '<thead><tr style="background:#f7fafc;">' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;"></th>' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;">PRODUCT</th>' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;">PRICE</th>' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;">STOCK</th>' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;"></th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' + overflowNote
    );
  } catch (e) {
    Logger.log('Error in buildNewDropEmailBody: ' + e.message);
    return 'New products detected. Check your Google Sheet for details.';
  }
}

function buildPriceChangeEmailBody(changes) {
  try {
    var rows = changes.map(function(c) {
      var p          = c.product;
      var oldPrice   = c.oldPrice;
      var diff       = p.price - oldPrice;
      var pct        = oldPrice > 0 ? ((diff / oldPrice) * 100).toFixed(1) : 0;
      var isDown     = diff < 0;
      var arrow      = isDown ? '▼' : '▲';
      var color      = isDown ? '#38a169' : '#e53e3e';

      return '<tr style="border-bottom:1px solid #eee;">' +
        '<td style="padding:10px 8px;">' +
          '<a href="' + p.productUrl + '" style="font-weight:bold;color:#1a1a2e;text-decoration:none;">' + p.title + '</a><br>' +
          '<span style="color:#666;font-size:12px;">' + p.store + '</span>' +
        '</td>' +
        '<td style="padding:10px 8px;text-decoration:line-through;color:#999;">$' + oldPrice.toFixed(2) + '</td>' +
        '<td style="padding:10px 8px;font-weight:bold;color:#1a1a2e;">$' + p.price.toFixed(2) + '</td>' +
        '<td style="padding:10px 8px;font-weight:bold;color:' + color + ';">' + arrow + ' ' + Math.abs(pct) + '%</td>' +
        '<td style="padding:10px 8px;"><a href="' + p.productUrl + '" style="background:#1a1a2e;color:#fff;padding:6px 12px;border-radius:6px;text-decoration:none;font-size:12px;">View →</a></td>' +
        '</tr>';
    }).join('');

    return buildEmailWrapper(
      'Price Change Alert',
      changes.length + ' price change(s) detected',
      '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' +
        '<thead><tr style="background:#f7fafc;">' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;">PRODUCT</th>' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;">OLD PRICE</th>' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;">NEW PRICE</th>' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;">CHANGE</th>' +
          '<th style="padding:8px;text-align:left;font-size:12px;color:#666;"></th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>'
    );
  } catch (e) {
    Logger.log('Error in buildPriceChangeEmailBody: ' + e.message);
    return 'Price changes detected. Check your Google Sheet for details.';
  }
}

/**
 * Shared email HTML wrapper.
 */
function buildEmailWrapper(title, subtitle, content) {
  try {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">' +
      '<div style="max-width:700px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">' +
        '<div style="background:#1a1a2e;padding:24px 30px;">' +
          '<h1 style="margin:0;color:#fff;font-size:22px;">' + title + '</h1>' +
          '<p style="margin:6px 0 0;color:#aaa;font-size:14px;">' + subtitle + ' · ' + new Date().toDateString() + '</p>' +
        '</div>' +
        '<div style="padding:24px 30px;">' + content + '</div>' +
        '<div style="background:#f7fafc;padding:16px 30px;text-align:center;font-size:12px;color:#999;">' +
          'Shopify Scraper · Powered by Google Apps Script & Claude AI' +
        '</div>' +
      '</div>' +
    '</body></html>';
  } catch (e) {
    Logger.log('Error in buildEmailWrapper: ' + e.message);
    return content;
  }
}
