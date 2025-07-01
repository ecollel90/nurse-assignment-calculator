/**
 * ====
 * ASSIGNMENT CALCULATION ENGINE
 * ====
 * Core logic for distributing patients fairly among nursing staff
 * with special consideration for high-acuity and high fall risk patients.
 */

import type { 
  AssignmentInputData, 
  AssignmentResults, 
  StaffAssignment, 
  AideCoverageData,
  CategorizedRooms,
  RoomStatusData
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
 * Processes room list with discharges and admits
 * @param roomRangeStart - Starting room number
 * @param roomRangeEnd - Ending room number
 * @param excludedRooms - Rooms to exclude (maintenance, etc.)
 * @param discharges - Rooms with patient discharges
 * @param admits - Rooms with new patient admits
 * @returns Final processed room list and change tracking
 */
export function processRoomList(
  roomRangeStart: number,
  roomRangeEnd: number,
  excludedRooms: number[],
  discharges: number[],
  admits: number[]
): { 
  availableRooms: number[], 
  processedDischarges: number[], 
  processedAdmits: number[] 
} {
  // Start with base room range
  const allRoomsInRange = generateRoomRange(roomRangeStart, roomRangeEnd);
  
  // Remove excluded rooms (maintenance, unavailable, etc.)
  let availableRooms = removeExcludedRooms(allRoomsInRange, excludedRooms);
  
  // Process discharges (remove from existing rooms)
  const processedDischarges = discharges.filter(room => availableRooms.includes(room));
  availableRooms = removeExcludedRooms(availableRooms, discharges);
  
  // Process admits (add new rooms)
  const processedAdmits = [...admits];
  if (admits.length > 0) {
    availableRooms = [...availableRooms, ...admits];
    
    // Remove duplicates and sort
    availableRooms = Array.from(new Set(availableRooms));
    availableRooms.sort((a, b) => a - b);
  }
  
  return {
    availableRooms,
    processedDischarges,
    processedAdmits
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
  // Filter special rooms to only include those that actually exist
  const validHighAcuity = highAcuityRooms.filter(room => allRooms.includes(room));
  const validHighFallRisk = highFallRiskRooms
    .filter(room => allRooms.includes(room) && !validHighAcuity.includes(room));
  
  // Regular rooms are those not in either special category
  const regularRooms = allRooms.filter(room => 
    !validHighAcuity.includes(room) && !validHighFallRisk.includes(room)
  );
  
  return {
    highAcuityRooms: validHighAcuity,
    highFallRiskRooms: validHighFallRisk,
    regularRooms
  };
}

/**
 * Distributes rooms among staff using continuous round-robin algorithm
 * @param roomList - Rooms to be assigned
 * @param staffCount - Number of staff members
 * @param existingAssignments - Current staff assignments to append to
 * @param roomType - Type of rooms being assigned (for tracking)
 * @param startingStaffIndex - Staff index to start distribution from
 * @param roomStatusData - Status data for tracking special room types
 * @returns Next staff index for continued round-robin
 */
function assignRoomsRoundRobin(
  roomList: number[], 
  staffCount: number, 
  existingAssignments: StaffAssignment[],
  roomType: 'highAcuity' | 'highFallRisk' | 'regular',
  startingStaffIndex: number = 0,
  roomStatusData: RoomStatusData
): number {
  let currentStaffIndex = startingStaffIndex;
  
  for (const roomNumber of roomList) {
    const staffAssignment = existingAssignments[currentStaffIndex];
    
    // Add room to main assignment list
    staffAssignment.assignedRooms.push(roomNumber);
    
    // Add to appropriate special care category
    if (roomType === 'highAcuity') {
      staffAssignment.highAcuityRooms.push(roomNumber);
    } else if (roomType === 'highFallRisk') {
      staffAssignment.highFallRiskRooms.push(roomNumber);
    }
    
    // Track discharge/admit status
    if (roomStatusData.discharges.includes(roomNumber)) {
      staffAssignment.dischargeRooms.push(roomNumber);
    }
    if (roomStatusData.admits.includes(roomNumber)) {
      staffAssignment.admitRooms.push(roomNumber);
    }
    
    // Move to next staff member in round-robin fashion
    currentStaffIndex = (currentStaffIndex + 1) % staffCount;
  }
  
  return currentStaffIndex;
}

/**
 * Creates nurse assignments with fair distribution of special care patients
 * @param allRooms - Complete list of patient rooms
 * @param totalNurses - Number of nursing staff
 * @param categorizedRooms - Rooms organized by care requirements
 * @param patientsWithoutAideSupport - Number of total care patients
 * @param roomStatusData - Status data for tracking special room types
 * @returns Array of nurse assignments with room allocations
 */
export function createNurseAssignments(
  allRooms: number[], 
  totalNurses: number, 
  categorizedRooms: CategorizedRooms,
  patientsWithoutAideSupport: number,
  roomStatusData: RoomStatusData
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
      totalCareRooms: [],
      dischargeRooms: [],
      admitRooms: []
    })
  );
  
  // Distribute rooms using continuous round-robin for even distribution
  let currentStaffIndex = 0;
  
  // Distribute high-priority rooms first for fair workload
  currentStaffIndex = assignRoomsRoundRobin(
    categorizedRooms.highAcuityRooms, 
    totalNurses, 
    nurseAssignments, 
    'highAcuity', 
    currentStaffIndex,
    roomStatusData
  );
  
  currentStaffIndex = assignRoomsRoundRobin(
    categorizedRooms.highFallRiskRooms, 
    totalNurses, 
    nurseAssignments, 
    'highFallRisk', 
    currentStaffIndex,
    roomStatusData
  );
  
  assignRoomsRoundRobin(
    categorizedRooms.regularRooms, 
    totalNurses, 
    nurseAssignments, 
    'regular', 
    currentStaffIndex,
    roomStatusData
  );
  
  // Assign total care rooms (patients without aide support)
  assignTotalCareRooms(nurseAssignments, patientsWithoutAideSupport);
  
  // Finalize assignments with patient counts and sorted room lists
  for (const assignment of nurseAssignments) {
    assignment.assignedRooms.sort((firstRoom, secondRoom) => firstRoom - secondRoom);
    assignment.patientCount = assignment.assignedRooms.length;
    
    // Sort special room arrays too
    assignment.highAcuityRooms.sort((a, b) => a - b);
    assignment.highFallRiskRooms.sort((a, b) => a - b);
    assignment.totalCareRooms.sort((a, b) => a - b);
    assignment.dischargeRooms.sort((a, b) => a - b);
    assignment.admitRooms.sort((a, b) => a - b);
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
 * @param roomStatusData - Status data for tracking special room types
 * @returns Array of aide assignments
 */
export function createAideAssignments(
  allRooms: number[], 
  totalAides: number, 
  totalAideCapacity: number,
  roomStatusData: RoomStatusData
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
    
    // Track discharge/admit status for aide assignments
    const dischargeRooms = assignedRooms.filter(room => roomStatusData.discharges.includes(room));
    const admitRooms = assignedRooms.filter(room => roomStatusData.admits.includes(room));
    
    aideAssignments.push({
      staffNumber: aideIndex + 1,
      assignedRooms,
      patientCount: roomsForThisAide,
      highAcuityRooms: [],
      highFallRiskRooms: [],
      totalCareRooms: [],
      dischargeRooms,
      admitRooms
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
    discharges,
    admits,
    highAcuityRooms,
    highFallRiskRooms,
    totalNurses,
    totalAides,
    maxPatientsPerNurse,
    maxPatientsPerAide
  } = inputData;
  
  // Process room list with discharges and admits
  const { availableRooms, processedDischarges, processedAdmits } = processRoomList(
    roomRangeStart, 
    roomRangeEnd, 
    excludedRooms, 
    discharges, 
    admits
  );
  
  const totalPatientCount = availableRooms.length;
  
  // Validate capacity constraints
  if (!validateNursingCapacity(totalPatientCount, totalNurses, maxPatientsPerNurse)) {
    throw new Error(`Insufficient nursing capacity: ${totalPatientCount} patients exceed maximum capacity of ${totalNurses * maxPatientsPerNurse}`);
  }
  
  // Prepare room status data for tracking
  const roomStatusData: RoomStatusData = {
    discharges: processedDischarges,
    admits: processedAdmits,
    highAcuity: highAcuityRooms.filter(room => availableRooms.includes(room)),
    highFallRisk: highFallRiskRooms.filter(room => availableRooms.includes(room))
  };
  
  // Calculate aide coverage and categorize rooms
  const aideCoverageData = calculateAideCoverageData(totalPatientCount, totalAides, maxPatientsPerAide);
  const categorizedRooms = categorizeRoomsByPriority(availableRooms, highAcuityRooms, highFallRiskRooms);
  
  // Create staff assignments
  const nurseAssignments = createNurseAssignments(
    availableRooms, 
    totalNurses, 
    categorizedRooms, 
    aideCoverageData.patientsWithoutAideSupport,
    roomStatusData
  );
  
  const aideAssignments = createAideAssignments(
    availableRooms, 
    totalAides, 
    aideCoverageData.totalAideCapacity,
    roomStatusData
  );
  
  return {
    totalPatientCount,
    aideCoverageData,
    nurseAssignments,
    aideAssignments,
    processedDischarges,
    processedAdmits
  };
}

/**
 * Helper function to generate room range
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
