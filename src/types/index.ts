/**
 * ====
 * TYPE DEFINITIONS
 * ====
 * Central location for all TypeScript interfaces and types
 * used throughout the nurse assignment calculator application.
 */

/** Input data structure for room assignment calculation */
export interface AssignmentInputData {
  roomRangeStart: number;
  roomRangeEnd: number;
  excludedRooms: number[];
  discharges: number[];
  admits: number[];
  highAcuityRooms: number[];
  highFallRiskRooms: number[];
  totalNurses: number;
  totalAides: number;
  maxPatientsPerNurse: number;
  maxPatientsPerAide: number;
}

/** Individual staff member assignment details */
export interface StaffAssignment {
  staffNumber: number;
  assignedRooms: number[];
  patientCount: number;
  highAcuityRooms: number[];
  highFallRiskRooms: number[];
  totalCareRooms: number[];
}

/** Aide coverage statistics and calculations */
export interface AideCoverageData {
  totalAideCapacity: number;
  patientsWithoutAideSupport: number;
}

/** Complete assignment calculation results */
export interface AssignmentResults {
  totalPatientCount: number;
  aideCoverageData: AideCoverageData;
  nurseAssignments: StaffAssignment[];
  aideAssignments: StaffAssignment[];
}

/** Room categorization for fair distribution */
export interface CategorizedRooms {
  highAcuityRooms: number[];
  highFallRiskRooms: number[];
  regularRooms: number[];
}
