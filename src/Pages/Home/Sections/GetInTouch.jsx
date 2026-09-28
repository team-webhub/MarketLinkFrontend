import React, { useState } from 'react';
import API from '../../../Core/api';
import '../Styles/GetInTouch.css';

function GetInTouch() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Farmer Stall Registration',
    userType: 'Local Farmer / Vendor',
    details: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserTypeSelect = (value) => {
    setFormData((prev) => ({ ...prev, userType: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.details) {
      setFeedback('Please complete your name, email, and message before submitting.');
      return;
    }

    setIsSubmitting(true);
    setFeedback('');

    try {
      await API.post('/auth/register', {
        username: formData.name,
        email: formData.email,
        password: 'MarketLink@123',
        role: formData.userType === 'Consumer / Shopper' ? 'customer' : 'farmer',
        business_name: formData.service,
        address: formData.details,
      });

      setFeedback('Your market registration request has been received. Our team will contact you shortly.');
      setFormData({
        name: '',
        email: '',
        service: 'Farmer Stall Registration',
        userType: 'Local Farmer / Vendor',
        details: '',
      });
    } catch (error) {
      setFeedback('Your request could not be sent right now. Please try again or email support directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id='contact' className="git-section">
      {/* Background Top Header */}
      <div className="git-top-header">
        <span className="git-sublabel">— GET IN TOUCH</span>
        <h1 className="git-main-title">REGISTER YOUR STALL</h1>
      </div>

      {/* Main Grid Section */}
      <div className="git-container">

        {/* Left Column Card */}
        <div className="git-left-card">
          <span className="git-card-tag">— FARMER & MARKET OPPORTUNITIES</span>

          <h2 className="git-card-heading">
            ARE YOU A <br />
            LOCAL GROWER? <br />
            <span className="git-green-text">LIST YOUR STALL TODAY.</span>
          </h2>

          <div className="git-info-list">
            <div className="git-info-item">
              <span className="git-num-badge">01</span>
              <div className="git-info-text">
                <span className="git-info-label">EMAIL</span>
                <a href="mailto:support@marketlink.com" className="git-info-val">support@marketlink.com</a>
              </div>
            </div>
            <hr className='text-zinc-800' />
            <div className="git-info-item">
              <span className="git-num-badge">02</span>
              <div className="git-info-text">
                <span className="git-info-label">WHO CAN APPLY</span>
                <span className="git-info-val">Farmers, vendors, and market organizers</span>
              </div>
            </div>
            <hr className='text-zinc-800' />
            <div className="git-info-item">
              <span className="git-num-badge">03</span>
              <div className="git-info-text">
                <span className="git-info-label">WHY JOIN</span>
                <span className="git-info-val">Manage weekly inventory and sell direct to shoppers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Form */}
        <div className="git-right-card">
          <form onSubmit={handleSubmit} className="git-form">

            {/* Input Row: Name & Email */}
            <div className="git-form-row">
              <div className="git-field-wrap">
                <label className="git-label">YOUR NAME</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="git-input"
                />
              </div>

              <div className="git-field-wrap">
                <label className="git-label">EMAIL</label>
                <input
                  type="email"
                  name="email"
                  placeholder="hello@domain.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="git-input"
                />
              </div>
            </div>

            {/* Field: Inquiry Type */}
            <div className="git-field-wrap">
              <label className="git-label">STALL / MARKET NEED</label>
              <div className="git-select-wrap">
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className="git-select"
                >
                  <option value="Farmer Stall Registration">Farmer Stall Registration</option>
                  <option value="Market Vendor Partnership">Market Vendor Partnership</option>
                  <option value="Weekly Inventory Setup">Weekly Inventory Setup</option>
                  <option value="General Inquiry & Feedback">General Inquiry & Feedback</option>
                </select>
                <span className="git-arrow">▾</span>
              </div>
            </div>

            {/* Field: User Category */}
            <div className="git-field-wrap">
              <label className="git-label">I AM A...</label>
              <div className="git-budget-row">
                {['Consumer / Shopper', 'Local Farmer / Vendor', 'Market Organizer'].map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`git-budget-btn ${formData.userType === item ? 'active' : ''}`}
                    onClick={() => handleUserTypeSelect(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Project / Inquiry Details */}
            <div className="git-field-wrap">
              <label className="git-label">MESSAGE DETAILS</label>
              <textarea
                name="details"
                rows="4"
                placeholder="Tell us about your produce, stall requirements, market location, or how you'd like to partner."
                value={formData.details}
                onChange={handleInputChange}
                className="git-textarea"
              ></textarea>
            </div>

            {/* Feedback Message */}
            {feedback && <div className="git-feedback">{feedback}</div>}

            {/* Submit Button */}
            <button type="submit" className="git-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : '+ SEND MESSAGE →'}
            </button>

          </form>
        </div>

      </div>
    </section>
  );
}

export default GetInTouch;