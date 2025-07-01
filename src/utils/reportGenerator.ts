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
 */
function generateAssignmentSummary(
  results: AssignmentResults, 
  maxPatientsPerAide: number
): string {
  const { totalPatientCount, aideCoverageData, processedDischarges, processedAdmits } = results;
  const totalAides = results.aideAssignments.length;
  
  let summaryText = `✓ Census confirmed: ${totalPatientCount} patients\n`;
  summaryText += `✓ Aide capacity: ${aideCoverageData.totalAideCapacity} patients `;
  summaryText += `(${totalAides} × ${maxPatientsPerAide} max)\n`;
  
  // Add discharge/admit information with distinct symbols
  if (processedDischarges.length > 0) {
    summaryText += `🔴 Discharges processed: ${processedDischarges.join(', ')}\n`;
  }
  
  if (processedAdmits.length > 0) {
    summaryText += `🟢 Admits processed: ${processedAdmits.join(', ')}\n`;
  }
  
  if (aideCoverageData.patientsWithoutAideSupport > 0) {
    summaryText += `📊 ${aideCoverageData.patientsWithoutAideSupport} patient(s) require total nurse care\n`;
  }
  
  return summaryText + '\n';
}

/**
 * Generates detailed nurse assignment section with zone information and special care indicators
 */
function generateNurseAssignmentSection(nurseAssignments: StaffAssignment[]): string {
  let nurseSection = 'NURSE ASSIGNMENTS\n';
  nurseSection += '-'.repeat(50) + '\n';
  
  for (const assignment of nurseAssignments) {
    const roomRange = assignment.assignedRooms.length > 0 
      ? `${assignment.assignedRooms[0]}-${assignment.assignedRooms[assignment.assignedRooms.length - 1]}`
      : '';
    
    nurseSection += `Nurse ${assignment.staffNumber}: ${assignment.patientCount} patients (Zone: ${roomRange})\n`;
    nurseSection += `Rooms: ${assignment.assignedRooms.join(', ')}\n`;
    
    // Add discharge/admit indicators with distinct symbols (most important for workflow)
    if (assignment.dischargeRooms.length > 0) {
      nurseSection += `       └─ Discharges: ${assignment.dischargeRooms.join(', ')} 🔴\n`;
    }
    
    if (assignment.admitRooms.length > 0) {
      nurseSection += `       └─ New admits: ${assignment.admitRooms.join(', ')} 🟢\n`;
    }
    
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
 * Generates aide assignment section with individual room listings and discharge/admit indicators
 */
function generateAideAssignmentSection(aideAssignments: StaffAssignment[]): string {
  if (aideAssignments.length === 0) {
    return '';
  }
  
  let aideSection = 'AIDE COVERAGE\n';
  aideSection += '-'.repeat(50) + '\n';
  
  for (const assignment of aideAssignments) {
    const roomRange = assignment.assignedRooms.length > 0 
      ? `${assignment.assignedRooms[0]}-${assignment.assignedRooms[assignment.assignedRooms.length - 1]}`
      : '';
    
    aideSection += `Aide ${assignment.staffNumber}: ${assignment.patientCount} patients (Zone: ${roomRange})\n`;
    aideSection += `Rooms: ${assignment.assignedRooms.join(', ')}\n`;
    
    // Add discharge/admit indicators for aides with distinct symbols
    if (assignment.dischargeRooms.length > 0) {
      aideSection += `       └─ Discharges: ${assignment.dischargeRooms.join(', ')} 🔴\n`;
    }
    
    if (assignment.admitRooms.length > 0) {
      aideSection += `       └─ New admits: ${assignment.admitRooms.join(', ')} 🟢\n`;
    }
    
    aideSection += '\n';
  }
  
  return aideSection;
}

/**
 * Generates complete assignment report for distribution to staff
 */
export function generateCompleteAssignmentReport(
  results: AssignmentResults, 
  maxPatientsPerAide: number
): string {
  const { totalPatientCount } = results;
  
  let reportText = `ASSIGNMENT RESULTS - ${totalPatientCount} Total Patients\n`;
  reportText += '='.repeat(50) + '\n\n';
  
  // Add summary section with discharge/admit info
  reportText += generateAssignmentSummary(results, maxPatientsPerAide);
  
  // Add nurse assignments
  reportText += generateNurseAssignmentSection(results.nurseAssignments);
  
  // Add aide assignments if applicable
  reportText += generateAideAssignmentSection(results.aideAssignments);
  
  // Add legend for symbols with updated discharge/admit symbols
  reportText += 'LEGEND\n';
  reportText += '-'.repeat(20) + '\n';
  reportText += '⚕️ High Acuity Patient\n';
  reportText += '⚠️ High Fall Risk\n';
  reportText += '🚨 Total Nurse Care Required\n';
  reportText += '🔴 Patient Discharge\n';
  reportText += '🟢 New Patient Admission\n';
  
  return reportText;
}
