import React, { useState } from 'react';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PricingComponent: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const togglePricing = () => {
    setIsAnnual(!isAnnual);
  };

  const proMonthlyPrice = 5;
  const proAnnualPrice = proMonthlyPrice * 12 * 0.9; // 10% discount

  const handleCheckout = async (priceId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      // Here you might want to show an error message to the user
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-4">
        <Link href="/dashboard" legacyBehavior>
          <a className="flex items-center text-black dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-300">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </a>
        </Link>
      </div>
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900 dark:text-gray-100">Pricing Plans</h1>
      <div className="flex justify-center mb-8">
        <button
          className={`comic-button ${isAnnual ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
          onClick={togglePricing}
        >
          {isAnnual ? 'Switch to Monthly' : 'Switch to Annual'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Free</h2>
          <p className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">$0/month</p>
          <ul className="mb-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Feature 1
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Feature 2
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Feature 3
            </li>
          </ul>
          <button className="comic-button">Choose Plan</button>
        </div>
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Pro</h2>
          <p className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            ${isAnnual ? proAnnualPrice.toFixed(2) : proMonthlyPrice}/
            {isAnnual ? 'year' : 'month'}
          </p>
          <ul className="mb-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Feature 1
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Feature 2
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Feature 3
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Feature 4
            </li>
          </ul>
          <button
            className="comic-button"
            onClick={() => handleCheckout(isAnnual ? 'price_1Pq0A4F628mXxSt6FHRqasQN' : 'price_1Ppzr1F628mXxSt6tLUgKpVT')}
          >
            Choose Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingComponent;