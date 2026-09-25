\# Unexpected File Write Outside Project



\## Expected Classification



Verdict: suspicious



\## Security Scenario



This fixture represents an application attempting to write a

file outside the expected project directory.



\## Expected Detection



\- Category: filesystem

\- Severity: warning

\- Expected verdict: suspicious



\## Purpose



Used to validate detection of unexpected filesystem writes

outside the project directory.

