import React from 'react';
import { Icon } from '@iconify/react';

const features = [
  { 
    icon: () => <Icon icon="pepicons-print:comet" className="text-4xl mb-4 text-red-500" />, 
    name: 'Learn Mode', 
    description: 'Master your flashcards at your own pace' 
  },
  { 
    icon: () => <Icon icon="pepicons-print:list" className="text-4xl mb-4 text-emerald-500" />, 
    name: 'Test Mode', 
    description: 'Challenge yourself and track your progress' 
  },
  { 
    icon: () => <Icon icon="pepicons-print:duplicate" className="text-4xl mb-4 text-purple-500" />, 
    name: 'Matching Game', 
    description: 'Make learning fun with interactive games' 
  },
  { 
    icon: () => <Icon icon="pepicons-print:text-bubbles" className="text-4xl mb-4 text-sky-500" />, 
    name: 'Auto-Generate Cards', 
    description: 'Create flashcards from text and files effortlessly' 
  },
  { 
    icon: () => <Icon icon="pepicons-print:menu" className="text-4xl mb-4 text-gray-500" />, 
    name: 'And More!', 
    description: 'Discover additional features to enhance your learning' 
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <div className="mt-40">
      <div className="relative overflow-hidden p-8 mx-auto
        before:content-[''] before:absolute before:w-8 before:h-8 before:border-t-2 before:border-l-2 before:border-black before:top-0 before:left-0
        after:content-[''] after:absolute after:w-8 after:h-8 after:border-b-2 after:border-r-2 after:border-black after:bottom-0 after:right-0"
      >
        <div className="relative overflow-hidden whitespace-nowrap">
          {/* First set of slides */}
          <div className="inline-block animate-marquee">
            {features.map((feature, index) => (
              <div 
                key={`first-${index}`} 
                className="inline-block w-64 p-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out relative overflow-hidden group bg-white mx-4"
              >
                <div className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" 
                     style={{
                       background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(30, 64, 175, 0.4) 0%, transparent 50%)',
                     }}
                />
                <feature.icon />
                <h4 className="text-xl font-semibold mb-2 text-black relative z-10">{feature.name}</h4>
                <p className="text-sm text-gray-600 relative z-10">{feature.description}</p>
              </div>
            ))}
          </div>
          {/* Second set of slides (clone) */}
          <div className="inline-block animate-marquee">
            {features.map((feature, index) => (
              <div 
                key={`second-${index}`} 
                className="inline-block w-64 p-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out relative overflow-hidden group bg-white mx-4"
              >
                <div className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" 
                     style={{
                       background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(30, 64, 175, 0.4) 0%, transparent 50%)',
                     }}
                />
                <feature.icon />
                <h4 className="text-xl font-semibold mb-2 text-black relative z-10">{feature.name}</h4>
                <p className="text-sm text-gray-600 relative z-10">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;