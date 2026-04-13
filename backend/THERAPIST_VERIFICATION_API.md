# Therapist Verification System - API Documentation

## Overview

The Mental Health Support System includes an **automated therapist license verification system** based on Ethiopian licensing practices.

**Important Disclaimer:**
> This system performs preliminary digital verification and does not replace official licensing by the Ministry of Health or regulatory authorities in Ethiopia.

---

## Verification Status

The system uses only **4 verification statuses** (no partial verification):

| Status | Meaning | Can Accept Appointments | Visible in Search |
|--------|---------|------------------------|------------------|
| **VERIFIED** | Licensed and eligible | ✅ YES | ✅ YES |
| **PENDING** | Awaiting verification | ❌ NO | ❌ NO |
| **REJECTED** | Failed verification | ❌ NO | ❌ NO |
| **EXPIRED** | License expired | ❌ NO | ❌ NO |

---

## Verification Criteria

A therapist is **VERIFIED** if ALL of the following are met:

1. ✅ Valid Educational Qualification
   - Psychology
   - Clinical Psychology
   - Social Work

2. ✅ Valid License Number
   - Must be non-empty and valid format

3. ✅ Valid Issuing Authority
   - Ministry of Health
   - Regional Bureau of Health

4. ✅ License Not Expired
   - Must expire after current date

5. ✅ Competency Requirement
   - Passed COC exam OR
   - Passed competency exam

6. ✅ License Document Uploaded
   - Must have uploaded document

---

## Therapist Registration Endpoint

### Register Therapist

**Endpoint:** `POST /api/therapist/register`

**Access:** Public (no authentication required)

**Request Body:**

```json
{
  "name": "Dr. Abebe Kebede",
  "email": "abebe@example.com",
  "password": "securePassword123",
  "phone": "+251911223344",
  "gender": "male",
  "dateOfBirth": "1985-05-15T00:00:00Z",
  "therapistData": {
    "specialization": ["Depression", "Anxiety"],
    "experienceYears": 8,
    "bio": "Licensed clinical psychologist with 8 years of experience...",
    "workplace": "St. Paul's Hospital",
    "hourlyRate": 500,
    "languages": ["Amharic", "English"],
    "education": {
      "degreeType": "Master",
      "field": "Clinical Psychology",
      "institution": "Addis Ababa University",
      "graduationYear": 2015
    },
    "license": {
      "licenseNumber": "ETH-2015-PSY-001234",
      "issuingAuthority": "Ministry of Health",
      "licenseExpiryDate": "2026-12-31",
      "licenseDocument": "https://example.com/documents/license.pdf"
    },
    "competency": {
      "hasCOC": true,
      "examPassed": true
    }
  }
}
```

**Response (Success - 201):**

```json
{
  "message": "Therapist registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Dr. Abebe Kebede",
    "email": "abebe@example.com",
    "role": "therapist"
  },
  "verification": {
    "status": "VERIFIED",
    "notes": "Successfully verified as a licensed mental health professional"
  }
}
```

**Response (Rejected):**

```json
{
  "message": "Therapist registered successfully",
  "verification": {
    "status": "REJECTED",
    "notes": "Invalid educational qualification. Must be Psychology, Clinical Psychology, or Social Work"
  }
}
```

**Response (Pending):**

```json
{
  "message": "Therapist registered successfully",
  "verification": {
    "status": "PENDING",
    "notes": "Awaiting competency exam results (COC or equivalent)"
  }
}
```

---

## Verification Status Endpoint

### Get Current Verification Status

**Endpoint:** `GET /api/therapist/verification-status`

**Access:** Protected (requires therapist authentication)

**Response:**

```json
{
  "message": "Verification status retrieved",
  "verification": {
    "status": "VERIFIED",
    "notes": "Successfully verified as a licensed mental health professional",
    "verifiedAt": "2026-04-13T12:30:00.000Z",
    "licenseExpiryDate": "2026-12-31",
    "isEligible": true
  }
}
```

---

## Re-upload License Endpoint

### Re-upload and Re-verify License

**Endpoint:** `POST /api/therapist/reupload-license`

**Access:** Protected (requires therapist authentication)

**Description:** When a therapist's license status is REJECTED or about to EXPIRE, they can re-upload updated documents for re-verification.

**Request Body:**

```json
{
  "licenseNumber": "ETH-2016-PSY-001234",
  "issuingAuthority": "Ministry of Health",
  "licenseExpiryDate": "2027-12-31",
  "licenseDocument": "https://example.com/documents/new-license.pdf"
}
```

**Response:**

```json
{
  "message": "License re-uploaded and re-verification completed",
  "verification": {
    "status": "VERIFIED",
    "notes": "Successfully verified as a licensed mental health professional",
    "verifiedAt": "2026-04-13T13:00:00.000Z",
    "licenseExpiryDate": "2027-12-31",
    "isEligible": true
  }
}
```

---

## Therapist Profile Endpoints

### Get Full Therapist Profile

**Endpoint:** `GET /api/therapist/profile`

**Access:** Protected (requires therapist authentication)

**Response:**

```json
{
  "therapist": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Abebe Kebede",
      "email": "abebe@example.com"
    },
    "specialization": ["Depression", "Anxiety"],
    "experienceYears": 8,
    "bio": "Licensed clinical psychologist...",
    "workplace": "St. Paul's Hospital",
    "education": {
      "degreeType": "Master",
      "field": "Clinical Psychology",
      "institution": "Addis Ababa University",
      "graduationYear": 2015
    },
    "license": {
      "licenseNumber": "ETH-2015-PSY-001234",
      "issuingAuthority": "Ministry of Health",
      "licenseExpiryDate": "2026-12-31"
    },
    "verification": {
      "status": "VERIFIED",
      "notes": "Successfully verified...",
      "verifiedAt": "2026-04-13T12:30:00.000Z"
    },
    "hourlyRate": 500,
    "languages": ["Amharic", "English"]
  },
  "isEligible": true
}
```

### Update Therapist Profile

**Endpoint:** `PUT /api/therapist/profile`

**Access:** Protected (requires therapist authentication)

**Allowed Fields:** specialization, experienceYears, bio, workplace, hourlyRate, availability, languages

**Request:**

```json
{
  "bio": "Updated bio information...",
  "hourlyRate": 600,
  "languages": ["Amharic", "English", "Oromo"]
}
```

---

## Appointment Booking (Verification Check)

### Create Appointment

**Endpoint:** `POST /api/client/appointments`

**Access:** Protected (requires client authentication)

**Important:** Only **VERIFIED** therapists can be booked for appointments.

**Request:**

```json
{
  "therapistId": "507f1f77bcf86cd799439012",
  "date": "2026-05-10",
  "time": "14:00",
  "sessionType": "video",
  "notes": "First session"
}
```

**Validation:**

```
IF therapist.verification.status !== 'VERIFIED'
  → REJECT with error: "Therapist not found or not verified"
```

---

## Client Therapist Search (Verification Check)

### Search Available Therapists

**Endpoint:** `GET /api/client/therapists`

**Access:** Protected (requires client authentication)

**Important:** Only **VERIFIED** therapists are returned in search results.

**Query:**

```
GET /api/client/therapists?specialization=Depression&page=1&limit=10
```

**Filter Applied:**

```
Query: { 'verification.status': 'VERIFIED' }
```

**Response:**

```json
{
  "therapists": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "name": "Dr. Abebe Kebede",
        "email": "abebe@example.com"
      },
      "specialization": ["Depression", "Anxiety"],
      "experienceYears": 8,
      "hourlyRate": 500
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

## Therapist Model Structure

```javascript
{
  userId: ObjectId,          // Reference to User model
  
  // Professional Information
  specialization: [String],
  experienceYears: Number,
  bio: String,
  workplace: String,
  
  // Education Details
  education: {
    degreeType: String,      // Bachelor, Master, Doctorate, Diploma
    field: String,           // Psychology, Clinical Psychology, Social Work, etc.
    institution: String,
    graduationYear: Number
  },
  
  // License Information
  license: {
    licenseNumber: String,
    issuingAuthority: String, // Ministry of Health, Regional Bureau of Health
    licenseExpiryDate: Date,
    licenseDocument: String   // URL to uploaded document
  },
  
  // Competency Information
  competency: {
    hasCOC: Boolean,
    examPassed: Boolean
  },
  
  // Verification Status
  verification: {
    status: String,          // VERIFIED, PENDING, REJECTED, EXPIRED
    notes: String,
    verifiedAt: Date
  },
  
  // Additional
  hourlyRate: Number,
  availability: Array,
  languages: [String]
}
```

---

## Verification Logic Flowchart

```
Therapist registers
        ↓
Check license expiry
        ↓
   Is expired?
   ├─ YES → EXPIRED
   └─ NO ↓
        ↓
Check education field
        ↓
   Valid field?
   ├─ NO → REJECTED
   └─ YES ↓
        ↓
Check license number
        ↓
   Valid?
   ├─ NO → REJECTED
   └─ YES ↓
        ↓
Check issuing authority
        ↓
   Valid?
   ├─ NO → REJECTED
   └─ YES ↓
        ↓
Check competency
        ↓
   Has COC or exam passed?
   ├─ NO → PENDING
   └─ YES ↓
        ↓
Check license document
        ↓
   Uploaded?
   ├─ NO → PENDING
   └─ YES ↓
        ↓
       VERIFIED ✓
```

---

## Admin Verification Monitoring

### Get Unverified Therapists (Admin)

**Endpoint:** `GET /api/admin/users?role=therapist`

**Response includes verification status** for monitoring purposes.

**Note:** Admins can view verification status but **CANNOT manually approve** licenses. The system is fully automated.

---

## Important Notes

1. **Automatic Verification:** Therapist verification happens automatically during registration.
2. **No Manual Approval:** Admin does NOT manually approve therapists.
3. **Safety First:** Only VERIFIED therapists can:
   - Accept appointments
   - Appear in search results
   - Provide services
4. **Re-verification:** Therapists can re-upload documents and the system re-runs verification.
5. **Language:** System designed in English but can support Amharic in future versions.
6. **Disclaimer:** Always displayed that this is preliminary verification only.

---

## Example Workflows

### Workflow 1: Successful Registration

```
1. Therapist fills registration form
2. All fields valid and complete
3. System performs automatic verification
4. Status: VERIFIED
5. Account activated immediately
6. Can accept appointments and appear in search
```

### Workflow 2: Missing Competency

```
1. Therapist registers without COC/exam passed
2. System checks competency
3. Status: PENDING
4. Review notes: "Awaiting competency exam results"
5. Therapist uploads exam certificate later
6. Triggers re-verification
7. Status updated to VERIFIED
```

### Workflow 3: Expired License

```
1. Therapist registered as VERIFIED
2. License expiration date passes
3. On next verification check, status: EXPIRED
4. Cannot accept new appointments
5. Therapist re-uploads new license
6. System re-verifies
7. Status updated back to VERIFIED
```

---

## Testing the API

### Using cURL

```bash
# Register therapist
curl -X POST http://localhost:5000/api/therapist/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+251911223344",
    "gender": "male",
    "dateOfBirth": "1985-05-15T00:00:00Z",
    "therapistData": {
      "specialization": ["Depression"],
      "experienceYears": 5,
      "bio": "Test therapist",
      "workplace": "Test Hospital",
      "education": {
        "degreeType": "Master",
        "field": "Clinical Psychology",
        "institution": "Test University",
        "graduationYear": 2015
      },
      "license": {
        "licenseNumber": "TEST-123",
        "issuingAuthority": "Ministry of Health",
        "licenseExpiryDate": "2027-12-31",
        "licenseDocument": "https://example.com/license.pdf"
      },
      "competency": {
        "hasCOC": true,
        "examPassed": true
      }
    }
  }'

# Get verification status (requires token)
curl -X GET http://localhost:5000/api/therapist/verification-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

This system provides a complete, automated therapist verification solution that ensures only qualified professionals can serve patients while maintaining transparency about the preliminary nature of digital verification.
