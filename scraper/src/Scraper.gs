/**
 * Scraper.gs
 * Fetches all products from a Shopify store using the public /products.json endpoint.
 * Handles pagination automatically up to CONFIG.SCRAPE.MAX_PAGES.
 */

/**
 * Fetch all products from a single Shopify store.
 * @param {string} storeUrl - e.g. "https://gymshark.com"
 * @returns {Array} flat array of product objects, or [] on failure
 */
function fetchAllProducts(storeUrl) {
  try {
    var allProducts = [];
    var page = 1;
    var hasMore = true;

    while (hasMore && page <= CONFIG.SCRAPE.MAX_PAGES) {
      var products = fetchProductPage(storeUrl, page);

      if (!products || products.length === 0) {
        hasMore = false;
      } else {
        allProducts = allProducts.concat(products);
        Logger.log('fetchAllProducts [' + storeUrl + '] page ' + page + ': fetched ' + products.length + ' products');

        // Shopify returns fewer than LIMIT on the last page
        if (products.length < CONFIG.SCRAPE.LIMIT) {
          hasMore = false;
        } else {
          page++;
          Utilities.sleep(CONFIG.SCRAPE.REQUEST_DELAY);
        }
      }
    }

    Logger.log('fetchAllProducts [' + storeUrl + '] TOTAL: ' + allProducts.length + ' products across ' + (page) + ' page(s)');
    return allProducts;

  } catch (e) {
    Logger.log('Error in fetchAllProducts [' + storeUrl + ']: ' + e.message);
    return [];
  }
}

/**
 * Fetch a single page of products from Shopify.
 * @param {string} storeUrl
 * @param {number} page
 * @returns {Array|null} array of products or null on error
 */
function fetchProductPage(storeUrl, page) {
  try {
    var url = storeUrl.replace(/\/$/, '') + '/products.json?limit=' + CONFIG.SCRAPE.LIMIT + '&page=' + page;

    var response = UrlFetchApp.fetch(url, {
      method: 'GET',
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ShopifyScraper/1.0)'
      }
    });

    var code = response.getResponseCode();

    if (code !== 200) {
      Logger.log('fetchProductPage [' + url + '] HTTP ' + code + ': ' + response.getContentText().substring(0, 200));
      return null;
    }

    var json = JSON.parse(response.getContentText());

    if (!json || !json.products) {
      Logger.log('fetchProductPage [' + url + ']: Unexpected response structure');
      return null;
    }

    return json.products;

  } catch (e) {
    Logger.log('Error in fetchProductPage [' + storeUrl + ', page ' + page + ']: ' + e.message);
    return null;
  }
}

/**
 * Parse a raw Shopify product into a flat, normalized object.
 * @param {Object} product - raw product from /products.json
 * @param {string} storeName
 * @param {string} storeUrl
 * @returns {Object} normalized product
 */
function parseProduct(product, storeName, storeUrl) {
  try {
    var firstVariant = (product.variants && product.variants.length > 0) ? product.variants[0] : {};
    var firstImage   = (product.images  && product.images.length  > 0) ? product.images[0].src : '';

    var price          = parseFloat(firstVariant.price || 0);
    var compareAtPrice = parseFloat(firstVariant.compare_at_price || 0);
    var available      = product.variants
      ? product.variants.some(function(v) { return v.available; })
      : false;

    return {
      store:          storeName,
      id:             String(product.id),
      title:          product.title         || '',
      handle:         product.handle        || '',
      vendor:         product.vendor        || '',
      type:           product.product_type  || '',
      price:          price,
      compareAtPrice: compareAtPrice,
      available:      available,
      tags:           (product.tags || []).join(', '),
      imageUrl:       firstImage,
      productUrl:     storeUrl.replace(/\/$/, '') + '/products/' + product.handle,
      description:    stripHtml(product.body_html || '')
    };

  } catch (e) {
    Logger.log('Error in parseProduct [id:' + (product && product.id) + ']: ' + e.message);
    return null;
  }
}

/**
 * Strip HTML tags and collapse whitespace from a raw HTML string.
 * @param {string} html
 * @returns {string} plain text
 */
function stripHtml(html) {
  try {
    return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (e) {
    return '';
  }
}
