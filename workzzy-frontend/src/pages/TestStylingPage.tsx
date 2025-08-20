import React from 'react';

const TestStylingPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Tailwind CSS Test Page</h1>
      
      {/* Typography Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Typography</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-2">This is a standard paragraph text with default gray color.</p>
        <p className="text-blue-600 dark:text-blue-400 font-medium">This text should appear in blue.</p>
        <p className="text-green-600 dark:text-green-400 font-bold">This text should appear in bold green.</p>
      </div>
      
      {/* Button Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors">
            Secondary Button
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Success Button
          </button>
        </div>
      </div>
      
      {/* Card Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-2">Card Title</h3>
            <p className="text-gray-600 dark:text-gray-300">This is a standard card component with some text content.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-2">Card Title 2</h3>
            <p className="text-gray-600 dark:text-gray-300">Another card to test consistent styling across multiple elements.</p>
          </div>
        </div>
      </div>
      
      {/* Layout Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Layout Grid</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">Column 1</div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">Column 2</div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">Column 3</div>
        </div>
      </div>
      
      {/* Form Elements Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Form Elements</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="text-input">
              Text Input
            </label>
            <input
              id="text-input"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter text"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="select-input">
              Select Input
            </label>
            <select
              id="select-input"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestStylingPage;