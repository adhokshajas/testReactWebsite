import { useState, useEffect, useCallback } from 'react';
import { addEventListener, getAttributionContext } from '../utils/appsflyer';
import './AttributionInspector.css';

export default function AttributionInspector() {
  const [events, setEvents] = useState([]);
  const [expandedEventIdx, setExpandedEventIdx] = useState(null);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [isConnected] = useState(!import.meta.env.VITE_AF_WEB_DEV_KEY);

  useEffect(() => {
    const unsubscribe = addEventListener((event) => {
      setEvents((prev) => [...prev, event]);

      // Update customer ID if this is a setCustomerUserId event
      if (event.type === 'setCustomerUserId') {
        setCurrentCustomerId(event.data.customerId);
      }
    });

    return unsubscribe;
  }, []);

  const handleClearLog = useCallback(() => {
    setEvents([]);
    setExpandedEventIdx(null);
  }, []);

  const attribution = getAttributionContext();

  const getEventLabel = (event) => {
    if (event.type === 'pageLoad') return 'pageLoad';
    if (event.type === 'setCustomerUserId') return `setCustomerUserId(${event.data.customerId})`;
    if (event.type === 'event') return event.data.eventName;
    return event.type;
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="inspector">
      {/* SDK Status Header */}
      <div className="inspector-header">
        <div className="status-badge">
          {isConnected ? '🟢 Simulation Mode' : '🔴 SDK Connected'}
        </div>
        <button onClick={handleClearLog} className="clear-btn">
          Clear Log
        </button>
      </div>

      {/* Attribution Card */}
      <div className="attribution-card">
        <h3>Active Session Attribution</h3>
        <div className="attr-row">
          <span className="attr-label">Media Source (pid)</span>
          <code className="attr-value">{attribution.mediaSource || 'direct'}</code>
        </div>
        <div className="attr-row">
          <span className="attr-label">Campaign (c)</span>
          <code className="attr-value">{attribution.campaign || 'organic'}</code>
        </div>
        {attribution.adset && (
          <div className="attr-row">
            <span className="attr-label">Adset</span>
            <code className="attr-value">{attribution.adset}</code>
          </div>
        )}
        {attribution.gclid && (
          <div className="attr-row">
            <span className="attr-label">Click ID (gclid)</span>
            <code className="attr-value">{attribution.gclid}</code>
          </div>
        )}
        <div className="attr-row">
          <span className="attr-label">Customer User ID</span>
          <code className="attr-value">
            {currentCustomerId ? (
              <span className="stitched">✓ {currentCustomerId}</span>
            ) : (
              <span className="anonymous">Anonymous</span>
            )}
          </code>
        </div>
      </div>

      {/* Event Stream */}
      <div className="event-stream">
        <h3>Real-Time Event Stream</h3>
        <div className="events-list">
          {events.length === 0 ? (
            <div className="empty-state">
              No events yet. Try clicking traffic sources or action buttons above.
            </div>
          ) : (
            events.map((event, idx) => (
              <div key={idx} className="event-item">
                <div
                  className="event-header"
                  onClick={() =>
                    setExpandedEventIdx(expandedEventIdx === idx ? null : idx)
                  }
                >
                  <div className="event-left">
                    <span className="event-time">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="event-name">{getEventLabel(event)}</span>
                  </div>
                  <div className="event-right">
                    <span className="badge-ok">200 OK</span>
                    <span className="expand-icon">
                      {expandedEventIdx === idx ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedEventIdx === idx && (
                  <div className="event-payload">
                    <pre>{formatJson(event)}</pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
