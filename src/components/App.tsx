/**
 * ====
 * MAIN APPLICATION COMPONENT
 * ====
 * Orchestrates the entire nurse assignment calculator application
 */

import React, { useState } from 'react';
import { DisclaimerSection } from './DisclaimerSection';
import { InputForm } from './InputForm';
import { ResultsDisplay } from './ResultsDisplay';
import { Footer } from './Footer';
import { calculateStaffAssignments } from '../utils/assignmentCalculator';
import { generateCompleteAssignmentReport } from '../utils/reportGenerator';
import type { AssignmentInputData } from '../types';

export const App: React.FC = () => {
  // Application state management
  const [assignmentReport, setAssignmentReport] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Processes assignment calculation request and handles results or errors
   */
  const handleCalculateAssignments = async (inputData: AssignmentInputData) => {
    setIsCalculating(true);
    setErrorMessage('');
    setShowResults(false);
    
    try {
      // Calculate staff assignments using input data
      const calculationResults = calculateStaffAssignments(inputData);
      
      // Generate formatted report for display
      const formattedReport = generateCompleteAssignmentReport(
        calculationResults, 
        inputData.maxPatientsPerAide
      );
      
      // Update application state with results
      setAssignmentReport(formattedReport);
      setShowResults(true);
      
    } catch (calculationError) {
      // Handle calculation errors gracefully
      const errorText = calculationError instanceof Error ? 
        calculationError.message : 
        'An unexpected error occurred during calculation';
      
      setErrorMessage(errorText);
      setShowResults(false);
      
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Nurse Assignment Calculator</h1>
        <p className="app-subtitle">
          Fair Patient Distribution System with Acuity Tracking
        </p>
      </header>

      <main className="app-main">
        <DisclaimerSection />
        
        <InputForm 
          onCalculateAssignments={handleCalculateAssignments}
          isCalculating={isCalculating}
        />

        {errorMessage && (
          <div className="error-message" role="alert">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <ResultsDisplay 
          assignmentReport={assignmentReport}
          isVisible={showResults}
        />
      </main>

      <Footer />
    </div>
  );
};
