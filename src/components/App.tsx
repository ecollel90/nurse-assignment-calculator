/**
 * ================================================================
 * MAIN APPLICATION COMPONENT
 * ================================================================
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
import { 
  processPatientFlowChanges, 
  validatePatientFlowChanges, 
  formatChangeHistory,
  type PatientFlowChange 
} from '../utils/NurseAssignmentCalculator';

export const App: React.FC = () => {
  // Application state management
  const [assignmentReport, setAssignmentReport] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // State for tracking discharges and admits
  const [dischargeRooms, setDischargeRooms] = useState<string>('');
  const [admitRooms, setAdmitRooms] = useState<string>('');
  const [changeHistory, setChangeHistory] = useState<PatientFlowChange[]>([]);
  const [showChangeSection, setShowChangeSection] = useState<boolean>(false);

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

      /**
 * Handles updating assignments with discharges and admits
 * Uses utility functions to process changes and maintain fair distribution
 */
const handlePatientFlowChanges = (): void => {
  if (!assignments.length) {
    alert('Please calculate initial assignments first.');
    return;
  }

  try {
    // Validate discharge rooms before processing
    const validation = validatePatientFlowChanges(assignments, dischargeRooms);
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    // Process the changes using utility function
    const result = processPatientFlowChanges(
      assignments,
      dischargeRooms,
      admitRooms,
      nurseCount,
      aideCount,
      maxPatientsPerNurse,
      maxPatientsPerAide
    );

    // Update state with new assignments and change history
    setAssignments(result.updatedAssignments);
    setChangeHistory(prevHistory => [...prevHistory, result.changeRecord]);

    // Clear input fields after successful update
    setDischargeRooms('');
    setAdmitRooms('');

    // Show success message
    const dischargeCount = result.changeRecord.discharges.length;
    const admitCount = result.changeRecord.admits.length;
    alert(`Successfully updated assignments: ${dischargeCount} discharge(s), ${admitCount} admit(s)`);

  } catch (error) {
    console.error('Error updating assignments:', error);
    alert(error instanceof Error ? error.message : 'Error updating assignments. Please try again.');
  }
};

/**
 * Clears the discharge and admit input fields
 */
const clearChangeInputs = (): void => {
  setDischargeRooms('');
  setAdmitRooms('');
};

/**
 * Toggles the visibility of the change management section
 */
const toggleChangeSection = (): void => {
  setShowChangeSection(prevShow => !prevShow);
};
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
