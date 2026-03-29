/**
 * SheetSetup.gs
 * Run setupSheets() ONCE to initialize the Google Sheet structure.
 */

function setupSheets() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    createSheetIfMissing(ss, CONFIG.SHEETS.STORES,        ['Store Name', 'Store URL', 'Active', 'Last Scraped', 'Currency']);
    createSheetIfMissing(ss, CONFIG.SHEETS.PRODUCTS,      ['Store', 'Product ID', 'Title', 'Handle', 'Vendor', 'Type', 'Price', 'Compare At Price', 'Available', 'Tags', 'Image URL', 'Product URL', 'First Seen', 'Last Updated', 'Description']);
    createSheetIfMissing(ss, CONFIG.SHEETS.PRICE_HISTORY, ['Timestamp', 'Store', 'Product ID', 'Title', 'Old Price', 'New Price', 'Change (%)']);
    createSheetIfMissing(ss, CONFIG.SHEETS.NEW_DROPS,     ['Timestamp', 'Store', 'Product ID', 'Title', 'Price', 'Compare At Price', 'Available', 'Tags', 'Image URL', 'Product URL']);

    // Set column widths for Products sheet
    var productsSheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
    if (productsSheet) {
      [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].forEach(function(col) {
        productsSheet.autoResizeColumn(col);
      });
    }

    // Pre-populate Stores sheet with Gymshark
    var storesSheet = ss.getSheetByName(CONFIG.SHEETS.STORES);
    if (storesSheet.getLastRow() <= 1) {
      storesSheet.appendRow(['Gymshark', 'https://gymshark.com', 'TRUE', new Date()]);
    }

    Logger.log('setupSheets: All sheets initialized successfully.');
  } catch (e) {
    Logger.log('Error in setupSheets: ' + e.message);
    Logger.log('setupSheets FAILED: ' + e.message);
  }
}

function createSheetIfMissing(ss, name, headers) {
  try {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      Logger.log('createSheetIfMissing: Created sheet "' + name + '"');
    }
    return sheet;
  } catch (e) {
    Logger.log('Error in createSheetIfMissing [' + name + ']: ' + e.message);
    throw e;
  }
}
