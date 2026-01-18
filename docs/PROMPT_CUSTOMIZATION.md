# AI Prompt Customization Guide

## Overview
The Gemini AI analysis uses a standardized, formal prompt template to ensure consistent, professional responses for engineering teams.

## Prompt Location
- **Code Implementation**: `backend/main.py` → `enrich_with_gemini()` function
- **Template Reference**: `backend/prompts/gemini_analysis_prompt.txt`

## Current Prompt Structure

### 1. System Role
```
You are a professional software quality assurance analyst 
providing technical analysis for engineering teams.
```

### 2. Input Format
```
INPUT DATA:
• Report Type: {type}
• User Message: {message}
• Platform: {platform}
• Visual Evidence: Screenshot (if available)
```

### 3. Analysis Requirements
The prompt defines 5 standardized fields:

#### DESCRIPTION
- **Purpose**: Technical summary of the issue
- **Format**: 2-3 professional sentences
- **Style**: Formal, third-person, objective
- **Example**: "The user has encountered a network connectivity issue while accessing the profile view. The screenshot reveals a timeout error dialog with error code NET::ERR_CONNECTION_TIMED_OUT."

#### CATEGORY
- **Purpose**: Issue classification
- **Options**: crash | performance | bug | feature_request | ui_issue | network | data_issue
- **Format**: Single lowercase word

#### SEVERITY
- **Purpose**: Impact assessment
- **Levels**:
  - `critical`: App unusable, data loss, security issue, affects all users
  - `high`: Major functionality unavailable, no workaround
  - `medium`: Feature impaired, workaround exists, subset of users
  - `low`: Minor inconvenience, cosmetic, edge case
- **Format**: Single lowercase word

#### DEVELOPER_ACTION
- **Purpose**: Actionable remediation steps
- **Format**: 1-2 sentences, imperative voice
- **Structure**: "Investigate X. Verify Y. Test Z."
- **Example**: "Investigate API timeout configuration in network layer. Verify connection retry logic. Test behavior under poor network conditions."

#### CONFIDENCE
- **Purpose**: AI's certainty in the analysis
- **Range**: 0.0 to 1.0
- **Scoring**:
  - 0.9-1.0: High confidence (clear evidence)
  - 0.7-0.8: Moderate confidence (probable cause)
  - 0.5-0.6: Low confidence (educated guess)
  - <0.5: Very uncertain (needs more data)

### 4. Output Format
```
DESCRIPTION: [technical summary]
CATEGORY: [category]
SEVERITY: [severity]
DEVELOPER_ACTION: [recommendations]
CONFIDENCE: [score]
```

## Customization Options

### Option 1: Modify Tone and Style
You can adjust the formality level by changing:

**More Technical/Formal**:
```python
prompt = """You are a senior software architect conducting root cause analysis 
for mission-critical production systems."""
```

**More User-Friendly**:
```python
prompt = """You are a helpful technical support specialist analyzing user 
feedback to improve software quality."""
```

### Option 2: Add Custom Fields
To add new analysis fields:

1. **Update the prompt** in `main.py`:
```python
6. ROOT_CAUSE: Identify the most likely underlying cause
7. AFFECTED_USERS: Estimate percentage of users impacted
8. PRIORITY: Recommend sprint priority (P0/P1/P2/P3)
```

2. **Update the OUTPUT FORMAT**:
```
ROOT_CAUSE: [analysis]
AFFECTED_USERS: [percentage]
PRIORITY: [level]
```

3. **Update database schema** to store new fields

### Option 3: Industry-Specific Terminology
Customize for your industry:

**E-commerce**:
```python
CATEGORY: checkout_issue | payment_failure | inventory_error | shipping_problem
```

**Healthcare**:
```python
CATEGORY: patient_data | compliance_issue | medical_device | hipaa_violation
SEVERITY: patient_safety_critical | high | medium | low
```

**Finance**:
```python
CATEGORY: transaction_failure | security_breach | compliance_violation | data_accuracy
```

### Option 4: Screenshot Analysis Instructions
Enhance screenshot analysis by adding specific guidelines:

```python
SCREENSHOT ANALYSIS GUIDELINES:
• Identify error messages, codes, or status indicators
• Note UI element states (buttons, forms, modals)
• Describe user flow context visible in the image
• Reference specific text, colors, or visual cues
• Mention any data visible in the screenshot
```

### Option 5: Response Language Style
Adjust the language formality:

**Highly Technical**:
```python
STYLE GUIDELINES:
• Use precise technical terminology
• Reference specific architecture components
• Include stack trace interpretation when visible
• Cite error codes and HTTP status codes
• Mention relevant RFCs or specifications
```

**Business-Friendly**:
```python
STYLE GUIDELINES:
• Balance technical accuracy with clarity
• Explain impact in business terms
• Provide user experience context
• Estimate business impact when possible
```

## Implementation Steps

### 1. Backup Current Prompt
```bash
cd backend
cp main.py main.py.backup
```

### 2. Edit the Prompt
Open `backend/main.py` and locate the `enrich_with_gemini()` function (~line 100).

Modify the `prompt` variable with your customizations.

### 3. Test Changes
```bash
./stop.sh
./start.sh
```

Submit a test report and verify the AI analysis format.

### 4. Validate Output
Check that the response still follows the expected format by examining:
```bash
sqlite3 backend/reports.db "SELECT description, category, severity, developer_action, confidence FROM reports ORDER BY created_at DESC LIMIT 1;"
```

## Best Practices

### ✓ DO:
- Keep the output format consistent (field names and structure)
- Provide clear examples in the prompt
- Test prompt changes with various report types
- Document custom fields in your schema
- Version control prompt changes

### ✗ DON'T:
- Remove required fields without updating parsing logic
- Make output format ambiguous
- Use overly complex instructions that confuse the AI
- Change field names without updating database schema
- Skip testing after modifications

## Example Custom Prompts

### Minimal Prompt (Fast, Less Detailed)
```python
prompt = f"""Analyze this bug report:
Type: {report_data['type']}
Message: {report_data['message']}

Respond with:
DESCRIPTION: [1 sentence]
CATEGORY: [bug|feature|crash|other]
SEVERITY: [high|medium|low]
DEVELOPER_ACTION: [1 sentence]
CONFIDENCE: [0-1]
"""
```

### Maximum Detail Prompt (Comprehensive)
```python
prompt = f"""You are a principal software engineer conducting detailed incident analysis.

[Include full context, examples, edge cases, integration requirements]

Provide comprehensive analysis covering:
1-10. [Multiple detailed sections]
"""
```

## Troubleshooting

**Issue**: AI responses don't follow format
- **Solution**: Add more examples in the prompt, make output format more explicit

**Issue**: Analysis is too generic
- **Solution**: Add screenshot analysis requirements, request specific details

**Issue**: Wrong categorization
- **Solution**: Provide clearer category definitions with examples

**Issue**: Inconsistent severity levels
- **Solution**: Add explicit criteria for each severity level

## Support
For questions about prompt customization, see:
- Gemini API documentation: https://ai.google.dev/docs
- Project documentation: `docs/` folder
- Example responses: Check dashboard for recent reports
