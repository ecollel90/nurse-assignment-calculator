/**
 * ================================================================
 * ASSIGNMENT REPORT GENERATION
 * ================================================================
 * Formats assignment calculation results into human-readable reports
 * for charge nurses and staff members.
 */

import type { AssignmentResults, StaffAssignment } from '../types';

/**
 * Compresses consecutive room numbers into ranges for better readability
 * @param roomNumbers - Array of room numbers to format
 * @returns Formatted string with ranges (e.g., "101-105, 107, 110-112")
 */
export function formatRoomsAsRanges(roomNumbers: number[]): string {
  if (roomNumbers.length === 0) {
    return '';
  }
  
  const sortedRooms = [...roomNumbers].sort((firstRoom, secondRoom) => firstRoom - secondRoom);
  const formattedRanges: string[] = [];
  let rangeStart = sortedRooms[0];
  let rangeEnd = sortedRooms[0];
  
  // Process each room to identify consecutive sequences
  for (let roomIndex = 1; roomIndex < sortedRooms.length; roomIndex++) {
    const currentRoom = sortedRooms[roomIndex];
    
    if (currentRoom === rangeEnd + 1) {
      // Extend current range
      rangeEnd = currentRoom;
    } else {
      // End current range and start new one
      formattedRanges.push(rangeStart === rangeEnd ? 
        `${rangeStart}` : 
        `${rangeStart}-${rangeEnd}`
      );
      rangeStart = currentRoom;
      rangeEnd = currentRoom;
    }
  }
  
  // Add the final range
  formattedRanges.push(rangeStart === rangeEnd ? 
    `${rangeStart}` : 
    `${rangeStart}-${rangeEnd}`
  );
  
  return formattedRanges.join(', ');
}

/**
 * Generates summary section with patient census and coverage statistics
 * @param results - Complete assignment calculation results
 * @param maxPatientsPerAide - Maximum aide capacity setting
 * @returns Formatted summary text
 */
function generateAssignmentSummary(results: AssignmentResults, maxPatientsPerAide: number): string {
  const { totalPatientCount, aideCoverageData } = results;
  const totalAides = results.aideAssignments.length;
  
  let summaryText = `✓ Census confirmed: ${totalPatientCount} patients\n`;
  summaryText += `✓ Aide capacity: ${aideCoverageData.totalAideCapacity} patients `;
  summaryText += `(${totalAides} × ${maxPatientsPerAide} max)\n`;
  
  if (aideCoverageData.patientsWithoutAideSupport > 0) {
    summaryText += `📊 ${aideCoverageData.patientsWithoutAideSupport} patient(s) require total nurse care\n`;
  }
  
  return summaryText + '\n';
}

/**
 * Generates detailed nurse assignment section with special care indicators
 * @param nurseAssignments - Array of nurse assignments
 * @returns Formatted nurse assignment text
 */
function generateNurseAssignmentSection(nurseAssignments: StaffAssignment[]): string {
  let nurseSection = 'NURSE ASSIGNMENTS\n';
  nurseSection += '-'.repeat(50) + '\n';
  
  for (const assignment of nurseAssignments) {
    nurseSection += `Nurse ${assignment.staffNumber}: ${assignment.patientCount} patients\n`;
    nurseSection += `Rooms: ${assignment.assignedRooms.join(', ')}\n`;
    
    // Add high acuity indicators
    if (assignment.highAcuityRooms.length > 0) {
      nurseSection += `       └─ High acuity: ${assignment.highAcuityRooms.join(', ')} ⚕️\n`;
    }
    
    // Add high fall risk indicators
    if (assignment.highFallRiskRooms.length > 0) {
      nurseSection += `       └─ Fall risk: ${assignment.highFallRiskRooms.join(', ')} ⚠️\n`;
    }
    
    // Add total care indicators
    if (assignment.totalCareRooms.length > 0) {
      nurseSection += `       └─ Total care: ${assignment.totalCareRooms.join(', ')} 🚨\n`;
    }
    
    nurseSection += '\n';
  }
  
  return nurseSection;
}

/**
 * Generates aide assignment section with room coverage details
 * @param aideAssignments - Array of aide assignments
 * @returns Formatted aide assignment text
 */
function generateAideAssignmentSection(aideAssignments: StaffAssignment[]): string {
  if (aideAssignments.length === 0) {
    return '';
  }
  
  let aideSection = 'AIDE COVERAGE\n';
  aideSection += '-'.repeat(50) + '\n';
  
  for (const assignment of aideAssignments) {
    aideSection += `Aide ${assignment.staffNumber}: ${assignment.patientCount} patients\n`;
    aideSection += `Rooms: ${formatRoomsAsRanges(assignment.assignedRooms)}\n\n`;
  }
  
  return aideSection;
}

/**
 * Generates complete assignment report for distribution to staff
 * @param results - Assignment calculation results
 * @param maxPatientsPerAide - Aide capacity configuration
 * @returns Complete formatted report text
 */
export function generateCompleteAssignmentReport(
  results: AssignmentResults, 
  maxPatientsPerAide: number
): string {
  const { totalPatientCount } = results;
  
  let reportText = `ASSIGNMENT RESULTS - ${totalPatientCount} Total Patients\n`;
  reportText += '='.repeat(50) + '\n\n';
  
  // Add summary section
  reportText += generateAssignmentSummary(results, maxPatientsPerAide);
  
  // Add nurse assignments
  reportText += generateNurseAssignmentSection(results.nurseAssignments);
  
  // Add aide assignments if applicable
  reportText += generateAideAssignmentSection(results.aideAssignments);
  
  // Add legend for symbols
  reportText += 'LEGEND\n';
  reportText += '-'.repeat(20) + '\n';
  reportText += '⚕️ High Acuity Patient\n';
  reportText += '⚠️ High Fall Risk\n';
  reportText += '🚨 Total Nurse Care Required\n';
  
  return reportText;
}
