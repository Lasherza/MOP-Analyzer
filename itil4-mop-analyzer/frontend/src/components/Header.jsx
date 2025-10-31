import React from 'react';

const Header = () => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-white mb-4">
        ITIL 4 MOP Analyzer
      </h1>
      <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
        Change Enablement Method of Procedure Analysis Agent for Telecommunications
      </p>
      <div className="mt-6 flex justify-center items-center space-x-4">
        <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-white text-sm font-semibold">
          ITIL 4 Compliant
        </span>
        <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-white text-sm font-semibold">
          AI-Powered Analysis
        </span>
        <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-white text-sm font-semibold">
          Industry Standards
        </span>
      </div>
    </div>
  );
};

export default Header;
