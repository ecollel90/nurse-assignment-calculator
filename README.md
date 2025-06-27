## Healthcare Disclaimer

This tool is provided as-is for workflow assistance only. 
It does not replace professional judgment in patient care decisions.
Always verify assignments meet your facility's policies and regulatory requirements. 
The authors assume no liability for clinical decisions made using this tool.

# Nurse Assignment Calculator

A web-based tool for healthcare facilities to efficiently distribute patient assignments among nursing staff while maintaining safe patient-to-staff ratios and ensuring equitable workload distribution.

## Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Live Demo](#live-demo)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Technical Details](#technical-details)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Overview

The Nurse Assignment Calculator is a simple yet powerful tool designed to automate the time-consuming process of distributing patient room assignments among nurses and aides during shift changes. 
What typically takes 20+ minutes of manual calculation can now be completed in under 2 minutes.

### Key Benefits
- **Time Savings**: Reduces assignment time from 20 minutes to 2 minutes
- **Fair Distribution**: Ensures equitable patient loads among staff
- **Safety Compliance**: Maintains maximum patient-to-staff ratios
- **Flexibility**: Accommodates various unit configurations and staffing patterns
- **User-Friendly**: No technical expertise required

## Problem Statement

Healthcare facilities face daily challenges in:
- Manually calculating patient distributions at every shift change
- Ensuring fair workload distribution to prevent staff burnout
- Maintaining compliance with staffing ratios
- Handling complex room numbering systems and unit layouts
- Managing situations where aide coverage is insufficient
- Providing clear, documented assignments for all staff

This tool addresses all these challenges with a simple, efficient interface.

## Features

### Current Features ✅
- **Smart Room Parser**: Handles ranges (114-116) and individual rooms (118, 120)
- **Flexible Staffing Limits**: Customizable maximum patients per nurse/aide
- **Automatic Distribution**: Evenly distributes patients with one click
- **Total Care Identification**: Flags patients without aide coverage
- **Copy to Clipboard**: Easy sharing of assignments
- **Responsive Design**: Works on desktop, tablet, and mobile
- **No Login Required**: Instant access without accounts or passwords
- **Offline Capable**: Works without internet once loaded

### Example Scenarios Handled
- Non-consecutive room numbers (missing rooms due to discharge/maintenance)
- Aide shortages requiring nurse total care assignments
- Variable staffing patterns (different nurse/aide counts)
- Custom ratio requirements for different units

## Live Demo

Try the calculator: (https://nurseassign.netlify.app/)

### Quick Test
1. Enter rooms: `114-116, 118-127, 129-140, 142-153`
2. Nurses: `5`
3. Aides: `2`
4. Click "Calculate Assignments"

## Getting Started

### Option 1: Use Hosted Version
Simply visit the live demo link above - no installation required!

### Option 2: Deploy Your Own

#### Using GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from branch" → main → / (root)
4. Your site will be available at `https://ecollel90.github.io/nurse-assignment-calculator`

#### Using Netlify
1. Fork this repository
2. Log in to Netlify
3. Click "New site from Git"
4. Connect to GitHub and select this repository
5. Deploy with default settings

### Option 3: Local Development
```bash
# Clone the repository
git clone https://github.com/[username]/nurse-assignment-calculator.git

# Navigate to project directory
cd nurse-assignment-calculator

# Open in browser (no server required)
open index.html
# or
start index.html  # Windows

## Why Open Source?

We believe core healthcare tools should be accessible to all facilities, 
regardless of budget. This open-source calculator will always remain free.

For facilities needing advanced features, mobile access, and professional 
support, we're developing a Professional edition.

Your contributions to this open-source version help improve healthcare 
workflows for everyone.
