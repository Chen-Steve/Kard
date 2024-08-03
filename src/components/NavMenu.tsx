import { useState } from "react";
import { RiMenu4Fill } from "react-icons/ri";
import { FaFolderOpen } from "react-icons/fa";

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
        <RiMenu4Fill className="text-4xl text-black" />
      </button>
      <div
        className={`fixed top-0 left-0 bg-gray rounded-sm transition-width duration-300 ease-in-out ${
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
              <RiMenu4Fill className="text-4xl text-black" />
            </button>
          )}
          <hr className="my-4 border-gray-600" />
          {isOpen && (
            <div className="flex items-center text-black">
              <FaFolderOpen className="text-2xl" />
              <span className="ml-2 text-xl">Your Library</span>
            </div>
          )}
          {/* Add more sidebar content here */}
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
