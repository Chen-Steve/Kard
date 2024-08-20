import React from 'react';
import PricingComponent from '../components/PricingComponent';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <PricingComponent />
    </div>
  );
};

export default PricingPage;