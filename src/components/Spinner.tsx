import React from 'react';
import { CgSpinner } from "react-icons/cg";

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen" data-cursor="normal">
      <CgSpinner className="animate-spin text-black text-4xl mb-4" data-cursor="block" />
      <p className="text-md font-semibold text-black" data-cursor="block">Almost there...</p>
    </div>
  );
};

export default Spinner;