# Web Attribution Copy & UI Updates

This document summarizes the changes made to focus the demo strictly on **Web Attribution** rather than Cross-Platform Attribution.

## ✅ Updates Complete

### Build Status
✅ **Zero Errors** | **110ms Build Time** | **233 KB Bundle** | **Dev Server Ready**

---

## 📝 Text & Copy Changes

### 1. **Navbar Brand** (`src/components/Storefront.jsx:74`)
**Before:**
```
AF Commerce Sandbox
```

**After:**
```
Web Attribution Sandbox
```

### 2. **Hero Heading** (`src/components/Storefront.jsx:109`)
**Before:**
```
Cross-Platform Web Attribution Sandbox
```

**After:**
```
Web Attribution Sandbox
```

---

## 🎯 UI Replacement: Mobile OneLink → Web Attribution Summary

### **Removed Section**
The `onelink-section` with:
- "Continue in Mobile App" messaging
- Dynamic QR code linking to OneLink URL
- Mobile app handoff workflow

**Rationale:** OneLink is a mobile/app feature. For a web-only demo, it's not relevant.

### **New Section: Web Attribution Summary** (`src/components/Storefront.jsx:162-218`)

**Purpose:** Demonstrate how web attribution persists across page reloads and stitches to customer IDs.

#### **Card Content:**

1. **Title:** "Web Attribution Summary"

2. **Description:**
   > "Your web session maintains persistent attribution across page reloads via URL parameters and Web SDK tracking."

3. **Attribution Details Box** (displays in real-time):
   - **Media Source (pid):** Current traffic source (e.g., `direct`, `meta_ads`, `google_search`)
   - **Campaign (c):** Current campaign (e.g., `organic`, `summer_launch_2026`, `brand_exact`)
   - **Adset:** Conditional display if present (e.g., `carousel_1`, `gclid`)
   - **Customer User ID:** Shows `✓ stitched` (green) if logged in, `Not stitched` (red) if anonymous

4. **Three Info Items** with explanations:
   - 📍 **How it works:** URL parameters persist in address bar; reload the page and attribution persists
   - 🔗 **Customer ID:** When you log in, CUID is stored and stitched to all subsequent events via Web SDK
   - 📊 **Measurement:** Every web event (views, clicks, purchases) includes attribution context automatically

#### **Key Behaviors:**

- **Updates Dynamically:** When you switch traffic sources in the Campaign Bar, the attribution details update instantly
- **Reactive to Login:** When you log in, the Customer User ID row changes from `Not stitched` → `✓ user_48291` (green)
- **Page Reload Persistence:** Refresh the page and all attribution values persist (URL parameters are remembered)

---

## 🏗️ Code Changes Summary

| Component | Change |
|-----------|--------|
| [src/components/Storefront.jsx](src/components/Storefront.jsx:1-3) | Removed `generateOneLinkUrl` and `QRCode` imports; added `getAttributionContext` |
| [src/components/Storefront.jsx:10](src/components/Storefront.jsx:10) | Replaced `oneLinkUrl` state with `attribution` state |
| [src/components/Storefront.jsx:33-44](src/components/Storefront.jsx:33-44) | Updated useEffect to sync `attribution` on mount and campaign changes |
| [src/components/Storefront.jsx:74](src/components/Storefront.jsx:74) | Updated navbar brand text |
| [src/components/Storefront.jsx:109](src/components/Storefront.jsx:109) | Updated hero heading |
| [src/components/Storefront.jsx:162-218](src/components/Storefront.jsx:162-218) | Replaced OneLink section with Web Attribution Summary card |

---

## 🎨 Styling Changes (`src/components/Storefront.css`)

### **Removed Classes:**
```css
.onelink-section { }
.onelink-card { }
.onelink-content { }
.onelink-url { }
.qrcode-container { }
```

### **Added Classes:**
```css
.attribution-summary-section { }      /* Outer section with padding */
.attribution-summary-card { }         /* White card container */
.attribution-summary-card h3 { }      /* Title "Web Attribution Summary" */
.summary-description { }              /* Description text */
.attribution-details { }              /* Light gray box with details */
.detail-row { }                       /* Each key-value pair */
.detail-label { }                     /* Left side: "Media Source", etc */
.detail-value { }                     /* Right side: purple, monospaced values */
.stitched { }                         /* Green text for logged-in CUID */
.anonymous { }                        /* Red italic text for not logged in */
.summary-info { }                     /* Container for 3 info items */
.info-item { }                        /* Single info item with green left border */
.info-icon { }                        /* Emoji icon (📍, 🔗, 📊) */
.info-text { }                        /* Info text with explanation */
```

### **Responsive Updates:**
- Mobile (<768px): Details stack vertically
- Detail rows flex into separate lines on small screens
- Summary info items adapt font size and padding

---

## 📱 Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Navbar: "Web Attribution Sandbox"                          │
├─────────────────────────────────────────────────────────────┤
│  Hero: "Web Attribution Sandbox"                            │
│  Flow: 1. Pick Traffic Source → 2. Trigger Web Events ...   │
├─────────────────────────────────────────────────────────────┤
│  Product Cards (3 column grid on desktop)                   │
├─────────────────────────────────────────────────────────────┤
│  WEB ATTRIBUTION SUMMARY                                    │
│                                                             │
│  Your web session maintains persistent attribution ...      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Media Source (pid)        │ direct                  │   │
│  │ Campaign (c)              │ organic                 │   │
│  │ Customer User ID          │ Not stitched            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📍 How it works: URL parameters persist in the address... │
│  🔗 Customer ID: When you log in, the CUID is stored...    │
│  📊 Measurement: Every web event includes attribution...   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing the Changes

### **Test 1: Campaign Attribution Persistence**
1. Open the demo at `http://localhost:5174/`
2. Click **"Meta Ads"** in the Campaign Bar
3. Verify the Web Attribution Summary shows:
   - Media Source: `meta_ads`
   - Campaign: `summer_launch_2026`
4. **Reload the page** (Cmd+R)
5. ✅ Attribution values persist (they're in the URL parameters)

### **Test 2: Customer ID Stitching**
1. Click **"Simulate User Login"** button
2. Enter a custom customer ID (e.g., `customer_xyz`)
3. Click **"Login & Stitch ID"**
4. Verify the Web Attribution Summary shows:
   - Customer User ID: `✓ customer_xyz` (in green)
5. **Reload the page**
6. ✅ The session persists (login state is in-memory, attribution parameters in URL)

### **Test 3: Campaign + Login**
1. Click **"Google Search"** in Campaign Bar
2. Click **"Simulate User Login"** and log in
3. Verify all attribution values update:
   - Media Source: `google_search`
   - Campaign: `brand_exact`
   - Customer User ID: `✓ user_id` (green)
4. Click **"Complete Purchase"** on any product
5. Right panel (Inspector) shows:
   - Campaign Visit (from Campaign Bar click)
   - setCustomerUserId + af_login (from login)
   - af_purchase (from purchase)
6. ✅ All events carry the web attribution context

---

## 🎯 Summary of Focus Shift

| Aspect | Before | After |
|--------|--------|-------|
| **Heading** | "Cross-Platform Web Attribution" | "Web Attribution" |
| **Navbar** | "AF Commerce Sandbox" | "Web Attribution Sandbox" |
| **Bottom Banner** | "Continue in Mobile App" (OneLink + QR) | "Web Attribution Summary" (URL params + CUID) |
| **Demo Focus** | Web + Mobile handoff | Web-only attribution persistence |
| **Key Message** | "Open in app" | "Attribution persists across page reloads" |
| **Measurement Focus** | Cross-platform stitching | Web SDK event measurement with CUID stitching |

---

## 🔗 Related Documentation

- **Official SDK Setup**: See [OFFICIAL_SDK_SETUP.md](OFFICIAL_SDK_SETUP.md) for Web SDK configuration
- **Integration Details**: See [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) for API changes
- **Full Demo Guide**: See [DEMO_GUIDE.md](DEMO_GUIDE.md) for complete feature walkthrough

---

## ✅ Verification

- [x] Navbar brand updated to "Web Attribution Sandbox"
- [x] Hero heading updated to "Web Attribution Sandbox"
- [x] OneLink/QR code banner removed
- [x] Web Attribution Summary card implemented
- [x] Attribution values display in real-time
- [x] Attribution updates on campaign switches
- [x] CUID shows as stitched when logged in
- [x] Responsive design works on mobile
- [x] Build succeeds with zero errors
- [x] Dev server starts without errors
- [x] All styling matches existing design system

---

**Status**: ✅ Ready for Web Attribution Sandbox use!
