---
description: "Database integration and resident profiling system setup"
---

# Database Integration and Resident Profiling

When working on this project, help with the database of this system and connect it to the profiling database and make the residents list appear on our system and use their data to fill up our document issuance.

## Key Tasks:
- Connect to profiling database (MongoDB profiling_db collection residents)
- Fetch resident data from profiling_db
- Display residents list in the UI
- Use resident information for document issuance forms
- Integrate resident data with existing document system

## Database Details:
- Profiling DB: profiling_db
- Collection: residents
- Fields: resident_code, first_name, middle_name, last_name, extension, birthdate, address_text, status, archival_state, tags
- Connection: Same MongoDB cluster as document_db

## Implementation:
- Create resident API endpoints (/api/residents)
- Update frontend components to fetch and display real resident data
- Integrate resident selection with document issuance workflow
- Handle resident search and filtering