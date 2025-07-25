# Agile DHF Feature Files Repository

## Overview
This repository contains feature files for Agile Design History File (DHF) implementation with full traceability support for Codebeamer integration. The feature files are organized to support requirements traceability, test scenarios, and documentation generation.

## Repository Structure

```
├── features/
│   ├── core/                    # Core system features
│   ├── api/                     # API-related features
│   ├── ui/                      # User interface features
│   ├── compliance/              # Regulatory compliance features
│   └── integration/             # System integration features
├── docs/
│   ├── traceability/           # Traceability matrices
│   └── templates/              # Document templates
├── config/
│   └── codebeamer/             # Codebeamer configuration
└── scripts/                    # Automation scripts
```

## Feature File Standards

All feature files follow the Gherkin syntax and include:
- **Feature ID**: Unique identifier for traceability
- **Requirements References**: Links to URS, CMT, MANUAL documents
- **Scenarios**: Test scenarios with Given-When-Then structure
- **Tags**: For categorization and filtering

## Codebeamer Integration

### Prerequisites
1. Codebeamer instance with API access
2. Repository connected to Codebeamer project
3. Proper permissions for requirements management

### Traceability Setup
1. Feature files include reference IDs (@URS_xxx, @CMT_xxx, @MANUAL_xxx)
2. These IDs map to Codebeamer requirements
3. Test execution results are automatically linked back to requirements

### Configuration
See `config/codebeamer/` for integration settings and mapping configurations.

## Usage

### Running Tests
```bash
# Run all features
npm test

# Run specific feature category
npm test features/core/

# Run with specific tags
npm test -- --tags @regression
```

### Generating Documentation
```bash
# Generate traceability matrix
npm run docs:traceability

# Generate test reports
npm run docs:reports
```

## Contributing

1. Follow the feature file naming convention: `feature-name.feature`
2. Include proper requirement references
3. Use descriptive scenario names
4. Add appropriate tags for categorization

## Tags Convention

- `@regression` - Regression test scenarios
- `@smoke` - Smoke test scenarios
- `@api` - API testing
- `@ui` - User interface testing
- `@compliance` - Regulatory compliance
- `@critical` - Critical functionality
- `@integration` - Integration testing

## Requirements Traceability

This repository maintains full bidirectional traceability between:
- User Requirements Specifications (URS)
- Component/Module Test documents (CMT)
- Manual procedures (MANUAL)
- Non-Functional Requirements (NFR)
- Feature files and test scenarios