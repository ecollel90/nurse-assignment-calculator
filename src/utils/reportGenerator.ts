/**
 * Generates detailed nurse assignment section with zone information
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
    
    // Add discharge/admit indicators (most important for workflow)
    if (assignment.dischargeRooms.length > 0) {
      nurseSection += `       └─ Discharges: ${assignment.dischargeRooms.join(', ')} 📤\n`;
    }
    
    if (assignment.admitRooms.length > 0) {
      nurseSection += `       └─ New admits: ${assignment.admitRooms.join(', ')} 📥\n`;
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
