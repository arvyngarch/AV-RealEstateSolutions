# Local workflow API

All development endpoints accept local identity headers from `docs/local-development.md`.

- `/profile` and `/identity-submissions` cover participant profile and identity review.
- `/listings`, `/favorites`, and `/listings/:id/offers` cover marketplace workflows.
- `/offers/:id/respond` and `/offers/:id/counter-response` handle negotiation and create a transaction on acceptance.
- `/transactions/:id` shows milestones. Questionnaire, agreement, inspection, report, and repair endpoints are nested below the transaction.
- `/transactions/:id/agreement/complete-local-signing` simulates an idempotent signing-provider completion event. It must be replaced by the secured DocuSign webhook before production.

All protected business actions enforce role, ownership, listing status, offer state, and expiry checks in the API.
