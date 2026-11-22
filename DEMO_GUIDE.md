# AppsFlyer Web Attribution Demo & Sandbox

An interactive, real-time web attribution sandbox built with Vite + React for testing and demonstrating AppsFlyer's web tracking capabilities.

## 🎯 Features

### 1. **Campaign Traffic Simulator** (`CampaignBar.jsx`)
- **Sticky top bar** with pre-configured traffic source pills:
  - Direct / Organic
  - Meta Ads
  - Google Search
  - TikTok Creator
- **Custom parameter input** to apply any `pid` (media source) and `c` (campaign)
- **Live URL display** showing current query parameters
- **One-click attribution switching** with automatic `pageLoad` event tracking

### 2. **Mock E-Commerce Storefront** (`Storefront.jsx`)
- **Brand navbar** with user identity management
- **Simulate User Login** toggle to test customer ID stitching
- **Hero section** with visual 3-step flow indicator
- **Product cards grid** (3 columns on desktop):
  - Starter Plan ($29)
  - Pro Bundle ($99)
  - Enterprise Suite ($199)
- **Interactive buttons**:
  - **Add to Cart**: Tracks `af_add_to_cart` with product metadata
  - **Complete Purchase**: Tracks `af_purchase` with revenue
- **OneLink handoff banner** with:
  - Dynamically generated OneLink URL
  - QR code that updates with current attribution context
  - Responsive design that stacks on mobile

### 3. **Live Attribution X-Ray Inspector** (`AttributionInspector.jsx`)
- **SDK Status Header** showing simulation mode or live SDK connection
- **Active Session Attribution Card** displaying:
  - Media Source (pid)
  - Campaign (c)
  - Adset / Click ID
  - Customer User ID (CUID) - Anonymous vs Stitched
- **Real-Time Event Stream**:
  - Chronological log of all events
  - Green `200 OK` badges for each event
  - Expandable event details with full JSON payload
- **Clear Log button** to reset the event stream

## 🚀 Quick Start

### Installation

```bash
cd af-web-integration
npm install
npm run dev
```

The dev server starts at `http://localhost:5174/`

### Environment Setup

#### Option 1: Simulation Mode (Default)
No setup required! The demo runs in simulation mode out of the box, showing how events would be tracked without a real AppsFlyer SDK connection.

#### Option 2: Live AppsFlyer Web SDK

1. **Get your Web Dev Key**:
   - Log in to [AppsFlyer Dashboard](https://hq1.appsflyer.com/apps)
   - Navigate to App Settings → Integrations → Web SDK
   - Copy your `WEB_DEV_KEY`

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your key:
   # VITE_AF_WEB_DEV_KEY=your_actual_web_dev_key
   ```

3. **Enable the SDK in `index.html`**:
   - Uncomment the AppsFlyer SDK snippet in the `<head>`
   - Replace `YOUR_WEB_DEV_KEY_HERE` with your actual key

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

## 📋 How to Use the Demo

### 1. Pick a Traffic Source
Click any pill in the **Campaign Bar**:
- Buttons update the URL with attribution parameters
- Each selection triggers a fresh `pageLoad` event
- Watch the **Inspector** update with the new attribution context

### 2. Trigger Web Events
In the storefront:
- **Add to Cart**: Fires `af_add_to_cart` event with product details
- **Complete Purchase**: Fires `af_purchase` event with revenue tracking
- **Simulate User Login**: Calls `setCustomerUserId()` to stitch a web session to a known customer

### 3. Inspect Live Payloads
The right panel (**Attribution Inspector**) shows:
- Real-time **Active Session Attribution** values
- Complete **Event Stream** with timestamps
- Click any event to expand and view the full JSON payload
- Use **Clear Log** to reset and test new scenarios

## 🏗️ Project Structure

```
af-web-integration/
├── src/
│   ├── components/
│   │   ├── CampaignBar.jsx         # Traffic source simulator
│   │   ├── CampaignBar.css         # Campaign bar styling
│   │   ├── Storefront.jsx          # E-commerce UI
│   │   ├── Storefront.css          # Storefront styling
│   │   ├── AttributionInspector.jsx # Event stream viewer
│   │   └── AttributionInspector.css # Inspector styling
│   ├── utils/
│   │   ├── appsflyer.js            # SDK wrapper module
│   │   └── qrcode.jsx              # QR code generator
│   ├── App.jsx                     # Main layout orchestrator
│   ├── App.css                     # App layout (split-screen)
│   ├── index.css                   # Global styles
│   └── main.jsx                    # React entry point
├── index.html                      # HTML with SDK placeholder
├── .env.example                    # Environment template
├── package.json
├── vite.config.js
└── DEMO_GUIDE.md                   # This file
```

## 🔧 Technical Details

### AppsFlyer SDK Integration (`src/utils/appsflyer.js`)

The wrapper module provides:

```javascript
// Initialize the command queue if SDK not loaded
initializeAFQueue()

// Track page load (initial attribution)
trackPageLoad()

// Identify user by customer ID (stitching)
identifyUser(cuid)

// Track custom events with event values
trackEvent(eventName, eventValues)

// Get current attribution context from URL
getAttributionContext()

// Generate OneLink URL with current attribution
generateOneLinkUrl(baseUrl)

// Register listeners for real-time event broadcasts
addEventListener(callback)
```

### Event Broadcasting System

Every SDK call broadcasts to React listeners, enabling the Inspector to update in real-time:

```javascript
// In your component
useEffect(() => {
  const unsubscribe = addEventListener((event) => {
    // event.type: 'pageLoad', 'setCustomerUserId', 'event'
    // event.data: event payload
    // event.timestamp: ISO timestamp
  });
  return unsubscribe;
}, []);
```

### Design System

- **Light theme**: Storefront uses clean `#F8FAFC` background
- **Dark theme**: Inspector uses dark slate `#0F172A` for console feel
- **Accent color**: Purple `#7e22ce` for highlights and CTAs
- **Responsive**: Split-screen stacks to vertical on tablets/mobile

## 📱 Responsive Behavior

- **Desktop** (1024px+): Split-screen layout (62% storefront, 38% inspector)
- **Tablet/Mobile** (<1024px): Single column, stacked panels
- Campaign bar adapts to flexible wrapping layout on smaller screens

## 🧪 Testing Scenarios

### Scenario 1: Track Meta Ads Campaign
1. Click **"Meta Ads"** pill in Campaign Bar
2. URL changes to: `/?pid=meta_ads&c=summer_launch_2026&af_adset=carousel_1`
3. `pageLoad` event appears in Inspector
4. Click **"Complete Purchase"** on any product
5. `af_purchase` event shows with correct attribution context

### Scenario 2: User Stitching
1. Click **"Simulate User Login"** button
2. Enter a custom user ID (e.g., `account_12345`)
3. Click **"Login & Stitch ID"**
4. `setCustomerUserId` event appears in Inspector
5. **Active Session Attribution** shows "✓ Stitched" with your ID

### Scenario 3: Custom Traffic Source
1. Enter `custom_partner` in the first input
2. Enter `vip_campaign` in the second input
3. Click **"Apply"**
4. URL updates and `pageLoad` fires with new attribution

## 🔗 API Reference

### Campaign Options

Each pre-configured pill passes these parameters:

| Pill | pid | c | Extra |
|------|-----|---|-------|
| Direct / Organic | (empty) | (empty) | None |
| Meta Ads | `meta_ads` | `summer_launch_2026` | `af_adset=carousel_1` |
| Google Search | `google_search` | `brand_exact` | `gclid=demo_991` |
| TikTok Creator | `tiktok_int` | `influencer_promo` | None |

### Event Payloads

#### `pageLoad` Event
```json
{
  "type": "pageLoad",
  "data": {
    "eventName": "pageLoad",
    "timestamp": "2026-11-22T10:52:04.123Z"
  },
  "timestamp": "2026-11-22T10:52:04.123Z"
}
```

#### `setCustomerUserId` Event
```json
{
  "type": "setCustomerUserId",
  "data": {
    "eventName": "setCustomerUserId",
    "customerId": "user_48291",
    "timestamp": "2026-11-22T10:52:05.456Z"
  },
  "timestamp": "2026-11-22T10:52:05.456Z"
}
```

#### `af_add_to_cart` Event
```json
{
  "type": "event",
  "data": {
    "eventName": "af_add_to_cart",
    "eventValues": {
      "af_content_id": "plan_pro",
      "af_content_type": "plan",
      "af_price": 99,
      "af_currency": "USD",
      "timestamp": "2026-11-22T10:52:06.789Z"
    }
  },
  "timestamp": "2026-11-22T10:52:06.789Z"
}
```

#### `af_purchase` Event
```json
{
  "type": "event",
  "data": {
    "eventName": "af_purchase",
    "eventValues": {
      "af_content_id": "plan_enterprise",
      "af_content_type": "plan",
      "eventRevenue": 199,
      "eventRevenueCurrency": "USD",
      "eventCurrency": "USD",
      "af_price": 199,
      "timestamp": "2026-11-22T10:52:07.123Z"
    }
  },
  "timestamp": "2026-11-22T10:52:07.123Z"
}
```

## 🌐 OneLink Integration

The **OneLink Banner** at the bottom of the storefront:

- Generates a OneLink URL with current `pid` and `c` parameters
- Displays a **QR code** that automatically updates when you switch traffic sources
- Base URL: `https://demo.onelink.me/af-web?...`
- Perfect for testing web-to-app handoff flows

## 🎨 Customization

### Change Product Catalog
Edit `src/components/Storefront.jsx`, `products` array:
```javascript
const products = [
  {
    id: 'plan_starter',
    name: 'Starter Plan',
    price: 29,
    features: ['Basic analytics', '100K events/mo', 'Email support'],
  },
  // Add more products...
];
```

### Add Traffic Sources
Edit `src/components/CampaignBar.jsx`, `campaignOptions` array:
```javascript
const campaignOptions = [
  { label: 'Your Source', pid: 'your_pid', c: 'your_campaign' },
  // Add more options...
];
```

### Modify Inspector Layout
The **AttributionInspector** component reads from `getAttributionContext()`. 
Extend the `attr-row` sections in the template to show additional parameters.

## 🚨 Troubleshooting

### Events not appearing in Inspector?
- Ensure you're clicking buttons on the **left panel** (Storefront)
- Check the browser console for any JS errors
- Clear the log and try again

### QR code not loading?
- The demo uses `api.qrserver.com` to generate QR codes
- Ensure your internet connection allows external API calls
- Check browser console for CORS errors

### SDK Connected but events not in AppsFlyer dashboard?
- Confirm your `WEB_DEV_KEY` is correct
- Wait 30-60 seconds for real-time events to appear in dashboard
- Check AppsFlyer Dashboard → Data → Raw Data for the events

### Build errors?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📦 Build & Deploy

### Production Build
```bash
npm run build
# Output in ./dist/
```

### Preview Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
Push to GitHub and connect your repo to Vercel/Netlify for automatic deployments.

## 🔐 Security Notes

- This demo uses `window.history.pushState()` to update URLs without page reloads
- No sensitive data is stored; all state is in memory
- SDK credentials should never be committed—use `.env` files
- For production, implement proper backend attribution validation

## 📚 Resources

- [AppsFlyer Web SDK Documentation](https://support.appsflyer.com/hc/en-us/articles/207032066)
- [OneLink Documentation](https://support.appsflyer.com/hc/en-us/articles/207033326)
- [AppsFlyer Dashboard](https://hq1.appsflyer.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)

## 📄 License

MIT

---

**Last Updated**: November 22, 2026
**Demo Version**: 1.0.0
