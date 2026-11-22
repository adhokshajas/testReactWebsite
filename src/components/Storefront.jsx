import { useState, useCallback, useEffect } from 'react';
import { identifyUser, trackAddToCart, trackPurchase, getAttributionContext } from '../utils/appsflyer';
import './Storefront.css';

export default function Storefront() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState('user_48291');
  const [editingCuid, setEditingCuid] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [attribution, setAttribution] = useState(getAttributionContext());

  const products = [
    {
      id: 'plan_starter',
      name: 'Starter Plan',
      price: 29,
      features: ['Basic analytics', '100K events/mo', 'Email support'],
    },
    {
      id: 'plan_pro',
      name: 'Pro Bundle',
      price: 99,
      features: ['Advanced analytics', '1M events/mo', 'Priority support', 'Custom integrations'],
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise Suite',
      price: 199,
      features: ['Full platform', 'Unlimited events', '24/7 support', 'Dedicated manager'],
    },
  ];

  useEffect(() => {
    // Update attribution context on initial mount
    setAttribution(getAttributionContext());

    // Listen for campaign changes from CampaignBar
    const handleCampaignChange = () => {
      setAttribution(getAttributionContext());
    };

    window.addEventListener('afCampaignChanged', handleCampaignChange);
    return () => window.removeEventListener('afCampaignChanged', handleCampaignChange);
  }, []);

  const handleLogin = useCallback(() => {
    if (customerId.trim()) {
      identifyUser(customerId);
      setIsLoggedIn(true);
      setEditingCuid(false);
    }
  }, [customerId]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCustomerId('user_48291');
  }, []);

  const handleAddToCart = useCallback((product) => {
    trackAddToCart(product);
  }, []);

  const handlePurchase = useCallback((product) => {
    trackPurchase(product);

    setShowToast(`✓ Purchase of ${product.name} confirmed!`);
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  return (
    <div className="storefront">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">Web Attribution Sandbox</div>
        <div className="navbar-user">
          {isLoggedIn ? (
            <>
              <span className="user-badge">{customerId}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setEditingCuid(!editingCuid)} className="btn-login">
              Simulate User Login
            </button>
          )}
        </div>
      </nav>

      {/* Login Form */}
      {editingCuid && !isLoggedIn && (
        <div className="login-form">
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Enter Customer User ID"
            className="login-input"
          />
          <button onClick={handleLogin} className="btn-confirm">
            Login & Stitch ID
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Web Attribution Sandbox</h1>
        <div className="flow-steps">
          <div className="step">
            <span className="step-num">1</span>
            <span className="step-text">Pick Traffic Source</span>
          </div>
          <span className="step-arrow">→</span>
          <div className="step">
            <span className="step-num">2</span>
            <span className="step-text">Trigger Web Events</span>
          </div>
          <span className="step-arrow">→</span>
          <div className="step">
            <span className="step-num">3</span>
            <span className="step-text">Inspect Live Payloads</span>
          </div>
        </div>
      </section>

      {/* Product Cards Grid */}
      <section className="products-section">
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{product.price}</span>
              </div>
              <ul className="features">
                {product.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <div className="card-actions">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn-secondary"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handlePurchase(product)}
                  className="btn-primary"
                >
                  Complete Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Web Attribution Summary */}
      <section className="attribution-summary-section">
        <div className="attribution-summary-card">
          <h3>Web Attribution Summary</h3>
          <p className="summary-description">
            Your web session maintains persistent attribution across page reloads via URL parameters and Web SDK tracking.
          </p>

          <div className="attribution-details">
            <div className="detail-row">
              <span className="detail-label">Media Source (pid)</span>
              <code className="detail-value">{attribution.mediaSource || 'direct'}</code>
            </div>
            <div className="detail-row">
              <span className="detail-label">Campaign (c)</span>
              <code className="detail-value">{attribution.campaign || 'organic'}</code>
            </div>
            {attribution.adset && (
              <div className="detail-row">
                <span className="detail-label">Adset</span>
                <code className="detail-value">{attribution.adset}</code>
              </div>
            )}
            {attribution.gclid && (
              <div className="detail-row">
                <span className="detail-label">Click ID (gclid)</span>
                <code className="detail-value">{attribution.gclid}</code>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Customer User ID</span>
              <code className="detail-value">
                {isLoggedIn ? (
                  <span className="stitched">✓ {customerId}</span>
                ) : (
                  <span className="anonymous">Not stitched</span>
                )}
              </code>
            </div>
          </div>

          <div className="summary-info">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <span className="info-text"><strong>How it works:</strong> URL parameters (`pid`, `c`) persist in the address bar. Reload the page and the attribution persists.</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔗</span>
              <span className="info-text"><strong>Customer ID:</strong> When you log in, the CUID is stored and stitched to all subsequent events via the Web SDK.</span>
            </div>
            <div className="info-item">
              <span className="info-icon">📊</span>
              <span className="info-text"><strong>Measurement:</strong> Every web event (views, clicks, purchases) includes this attribution context automatically.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && <div className="toast">{showToast}</div>}
    </div>
  );
}
