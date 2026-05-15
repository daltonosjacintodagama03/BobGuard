---
name: security-review
description: Review code for security vulnerabilities including injection, auth issues, and data exposure
---

Perform a security-focused code review on the provided code or diff.

<Steps>
<Step>
Check for these vulnerability classes:
- SQL/NoSQL injection
- XSS and output encoding issues
- Authentication and authorization flaws
- Sensitive data exposure (hardcoded secrets, tokens, passwords)
- Insecure direct object references
</Step>

<Step>
For each finding, produce a structured entry:
- SEVERITY: Critical | High | Medium | Low
- FILE: exact file path and line number
- ISSUE: one-sentence description
- FIX: concrete suggestion with example code if applicable
</Step>

<Step>
End with a SUMMARY section:
- Total findings per severity level
- Overall risk score (0-10)
- Top 1 priority fix
</Step>
</Steps>
