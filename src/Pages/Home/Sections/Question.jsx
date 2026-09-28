import React, { useState } from 'react';
import '../Styles/Question.css';

const faqData = [
  {
    id: 1,
    question: 'How does pre-ordering work on MarketLink?',
    answer:
      'Customers can browse live inventory from nearby farmers, add items to their basket, and confirm pickup before the market cutoff. This helps farmers plan stock and gives shoppers a guaranteed fresh basket for pickup.',
  },
  {
    id: 2,
    question: 'Do you offer direct home delivery or only pickup?',
    answer:
      'MarketLink is designed around fresh-market pickup for quality, affordability, and reduced waste. Customers pick up their basket from the farmer stall or assigned market point at the selected time slot.',
  },
  {
    id: 3,
    question: 'Can I pay online or only on pickup?',
    answer:
      'You can reserve and pay through the platform before pickup, and in many cases buyers can also settle the amount directly with the farmer at collection depending on the market and stall setup.',
  },
  {
    id: 4,
    question: 'How do I find the best nearby market?',
    answer:
      'Use the market discovery flow to search by area, market name, or operating day. The system shows nearby farmers, current availability, and recommended pickup windows.',
  },
  {
    id: 5,
    question: 'What if a product is almost sold out?',
    answer:
      'Limited-stock items are highlighted on the site with urgency indicators. Customers should pre-order early to secure fresh produce before the cutoff time or stock runs out.',
  },
  {
    id: 6,
    question: 'Does the AI helper give recipe ideas?',
    answer:
      'Yes. The AI shopping assistant can suggest seasonal recipes, help you understand market timing, and recommend product combinations based on what is fresh in the local market.',
  },
];

function Question() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="questions-section">
      <div className="questions-container">
        <div className="questions-left">
          <span className="questions-sublabel">— FAQ</span>
          <h2 className="questions-heading">
            QUICK ANSWERS
            <br />
            FOR SHOPPERS
          </h2>
        </div>

        <div className="questions-right">
          <div className="accordion-list">
            {faqData.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id}
                  className={`accordion-item ${isOpen ? 'is-open' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="accordion-header">
                    <h3 className="accordion-question">{item.question}</h3>
                    <button
                      className={`accordion-toggle-btn ${isOpen ? 'active' : ''}`}
                      aria-label="Toggle answer"
                    >
                      <span className="icon-line line-horizontal"></span>
                      <span className="icon-line line-vertical"></span>
                    </button>
                  </div>

                  <div className="accordion-body">
                    <div className="accordion-content">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Question;