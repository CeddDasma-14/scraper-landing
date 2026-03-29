/**
 * AIInsights.gs
 * Uses Claude AI to generate insights from new product drops and price changes.
 * Writes results to an "AI Insights" sheet and includes them in the daily email.
 */

// ─── MAIN ENTRY ──────────────────────────────────────────────────────────────

/**
 * Generate AI insights from a scrape run's new products and price changes.
 * @param {Array} newProducts  - normalized product objects
 * @param {Array} priceChanges - { product, oldPrice } objects
 * @returns {string} AI-generated insight text, or '' on failure
 */
function generateInsights(newProducts, priceChanges) {
  try {
    if (!CONFIG.AI.ENABLED || !CONFIG.AI.API_KEY) {
      Logger.log('generateInsights: AI disabled or no API key set. Skipping.');
      return '';
    }

    if (newProducts.length === 0 && priceChanges.length === 0) {
      Logger.log('generateInsights: Nothing new to analyse.');
      return '';
    }

    var prompt = buildInsightPrompt(newProducts, priceChanges);
    var insight = callClaudeAPI(prompt);

    if (insight) {
      saveInsightToSheet(insight, newProducts.length, priceChanges.length);
    }

    return insight;

  } catch (e) {
    Logger.log('Error in generateInsights: ' + e.message);
    return '';
  }
}

// ─── PROMPT BUILDER ──────────────────────────────────────────────────────────

function buildInsightPrompt(newProducts, priceChanges) {
  try {
    var newList = newProducts.slice(0, 50).map(function(p) {
      return '- ' + p.title + ' | $' + p.price + ' | ' + (p.type || 'General') + ' | Tags: ' + (p.tags || 'none');
    }).join('\n');

    var changeList = priceChanges.slice(0, 20).map(function(c) {
      var dir = c.product.price < c.oldPrice ? 'DOWN' : 'UP';
      return '- ' + c.product.title + ' | $' + c.oldPrice + ' → $' + c.product.price + ' (' + dir + ')';
    }).join('\n');

    var prompt = 'You are a sharp e-commerce analyst. Analyse the following Shopify store data and give me actionable insights.\n\n';

    if (newProducts.length > 0) {
      prompt += 'NEW PRODUCTS DETECTED (' + newProducts.length + ' total, showing up to 50):\n' + newList + '\n\n';
    }

    if (priceChanges.length > 0) {
      prompt += 'PRICE CHANGES (' + priceChanges.length + ' total, showing up to 20):\n' + changeList + '\n\n';
    }

    prompt += 'Provide a concise analysis covering:\n';
    prompt += '1. TREND SUMMARY: What product categories or themes are being pushed?\n';
    prompt += '2. PRICING STRATEGY: What do the price changes suggest about their strategy?\n';
    prompt += '3. OPPORTUNITY: What gaps or opportunities does this create for competitors?\n';
    prompt += '4. ACTION ITEMS: 2-3 specific things a competitor or dropshipper should do NOW.\n\n';
    prompt += 'Be direct, specific, and actionable. No fluff. Max 300 words.';

    return prompt;

  } catch (e) {
    Logger.log('Error in buildInsightPrompt: ' + e.message);
    return '';
  }
}

// ─── CLAUDE API CALL ─────────────────────────────────────────────────────────

function callClaudeAPI(prompt) {
  try {
    var payload = {
      model:      CONFIG.AI.MODEL,
      max_tokens: CONFIG.AI.MAX_TOKENS,
      messages: [
        { role: 'user', content: prompt }
      ]
    };

    var options = {
      method:      'POST',
      contentType: 'application/json',
      headers: {
        'x-api-key':         CONFIG.AI.API_KEY,
        'anthropic-version': '2023-06-01'
      },
      payload:          JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', options);
    var code     = response.getResponseCode();
    var body     = response.getContentText();

    if (code !== 200) {
      Logger.log('callClaudeAPI: HTTP ' + code + ' — ' + body.substring(0, 300));
      return '';
    }

    var json = JSON.parse(body);

    if (!json.content || !json.content[0] || !json.content[0].text) {
      Logger.log('callClaudeAPI: Unexpected response structure.');
      return '';
    }

    var insight = json.content[0].text;
    Logger.log('callClaudeAPI: Got insight (' + insight.length + ' chars).');
    return insight;

  } catch (e) {
    Logger.log('Error in callClaudeAPI: ' + e.message);
    return '';
  }
}

// ─── SAVE TO SHEET ───────────────────────────────────────────────────────────

/**
 * Saves the AI insight to the AI Insights sheet.
 * Creates the sheet if it doesn't exist.
 */
function saveInsightToSheet(insight, newCount, priceCount) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('AI Insights');

    if (!sheet) {
      sheet = ss.insertSheet('AI Insights');
      sheet.appendRow(['Timestamp', 'New Products', 'Price Changes', 'Insight']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(4, 600);
    }

    sheet.appendRow([new Date(), newCount, priceCount, insight]);
    Logger.log('saveInsightToSheet: Insight saved.');

  } catch (e) {
    Logger.log('Error in saveInsightToSheet: ' + e.message);
  }
}

// ─── EMAIL SECTION BUILDER ───────────────────────────────────────────────────

/**
 * Build the AI insight HTML block for inclusion in daily report email.
 * @param {string} insight
 * @returns {string} HTML string
 */
function buildInsightEmailSection(insight) {
  try {
    if (!insight) return '';

    // Convert newlines to HTML paragraphs
    var formatted = insight
      .split('\n')
      .filter(function(line) { return line.trim().length > 0; })
      .map(function(line) {
        // Bold numbered headers like "1. TREND SUMMARY:"
        line = line.replace(/^(\d+\.\s+[A-Z\s]+:)/g, '<strong>$1</strong>');
        return '<p style="margin:6px 0;font-size:13px;color:#333;line-height:1.6;">' + line + '</p>';
      })
      .join('');

    return '<h2 style="color:#1a1a2e;font-size:16px;margin:24px 0 12px;">AI Insights</h2>' +
      '<div style="background:#f0f4ff;border-left:4px solid #1a1a2e;border-radius:6px;padding:16px 20px;margin-bottom:24px;">' +
        formatted +
      '</div>';

  } catch (e) {
    Logger.log('Error in buildInsightEmailSection: ' + e.message);
    return '';
  }
}
