# Lessons Learned

_Updated after every correction. Rules to prevent repeating mistakes._

---

<!-- Entries added here as corrections occur -->

## 1. GmailApp requires explicit authorization before it can send emails
- **What happened:** `scrapeAllStores` ran from the Google Sheet menu and silently skipped all email alerts. No error shown to the user.
- **Root cause:** GmailApp in Apps Script requires OAuth authorization the first time it's used. That prompt only appears when running a function **directly from the Apps Script editor**, not from a Sheet custom menu trigger.
- **Fix:** Always run at least one function that uses GmailApp directly from the Apps Script editor to trigger the authorization flow before relying on Sheet-triggered runs.
- **Rule:** After deploying or resetting a script, run `testEmail()` from Apps Script editor first to confirm GmailApp is authorized.

## 2. Sending one email per product causes Email Body Size quota errors
- **What happened:** On first scrape of a new store (Ryderwear, 1,725 products), the alert tried to build one HTML email with all 1,725 product rows — Gmail rejected it with `Limit Exceeded: Email Body Size`.
- **Root cause:** No cap on how many products were rendered into the email body.
- **Fix:** Cap email preview to first 20 products. Add "...and X more" note with a link to the Sheet.
- **Rule:** Always cap bulk email content. Never pass an unbounded array into an email builder function.
