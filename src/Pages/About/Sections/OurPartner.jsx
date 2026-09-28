import React from 'react';
import '../Styles/OurPartner.css';

const row1Partners = [
    { name: 'Stripe', icon: 'https://cdn.simpleicons.org/stripe/635BFF', category: 'Payouts & Payments' },
    { name: 'Google Maps', icon: 'https://cdn.simpleicons.org/googlemaps/4285F4', category: 'Stall & Route Maps' },
    { name: 'WhatsApp', icon: 'https://cdn.simpleicons.org/whatsapp/25D366', category: 'Farmer Order Alerts' },
    { name: 'Shopify', icon: 'https://cdn.simpleicons.org/shopify/96BF48', category: 'Produce Channel Sync' },
    { name: 'Zapier', icon: 'https://cdn.simpleicons.org/zapier/FF4A00', category: 'Workflow Automation' },
    { name: 'Twilio', icon: 'https://cdn.simpleicons.org/twilio/F22F46', category: 'SMS Dispatch' },
    { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql/4169E1', category: 'Live Inventory DB' },
    { name: 'OpenAI', icon: 'https://cdn.simpleicons.org/openai/ffffff', category: 'Yield Forecast AI' },
    { name: 'AWS Cloud', icon: 'https://cdn.simpleicons.org/amazonwebservices/FF9900', category: 'IoT Telematics' },
];

const row2Partners = [
    { name: 'QuickBooks', icon: 'https://cdn.simpleicons.org/quickbooks/2CA01C', category: 'Farm Accounting' },
    { name: 'Zendesk', icon: 'https://cdn.simpleicons.org/zendesk/ffffff', category: 'Vendor Support' },
    { name: 'Google Analytics', icon: 'https://cdn.simpleicons.org/googleanalytics/E37400', category: 'Crop Demand Insights' },
    { name: 'Slack', icon: 'https://cdn.simpleicons.org/slack/4A154B', category: 'Hub Operations' },
    { name: 'Meta', icon: 'https://cdn.simpleicons.org/meta/0467DF', category: 'Direct Marketing' },
    { name: 'WooCommerce', icon: 'https://cdn.simpleicons.org/woocommerce/96588A', category: 'B2B Produce Orders' },
    { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB', category: 'Vendor Portal UI' },
    { name: 'Xero', icon: 'https://cdn.simpleicons.org/xero/13B5EA', category: 'Financial Audits' },
    { name: 'GitHub', icon: 'https://cdn.simpleicons.org/github/ffffff', category: 'Agri-Tech Engine' },
];

function OurPartner() {
    // Smooth infinite loop ke liye array duplicate kiya hai
    const duplicatedRow1 = [...row1Partners, ...row1Partners, ...row1Partners];
    const duplicatedRow2 = [...row2Partners, ...row2Partners, ...row2Partners];

    return (
        <section className="ourpartner-section">
            {/* Header Content Section */}
            <div className="ourpartner-header">
                {/* Badge */}
                <div className="ourpartner-badge">
                    <span className="badge-dash">—</span> ECOSYSTEM & INTEGRATIONS
                </div>

                {/* Main Headline */}
                <h2 className="ourpartner-heading">
                    Seamlessly connected with your agritech & logistics stack.
                </h2>

                {/* Descriptive Sub-text */}
                <p className="ourpartner-subheading">
                    Instant grower payouts, live cold-chain telemetry, automated SMS dispatch,
                    stall mapping, inventory sync, accounting, and predictive demand analytics.{' '}
                    <span className="ourpartner-highlight">Plug and play.</span>
                </p>
            </div>

            {/* Infinite Marquees Container */}
            <div className="ourpartner-marquees-container">
                {/* Upper Marquee: Left to Right */}
                <div className="marquee-wrapper fade-edges">
                    <div className="marquee-track marquee-left-to-right">
                        {duplicatedRow1.map((item, idx) => (
                            <div key={`row1-${idx}`} className="partner-card">
                                <div className="partner-icon-wrapper">
                                    <img src={item.icon} alt={item.name} className="partner-icon" />
                                </div>
                                <span className="partner-name">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lower Marquee: Right to Left */}
                <div className="marquee-wrapper fade-edges">
                    <div className="marquee-track marquee-right-to-left">
                        {duplicatedRow2.map((item, idx) => (
                            <div key={`row2-${idx}`} className="partner-card">
                                <div className="partner-icon-wrapper">
                                    <img src={item.icon} alt={item.name} className="partner-icon" />
                                </div>
                                <span className="partner-name">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurPartner;