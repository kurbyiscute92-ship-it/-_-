# Firestore Security Specification

## 1. Data Invariants
1. **Teacher-Only Roster & Settings Control**: Only verified teacher (`kurbyiscute92@gmail.com`) can create, update, or delete `/students/{studentId}` and write `/settings/classroom`.
2. **Strict Student Response Privacy**: `/morningGreetings/{greetingId}` and `/counselingRequests/{requestId}` can only be read (`get` and `list`) by the verified teacher OR the exact authenticated user whose `authorUid == request.auth.uid`.
3. **Referential Integrity**: Every new morning greeting or counseling request MUST reference an existing `/students/{studentId}` document via `exists()`.
4. **Immutable Ownership & Timestamps**: `authorUid`, `studentId`, and `createdAt` cannot be modified after creation. `createdAt` and `updatedAt` MUST match `request.time`.
5. **Initial State Integrity**: New `morningGreetings` must start with `teacherChecked == false` and `teacherReply == ''`. New `counselingRequests` must start with `status == 'pending'` and `completedTimeLabel == ''`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Unauthenticated Read**: `get(/settings/classroom)` or `list(/morningGreetings)` with `auth == null` -> DENIED.
2. **Unverified Email Write**: Student with `email_verified: false` creating `/morningGreetings/g1` -> DENIED.
3. **Peer Greeting Snooping (Get)**: Student B (`uid_b`) calling `get(/morningGreetings/g_from_uid_a)` -> DENIED.
4. **Peer Greeting Scraping (List)**: Student B (`uid_b`) calling `list(/morningGreetings)` without `authorUid == uid_b` -> DENIED.
5. **Peer Counseling Snooping**: Student B (`uid_b`) reading `/counselingRequests` belonging to `uid_a` -> DENIED.
6. **UID Spoofing on Create**: Student A (`uid_a`) creating greeting with `authorUid: "uid_b"` -> DENIED.
7. **Self-Check / Reply Spoofing on Create**: Student A creating greeting with `teacherChecked: true` or `teacherReply: "Great!"` -> DENIED.
8. **Shadow Ghost Field Injection**: Creating `/morningGreetings/g2` with extra field `isAdmin: true` -> DENIED by `keys().hasOnly(...)`.
9. **Orphan Student Reference**: Creating `/counselingRequests/c1` with nonexistent `studentId: "ghost_student"` -> DENIED by `exists(...)`.
10. **Student Modifying Roster**: Student A creating/updating/deleting `/students/student-minjun` -> DENIED.
11. **Student Changing Active Date**: Student A updating `/settings/classroom` `activeDate` -> DENIED.
12. **Client Timestamp Forgery & Oversized Payload**: Creating `/morningGreetings/g3` with forged `createdAt` (`!= request.time`) or `reason` > 500 chars -> DENIED.
