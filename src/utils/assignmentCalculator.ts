/**
 * ====
 * ASSIGNMENT CALCULATION ENGINE
 * ====
 * Zone-based assignment system for efficient geographical clustering
 * minimizing nurse travel time while maintaining fair distribution.
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
 * Divides rooms into geographical zones for efficient nurse coverage
 * @param allRooms - Complete sorted list of room numbers
 * @param totalNurses - Number of nurses to create zones for
 * @returns Array of room zones for each nurse
 */
function createGeographicalZones(allRooms: number[], totalNurses: number): number[][] {
  const totalRooms = allRooms.length;
  const baseRoomsPerZone = Math.floor(totalRooms / totalNurses);
  const extraRooms = totalRooms % totalNurses;
  
  const zones: number[][] = [];
  let currentIndex = 0;
  
  // Create contiguous zones
  for (let zoneIndex = 0; zoneIndex < totalNurses; zoneIndex++) {
    const roomsInThisZone = baseRoomsPerZone + (zoneIndex < extraRooms ? 1 : 0);
    const zoneRooms = allRooms.slice(currentIndex, currentIndex + roomsInThisZone);
    zones.push(zoneRooms);
    currentIndex += roomsInThisZone;
  }
  
  return zones;
}

/**
 * Redistributes special care patients fairly across zones
 * @param zones - Current zone assignments
 * @param specialRooms - Rooms requiring special care
 * @param totalNurses - Number of nurses
 * @returns Zones with balanced special care distribution
 */
function balanceSpecialCareAcrossZones(
  zones: number[][], 
  specialRooms: number[], 
  totalNurses: number
): number[][] {
  if (specialRooms.length === 0) {
    return zones;
  }
  
  // Count special care rooms per zone
  const specialCareCount = zones.map(zone => 
    zone.filter(room => specialRooms.includes(room)).length
  );
  
  // If distribution is already fair (max difference ≤ 1), keep zones as-is
  const maxSpecialCare = Math.max(...specialCareCount);
  const minSpecialCare = Math.min(...specialCareCount);
  
  if (maxSpecialCare - minSpecialCare <= 1) {
    return zones;
  }
  
  // Otherwise, perform limited redistribution
  const balancedZones = zones.map(zone => [...zone]);
  
  // Move special care patients from overloaded zones to underloaded zones
  for (let fromZone = 0; fromZone < totalNurses; fromZone++) {
    for (let toZone = 0; toZone < totalNurses; toZone++) {
      if (fromZone === toZone) continue;
      
      const fromSpecialCount = balancedZones[fromZone].filter(room => specialRooms.includes(room)).length;
      const toSpecialCount = balancedZones[toZone].filter(room => specialRooms.includes(room)).length;
      
      // If difference is > 1, try to balance
      if (fromSpecialCount - toSpecialCount > 1) {
        const specialRoomInFromZone = balancedZones[fromZone].find(room => specialRooms.includes(room));
        const regularRoomInToZone = balancedZones[toZone].find(room => !specialRooms.includes(room));
        
        if (specialRoomInFromZone && regularRoomInToZone) {
          // Swap rooms between zones
          const fromIndex = balancedZones[fromZone].indexOf(specialRoomInFromZone);
          const toIndex = balancedZones[toZone].indexOf(regularRoomInToZone);
          
          balancedZones[fromZone][fromIndex] = regularRoomInToZone;
          balancedZones[toZone][toIndex] = specialRoomInFromZone;
        }
      }
    }
  }
  
  return balancedZones;
}

/**
 * Assigns total care responsibilities with clinical priority WITHIN each nurse's zone
 * PRIORITY ORDER: Fall Risk > High Acuity > Regular patients
 * @param nurseAssignments - Current nurse assignments to modify
 * @param patientsWithoutAideSupport - Number of patients requiring total care
 * @param highFallRiskRooms - Rooms with fall risk patients
 * @param highAcuityRooms - Rooms with high acuity patients
 */
function assignTotalCareRooms(
  nurseAssignments: StaffAssignment[], 
  patientsWithoutAideSupport: number,
  highFallRiskRooms: number[],
  highAcuityRooms: number[]
): void {
  if (patientsWithoutAideSupport <= 0) {
    return;
  }
  
  const totalNurses = nurseAssignments.length;
  const baseTotalCarePerNurse = Math.floor(patientsWithoutAideSupport / totalNurses);
  const extraTotalCarePatients = patientsWithoutAideSupport % totalNurses;
  
  let remainingTotalCareToAssign = patientsWithoutAideSupport;
  
  // Assign total care to each nurse, prioritizing fall risk within their zone
  nurseAssignments.forEach((assignment, nurseIndex) => {
    if (remainingTotalCareToAssign <= 0) {
      return;
    }
    
    // Calculate how many total care patients this nurse should get
    const totalCareForThisNurse = baseTotalCarePerNurse + (nurseIndex < extraTotalCarePatients ? 1 : 0);
    
    if (totalCareForThisNurse === 0) {
      assignment.totalCareRooms = [];
      return;
    }
    
    // Prioritize rooms within this nurse's assignment
    const nursePriorityRooms: Array<{room: number, priority: number}> = [];
    
    assignment.assignedRooms.forEach(room => {
      let priority = 3; // Regular patient (lowest priority)
      
      if (highFallRiskRooms.includes(room)) {
        priority = 1; // Fall risk (highest priority for total care)
      } else if (highAcuityRooms.includes(room)) {
        priority = 2; // High acuity (medium priority)
      }
      
      nursePriorityRooms.push({ room, priority });
    });
    
    // Sort this nurse's rooms by priority (fall risk first)
    nursePriorityRooms.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Fall risk first, then high acuity, then regular
      }
      return a.room - b.room; // Secondary sort by room number
    });
    
    // Assign total care to highest priority patients for this nurse
    const totalCareRooms: number[] = [];
    const actualTotalCareCount = Math.min(totalCareForThisNurse, nursePriorityRooms.length, remainingTotalCareToAssign);
    
    for (let i = 0; i < actualTotalCareCount; i++) {
      totalCareRooms.push(nursePriorityRooms[i].room);
    }
    
    assignment.totalCareRooms = totalCareRooms.sort((a, b) => a - b);
    remainingTotalCareToAssign -= actualTotalCareCount;
  });
  
  // Handle any remaining total care patients (edge case)
  if (remainingTotalCareToAssign > 0) {
    // Distribute remaining total care to nurses with capacity
    for (const assignment of nurseAssignments) {
      if (remainingTotalCareToAssign <= 0) break;
      
      const availableCapacity = Math.min(3, assignment.assignedRooms.length) - assignment.totalCareRooms.length;
      if (availableCapacity > 0) {
        // Find rooms not already assigned as total care
        const remainingRooms = assignment.assignedRooms.filter(
          room => !assignment.totalCareRooms.includes(room)
        );
        
        if (remainingRooms.length > 0) {
          // Prioritize fall risk and high acuity among remaining rooms
          const prioritizedRemaining = remainingRooms.map(room => ({
            room,
            priority: highFallRiskRooms.includes(room) ? 1 : 
                     (highAcuityRooms.includes(room) ? 2 : 3)
          })).sort((a, b) => a.priority - b.priority);
          
          const additionalTotalCare = Math.min(
            availableCapacity, 
            remainingTotalCareToAssign, 
            prioritizedRemaining.length
          );
          
          for (let i = 0; i < additionalTotalCare; i++) {
            assignment.totalCareRooms.push(prioritizedRemaining[i].room);
          }
          
          assignment.totalCareRooms.sort((a, b) => a - b);
          remainingTotalCareToAssign -= additionalTotalCare;
        }
      }
    }
  }
}

/**
 * Creates nurse assignments using zone-based geographical clustering
 */
export function createNurseAssignments(
  allRooms: number[], 
  totalNurses: number, 
  highAcuityRooms: number[],
  highFallRiskRooms: number[],
  patientsWithoutAideSupport: number,
  roomStatusData: RoomStatusData
): StaffAssignment[] {
  // Create initial geographical zones
  let nurseZones = createGeographicalZones(allRooms, totalNurses);
  
  // Balance special care patients across zones
  nurseZones = balanceSpecialCareAcrossZones(nurseZones, highAcuityRooms, totalNurses);
  nurseZones = balanceSpecialCareAcrossZones(nurseZones, highFallRiskRooms, totalNurses);
  
  // Create nurse assignments from zones
  const nurseAssignments: StaffAssignment[] = nurseZones.map((zoneRooms, nurseIndex) => {
    const assignedRooms = [...zoneRooms].sort((a, b) => a - b);
    
    return {
      staffNumber: nurseIndex + 1,
      assignedRooms,
      patientCount: assignedRooms.length,
      highAcuityRooms: assignedRooms.filter(room => highAcuityRooms.includes(room)),
      highFallRiskRooms: assignedRooms.filter(room => highFallRiskRooms.includes(room)),
      totalCareRooms: [],
      dischargeRooms: assignedRooms.filter(room => roomStatusData.discharges.includes(room)),
      admitRooms: assignedRooms.filter(room => roomStatusData.admits.includes(room))
    };
  });
  
  // Assign total care rooms with clinical priority (Fall Risk > High Acuity > Regular)
  assignTotalCareRooms(nurseAssignments, patientsWithoutAideSupport, highFallRiskRooms, highAcuityRooms);
  
  return nurseAssignments;
}

/**
 * Creates aide assignments for rooms with aide coverage
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
  
  // Distribute rooms evenly among aides (keeping geographical clustering)
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
  
  // Calculate aide coverage
  const aideCoverageData = calculateAideCoverageData(totalPatientCount, totalAides, maxPatientsPerAide);
  
  // Create zone-based staff assignments with clinical priority for total care
  const nurseAssignments = createNurseAssignments(
    availableRooms, 
    totalNurses, 
    highAcuityRooms,
    highFallRiskRooms,
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
