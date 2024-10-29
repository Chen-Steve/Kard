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
      <div className="mb-8">
        <Link href="/dashboard" legacyBehavior>
          <a className="inline-flex items-center px-4 py-2 rounded-lg text-black dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </a>
        </Link>
      </div>
      <div className="text-center mb-16">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          Choose Your Plan
        </h1>
        
        <div className="flex items-center justify-center gap-4">
          <span className={`text-lg ${!isAnnual ? 'font-bold' : 'text-gray-600 dark:text-gray-400'}`}>Monthly</span>
          <button
            aria-label="Toggle Monthly/Annual Pricing"
            className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200"
            onClick={togglePricing}
          >
            <div className={`absolute w-6 h-6 rounded-full bg-blue-500 top-1 transition-transform duration-200 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
          </button>
          <span className={`text-lg ${isAnnual ? 'font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
            Annual <span className="text-green-500 text-sm">Save 10%</span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="px-4 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
              FREE
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Free</h2>
          <p className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">$0/month</p>
          <ul className="mb-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Unlimited Flashcards
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Unlimited Decks
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Learning Mode
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Test Mode
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Matching Mode
            </li>
          </ul>
          <button className="w-full px-6 py-3 mt-8 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold">
            Get Started
          </button>
        </div>
        <div className="relative p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-gray-800 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800 hover:shadow-2xl transition-shadow duration-300">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
              RECOMMENDED
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Pro</h2>
          <p className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            ${isAnnual ? proAnnualPrice.toFixed(2) : proMonthlyPrice}/
            {isAnnual ? 'year' : 'month'}
          </p>
          <ul className="mb-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Everything in Free plan
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              AI Flashcard Generation
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              AI Chat Mode
            </li>
            <li className="mb-2 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Import from Quizlet
            </li>
          </ul>
          <button
            onClick={() => handleCheckout(isAnnual ? 'price_1Pq0A4F628mXxSt6FHRqasQN' : 'price_1Ppzr1F628mXxSt6tLUgKpVT')}
            className="w-full px-6 py-3 mt-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 font-semibold"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingComponent;