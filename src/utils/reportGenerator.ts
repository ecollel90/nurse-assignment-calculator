/**
 * ====
 * ASSIGNMENT REPORT GENERATION
 * ====
 * Formats assignment calculation results into human-readable reports
 * for charge nurses and staff members.
 */

import type { AssignmentResults, StaffAssignment } from '../types';

/**
 * Generates summary section with patient census, coverage statistics, and daily changes
 * @param results - Complete assignment calculation results
 * @param maxPatientsPerAide - Maximum aide capacity setting
 * @param processedDischarges - Rooms that were discharged
 * @param processedAdmits - Rooms that were admitted
 * @returns Formatted summary text
 */
function generateAssignmentSummary(
  results: AssignmentResults, 
  maxPatientsPerAide: number,
  processedDischarges: number[] = [],
  processedAdmits: number[] = []
): string {
  const { totalPatientCount, aideCoverageData } = results;
  const totalAides = results.aideAssignments.length;
  
  let summaryText = `✓ Census confirmed: ${totalPatientCount} patients\n`;
  summaryText += `✓ Aide capacity: ${aideCoverageData.totalAideCapacity} patients `;
  summaryText += `(${totalAides} × ${maxPatientsPerAide} max)\n`;
  
  // Add discharge/admit information if any
  if (processedDischarges.length > 0) {
    summaryText += `📤 Discharges processed: ${processedDischarges.join(', ')}\n`;
  }
  
  if (processedAdmits.length > 0) {
    summaryText += `📥 Admits processed: ${processedAdmits.join(', ')}\n`;
  }
  
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
 * Generates aide assignment section with individual room listings (consistent with nurse format)
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
    aideSection += `Rooms: ${assignment.assignedRooms.join(', ')}\n\n`;
  }
  
  return aideSection;
}

/**
 * Generates complete assignment report for distribution to staff
 * @param results - Assignment calculation results
 * @param maxPatientsPerAide - Aide capacity configuration
 * @param processedDischarges - Rooms that were discharged
 * @param processedAdmits - Rooms that were admitted
 * @returns Complete formatted report text
 */
export function generateCompleteAssignmentReport(
  results: AssignmentResults, 
  maxPatientsPerAide: number,
  processedDischarges: number[] = [],
  processedAdmits: number[] = []
): string {
  const { totalPatientCount } = results;
  
  let reportText = `ASSIGNMENT RESULTS - ${totalPatientCount} Total Patients\n`;
  reportText += '='.repeat(50) + '\n\n';
  
  // Add summary section with discharge/admit info
  reportText += generateAssignmentSummary(results, maxPatientsPerAide, processedDischarges, processedAdmits);
  
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
  reportText += '📤 Patient Discharged\n';
  reportText += '📥 New Patient Admission\n';
  
  return reportText;
}
