import { useState, useCallback } from 'react';
import { trackCampaignVisit } from '../utils/appsflyer';
import './CampaignBar.css';

export default function CampaignBar() {
  const [customPid, setCustomPid] = useState('');
  const [customCampaign, setCustomCampaign] = useState('');

  const campaignOptions = [
    { label: 'Direct / Organic', pid: '', c: '' },
    { label: 'Meta Ads', pid: 'meta_ads', c: 'summer_launch_2026', extra: { af_adset: 'carousel_1' } },
    { label: 'Google Search', pid: 'google_search', c: 'brand_exact', extra: { gclid: 'demo_991' } },
    { label: 'TikTok Creator', pid: 'tiktok_int', c: 'influencer_promo' },
  ];

  const applyCampaign = useCallback((pid, c, extra = {}) => {
    const params = new URLSearchParams();
    if (pid) params.set('pid', pid);
    if (c) params.set('c', c);
    Object.entries(extra).forEach(([key, value]) => {
      params.set(key, value);
    });

    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    window.history.pushState({ campaign: { pid, c } }, '', newUrl);

    // Dispatch custom event so other components (Storefront) can react to URL changes
    window.dispatchEvent(new CustomEvent('afCampaignChanged', { detail: { pid, c } }));

    // Log the campaign visit in the inspector
    trackCampaignVisit(pid || 'direct', c || 'organic');
  }, []);

  const applyCustom = useCallback(() => {
    applyCampaign(customPid, customCampaign);
    setCustomPid('');
    setCustomCampaign('');
  }, [customPid, customCampaign, applyCampaign]);

  const currentParams = new URLSearchParams(window.location.search);
  const currentPid = currentParams.get('pid') || '';
  const currentCampaign = currentParams.get('c') || '';

  return (
    <div className="campaign-bar">
      <div className="campaign-container">
        <div className="campaign-section">
          <span className="label">Traffic Source:</span>
          <div className="pill-group">
            {campaignOptions.map((option, idx) => (
              <button
                key={idx}
                className={`pill ${
                  (currentPid === option.pid || (!option.pid && !currentPid)) ? 'active' : ''
                }`}
                onClick={() => applyCampaign(option.pid, option.c, option.extra)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="custom-section">
          <span className="label">Custom:</span>
          <input
            type="text"
            placeholder="media source (pid)"
            value={customPid}
            onChange={(e) => setCustomPid(e.target.value)}
            className="custom-input"
          />
          <input
            type="text"
            placeholder="campaign (c)"
            value={customCampaign}
            onChange={(e) => setCustomCampaign(e.target.value)}
            className="custom-input"
          />
          <button onClick={applyCustom} className="apply-btn">
            Apply
          </button>
        </div>

        <div className="url-display">
          <span className="label">URL:</span>
          <code className="url">{window.location.href}</code>
        </div>
      </div>
    </div>
  );
}
