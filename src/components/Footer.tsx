/**
 * ================================================================
 * APPLICATION FOOTER COMPONENT
 * ================================================================
 * Contact information and feedback collection
 */

import React from 'react';

export const Footer: React.FC = () => {
  return (
<footer className="app-footer">
  <div className="footer-content">
    <p>
      <span role="img" aria-label="lightbulb">💡</span>
      Have suggestions or feedback? We'd love to hear from you!<br />
      Email: <a href="mailto:talentstoserve@gmail.com">talentstoserve@gmail.com</a>
    </p>
    <p className="version-info">
      Version 2.0 – Enhanced with acuity tracking and fair distribution
    </p>
    <p style={{ fontSize: '0.9em', marginTop: '10px', opacity: 0.7 }}>
      &copy; {new Date().getFullYear()} talentstoserve. Open source under the MIT License.
    </p>
  </div>
</footer>
  );
};
