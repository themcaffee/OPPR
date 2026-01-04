---
"@opprs/db-prisma": minor
"@opprs/rest-api-client": minor
"rest-api": minor
"frontend-next": minor
"@opprs/cli": patch
---

Add policy acceptance to user registration

- Add Terms of Service, Privacy Policy, and Code of Conduct acceptance tracking
- New DateTime fields on User model: tosAcceptedAt, privacyPolicyAcceptedAt, codeOfConductAcceptedAt
- Registration form requires acceptPolicies checkbox
- New public pages: /terms, /privacy, /code-of-conduct
- Footer links to policy pages
