# Shopify Product Scraper — Full Handoff Guide

## What This Tool Does
Automatically monitors Shopify stores for new product drops, price changes, and stock updates.
Sends Gmail alerts and a daily summary email. Includes a live Google Sheets dashboard and Claude AI-generated insights.

---

## Files Overview

| File | Purpose |
|---|---|
| `Config.gs` | All settings — stores, email, API key, timing |
| `SheetSetup.gs` | Creates sheet tabs (run once) |
| `Scraper.gs` | Fetches products from Shopify's public API |
| `ProductLog.gs` | Reads/writes all sheet data |
| `Tracker.gs` | Detects new products, price changes, stock changes |
| `Alerts.gs` | Sends instant Gmail alerts |
| `DailyReport.gs` | Sends daily digest email |
| `AIInsights.gs` | Calls Claude API for AI-generated analysis |
| `Dashboard.gs` | Builds the live Google Sheets dashboard |
| `Main.gs` | Entry point — runs everything together |

---

## Google Sheets Tabs

| Tab | What's in it |
|---|---|
| **Dashboard** | Live summary — stats, categories, price ranges, recent drops |
| **Stores** | List of stores being monitored + last scraped time |
| **Products** | Full product log — every product ever detected |
| **New Drops** | Every new product detected, with timestamp |
| **Price History** | Every price change detected, with old/new price |
| **AI Insights** | Claude AI analysis from each scrape run |

---

## How to Use

### Run a Manual Scrape
1. Open Apps Script (`Extensions → Apps Script`)
2. Select `scrapeAllStores` from the dropdown
3. Click Run ▶

Or use the custom menu in your Google Sheet: **Shopify Scraper → Run Scrape Now**

### Add a New Store
1. Go to the **Stores** tab in your Google Sheet
2. Add a new row: `Store Name | https://storeurl.com | TRUE`
3. The store will be included in the next scrape automatically

> Any public Shopify store works. Test by visiting `https://storeurl.com/products.json` in your browser — if it returns JSON, it's compatible.

### Change Your Email
Open `Config.gs` and update:
```js
EMAIL: 'your@gmail.com'
```

### Change Scrape Time
Open `Config.gs` and update:
```js
DAILY_REPORT_HOUR: 8   // 8 = 8am, 20 = 8pm
```
Then re-run `setupTriggers` to apply the change.

### Disable Email Alerts
```js
ALERTS: {
  ENABLED: false,
  ...
}
```

### Disable AI Insights
```js
AI: {
  ENABLED: false,
  ...
}
```

### Refresh the Dashboard Manually
**Shopify Scraper → Refresh Dashboard** in the Sheet menu, or run `buildDashboard` in Apps Script.

---

## Automation Schedule

| Time | What runs |
|---|---|
| 8am daily | `scrapeAllStores` — scrapes all stores, sends instant alerts if new drops found |
| 9am daily | `sendDailyReport` — sends digest email with last 24h summary + AI insights |

Set up by running `setupTriggers` once. Re-run it if you ever change the hour in Config.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Scrape times out | Normal on first run with 2,500+ products. Subsequent runs are fast (20-25s) |
| No email received | Check `ALERTS.ENABLED = true` and `EMAIL` is set in Config.gs |
| AI insights not showing | Check `AI.ENABLED = true` and `API_KEY` is set in Config.gs |
| Store not scraping | Verify the URL works at `storeurl.com/products.json` and `Active = TRUE` in Stores tab |
| Duplicate products | Don't delete rows from the Products sheet — the scraper uses it to detect duplicates |
| Permission errors | Re-run `setupSheets` and approve permissions again |

---

## How to Sell This (VA Service)

### Packages
| Package | What to offer | Price |
|---|---|---|
| Basic | 1 store, daily scrape, Google Sheets | P500-1,000/mo |
| Standard | 3 stores, alerts, price tracking | P1,500-2,500/mo |
| Premium | Unlimited stores, AI insights, dashboard | P3,000+/mo |

### Setup per Client
1. Duplicate the Google Sheet for each client
2. Open Apps Script on their copy → paste all `.gs` files
3. Run `setupSheets` then `setupTriggers`
4. Add their store URLs to the Stores tab
5. Set their email in Config.gs
6. Done — fully automated from here

### What to Tell Clients
> "I set up an automated system that monitors your competitors' Shopify stores 24/7. You get an email the moment they launch a new product or change a price — plus a daily report and AI analysis of their strategy. No more manual checking."

---

## Version 2 Ideas
- Add Slack notifications (alongside Gmail)
- Keyword filtering — only alert on specific product types
- Price drop watchlist — monitor specific products only
- Multi-currency support
- Export reports as PDF
- WhatsApp alerts via Twilio

---

> Built with Google Apps Script + Claude AI. Runs entirely free within Google's free tier limits.
