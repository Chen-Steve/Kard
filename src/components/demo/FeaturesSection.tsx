import React from 'react';
import { SiStagetimer } from "react-icons/si";
import { RiTimerFill } from "react-icons/ri";
import { PiCardsFill } from "react-icons/pi";
import { BiSolidMessageSquareDots } from "react-icons/bi";
import { FaEllipsisH } from 'react-icons/fa';

const features = [
  { icon: SiStagetimer, name: 'Learn Mode', description: 'Master your flashcards at your own pace' },
  { icon: RiTimerFill, name: 'Test Mode', description: 'Challenge yourself and track your progress' },
  { icon: PiCardsFill, name: 'Matching Game', description: 'Make learning fun with interactive games' },
  { icon: BiSolidMessageSquareDots, name: 'Auto-Generate Cards', description: 'Create flashcards from text and files effortlessly' },
  { icon: FaEllipsisH, name: 'And More!', description: 'Discover additional features to enhance your learning' },
];

const FeaturesSection: React.FC = () => {
  return (
    <div className="mt-40">
      <h3 className="text-3xl font-bold mb-8 text-center text-black">
        Powerful Features to Accelerate Your Learning
      </h3>
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee">
          {[...features, ...features].map((feature, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-64 p-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out relative overflow-hidden group bg-white mx-4"
            >
              <div className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" 
                   style={{
                     background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(30, 64, 175, 0.4) 0%, transparent 50%)',
                   }}
              />
              <feature.icon className="text-4xl mb-4 text-black relative z-10" />
              <h4 className="text-xl font-semibold mb-2 text-black relative z-10">{feature.name}</h4>
              <p className="text-sm text-gray-600 relative z-10">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          width: 200%;
        }
      `}</style>
    </div>
  );
};

export default FeaturesSection;
