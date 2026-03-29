# ShopSpy — Shopify Store Intelligence Scraper

A fully automated Shopify product intelligence system built on Google Apps Script. Track competitors, monitor price changes, detect new product drops, and generate AI-powered insights — all from a Google Sheet.

---

## Features

### Real-Time Store Monitoring
- Scrapes any public Shopify store via `/products.json`
- Detects **new product drops** the moment they go live
- Tracks **price changes** across every product in every store
- Monitors **stock availability** (in stock vs sold out)
- Supports unlimited stores with per-store currency configuration

### Automated Email Alerts
- Instant email when a new product drops
- Instant email when a price changes
- Daily digest report with full summary
- CC support for team/client sharing
- Capped previews (20 products) to avoid Gmail size limits

### AI-Powered Insights (Claude API)
- After each scrape, sends new products + price changes to Claude
- Returns actionable analysis: trend summary, pricing strategy, competitor opportunities, action items
- Saved to an "AI Insights" sheet for historical review
- Included in daily email report

### Live Google Sheets Dashboard
- Summary stats: total products, new drops, price changes, in stock vs sold out
- Top categories breakdown
- Price range distribution
- Stock status overview
- Recent new drops table
- Recent price history table
- Store breakdown panel with bar chart (products per store, in-stock %, avg price, top category)

### Fine-Tuning Dataset Export
- Exports scraped products as a JSONL fine-tuning dataset
- Format: instruction / input / output for LLM training
- Filters products with descriptions >= 50 characters
- Per-store breakdown stats

### Plan Tier System
- **Basic** — 1 store, 24h scrape interval, no AI
- **Standard** — 3 stores, 6h interval, AI + stock tracking
- **Premium** — unlimited stores, 1h interval, full feature set

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Google Apps Script (V8) |
| Data Store | Google Sheets |
| Scraping | Shopify `/products.json` public API |
| AI Insights | Anthropic Claude API (Haiku) |
| Alerts | Gmail via GmailApp |
| Charts | Google Sheets Charts API |
| Fine-Tuning | Llama 3.2 3B Instruct via Hugging Face |
| Training | Google Colab (T4 GPU), LoRA + 4-bit quantization |
| ML Libraries | transformers, peft, trl, bitsandbytes, accelerate |

---

## Project Structure

```
scraper/
├── src/
│   ├── Config.example.gs     # Configuration template (copy → Config.gs, fill in keys)
│   ├── Main.gs               # Entry point — scrapeAllStores(), trigger setup
│   ├── Scraper.gs            # Shopify API fetch + product parser
│   ├── Tracker.gs            # Change detection (new drops, price changes, stock)
│   ├── ProductLog.gs         # Batch writes to Products sheet
│   ├── Alerts.gs             # Email alerts (new drop, price change, daily report)
│   ├── DailyReport.gs        # Daily digest email builder
│   ├── AIInsights.gs         # Claude API integration + insight storage
│   ├── Dashboard.gs          # Live Google Sheets dashboard builder
│   ├── DatasetExport.gs      # JSONL fine-tuning dataset exporter
│   └── SheetSetup.gs         # One-time sheet + trigger initializer
├── colab/
│   └── shopspy_finetune.ipynb  # Llama 3.2 3B fine-tuning notebook (9 steps)
├── tasks/
│   ├── todo.md
│   ├── lessons.md
│   └── token-efficiency.md
├── HANDOFF.md
└── README.md
```

---

## Setup

1. Create a new Google Sheet
2. Go to **Extensions → Apps Script**
3. Copy all `.gs` files from `src/` into the Apps Script editor
4. Copy `Config.example.gs` → rename to `Config.gs` and fill in:
   - Your Anthropic API key (console.anthropic.com)
   - Your Gmail address for alerts
5. Run `setupSheets()` once to create all sheet tabs
6. Add stores to the **Stores** sheet (Name, URL, Active = TRUE)
7. Run `setupTriggers()` to enable automated scraping
8. Run `scrapeAllStores()` to do your first scrape

---

## Fine-Tuning (Phase 2)

The `colab/shopspy_finetune.ipynb` notebook fine-tunes **Llama 3.2 3B Instruct** on scraped product data to generate high-converting e-commerce product descriptions.

- Uses **LoRA** (r=16, alpha=32) for parameter-efficient training
- **4-bit quantization** via BitsAndBytes for T4 GPU compatibility
- Trains on JSONL dataset exported from the scraper
- Pushes trained model to Hugging Face Hub

Requires: Hugging Face account + Llama 3.2 access approval from Meta.

---

## Security Notes

- `Config.gs` is gitignored — never commit your API keys
- All keys are stored directly in Apps Script, not in version control
- Email alerts are rate-limited and capped to prevent quota abuse
