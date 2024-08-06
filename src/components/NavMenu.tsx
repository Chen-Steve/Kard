import { useState } from "react";
import { RiMenu4Fill } from "react-icons/ri";
import { FaFolderOpen } from "react-icons/fa";
import Link from 'next/link';

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        className="absolute top-2 left-2"
        aria-label="Menu"
        onClick={toggleSidebar}
      >
        <RiMenu4Fill className="text-4xl text-black dark:text-white" />
      </button>
      <div
        className={`fixed top-0 left-0 bg-gray-200 dark:bg-gray-800 rounded-sm transition-width duration-300 ease-in-out ${
          isOpen ? "w-50 h-64" : "w-0 h-64"
        } overflow-hidden h-full`}
      >
        <div className="p-4">
          {isOpen && (
            <button
              className="p-2"
              aria-label="Close Menu"
              onClick={toggleSidebar}
            >
              <RiMenu4Fill className="text-4xl text-black dark:text-white" />
            </button>
          )}
          <hr className="my-4 border-gray-600 dark:border-gray-400" />
          {isOpen && (
            <div className="flex items-center text-black dark:text-white">
              <FaFolderOpen className="text-2xl" />
              <Link href="/decks" className="ml-2 text-xl">
                Your Library
              </Link>
            </div>
          )}
          {/* Add more sidebar content here */}
        </div>
      </div>
    </div>
  );
};

export default NavMenu;