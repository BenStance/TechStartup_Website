import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2">Tailwind CSS Test</h1>
      <p className="text-lg">If you can see this styled correctly, Tailwind is working!</p>
      <button className="mt-4 bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
        Click Me
      </button>
    </div>
  );
};

export default TestComponent;