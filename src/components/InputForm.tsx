/**
 * ====
 * ASSIGNMENT INPUT FORM COMPONENT
 * ====
 * Handles all user inputs for room assignments and staffing data
 */

import React, { useState } from 'react';
import { parseRoomInputString } from '../utils/roomParser';
import type { AssignmentInputData } from '../types';

interface InputFormProps {
  onCalculateAssignments: (inputData: AssignmentInputData) => void;
  isCalculating: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ 
  onCalculateAssignments, 
  isCalculating 
}) => {
  // Form state management
  const [roomRangeStart, setRoomRangeStart] = useState<string>('101');
  const [roomRangeEnd, setRoomRangeEnd] = useState<string>('120');
  const [excludedRoomsInput, setExcludedRoomsInput] = useState<string>('');
  const [dischargesInput, setDischargesInput] = useState<string>('');
  const [admitsInput, setAdmitsInput] = useState<string>('');
  const [highAcuityRoomsInput, setHighAcuityRoomsInput] = useState<string>('');
  const [highFallRiskRoomsInput, setHighFallRiskRoomsInput] = useState<string>('');
  const [totalNurses, setTotalNurses] = useState<string>('4');
  const [totalAides, setTotalAides] = useState<string>('2');
  const [maxPatientsPerNurse, setMaxPatientsPerNurse] = useState<string>('8');
  const [maxPatientsPerAide, setMaxPatientsPerAide] = useState<string>('12');

  /**
   * Validates and submits form data for assignment calculation
   */
  const handleSubmitAssignmentForm = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate required fields
    if (!roomRangeStart || !roomRangeEnd || !totalNurses) {
      alert('Please fill in room range and number of nurses');
      return;
    }
    
    // Parse numeric inputs with validation
    const parsedRoomStart = parseInt(roomRangeStart);
    const parsedRoomEnd = parseInt(roomRangeEnd);
    const parsedNurses = parseInt(totalNurses);
    const parsedAides = parseInt(totalAides) || 0;
    const parsedNurseMax = parseInt(maxPatientsPerNurse);
    const parsedAideMax = parseInt(maxPatientsPerAide);
    
    // Validate numeric ranges
    if (parsedRoomStart >= parsedRoomEnd) {
      alert('End room must be greater than start room');
      return;
    }
    
    if (parsedNurses < 1) {
      alert('Must have at least 1 nurse');
      return;
    }
    
    // Parse room lists
    const excludedRooms = parseRoomInputString(excludedRoomsInput);
    const discharges = parseRoomInputString(dischargesInput);
    const admits = parseRoomInputString(admitsInput);
    const highAcuityRooms = parseRoomInputString(highAcuityRoomsInput);
    const highFallRiskRooms = parseRoomInputString(highFallRiskRoomsInput);
    
    // Compile input data for calculation
    const inputData: AssignmentInputData = {
      roomRangeStart: parsedRoomStart,
      roomRangeEnd: parsedRoomEnd,
      excludedRooms,
      discharges,
      admits,
      highAcuityRooms,
      highFallRiskRooms,
      totalNurses: parsedNurses,
      totalAides: parsedAides,
      maxPatientsPerNurse: parsedNurseMax,
      maxPatientsPerAide: parsedAideMax
    };
    
    onCalculateAssignments(inputData);
  };

  return (
    <form onSubmit={handleSubmitAssignmentForm} className="input-form">
      {/* Room Range Section */}
      <div className="input-section">
        <h3>Room Configuration</h3>
        
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="roomStart">Start Room:</label>
            <input
              type="number"
              id="roomStart"
              value={roomRangeStart}
              onChange={(event) => setRoomRangeStart(event.target.value)}
              min="1"
              required
              aria-label="Starting room number"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="roomEnd">End Room:</label>
            <input
              type="number"
              id="roomEnd"
              value={roomRangeEnd}
              onChange={(event) => setRoomRangeEnd(event.target.value)}
              min="1"
              required
              aria-label="Ending room number"
            />
          </div>
        </div>
        
        <div className="input-group">
          <label htmlFor="excludedRooms">Skip Rooms (optional):</label>
          <input
            type="text"
            id="excludedRooms"
            value={excludedRoomsInput}
            onChange={(event) => setExcludedRoomsInput(event.target.value)}
            placeholder="e.g., 105, 110, 115-117"
            aria-label="Rooms to exclude from assignment"
          />
          <small className="input-hint">
            Enter room numbers to skip (maintenance, unavailable, etc.)
          </small>
        </div>

        {/* New Discharges and Admits Section */}
        <div className="discharge-admit-section">
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="discharges">Discharges (optional):</label>
              <input
                type="text"
                id="discharges"
                value={dischargesInput}
                onChange={(event) => setDischargesInput(event.target.value)}
                placeholder="e.g., 102, 108, 114-116"
                aria-label="Rooms with patient discharges"
              />
              <small className="input-hint">
                Rooms with patients being discharged today
              </small>
            </div>
            
            <div className="input-group">
              <label htmlFor="admits">Admits (optional):</label>
              <input
                type="text"
                id="admits"
                value={admitsInput}
                onChange={(event) => setAdmitsInput(event.target.value)}
                placeholder="e.g., 103, 109, 121-123"
                aria-label="Rooms with new patient admits"
              />
              <small className="input-hint">
                Rooms receiving new patient admissions
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Special Care Section */}
      <div className="input-section">
        <h3>Special Care Patients (Optional)</h3>
        
        <div className="input-group">
          <label htmlFor="highAcuityRooms">High Acuity Rooms:</label>
          <input
            type="text"
            id="highAcuityRooms"
            value={highAcuityRoomsInput}
            onChange={(event) => setHighAcuityRoomsInput(event.target.value)}
            placeholder="e.g., 101, 105, 110"
            aria-label="Rooms with high acuity patients"
          />
          <small className="input-hint">
            Patients requiring intensive nursing care
          </small>
        </div>
        
        <div className="input-group">
          <label htmlFor="highFallRiskRooms">High Fall Risk Rooms:</label>
          <input
            type="text"
            id="highFallRiskRooms"
            value={highFallRiskRoomsInput}
            onChange={(event) => setHighFallRiskRoomsInput(event.target.value)}
            placeholder="e.g., 102, 108, 112"
            aria-label="Rooms with high fall risk patients"
          />
          <small className="input-hint">
            Patients requiring fall prevention monitoring
          </small>
        </div>
      </div>

      {/* Staffing Section */}
      <div className="input-section">
        <h3>Staffing Configuration</h3>
        
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="nurses">Number of Nurses:</label>
            <input
              type="number"
              id="nurses"
              value={totalNurses}
              onChange={(event) => setTotalNurses(event.target.value)}
              min="1"
              required
              aria-label="Total number of nurses"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="aides">Number of Aides:</label>
            <input
              type="number"
              id="aides"
              value={totalAides}
              onChange={(event) => setTotalAides(event.target.value)}
              min="0"
              aria-label="Total number of aides"
            />
          </div>
        </div>
        
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="nurseMax">Max Patients per Nurse:</label>
            <input
              type="number"
              id="nurseMax"
              value={maxPatientsPerNurse}
              onChange={(event) => setMaxPatientsPerNurse(event.target.value)}
              min="1"
              required
              aria-label="Maximum patients per nurse"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="aideMax">Max Patients per Aide:</label>
            <input
              type="number"
              id="aideMax"
              value={maxPatientsPerAide}
              onChange={(event) => setMaxPatientsPerAide(event.target.value)}
              min="1"
              required
              aria-label="Maximum patients per aide"
            />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        className="calculate-button"
        disabled={isCalculating}
        aria-label="Calculate patient assignments"
      >
        {isCalculating ? 'Calculating...' : 'Calculate Assignments'}
      </button>
    </form>
  );
};
