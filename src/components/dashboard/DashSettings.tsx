import React, { useState } from 'react';
import { LuSettings2 } from "react-icons/lu";
import { DashboardComponent } from '../../types/dashboard';

interface DashSettingsProps {
  components: DashboardComponent[];
  onUpdateComponents: (components: DashboardComponent[]) => void;
  showFlashcardList: boolean;
  onToggleFlashcardList: () => void;
}

const DashSettings: React.FC<DashSettingsProps> = ({ 
  components, 
  onUpdateComponents, 
  showFlashcardList, 
  onToggleFlashcardList 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVisibility = (id: string) => {
    const updatedComponents = components.map(comp =>
      comp.id === id ? { ...comp, visible: !comp.visible } : comp
    );
    onUpdateComponents(updatedComponents);
  };

  return (
    <div className="relative inline-block">
      <LuSettings2
        onClick={() => setIsOpen(!isOpen)}
        className="ml-4 mb-4 text-black dark:text-gray-200 text-3xl cursor-pointer hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200"
        data-cursor="block"
        aria-label="Dashboard Settings"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
      />
      {isOpen && (
        <div className="absolute left-4 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20">
          <div className="p-3">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Dashboard Settings</h3>
            {components.filter(comp => comp.id !== 'flashcards').map((comp) => (
              <div key={comp.id} className="flex items-center justify-between my-2">
                <span className="text-gray-700 dark:text-gray-300 text-sm">{comp.name}</span>
                <label className="inline-flex items-center cursor-pointer ml-2">
                  <input
                    title="Toggle Visibility"
                    type="checkbox"
                    className="sr-only peer"
                    checked={comp.visible}
                    onChange={() => toggleVisibility(comp.id)}
                  />
                  <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
            <div className="flex items-center justify-between my-2">
              <span className="text-gray-700 dark:text-gray-300 text-sm">Show Flashcards</span>
              <label className="inline-flex items-center cursor-pointer ml-2">
                <input
                  title="Toggle Flashcard List"
                  type="checkbox"
                  className="sr-only peer"
                  checked={showFlashcardList}
                  onChange={onToggleFlashcardList}
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between my-2">
                <span className="text-gray-700 dark:text-gray-300 text-sm relative group">
                  <span className="transition-opacity duration-300 group-hover:opacity-0">
                    Customize Layout
                  </span>
                  <span className="absolute left-0 top-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Coming Soon
                  </span>
                </span>
                <button 
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded cursor-not-allowed"
                  disabled
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashSettings;