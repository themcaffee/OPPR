---
"frontend-next": minor
"rest-api": minor
---

Add multi-result tournament entry with unique placement validation

- Admin can now add multiple tournament results at once using a dynamic multi-row form
- Real-time validation prevents duplicate positions within the form and conflicts with existing results
- Backend validation on batch endpoint rejects submissions with duplicate positions
