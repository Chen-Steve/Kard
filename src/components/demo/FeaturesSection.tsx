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

interface FeaturesSectionProps {
  isDarkMode: boolean;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ isDarkMode }) => {
  return (
    <>
      <div className="mt-40">
        <h3 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Powerful Features to Accelerate Your Learning
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.name} className={`p-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
              isDarkMode ? 'bg-white' : 'bg-white'
            }`}>
              <feature.icon className="text-4xl mb-4 text-black dark:text-black" />
              <h4 className="text-xl font-semibold mb-2 text-black dark:text-black">{feature.name}</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-800' : 'text-gray-600'}`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-40 text-center">
        <h3 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>More Features coming soon!</h3>
        <ul className="grid grid-cols-2 gap-4">
          {['Progress Tracking', 'Spaced Repetition', 'Customizable Dashboard', 'Generate flashcards from websites'].map((feature) => (
            <li key={feature} className={`backdrop-blur-sm p-4 rounded-lg shadow-lg border-2 ${
              isDarkMode ? 'bg-gray-800/30 text-white border-white' : 'bg-white/30 text-black border-black'
            }`}>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default FeaturesSection;