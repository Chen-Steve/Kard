import React, { useState } from 'react';

const EmailForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error('Subscription failed');
        }

        setIsSubmitted(true);
      } catch (error) {
        setError('Failed to subscribe. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
        <p className="mb-4">You&apos;ve been subscribed to updates about Kard.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
      <p className="mb-4">Sign up for changelogs and more information about Kard.</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          data-cursor="text"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          data-cursor="block"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default EmailForm;