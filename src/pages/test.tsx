import React from 'react';

export default function Test() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold text-white mb-10">Tailwind CSS Test Page</h1>
      <div className="w-full max-w-4xl mb-8">
        <div className="flex flex-col gap-4">
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Test Heading</h2>
            <p className="text-lg">This is a test paragraph to check Tailwind CSS styles.</p>
          </div>
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-secondary ml-4">Secondary Button</button>
          </div>
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
            <input
              type="text"
              className="input input-bordered border-2 border-black p-2 text-black w-full"
              placeholder="Input Field"
            />
          </div>
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-500 h-16"></div>
              <div className="bg-green-500 h-16"></div>
              <div className="bg-blue-500 h-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
