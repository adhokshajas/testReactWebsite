/**
 * AppsFlyer Web SDK Integration
 * Wrapper for official AF('pba', ...) API calls with event broadcasting
 */

let eventListeners = [];

/**
 * Register a listener to receive all SDK event calls
 */
export function addEventListener(callback) {
  eventListeners.push(callback);
  return () => {
    eventListeners = eventListeners.filter(cb => cb !== callback);
  };
}

/**
 * Broadcast an event to all registered listeners
 */
function broadcastEvent(eventType, eventData) {
  const event = {
    type: eventType,
    data: eventData,
    timestamp: new Date().toISOString(),
  };
  eventListeners.forEach(callback => {
    try {
      callback(event);
    } catch (err) {
      console.error('Event listener error:', err);
    }
  });
}

/**
 * Ensure window.AF is available and queuing commands
 */
export function initializeAFQueue() {
  if (!window.AF) {
    window.AF = function() {
      (window.AF.q = window.AF.q || []).push([Date.now()].concat(Array.prototype.slice.call(arguments)));
    };
    window.AF.q = [];
  }
}

/**
 * Log the automatic SDK LOAD visit (fired by snippet on page load)
 * Called once per session to register the visit in the Inspector without duplicating
 */
export function logAutoVisit() {
  const eventData = {
    eventName: 'SDK Auto-Visit (LOAD)',
    description: 'Automatic visit tracked by AppsFlyer Web SDK on page load',
    timestamp: new Date().toISOString(),
  };

  broadcastEvent('autoVisit', eventData);
}

/**
 * Track a manual visit when campaign attribution changes
 * This logs a visit to the inspector when the user switches traffic sources
 */
export function trackCampaignVisit(pid, campaign) {
  const eventData = {
    eventName: 'Campaign Visit',
    description: `Visit with attribution: pid=${pid}, campaign=${campaign}`,
    attribution: { pid, campaign },
    timestamp: new Date().toISOString(),
  };

  broadcastEvent('campaignVisit', eventData);
}

/**
 * Identify a user by customer user ID and trigger af_login event
 * Calls: AF('pba', 'setCustomerUserId', cuid) + AF('pba', 'event', af_login)
 */
export function identifyUser(cuid) {
  initializeAFQueue();

  // 1. Set the customer user ID
  const setCustomerUserIdData = {
    eventName: 'setCustomerUserId',
    customerId: cuid,
    arguments: ['pba', 'setCustomerUserId', cuid],
    timestamp: new Date().toISOString(),
  };

  if (window.AF) {
    try {
      window.AF('pba', 'setCustomerUserId', String(cuid));
    } catch (err) {
      console.error('AF setCustomerUserId error:', err);
    }
  }

  broadcastEvent('setCustomerUserId', setCustomerUserIdData);

  // 2. Trigger af_login event with the CUID attached
  const afLoginEvent = {
    eventType: 'EVENT',
    eventName: 'af_login',
    eventValue: {
      af_customer_event_id: crypto.randomUUID(),
    },
    timestamp: new Date().toISOString(),
  };

  if (window.AF) {
    try {
      window.AF('pba', 'event', afLoginEvent);
    } catch (err) {
      console.error('AF af_login event error:', err);
    }
  }

  broadcastEvent('event', {
    eventName: 'af_login',
    arguments: ['pba', 'event', afLoginEvent],
    eventData: afLoginEvent,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track an add-to-cart event
 */
export function trackAddToCart(product) {
  initializeAFQueue();

  const afAddToCartEvent = {
    eventType: 'EVENT',
    eventName: 'af_add_to_cart',
    eventValue: {
      af_content_id: product.id,
      af_content_type: 'subscription',
      af_price: product.price,
      af_currency: 'USD',
      af_customer_event_id: crypto.randomUUID(),
    },
    timestamp: new Date().toISOString(),
  };

  if (window.AF) {
    try {
      window.AF('pba', 'event', afAddToCartEvent);
    } catch (err) {
      console.error('AF af_add_to_cart event error:', err);
    }
  }

  broadcastEvent('event', {
    eventName: 'af_add_to_cart',
    arguments: ['pba', 'event', afAddToCartEvent],
    eventData: afAddToCartEvent,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track a purchase event with revenue (top-level, per AppsFlyer spec)
 */
export function trackPurchase(product) {
  initializeAFQueue();

  const afPurchaseEvent = {
    eventType: 'EVENT',
    eventName: 'af_purchase',
    eventRevenue: product.price,  // ✅ TOP-LEVEL revenue field
    eventRevenueCurrency: 'USD',  // ✅ TOP-LEVEL currency field
    eventValue: {
      af_content_id: product.id,
      af_content_type: 'subscription',
      af_price: product.price,
      af_currency: 'USD',
      af_customer_event_id: crypto.randomUUID(),
    },
    timestamp: new Date().toISOString(),
  };

  if (window.AF) {
    try {
      window.AF('pba', 'event', afPurchaseEvent);
    } catch (err) {
      console.error('AF af_purchase event error:', err);
    }
  }

  broadcastEvent('event', {
    eventName: 'af_purchase',
    arguments: ['pba', 'event', afPurchaseEvent],
    eventData: afPurchaseEvent,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track a custom event with full control
 */
export function trackEvent(eventName, eventValue = {}) {
  initializeAFQueue();

  const eventData = {
    eventType: 'EVENT',
    eventName,
    eventValue: {
      af_customer_event_id: crypto.randomUUID(),
      ...eventValue,
    },
    timestamp: new Date().toISOString(),
  };

  if (window.AF) {
    try {
      window.AF('pba', 'event', eventData);
    } catch (err) {
      console.error(`AF ${eventName} event error:`, err);
    }
  }

  broadcastEvent('event', {
    eventName,
    arguments: ['pba', 'event', eventData],
    eventData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get current attribution context from URL and session
 */
export function getAttributionContext() {
  const params = new URLSearchParams(window.location.search);

  return {
    mediaSource: params.get('pid') || 'direct',
    campaign: params.get('c') || 'organic',
    adset: params.get('af_adset') || params.get('gclid') || null,
    gclid: params.get('gclid') || null,
    customerId: null, // Will be updated by identifyUser
  };
}

/**
 * Generate a OneLink URL with current attribution context
 */
export function generateOneLinkUrl(baseUrl = 'https://demo.onelink.me/af-web') {
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('pid') || 'direct';
  const c = params.get('c') || 'organic';

  const url = new URL(baseUrl);
  url.searchParams.set('pid', pid);
  url.searchParams.set('c', c);

  return url.toString();
}
