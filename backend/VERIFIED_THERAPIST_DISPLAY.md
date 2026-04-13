# Verified Therapist Information Display Guide

This document explains what verified therapist information is shown at different stages and to different users.

---

## 📋 Privacy & Security Rules

**Hidden from clients:**
- ❌ Password
- ❌ License document URL
- ❌ Verification notes (internal only)

**Visible to verified clients:**
- ✅ All professional credentials
- ✅ Verification badge
- ✅ Reviews and ratings
- ✅ Contact information

**Visible to therapist:**
- ✅ Full profile including documents
- ✅ Verification status & notes
- ✅ License document

**Visible to admin:**
- ✅ Complete profile including verification documents
- ✅ Internal verification notes

---

## 1️⃣ Therapist Search Results

**Endpoint:** `GET /api/client/therapists?specialization=Depression`

**What clients see (list view):**

```json
{
  "therapists": [
    {
      "id": "507f1f77bcf86cd799439012",
      "userId": {
        "name": "Dr. Abebe Kebede",
        "email": "abebe@example.com",
        "phone": "+251911223344",
        "profileImage": "https://example.com/photo.jpg"
      },
      "specialization": ["Depression", "Anxiety"],
      "experienceYears": 8,
      "bio": "Licensed clinical psychologist with 8 years of experience treating depression and anxiety disorders...",
      "workplace": "St. Paul's Hospital",
      "hourlyRate": 500,
      "languages": ["Amharic", "English"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45
  }
}
```

---

## 2️⃣ Detailed Therapist Profile

**Endpoint:** `GET /api/client/therapists/:therapistId`

**What clients see (detailed view):**

```json
{
  "therapist": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Dr. Abebe Kebede",
    "email": "abebe@example.com",
    "phone": "+251911223344",
    "profileImage": "https://example.com/photo.jpg",

    "specialization": ["Depression", "Anxiety"],
    "experienceYears": 8,
    "bio": "Licensed clinical psychologist with 8 years of experience...",
    "workplace": "St. Paul's Hospital",
    "hourlyRate": 500,
    "languages": ["Amharic", "English"],

    "education": {
      "field": "Clinical Psychology",
      "degreeType": "Master",
      "institution": "Addis Ababa University",
      "graduationYear": 2015
    },

    "license": {
      "licenseNumber": "ETH-2015-PSY-001234",
      "issuingAuthority": "Ministry of Health",
      "licenseExpiryDate": "2026-12-31"
    },

    "competency": {
      "hasCOC": true,
      "examPassed": true
    },

    "verification": {
      "status": "VERIFIED",
      "verifiedAt": "2026-04-13T12:30:00.000Z"
    },

    "availability": [
      {
        "day": "monday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "day": "tuesday",
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  },

  "reviews": {
    "total": 12,
    "averageRating": 4.8,
    "recentReviews": [
      {
        "clientName": "Almaz T.",
        "rating": 5,
        "comment": "Dr. Abebe is very professional and helpful. Highly recommended!",
        "createdAt": "2026-04-10T14:30:00.000Z"
      },
      {
        "clientName": "Tegist M.",
        "rating": 5,
        "comment": "Excellent therapist. Great communication and understanding.",
        "createdAt": "2026-04-08T10:15:00.000Z"
      }
    ]
  }
}
```

---

## 3️⃣ What Is Shown As "VERIFIED"?

### ✅ **Verified Credentials** (Displayed)

| Credential | Status | Shown |
|-----------|--------|-------|
| Education | Verified ✓ | ✅ Field, Degree, Institution, Year |
| License | Verified ✓ | ✅ License #, Issuing Authority, Expiry Date |
| Competency | Verified ✓ | ✅ COC, Exam Passed |
| Experience | Verified ✓ | ✅ Years of Experience |
| Specialization | Verified ✓ | ✅ List of specializations |
| Verification Badge | VERIFIED | ✅ Status & Date |

### ❌ **Hidden Information** (Private)

| Information | Why Hidden |
|-------------|-----------|
| License Document URL | Security - prevent direct access |
| Verification Notes | Internal use only |
| Password | Security |
| Verification Logic Details | Security |
| System Verification Process | Protection |

---

## 4️⃣ Verification Badge Display

### For VERIFIED Therapists

```
┌─────────────────────────────────────┐
│  ✓ VERIFIED                         │
│  Licensed Mental Health Professional │
│  Verified: April 13, 2026           │
│                                     │
│  📋 Credentials:                    │
│  • Master in Clinical Psychology    │
│  • License: ETH-2015-PSY-001234    │
│  • Ministry of Health (Ethiopia)    │
│  • Expires: December 31, 2026       │
│  • COC Certified ✓                  │
└─────────────────────────────────────┘
```

### For Non-Verified Therapists

```
NOT SHOWN TO CLIENTS

(Therapists with status: PENDING, REJECTED, EXPIRED)
- Do not appear in search results
- Cannot be booked
- Profile not accessible
```

---

## 5️⃣ Information Flow by User Role

### **CLIENT** Can See:
✅ Therapist name, email, phone  
✅ Profile picture  
✅ Education details (degree, field, institution, year)  
✅ License number & issuing authority & expiry  
✅ Specialization & experience  
✅ Bio & workplace  
✅ Languages  
✅ Hourly rate  
✅ Availability  
✅ Competency (COC, exam passed)  
✅ Verification badge (VERIFIED + date)  
✅ Reviews & ratings  

❌ Cannot see:
- License document URL
- Verification notes
- Password
- Verification logic

---

### **THERAPIST** Can See:
✅ Own full profile  
✅ License document URL  
✅ Verification status & notes  
✅ Appointments  
✅ Earnings  
✅ Reviews received  

❌ Cannot see:
- Other therapists' documents
- System verification logic

---

### **ADMIN** Can See:
✅ All therapist information  
✅ License documents  
✅ Verification notes  
✅ Verification status  
✅ System activity  
✅ Unverified/expired therapists  

❌ Cannot do:
- Manually approve therapists
- Modify verification status
- Delete verification records

---

## 6️⃣ Appointment Booking Flow

### Client Books Appointment with VERIFIED Therapist

```
Client searches therapists
        ↓
See only VERIFIED therapists
        ↓
Click on therapist profile
        ↓
View full verified credentials
        ↓
See education, license, competency ✓
        ↓
Book appointment button available
        ↓
Schedule session
```

### Client Cannot Book with Non-VERIFIED

```
PENDING Therapist
        ↓
NOT shown in search results
        ↓
Profile not accessible
        ↓
Cannot be selected for booking
        ↓
Error if attempted: "Therapist not found or not verified"
```

---

## 7️⃣ Response Examples

### List All Verified Therapists

```bash
GET /api/client/therapists
```

**Shows:**
- Basic professional info
- Specialization
- Experience
- Bio
- Workplace
- Rate
- Languages

---

### Get Detailed Verified Therapist Profile

```bash
GET /api/client/therapists/507f1f77bcf86cd799439012
```

**Shows:**
- All basic info
- **Education credentials**
- **License information**
- **Competency status**
- **Verification badge**
- **Reviews & ratings**
- **Availability schedule**

---

### Therapist Verification Status (Therapist Only)

```bash
GET /api/therapist/verification-status
```

**Shows (to the therapist):**
- Status: VERIFIED
- Notes: "Successfully verified as a licensed mental health professional"
- Verified Date
- License expiry date
- **Is eligible for appointments**: true

---

## 8️⃣ Example Verification Display

### When Both Education & License Are Verified

```json
{
  "education": {
    "field": "Clinical Psychology",      // Psychology, Clinical Psychology, Social Work
    "degreeType": "Master",               // Bachelor, Master, Doctorate, Diploma
    "institution": "Addis Ababa University",
    "graduationYear": 2015
  },

  "license": {
    "licenseNumber": "ETH-2015-PSY-001234",
    "issuingAuthority": "Ministry of Health",  // or Regional Bureau of Health
    "licenseExpiryDate": "2026-12-31"
  },

  "competency": {
    "hasCOC": true,
    "examPassed": true
  },

  "verification": {
    "status": "VERIFIED",
    "verifiedAt": "2026-04-13T12:30:00.000Z"
  }
}
```

---

## 9️⃣ Important Notes

1. **Verification is automatic** - Not manually approved by admin
2. **Credentials are verified** - Not fake or easily spoofable
3. **Education validated** - Must be Psychology/Clinical Psychology/Social Work
4. **License checked** - Valid from Ministry of Health or Regional Bureau
5. **Competency required** - Must have COC or equivalent exam
6. **Safety first** - Only verified therapists appear in search and can be booked
7. **Transparency** - Badge shows verification date and status
8. **Privacy** - License document URLs kept private for security

---

## 🔟 Summary Table

| What | List View | Detail View | Therapist Dashboard | Admin |
|-----|-----------|-------------|-------------------|-------|
| Name | ✅ | ✅ | ✅ | ✅ |
| Email | ✅ | ✅ | ✅ | ✅ |
| Education | ❌ | ✅ | ✅ | ✅ |
| License # | ❌ | ✅ | ✅ | ✅ |
| License Document | ❌ | ❌ | ✅ | ✅ |
| Verification Status | ❌ | ✅ | ✅ | ✅ |
| Verification Notes | ❌ | ❌ | 📝✅ | ✅ |
| Reviews | ❌ | ✅ | ✅ | ✅ |

---

This ensures:
- 🔒 **Security** - Sensitive data protected
- 🎓 **Trust** - Credentials verified and displayed
- 👥 **Privacy** - Personal documents kept private
- ✅ **Transparency** - Clear verification badges
