import React from 'react';
import { CgSpinner } from "react-icons/cg";

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <CgSpinner className="animate-spin text-black text-4xl mb-4" />
      <p className="text-md font-semibold text-black" >Almost there...</p>
    </div>
  );
};

export default Spinner;