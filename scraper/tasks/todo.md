# Shopify Product Scraper — Project Plan

## Overview
AI-powered Shopify store monitoring tool built on Google Apps Script + Claude AI + Google Sheets + Gmail.
Target: Filipino e-commerce VA service (P500–P3,000+/mo).

---

## Phase 01 — Core Scraper
> Multi-store scraping, dedup, price tracking, stock monitoring

- [ ] Set up Google Sheet structure (stores list, products log, price history)
- [ ] Write Apps Script: fetch Shopify store product JSON (`/products.json`)
- [ ] Detect new products (compare against existing log)
- [ ] Track price changes (store previous price, flag delta)
- [ ] Monitor stock status (available vs. sold out)
- [ ] Test against at least 2 live Shopify stores
- [ ] Verify no duplicate entries

## Phase 02 — Data & Alerts
> Images, variants, SEO, discounts, Gmail alerts, daily digest

- [ ] Extend scraper: capture product images, variants, SEO title/description
- [ ] Detect discount/sale prices (compare `compare_at_price` vs `price`)
- [ ] Gmail alert on new product drop (immediate trigger)
- [ ] Daily summary email: new products, price changes, stock updates
- [ ] Test Gmail send with real email

## Phase 03 — AI & Analytics
> Live dashboard, competitor comparison, Claude AI insights, trend prediction

- [ ] Build Google Sheets live dashboard (charts, summaries)
- [ ] Competitor store comparison view (side-by-side)
- [ ] Integrate Claude API: generate insights from new product data
- [ ] Trend prediction: flag product categories growing fastest
- [ ] Final polish: clean UI, error handling, rate limiting

---

## Review
_To be filled after each phase._
