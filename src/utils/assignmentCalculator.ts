/**
 * ================================================================
 * ASSIGNMENT CALCULATION ENGINE
 * ================================================================
 * Core logic for distributing patients fairly among nursing staff
 * with special consideration for high-acuity and high fall risk patients.
 */

import type { 
  AssignmentInputData, 
  AssignmentResults, 
  StaffAssignment, 
  AideCoverageData,
  CategorizedRooms 
} from '../types';

/**
 * Validates that nursing capacity can handle the patient load
 * @param totalPatientCount - Number of patients to assign
 * @param totalNurses - Available nursing staff
 * @param maxPatientsPerNurse - Maximum patient limit per nurse
 * @returns Boolean indicating if assignment is feasible
 */
export function validateNursingCapacity(
  totalPatientCount: number, 
  totalNurses: number, 
  maxPatientsPerNurse: number
): boolean {
  const totalNursingCapacity = totalNurses * maxPatientsPerNurse;
  return totalPatientCount <= totalNursingCapacity;
}

/**
 * Calculates aide coverage statistics and total care requirements
 * @param totalPatientCount - Total number of patients
 * @param totalAides - Number of available aides
 * @param maxPatientsPerAide - Maximum patients each aide can handle
 * @returns Aide coverage data with capacity and shortfall information
 */
export function calculateAideCoverageData(
  totalPatientCount: number, 
  totalAides: number, 
  maxPatientsPerAide: number
): AideCoverageData {
  const totalAideCapacity = totalAides * maxPatientsPerAide;
  const patientsWithoutAideSupport = Math.max(0, totalPatientCount - totalAideCapacity);
  
  return {
    totalAideCapacity,
    patientsWithoutAideSupport
  };
}

/**
 * Categorizes rooms by priority level for fair distribution
 * @param allRooms - Complete list of room numbers
 * @param highAcuityRooms - Rooms requiring intensive nursing care
 * @param highFallRiskRooms - Rooms with fall risk patients
 * @returns Categorized room structure for distribution algorithm
 */
export function categorizeRoomsByPriority(
  allRooms: number[], 
  highAcuityRooms: number[], 
  highFallRiskRooms: number[]
): CategorizedRooms {
  // Remove duplicates and ensure high acuity takes precedence
  const uniqueHighAcuity = Array.from(new Set(highAcuityRooms));
  const uniqueHighFallRisk = Array.from(
    new Set(highFallRiskRooms.filter(room => !uniqueHighAcuity.includes(room)))
  );
  
  // Regular rooms are those not in either special category
  const regularRooms = allRooms.filter(room => 
    !uniqueHighAcuity.includes(room) && !uniqueHighFallRisk.includes(room)
  );
  
  return {
    highAcuityRooms: uniqueHighAcuity,
    highFallRiskRooms: uniqueHighFallRisk,
    regularRooms
  };
}

/**
 * Distributes rooms among staff using round-robin algorithm
 * @param roomList - Rooms to be assigned
 * @param staffCount - Number of staff members
 * @param existingAssignments - Current staff assignments to append to
 * @param roomType - Type of rooms being assigned (for tracking)
 */
function assignRoomsRoundRobin(
  roomList: number[], 
  staffCount: number, 
  existingAssignments: StaffAssignment[],
  roomType: 'highAcuity' | 'highFallRisk' | 'regular'
): void {
  let currentStaffIndex = 0;
  
  for (const roomNumber of roomList) {
    const staffAssignment = existingAssignments[currentStaffIndex];
    
    // Add room to appropriate category and main assignment list
    staffAssignment.assignedRooms.push(roomNumber);
    
    if (roomType === 'highAcuity') {
      staffAssignment.highAcuityRooms.push(roomNumber);
    } else if (roomType === 'highFallRisk') {
      staffAssignment.highFallRiskRooms.push(roomNumber);
    }
    
    // Move to next staff member in round-robin fashion
    currentStaffIndex = (currentStaffIndex + 1) % staffCount;
  }
}

/**
 * Creates nurse assignments with fair distribution of special care patients
 * @param allRooms - Complete list of patient rooms
 * @param totalNurses - Number of nursing staff
 * @param categorizedRooms - Rooms organized by care requirements
 * @param patientsWithoutAideSupport - Number of total care patients
 * @returns Array of nurse assignments with room allocations
 */
export function createNurseAssignments(
  allRooms: number[], 
  totalNurses: number, 
  categorizedRooms: CategorizedRooms,
  patientsWithoutAideSupport: number
): StaffAssignment[] {
  // Initialize nurse assignment structures
  const nurseAssignments: StaffAssignment[] = Array.from(
    { length: totalNurses }, 
    (_, nurseIndex) => ({
      staffNumber: nurseIndex + 1,
      assignedRooms: [],
      patientCount: 0,
      highAcuityRooms: [],
      highFallRiskRooms: [],
      totalCareRooms: []
    })
  );
  
  // Distribute high-priority rooms first for fair workload
  assignRoomsRoundRobin(categorizedRooms.highAcuityRooms, totalNurses, nurseAssignments, 'highAcuity');
  assignRoomsRoundRobin(categorizedRooms.highFallRiskRooms, totalNurses, nurseAssignments, 'highFallRisk');
  assignRoomsRoundRobin(categorizedRooms.regularRooms, totalNurses, nurseAssignments, 'regular');
  
  // Assign total care rooms (patients without aide support)
  assignTotalCareRooms(nurseAssignments, patientsWithoutAideSupport);
  
  // Finalize assignments with patient counts and sorted room lists
  for (const assignment of nurseAssignments) {
    assignment.assignedRooms.sort((firstRoom, secondRoom) => firstRoom - secondRoom);
    assignment.patientCount = assignment.assignedRooms.length;
  }
  
  return nurseAssignments;
}

/**
 * Assigns total care responsibilities fairly among nurses
 * @param nurseAssignments - Current nurse assignments to modify
 * @param patientsWithoutAideSupport - Number of patients requiring total care
 */
function assignTotalCareRooms(
  nurseAssignments: StaffAssignment[], 
  patientsWithoutAideSupport: number
): void {
  if (patientsWithoutAideSupport <= 0) {
    return;
  }
  
  const totalNurses = nurseAssignments.length;
  const totalCarePerNurse = Math.ceil(patientsWithoutAideSupport / totalNurses);
  let remainingTotalCarePatients = patientsWithoutAideSupport;
  
  // Assign total care rooms starting from the end of each nurse's assignment
  for (let nurseIndex = 0; nurseIndex < totalNurses && remainingTotalCarePatients > 0; nurseIndex++) {
    const assignment = nurseAssignments[nurseIndex];
    const totalCareCount = Math.min(totalCarePerNurse, remainingTotalCarePatients, assignment.assignedRooms.length);
    
    // Select rooms from the end of the assignment (typically furthest from station)
    const totalCareRoomsForNurse = assignment.assignedRooms.slice(-totalCareCount);
    assignment.totalCareRooms = totalCareRoomsForNurse;
    
    remainingTotalCarePatients -= totalCareCount;
  }
}

/**
 * Creates aide assignments for rooms with aide coverage
 * @param allRooms - Complete list of patient rooms
 * @param totalAides - Number of available aides
 * @param totalAideCapacity - Maximum patients aides can handle
 * @returns Array of aide assignments
 */
export function createAideAssignments(
  allRooms: number[], 
  totalAides: number, 
  totalAideCapacity: number
): StaffAssignment[] {
  if (totalAides === 0) {
    return [];
  }
  
  // Only assign rooms that have aide coverage
  const roomsWithAideCoverage = allRooms.slice(0, totalAideCapacity);
  const baseRoomsPerAide = Math.floor(roomsWithAideCoverage.length / totalAides);
  const extraRooms = roomsWithAideCoverage.length % totalAides;
  
  const aideAssignments: StaffAssignment[] = [];
  let currentRoomIndex = 0;
  
  // Distribute rooms evenly among aides
  for (let aideIndex = 0; aideIndex < totalAides; aideIndex++) {
    const roomsForThisAide = baseRoomsPerAide + (aideIndex < extraRooms ? 1 : 0);
    const assignedRooms = roomsWithAideCoverage.slice(
      currentRoomIndex, 
      currentRoomIndex + roomsForThisAide
    );
    
    aideAssignments.push({
      staffNumber: aideIndex + 1,
      assignedRooms,
      patientCount: roomsForThisAide,
      highAcuityRooms: [],
      highFallRiskRooms: [],
      totalCareRooms: []
    });
    
    currentRoomIndex += roomsForThisAide;
  }
  
  return aideAssignments;
}

/**
 * Main calculation function that orchestrates the entire assignment process
 * @param inputData - All user inputs and configuration
 * @returns Complete assignment results with all staff allocations
 */
export function calculateStaffAssignments(inputData: AssignmentInputData): AssignmentResults {
  const {
    roomRangeStart,
    roomRangeEnd,
    excludedRooms,
    highAcuityRooms,
    highFallRiskRooms,
    totalNurses,
    totalAides,
    maxPatientsPerNurse,
    maxPatientsPerAide
  } = inputData;
  
  // Generate and filter room list
  const allRoomsInRange = generateRoomRange(roomRangeStart, roomRangeEnd);
  const availableRooms = removeExcludedRooms(allRoomsInRange, excludedRooms);
  const totalPatientCount = availableRooms.length;
  
  // Validate capacity constraints
  if (!validateNursingCapacity(totalPatientCount, totalNurses, maxPatientsPerNurse)) {
    throw new Error(`Insufficient nursing capacity: ${totalPatientCount} patients exceed maximum capacity of ${totalNurses * maxPatientsPerNurse}`);
  }
  
  // Calculate aide coverage and categorize rooms
  const aideCoverageData = calculateAideCoverageData(totalPatientCount, totalAides, maxPatientsPerAide);
  const categorizedRooms = categorizeRoomsByPriority(availableRooms, highAcuityRooms, highFallRiskRooms);
  
  // Create staff assignments
  const nurseAssignments = createNurseAssignments(
    availableRooms, 
    totalNurses, 
    categorizedRooms, 
    aideCoverageData.patientsWithoutAideSupport
  );
  
  const aideAssignments = createAideAssignments(
    availableRooms, 
    totalAides, 
    aideCoverageData.totalAideCapacity
  );
  
  return {
    totalPatientCount,
    aideCoverageData,
    nurseAssignments,
    aideAssignments
  };
}

/**
 * Helper function to generate room range (moved from roomParser for circular dependency)
 */
function generateRoomRange(rangeStart: number, rangeEnd: number): number[] {
  const generatedRooms: number[] = [];
  for (let roomNumber = rangeStart; roomNumber <= rangeEnd; roomNumber++) {
    generatedRooms.push(roomNumber);
  }
  return generatedRooms;
}

/**
 * Helper function to remove excluded rooms
 */
function removeExcludedRooms(allRooms: number[], excludedRooms: number[]): number[] {
  return allRooms.filter(roomNumber => !excludedRooms.includes(roomNumber));
}

/**
 * Interface for tracking patient flow changes during shifts
 */
export interface PatientFlowChange {
  timestamp: Date;
  discharges: number[];
  admits: number[];
}

/**
 * Updates current room assignments by processing discharges and new admits
 * Maintains fair distribution while accommodating patient flow changes
 * 
 * @param currentAssignments - Current staff assignments
 * @param dischargeRooms - Room numbers of patients being discharged
 * @param admitRooms - Room numbers of new patient admissions
 * @param nurseCount - Number of nurses available
 * @param aideCount - Number of aides available
 * @param maxPatientsPerNurse - Maximum patients per nurse
 * @param maxPatientsPerAide - Maximum patients per aide
 * @returns Updated assignments with changes processed
 */
export const processPatientFlowChanges = (
  currentAssignments: StaffAssignment[],
  dischargeRooms: string,
  admitRooms: string,
  nurseCount: number,
  aideCount: number,
  maxPatientsPerNurse: number,
  maxPatientsPerAide: number
): {
  updatedAssignments: StaffAssignment[];
  changeRecord: PatientFlowChange;
} => {
  try {
    // Parse discharge and admit room numbers using existing parseRoomInput function
    const dischargedRoomNumbers = parseRoomInput(dischargeRooms);
    const admittedRoomNumbers = parseRoomInput(admitRooms);

    // Validate input - at least one change must be specified
    if (dischargedRoomNumbers.length === 0 && admittedRoomNumbers.length === 0) {
      throw new Error('Please enter rooms to discharge or admit.');
    }

    // Extract current room numbers from existing assignments
    let currentRoomNumbers: number[] = [];
    currentAssignments.forEach(assignment => {
      currentRoomNumbers = [...currentRoomNumbers, ...assignment.rooms];
    });

    // Remove discharged rooms from current room list
    let updatedRoomNumbers = currentRoomNumbers.filter(roomNumber => 
      !dischargedRoomNumbers.includes(roomNumber)
    );

    // Add newly admitted rooms to the room list
    updatedRoomNumbers = [...updatedRoomNumbers, ...admittedRoomNumbers];

    // Sort rooms numerically for consistent assignment distribution
    updatedRoomNumbers.sort((a, b) => a - b);

    // Recalculate assignments with updated room list using existing distribution logic
    const updatedAssignments = distributeRoomsAmongStaff(
      updatedRoomNumbers,
      nurseCount,
      aideCount,
      maxPatientsPerNurse,
      maxPatientsPerAide
    );

    // Create change record for tracking
    const changeRecord: PatientFlowChange = {
      timestamp: new Date(),
      discharges: dischargedRoomNumbers,
      admits: admittedRoomNumbers
    };

    return {
      updatedAssignments,
      changeRecord
    };

  } catch (error) {
    console.error('Error processing patient flow changes:', error);
    throw error;
  }
};

/**
 * Validates room numbers for discharge/admit operations
 * Ensures rooms exist in current assignments before processing discharges
 * 
 * @param currentAssignments - Current staff assignments
 * @param dischargeRooms - Room numbers to be discharged
 * @returns Validation result with any error messages
 */
export const validatePatientFlowChanges = (
  currentAssignments: StaffAssignment[],
  dischargeRooms: string
): { isValid: boolean; errorMessage?: string } => {
  try {
    const dischargedRoomNumbers = parseRoomInput(dischargeRooms);
    
    if (dischargedRoomNumbers.length === 0) {
      return { isValid: true }; // No discharges to validate
    }

    // Get all current room numbers
    const currentRoomNumbers: number[] = [];
    currentAssignments.forEach(assignment => {
      currentRoomNumbers.push(...assignment.rooms);
    });

    // Check if all discharge rooms exist in current assignments
    const invalidDischargeRooms = dischargedRoomNumbers.filter(room => 
      !currentRoomNumbers.includes(room)
    );

    if (invalidDischargeRooms.length > 0) {
      return {
        isValid: false,
        errorMessage: `Cannot discharge rooms not in current assignments: ${invalidDischargeRooms.join(', ')}`
      };
    }

    return { isValid: true };

  } catch (error) {
    return {
      isValid: false,
      errorMessage: 'Invalid room number format for discharges.'
    };
  }
};

/**
 * Formats patient flow change history for display
 * Creates human-readable summaries of recent assignment changes
 * 
 * @param changes - Array of patient flow changes
 * @param maxEntries - Maximum number of recent changes to format
 * @returns Formatted change summaries
 */
export const formatChangeHistory = (
  changes: PatientFlowChange[],
  maxEntries: number = 5
): string[] => {
  return changes
    .slice(-maxEntries) // Get most recent changes
    .reverse() // Show newest first
    .map(change => {
      const timeString = change.timestamp.toLocaleTimeString();
      const dischargeSummary = change.discharges.length > 0 
        ? `🔴 Discharged: ${change.discharges.join(', ')}` 
        : '';
      const admitSummary = change.admits.length > 0 
        ? `🟢 Admitted: ${change.admits.join(', ')}` 
        : '';
      
      const changeParts = [timeString, dischargeSummary, admitSummary].filter(Boolean);
      return changeParts.join(' | ');
    });
};
