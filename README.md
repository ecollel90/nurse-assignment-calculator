# Nurse Assignment Calculator

A web-based tool for healthcare facilities to efficiently distribute patient assignments among nursing staff while maintaining safe patient-to-staff ratios and ensuring equitable workload distribution.

---

## Healthcare Disclaimer

This tool is provided as-is for workflow assistance only. It does not replace professional judgment in patient care decisions. Always verify assignments meet your facility's policies and regulatory requirements. The authors assume no liability for clinical decisions made using this tool.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Benefits](#key-benefits)
- [Features](#features)
- [Live Demo](#live-demo)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Technical Details](#technical-details)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

---

## Overview

The Nurse Assignment Calculator is a simple yet powerful tool designed to automate the time-consuming process of distributing patient room assignments among nurses and aides during shift changes. What typically takes 20+ minutes of manual calculation can now be completed in under 2 minutes.

---

## Problem Statement

Healthcare facilities face daily challenges in:

- Manually calculating patient distributions at every shift change
- Ensuring fair workload distribution to prevent staff burnout
- Maintaining compliance with staffing ratios
- Handling complex room numbering systems and unit layouts
- Managing situations where aide coverage is insufficient
- Providing clear, documented assignments for all staff

This tool addresses all these challenges with a simple, efficient interface.

---

## Key Benefits

- **Time Savings:** Reduces assignment time from 20 minutes to 2 minutes
- **Fair Distribution:** Ensures equitable patient loads among staff
- **Safety Compliance:** Maintains maximum patient-to-staff ratios
- **Flexibility:** Accommodates various unit configurations and staffing patterns
- **User-Friendly:** No technical expertise required

---

## Features

### Current Features ✅

- **Smart Room Parser:** Handles ranges (e.g., 114-116) and individual rooms (e.g., 118, 120)
- **Flexible Staffing Limits:** Customizable maximum patients per nurse/aide
- **Automatic Distribution:** Evenly distributes patients with one click
- **Total Care Identification:** Flags patients without aide coverage
- **Copy to Clipboard:** Easy sharing of assignments
- **Responsive Design:** Works on desktop, tablet, and mobile
- **No Login Required:** Instant access without accounts or passwords
- **Offline Capable:** Works without internet once loaded

### Example Scenarios Handled

- Non-consecutive room numbers (missing rooms due to discharge/maintenance)
- Aide shortages requiring nurse total care assignments
- Variable staffing patterns (different nurse/aide counts)
- Custom ratio requirements for different units

---

## Live Demo

Try the calculator here:  
[https://nurseassign.netlify.app/](https://nurseassign.netlify.app/)

---

## Getting Started

1. Visit the [Live Demo](https://nurseassign.netlify.app/)
2. Enter your unit’s room numbers (ranges and individual numbers supported)
3. Set the number of nurses and aides
4. Click "Calculate Assignments" to view results

---

## Usage Guide

**Quick Test Example:**

- Enter rooms: `114-116, 118-127, 129-140, 142-153`
- Nurses: `5`
- Aides: `2`
- Click "Calculate Assignments"

Assignments will be distributed fairly and displayed for easy review or copying.

---

## Technical Details

- Built with React and TypeScript
- Deployed on Netlify
- All logic runs client-side for privacy and speed
- No data is stored or transmitted

---

## Future Enhancements

- Mobile app version (coming soon)
- Export assignments to PDF/Excel
- User authentication for saved settings
- More advanced acuity scoring and tagging

---

## Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to change.

---

## Support

For questions, suggestions, or feedback, please email:  
[talentstoserve@gmail.com](mailto:talentstoserve@gmail.com)

---

## License

MIT License.  
See [LICENSE](./LICENSE) for details.

&copy; 2025 talentstoserve. Open source under the MIT License.
