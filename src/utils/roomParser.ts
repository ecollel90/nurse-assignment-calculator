/**
 * ================================================================
 * ROOM NUMBER PARSING UTILITIES
 * ================================================================
 * Handles conversion of user input into structured room data
 * with support for ranges, exclusions, and special room types.
 */

/**
 * Generates array of room numbers from start and end range
 * @param rangeStart - Starting room number (inclusive)
 * @param rangeEnd - Ending room number (inclusive)
 * @returns Array of consecutive room numbers
 */
export function generateRoomRange(rangeStart: number, rangeEnd: number): number[] {
  const generatedRooms: number[] = [];
  
  // Validate input parameters
  if (rangeStart > rangeEnd) {
    throw new Error('Start room number cannot be greater than end room number');
  }
  
  // Generate sequential room numbers
  for (let roomNumber = rangeStart; roomNumber <= rangeEnd; roomNumber++) {
    generatedRooms.push(roomNumber);
  }
  
  return generatedRooms;
}

/**
 * Removes excluded rooms from the main room list
 * @param allRooms - Complete list of room numbers
 * @param excludedRooms - Rooms to be removed from assignment
 * @returns Filtered array with excluded rooms removed
 */
export function removeExcludedRooms(allRooms: number[], excludedRooms: number[]): number[] {
  return allRooms.filter(roomNumber => !excludedRooms.includes(roomNumber));
}

/**
 * Parses comma-separated room input into array of numbers
 * @param roomInputString - User input string (e.g., "101, 105, 110-115")
 * @returns Array of parsed room numbers
 */
export function parseRoomInputString(roomInputString: string): number[] {
  if (!roomInputString.trim()) {
    return [];
  }
  
  const parsedRooms: number[] = [];
  const roomSegments = roomInputString.split(',');
  
  // Process each comma-separated segment
  for (const segment of roomSegments) {
    const trimmedSegment = segment.trim();
    
    if (trimmedSegment.includes('-')) {
      // Handle range input (e.g., "110-115")
      const [startString, endString] = trimmedSegment.split('-');
      const rangeStart = parseInt(startString.trim());
      const rangeEnd = parseInt(endString.trim());
      
      if (!isNaN(rangeStart) && !isNaN(rangeEnd)) {
        const rangeRooms = generateRoomRange(rangeStart, rangeEnd);
        parsedRooms.push(...rangeRooms);
      }
    } else if (trimmedSegment) {
      // Handle single room number
      const singleRoom = parseInt(trimmedSegment);
      if (!isNaN(singleRoom)) {
        parsedRooms.push(singleRoom);
      }
    }
  }
  
  // Remove duplicates and sort numerically
  const uniqueRooms = Array.from(new Set(parsedRooms));
  return uniqueRooms.sort((firstRoom, secondRoom) => firstRoom - secondRoom);
}

/**
 * Validates that special rooms exist in the main room list
 * @param allRooms - Complete list of available rooms
 * @param specialRooms - Rooms marked as high acuity or high fall risk
 * @returns Array of valid special room numbers
 */
export function validateSpecialRooms(allRooms: number[], specialRooms: number[]): number[] {
  return specialRooms.filter(roomNumber => allRooms.includes(roomNumber));
}
