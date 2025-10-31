import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import AnalysisResults from './components/AnalysisResults';
import Header from './components/Header';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setIsLoading(false);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        {!analysisResult ? (
          <UploadForm 
            onAnalysisComplete={handleAnalysisComplete}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <AnalysisResults 
            result={analysisResult}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </div>
    </div>
  );
}

export default App;
