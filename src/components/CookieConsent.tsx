import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      setIsVisible(false);
    }
  }, []);

  const handleAccept = () => {
    // Save the user's consent in localStorage
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    // Load non-essential cookies here if necessary
  };

  const handleReject = () => {
    // Save the user's rejection in localStorage
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
    // Ensure non-essential cookies are not loaded
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 md:left-24 bg-white text-black text-md font-bold px-4 py-2 rounded-lg shadow-lg flex flex-col items-start w-80 md:w-96">
      <p className="mb-4">
        We use cookies to enhance your experience, including maintaining preferences and our traffic analytics.
        <span className="text-blue-500 underline cursor-pointer ml-2" onClick={() => window.location.href = '/privacy'}>
          Learn more
        </span>
      </p>
      <div className="flex space-x-2">
        <button
          onClick={handleAccept}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;