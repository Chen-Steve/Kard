import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import UserAvatar from '../profile/UserAvatar';
import { MdDarkMode } from "react-icons/md";
import { FaSun } from "react-icons/fa";
import { HiLightningBolt } from "react-icons/hi";
import { FaPowerOff } from "react-icons/fa6";
import { UserType } from '../../types/user';

interface UserAvatarDropdownProps {
  user: UserType;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleSignOut: () => Promise<void>;
}

const UserAvatarDropdown: React.FC<UserAvatarDropdownProps> = ({ user, isDarkMode, toggleDarkMode, handleSignOut }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  return (
    <div className="relative" ref={dropdownRef}>
      <UserAvatar
        avatarUrl={user.avatar_url}
        alt="User Avatar"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      />
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 sm:mt-3 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="block font-medium">{user.name}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => router.push('/profile')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Profile
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
            >
              {isDarkMode ? <FaSun className="mr-2" /> : <MdDarkMode className="mr-2" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
          {/* <div className="border-t border-gray-200 dark:border-gray-600">
            {user.membership === 'pro' ? (
              <div className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                <HiLightningBolt className="mr-2" />
                Pro
              </div>
            ) : (
              <button
                onClick={() => router.push('/pricing')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
              >
                <HiLightningBolt className="mr-2" />
                Upgrade
              </button>
            )}
          </div> */}
          <div className="border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleSignOut}
              className="flex w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-200 transition-colors duration-150 items-center"
            >
              <FaPowerOff className="mr-2" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatarDropdown;
