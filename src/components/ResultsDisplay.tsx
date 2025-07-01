/**
 * ================================================================
 * ASSIGNMENT RESULTS DISPLAY COMPONENT
 * ================================================================
 * Shows calculated assignments and provides copy-to-clipboard functionality
 */

import React, { useState } from 'react';

interface ResultsDisplayProps {
  assignmentReport: string;
  isVisible: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  assignmentReport, 
  isVisible 
}) => {
  const [copyButtonText, setCopyButtonText] = useState<string>('Copy to Clipboard');

  /**
   * Copies assignment results to system clipboard with user feedback
   */
  const handleCopyAssignmentResults = async () => {
    try {
      await navigator.clipboard.writeText(assignmentReport);
      
      // Provide visual feedback for successful copy
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy to Clipboard');
      }, 2000);
      
    } catch (copyError) {
      console.error('Failed to copy assignment results:', copyError);
      alert('Failed to copy to clipboard. Please try again or select and copy manually.');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="results-container">
      <div className="results-display" aria-live="polite">
        <pre>{assignmentReport}</pre>
      </div>
      
      <button 
        onClick={handleCopyAssignmentResults}
        className="copy-button"
        aria-label="Copy assignment results to clipboard"
      >
        📋 {copyButtonText}
      </button>
      
      <div className="results-instructions">
        <p>
          <strong>Next Steps:</strong> Copy these assignments and share with your team. 
          Post in break room or send via secure messaging system.
        </p>
      </div>
    </div>
  );
};
