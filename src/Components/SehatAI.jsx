import React, { useState, useRef, useEffect } from 'react';
import './Styles/SehatAI.css';

const QUICK_PROMPTS = [
  '🌾 Farmer Ke Liye',
  '🛒 Pre-Order Kaise?',
  '📍 Markets Near Me',
  '📦 Organic Produce',
  '❤️ Why MarketLink?',
];

const WEBSITE_INFO = {
  name: 'MarketLink',
  tagline: 'Direct Farm to Fresh Basket',
  description: 'eGreen Basket Platform - Farmers aur Customers ke beech seedha connection',
  location: 'Karachi, Pakistan',
  email: 'support@marketlink.com',
  phone: '+92 300-XXXX-XXX',
  businessHours: 'Monday to Sunday, 9:00 AM - 6:00 PM',
  
  // Main Features
  features: {
    preOrders: 'Fresh produce ko pehle se order karein aur pickup date decide karein',
    liveMarkets: 'Karachi ke 50+ farmer markets ko map par dekhen aur directly visit karein',
    freshProduce: 'Seedhe farms se organic aur chemical-free sabziyaan',
    farmerRating: 'Har farmer ki rating, reviews aur operating days dekhen',
    realTimeTracking: 'Orders aur market inventory ko real-time update mile',
    customerDashboard: 'Apne orders, favorites aur account settings manage karein',
  },
  
  // For Farmers
  farmerFeatures: {
    stall: 'Apna stall open karein 50+ markets mein',
    dashboard: 'Products add karein, stock manage karein, orders dekhen',
    preOrderGrowth: 'Pre-orders through customers ko direct fulfill karein',
    profile: 'Apna rating, reviews aur business info showcase karein',
  },
  
  // Pages & Features
  pages: {
    home: 'Homepage - Fresh produce explore karein aur markets dekhen',
    products: 'Sab available products aur farmers browse karein',
    markets: 'Map par markets dekhen, ratings dekhen, visit karein',
    preOrders: 'Pehle se order karein aur selected time par pickup karein',
    blog: 'Farming tips, recipes aur organic living ke articles',
    reviews: 'Farmers aur products ki detailed reviews padhen',
  },
  
  mission: 'Farmers ko directly customers se connect karein taakeh fresh, organic produce fair prices par mile',
};

const SYSTEM_PROMPT = `You are Sehat.ai, MarketLink ka helpful assistant. Aap MarketLink platform, features, services, aur farmers ke baare mein jaankari dete hain.

MarketLink - Farm to Fresh Basket Platform:
📍 Location: ${WEBSITE_INFO.location}
📧 Email: ${WEBSITE_INFO.email}
⏰ Hours: ${WEBSITE_INFO.businessHours}

🌾 Main Features:
- Pre-Orders: ${WEBSITE_INFO.features.preOrders}
- Live Markets: ${WEBSITE_INFO.features.liveMarkets}
- Fresh Produce: ${WEBSITE_INFO.features.freshProduce}
- Farmer Ratings: ${WEBSITE_INFO.features.farmerRating}
- Real-time Updates: ${WEBSITE_INFO.features.realTimeTracking}
- Customer Dashboard: ${WEBSITE_INFO.features.customerDashboard}

👨‍🌾 Farmers Ke Liye:
- Apna Stall: ${WEBSITE_INFO.farmerFeatures.stall}
- Farmer Dashboard: ${WEBSITE_INFO.farmerFeatures.dashboard}
- Pre-Order Growth: ${WEBSITE_INFO.farmerFeatures.preOrderGrowth}
- Profile & Reviews: ${WEBSITE_INFO.farmerFeatures.profile}

📄 Website Pages:
- Home: Fresh produce explore karein aur markets dekhen
- Products: Sab available produce aur farmers browse karein
- Markets: Map par 50+ farmer markets dekhen aur visit karein
- Pre-Orders: Pehle se fresh produce order karein, pickup date select karein
- Blog: Farming tips, recipes aur organic living ke articles padhen
- Reviews: Farmers aur products ki detailed reviews dekhen

🌱 Mission: ${WEBSITE_INFO.mission}

Rules:
1. SIRF MarketLink ke baare mein jaankari do
2. Urdu/English mix mein respond karo, simple aur helpful
3. Agar koi aur topic ho, politely redirect karo
4. Responses short aur actionable rakhon
5. Emojis use karo experience ko better banana ke liye`;

function SehatAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '🌾 Assalam-o-Alaikum! Mein Sehat.ai hu, MarketLink ka assistant.\n\n👨‍🌾 Kya aap farmer ho ya customer?\n\n🛒 Fresh produce khareedna chahte ho?\n🏪 Apna stall open karna chahte ho?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef(null);

  // Call Sehat AI API (via backend)
  const callGroqAPI = async (userMessage) => {
    try {
      const response = await fetch('http://localhost:5000/api/sehat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Sehat AI error:', response.status, data);
        return `⚠️ Error: ${data.error || 'Unable to process'}`;
      }

      if (data.success && data.response) {
        return data.response;
      }

      return '❌ Unexpected response';
    } catch (error) {
      console.error('❌ Sehat AI call failed:', error);
      return `❌ Network error: ${error.message}`;
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    // Call Groq API
    const aiResponse = await callGroqAPI(query);
    const finalResponse = aiResponse || 'Mujhe samajhne mein thodi dikkat hui. Kya aap MarketLink ke baare mein kuch aur pooch sakte hain?';

    const aiMsg = {
      id: Date.now() + 1,
      sender: 'ai',
      text: finalResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="sehat-ai-wrapper">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          className="sehat-trigger-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open Sehat.ai Assistant"
        >
          <span className="sehat-trigger-badge">
            <svg viewBox="0 0 13 13" fill="currentColor" width="10" height="10">
              <path d="M5.6,12.6c-0.5-0.8-0.7-2.4-1.7-3.5c-1-1-2.7-1.2-3.5-1.7C-0.1,7-0.1,6,0.4,5.6c0.8-0.5,2.3-0.6,3.5-1.8 C5,2.8,5.1,1.2,5.6,0.4C6-0.1,7-0.1,7.4,0.4c0.5,0.8,0.7,2.4,1.8,3.5c1.2,1.2,2.6,1.2,3.5,1.7c0.6,0.4,0.6,1.4,0,1.7 C11.8,7.9,10.2,8,9.1,9.1c-1,1-1.2,2.7-1.7,3.5C7,13.1,6,13.1,5.6,12.6z" />
            </svg>
            AI
          </span>
          <span className="sehat-trigger-text">ASK SEHAT.AI</span>
        </button>
      )}

      {/* Chat Window Widget */}
      {isOpen && (
        <div className="sehat-window">
          {/* Header */}
          <div className="sehat-header">
            <div className="sehat-header-brand">
              <div className="sehat-avatar-glow">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" />
                </svg>
              </div>
              <div>
                <h3 className="sehat-title">
                  SEHAT.AI <span className="sehat-status-dot"></span>
                </h3>
                <p className="sehat-subtitle">MarketLink Harvest Assistant</p>
              </div>
            </div>
            <button className="sehat-close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="sehat-body" ref={chatBodyRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`sehat-msg-row ${msg.sender === 'user' ? 'sehat-msg-user' : 'sehat-msg-ai'
                  }`}
              >
                <div className="sehat-bubble">
                  <p className="sehat-text  text-zinc-800">{msg.text}</p>
                  <span className="sehat-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="sehat-msg-row sehat-msg-ai">
                <div className="sehat-bubble sehat-typing-bubble">
                  <span className="sehat-dot"></span>
                  <span className="sehat-dot"></span>
                  <span className="sehat-dot"></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Chips */}
          <div className="sehat-chips-container">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                className="sehat-chip"
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="sehat-footer">
            <input
              type="text"
              className="sehat-input"
              placeholder="Ask about markets, timing, pre-orders..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping}
            />
            <button
              className="sehat-send-btn"
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isTyping}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SehatAI;