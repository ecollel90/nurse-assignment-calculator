/**
 * ================================================================
 * HEALTHCARE DISCLAIMER COMPONENT
 * ================================================================
 * Displays important legal and usage disclaimers for healthcare tools
 */

import React from 'react';

export const DisclaimerSection: React.FC = () => {
  return (
    <div className="disclaimer">
      <div className="disclaimer-title">
        <span className="disclaimer-icon">ℹ️</span>
        Healthcare Disclaimer
      </div>
      <p>
        This tool is provided as-is for workflow assistance only. It does not replace 
        professional judgment in patient care decisions. Always verify assignments meet 
        your facility's policies and regulatory requirements. The authors assume no 
        liability for clinical decisions made using this tool.
      </p>
    </div>
  );
};
