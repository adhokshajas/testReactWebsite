# Official AppsFlyer Web SDK Integration

This guide explains how to activate the official AppsFlyer Web SDK in this demo.

## ✅ What's Already Integrated

### 1. Official Snippet in `index.html`
The exact AppsFlyer Web SDK snippet is now embedded in `<head>`:

```html
<script>
!function(t,e,n,s,a,c,i,o,p){t.AppsFlyerSdkObject=a,t.AF=t.AF||function(){
(t.AF.q=t.AF.q||[]).push([Date.now()].concat(Array.prototype.slice.call(arguments)))},
t.AF.id=t.AF.id||i,t.AF.plugins={},o=e.createElement(n),p=e.getElementsByTagName(n)[0],o.async=1,
o.src="https://websdk.appsflyer.com?"+(c.length>0?"st="+c.split(",").sort().join(",")+"&":"")+(i.length>0?"af_id="+i:""),
p.parentNode.insertBefore(o,p)}(window,document,"script",0,"AF","pba",{pba: {webAppId: "YOUR_WEB_SDK_ID"}})
</script>
```

This snippet:
- ✅ Loads the AppsFlyer Web SDK asynchronously
- ✅ Fires an automatic `LOAD` visit on page load
- ✅ Provides `window.AF('pba', ...)` command API
- ✅ Works in simulation mode (queues commands if SDK fails to load)

### 2. Official SDK API Calls in `src/utils/appsflyer.js`

All interactions now use the official `window.AF('pba', ...)` API:

#### **Auto-Visit (LOAD)**
- The snippet automatically tracks a visit when the page loads
- Logged in Inspector as: `SDK Auto-Visit (LOAD)`
- **Never duplicated** even under React StrictMode (guarded by `useRef`)

#### **Customer User ID (`identifyUser(cuid)`)**
```javascript
// 1. Set Customer User ID
window.AF('pba', 'setCustomerUserId', String(cuid))

// 2. Fire af_login event with CUID attached
window.AF('pba', 'event', {
  eventType: 'EVENT',
  eventName: 'af_login',
  eventValue: {
    af_customer_event_id: crypto.randomUUID()
  }
})
```

#### **Add to Cart (`trackAddToCart(product)`)**
```javascript
window.AF('pba', 'event', {
  eventType: 'EVENT',
  eventName: 'af_add_to_cart',
  eventValue: {
    af_content_id: product.id,
    af_content_type: 'subscription',
    af_price: product.price,
    af_currency: 'USD',
    af_customer_event_id: crypto.randomUUID()
  }
})
```

#### **Purchase (`trackPurchase(product)`)**
```javascript
window.AF('pba', 'event', {
  eventType: 'EVENT',
  eventName: 'af_purchase',
  eventValue: {
    af_content_id: product.id,
    af_content_type: 'subscription',
    af_price: product.price,
    af_currency: 'USD',
    af_revenue: product.price,
    af_customer_event_id: crypto.randomUUID()
  }
})
```

#### **Campaign Visit (`trackCampaignVisit(pid, campaign)`)**
When the user switches traffic sources via the Campaign Bar:
```javascript
// Logged in Inspector as:
{
  eventName: 'Campaign Visit',
  attribution: { pid: 'meta_ads', campaign: 'summer_launch_2026' }
}
```

## 🔧 Configuration Steps

### Step 1: Get Your Web SDK ID
1. Log in to [AppsFlyer Dashboard](https://hq1.appsflyer.com)
2. Go to **Apps** → Select your app
3. Navigate to **Settings** → **Web SDK**
4. Copy your **Web SDK ID** (looks like: `abc123def456...`)

### Step 2: Update `index.html`
Replace `YOUR_WEB_SDK_ID` in the snippet:

```html
<!-- BEFORE: -->
{pba: {webAppId: "YOUR_WEB_SDK_ID"}}

<!-- AFTER: -->
{pba: {webAppId: "abc123def456ghi789jkl012"}}
```

### Step 3: (Optional) Set Environment Variable
```bash
cp .env.example .env
# Edit .env
VITE_AF_WEB_SDK_ID=abc123def456ghi789jkl012
```

Then reference in `index.html` during build (if using server-side rendering):
```html
{pba: {webAppId: import.meta.env.VITE_AF_WEB_SDK_ID || "YOUR_WEB_SDK_ID"}}
```

### Step 4: Test the Integration

**Dev Mode:**
```bash
npm run dev
```

Then:
1. Open **DevTools → Network tab**
2. Look for requests to `websdk.appsflyer.com`
3. Click buttons in the Storefront
4. Check **AppsFlyer Dashboard → Real-Time** for incoming events

**Production Build:**
```bash
npm run build
npm run preview
```

## 📊 Event Flow Diagram

```
┌─────────────────────────────────────────┐
│   Page Load (index.html snippet)         │
│         ↓                                 │
│   AF('pba') auto-visit (LOAD)           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   User Actions in Storefront             │
└─────────────────────────────────────────┘
      ↙              ↙              ↓
  Add to Cart    Purchase      Login
      ↓              ↓              ↓
  af_add_to_cart  af_purchase  setCustomerUserId
      ↓              ↓          + af_login
      └──────────────┴──────────────┘
              ↓
   AppsFlyer Web SDK Transmits
              ↓
   AppsFlyer Backend (Real-Time Dashboard)
```

## 🎯 Real-Time Inspector Display

The right-hand **Attribution Inspector** now shows:

1. **SDK Auto-Visit (LOAD)** - Automatic on page load
2. **Campaign Visit** - When traffic source changes
3. **setCustomerUserId** - When user logs in
4. **af_login** - Automatically fired after setCustomerUserId
5. **af_add_to_cart** - Product added to cart
6. **af_purchase** - Purchase completed

Each event in the stream shows:
- 📅 Timestamp
- ✅ `200 OK` badge (simulated or real SDK response)
- 📋 Expandable JSON payload
- 🔍 Full event arguments

## ⚠️ Important Notes

### No Duplicate pageLoad Events
- The snippet fires the auto-visit automatically on load
- We do NOT fire manual `pageLoad()` calls
- Uses `useRef` guard to prevent React StrictMode duplicates
- Campaign switches log `Campaign Visit` (not duplicate loads)

### PII Protection
- **Always use opaque customer IDs** like `user_48291`, `cust_abc123`
- **Never pass email addresses or phone numbers** to `setCustomerUserId()`
- Use `af_customer_event_id: crypto.randomUUID()` for event deduplication

### Fallback Behavior
If the SDK fails to load (network error, etc.):
- Commands queue in `window.AF.q`
- Events still broadcast to Inspector (simulation mode)
- No data loss when SDK reconnects

### Currency & Pricing
- All prices in demo use `USD`
- `af_price` and `af_revenue` accept floating-point (e.g., `9.99`)
- Always include `af_currency` for multi-currency support

## 🧪 Testing Checklist

- [ ] Update `YOUR_WEB_SDK_ID` in `index.html`
- [ ] Run `npm run build` (verify zero errors)
- [ ] Run `npm run dev` and open in browser
- [ ] Check DevTools Network tab for `websdk.appsflyer.com` request
- [ ] Click **Campaign Bar pills** → verify Inspector shows `Campaign Visit`
- [ ] Click **"Simulate User Login"** → verify `setCustomerUserId` + `af_login`
- [ ] Click **"Add to Cart"** → verify `af_add_to_cart` with product details
- [ ] Click **"Complete Purchase"** → verify `af_purchase` with revenue
- [ ] Log in to AppsFlyer Dashboard → go to **Real-Time** tab
- [ ] Verify events appear within 30-60 seconds

## 📚 Official Resources

- **AppsFlyer Web SDK Docs**: https://support.appsflyer.com/hc/en-us/articles/207032066
- **OneLink**: https://support.appsflyer.com/hc/en-us/articles/207033326
- **Dashboard**: https://hq1.appsflyer.com
- **Event Dictionary**: https://support.appsflyer.com/hc/en-us/articles/207032956

## 🆘 Troubleshooting

### Events Not Appearing in Dashboard?

**Check 1: Web SDK ID**
```javascript
// Open DevTools Console
window.AF.id  // Should show your Web SDK ID
```

**Check 2: Network Request**
- DevTools → Network tab
- Filter: `websdk.appsflyer.com`
- Should see a successful request (status 200)

**Check 3: Event Queue**
```javascript
// Open DevTools Console
window.AF.q  // Should show queued commands if SDK loading
```

**Check 4: Real-Time Dashboard**
- AppsFlyer → Real-Time tab (not Reports, which has delay)
- Filter by your Web SDK ID or domain

### StrictMode Double-Events?
- Already fixed with `useRef` guards
- Check Inspector for timestamps—should not be duplicated

### Fallback Mode Stuck?
```javascript
// Check if SDK fully loaded
window.appsFlyer  // Should exist if SDK loaded
// or
window.AF.plugins  // Should have plugin info if SDK loaded
```

## 📝 Event Payload Examples

### af_login (Sent After setCustomerUserId)
```json
{
  "eventType": "EVENT",
  "eventName": "af_login",
  "eventValue": {
    "af_customer_event_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### af_add_to_cart (Product Added)
```json
{
  "eventType": "EVENT",
  "eventName": "af_add_to_cart",
  "eventValue": {
    "af_content_id": "plan_pro",
    "af_content_type": "subscription",
    "af_price": 99,
    "af_currency": "USD",
    "af_customer_event_id": "660f9511-f30c-52e5-b827-557766551111"
  }
}
```

### af_purchase (Conversion)
```json
{
  "eventType": "EVENT",
  "eventName": "af_purchase",
  "eventValue": {
    "af_content_id": "plan_enterprise",
    "af_content_type": "subscription",
    "af_price": 199,
    "af_currency": "USD",
    "af_revenue": 199,
    "af_customer_event_id": "770g0622-g41d-63f6-c938-668877662222"
  }
}
```

---

**Next Steps**: Replace `YOUR_WEB_SDK_ID` in `index.html` and run `npm run dev` to start tracking!
