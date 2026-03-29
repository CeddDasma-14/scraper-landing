/**
 * DatasetExport.gs
 * Exports scraped products as a JSONL fine-tuning dataset for the
 * E-Commerce Product Description Writer model (Project 03).
 *
 * Run exportDataset() from Apps Script editor.
 * Output is written to a "Dataset Export" sheet — copy column A and save as .jsonl
 */

/**
 * Main export function.
 * Reads the Products sheet, filters products with valid descriptions,
 * and writes JSONL lines to the "Dataset Export" sheet.
 */
function exportDataset() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var productsSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);

    if (!productsSheet || productsSheet.getLastRow() <= 1) {
      Logger.log('exportDataset: No products found.');
      return;
    }

    var data = productsSheet.getRange(2, 1, productsSheet.getLastRow() - 1, 15).getValues();

    var lines = [];

    data.forEach(function(row) {
      var title       = String(row[2]).trim();
      var vendor      = String(row[4]).trim();
      var type        = String(row[5]).trim();
      var tags        = String(row[9]).trim();
      var description = String(row[14]).trim();

      // Skip rows with no description or too short to be useful
      if (!description || description.length < 50) return;

      // Skip rows with no title
      if (!title) return;

      var inputParts = ['Product: ' + title];
      if (type)   inputParts.push('Category: ' + type);
      if (vendor) inputParts.push('Brand: ' + vendor);
      if (tags)   inputParts.push('Tags: ' + tags);

      var entry = {
        instruction: 'Write a high-converting product description for an e-commerce store.',
        input:       inputParts.join('\n'),
        output:      description
      };

      lines.push([JSON.stringify(entry)]);
    });

    if (lines.length === 0) {
      Logger.log('exportDataset: No products with descriptions found. Run a scrape first.');
      return;
    }

    // Write to Dataset Export sheet (create if missing)
    var exportSheet = ss.getSheetByName('Dataset Export');
    if (!exportSheet) {
      exportSheet = ss.insertSheet('Dataset Export');
      exportSheet.appendRow(['JSONL (copy column A → save as dataset.jsonl)']);
      exportSheet.getRange(1, 1).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#ffffff');
    } else {
      // Clear previous export (keep header)
      if (exportSheet.getLastRow() > 1) {
        exportSheet.getRange(2, 1, exportSheet.getLastRow() - 1, 1).clearContent();
      }
    }

    exportSheet.getRange(2, 1, lines.length, 1).setValues(lines);

    Logger.log('exportDataset: Exported ' + lines.length + ' training examples to "Dataset Export" sheet.');
    SpreadsheetApp.getUi().alert(
      'Dataset exported!\n\n' +
      lines.length + ' training examples written to the "Dataset Export" sheet.\n\n' +
      'Next step: Copy column A → paste into a text file → save as dataset.jsonl'
    );

  } catch (e) {
    Logger.log('Error in exportDataset: ' + e.message);
  }
}

/**
 * Shows dataset stats: total products, products with descriptions, coverage %.
 * Run this after a scrape to check how much description data you have.
 */
function datasetStats() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (!sheet || sheet.getLastRow() <= 1) {
      Logger.log('datasetStats: No products found.');
      return;
    }

    var data  = sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues();
    var total = data.length;
    var withDesc = data.filter(function(row) {
      return String(row[14]).trim().length >= 50;
    }).length;

    var byStore = {};
    data.forEach(function(row) {
      var store = String(row[0]).trim();
      var desc  = String(row[14]).trim();
      if (!byStore[store]) byStore[store] = { total: 0, withDesc: 0 };
      byStore[store].total++;
      if (desc.length >= 50) byStore[store].withDesc++;
    });

    var storeBreakdown = Object.keys(byStore).map(function(s) {
      var d = byStore[s];
      return s + ': ' + d.withDesc + '/' + d.total + ' (' + Math.round(d.withDesc / d.total * 100) + '%)';
    }).join('\n');

    var msg =
      'Dataset Stats\n' +
      '─────────────\n' +
      'Total products: ' + total + '\n' +
      'With descriptions: ' + withDesc + ' (' + Math.round(withDesc / total * 100) + '%)\n\n' +
      'By store:\n' + storeBreakdown + '\n\n' +
      (withDesc >= 500 ? '✓ Enough data to start fine-tuning!' : '⚠ Need more stores or products. Target: 500+ with descriptions.');

    Logger.log(msg);
    SpreadsheetApp.getUi().alert(msg);

  } catch (e) {
    Logger.log('Error in datasetStats: ' + e.message);
  }
}
