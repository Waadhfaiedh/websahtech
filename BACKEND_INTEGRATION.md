# Backend Integration Checklist - Medical Session System

## Overview

The frontend is ready to connect to your backend APIs. This document outlines all required endpoints and expected data formats.

---

## 📋 Required API Endpoints

### 1. Session Management

#### Create New Session

```
POST /patients/:patientId/sessions
Content-Type: application/json

Request Body:
{
  "sessionDate": "2026-04-30T10:00:00.000Z",
  "notes": "Follow-up session"
}

Response (201):
{
  "id": "session_123",
  "sessionId": "session_123",
  "patientId": "patient_456",
  "sessionDate": "2026-04-30T10:00:00.000Z",
  "notes": "Follow-up session",
  "createdAt": "2026-04-30T10:00:00Z",
  "examen_clinique": null,
  "examen_complementaire": null,
  "diagnostic": null,
  "conduite_a_tenir": null,
POST /doctors/patients/:patientId/sessions
}
```

#### Get Patient Sessions List

```
GET /patients/:patientId/sessions

Response (200):
{
  "sessions": [
    {
      "id": "session_123",
      "date": "2026-04-30",
      "notes": "Follow-up",
      "examen_clinique": { ... },
      "diagnostic": { ... },
      "physiotherapie": { ... },
      "conduite_a_tenir": { ... },
      "examen_complementaire": [...]
    },
    ...
GET /doctors/patients/:patientId/sessions
}
```

#### Get Single Session

```
GET /doctors/patients/:patientId/sessions/:sessionId

Response (200):
{
  "id": "session_123",
  "date": "2026-04-30",
  "notes": "Follow-up session",
  "examen_clinique": { ... },
  "diagnostic": { ... },
  "physiotherapie": { ... },
  "conduite_a_tenir": { ... },
  "examen_complementaire": [...]
GET /doctors/sessions/:sessionId
```

---

### 2. Form Data Endpoints

#### Save Examen Clinique

```
POST /sessions/:sessionId/examen-clinique
Content-Type: application/json

Request Body:
{
  "age": 45,
  "sexe": "MALE",
  "profession": "Engineer",
  "membreDominant": "DROIT",
  "activiteSportive": "Tennis",
  "couvertureSociale": "CNAM",
  "siegeDouleur": "Right shoulder",
  "irradiation": "Down the arm",
  "intensiteEVA": 7,
  "typeRythme": "mecanique",
  "facteurAggravant": "Overhead movements",
  "facteurSoulagement": "Rest",
  "debutDouleur": "progressif",
  "retentissementAVQ": true,
  "retentissementProfessionnel": false,
  "retentissementSommeil": false,
  "mobilite": {
    "antepu_active": 120,
    "antepu_passive": 140,
    "abduction_active": 80,
    "abduction_passive": 100,
    "retraction_active": 40,
    "retraction_passive": 50,
    "rot_ext_active": 60,
    "rot_ext_passive": 80,
    "rot_int_active": 70,
    "rot_int_passive": 85
  },
  "testsConflits": {
    "neer": true,
    "hawkins": true,
    "yocum": false
  },
  "testsTendineux": {
    "jobe": true,
    "patte": false,
    "gerber": false,
    "palmUp": true
  },
  "bilanFonctionnel": {
    "mainBouche": true,
    "mainTete": false,
    "mainNuque": false,
    "mainDos": false
  }
}
POST /doctors/sessions/:sessionId/examen-clinique
Response (200): { success: true }
```

#### Save Examen Complémentaire

```
POST /sessions/:sessionId/examen-complementaire
Content-Type: multipart/form-data
- date (string): YYYY-MM-DD
- file (file, optional): PDF or image file (max 5MB)

Response (200):
{
  "id": "exam_789",
  "type": "radiographie",
  "description": "Shoulder X-ray",
  "resultat": "Minimal degenerative changes",
  "date": "2026-04-30",
  "fileUrl": "https://cdn.example.com/files/exam_789.pdf"
POST /doctors/sessions/:sessionId/examen-complementaire
```

#### Delete Examen Complémentaire

```
DELETE /doctors/examen-complementaire/:examId

Response (200): { success: true }
```

#### Save Diagnostic

```
POST /sessions/:sessionId/diagnostic
Content-Type: application/json

Request Body:
{
POST /doctors/sessions/:sessionId/diagnostic
  "diagnostic": "Rotator cuff tear, likely supraspinatus involvement",
  "diagnosticDiff": "Could consider adhesive capsulitis",
  "severite": "severe",
  "observations": "Patient reports radiation down arm"
}

Response (200): { success: true }
```

#### Save Conduite à Tenir

```
POST /sessions/:sessionId/conduite-a-tenir
Content-Type: application/json

Request Body:
{
  "antalgiques": "Paracetamol 500mg x3/day",
  "antiInflammatoires": "Ibuprofen 400mg x3/day",
  "myorelaxants": "Cyclobenzaprine 5mg x2/day",
  "corticoides": "Only if necessary",
  "autresMedicaments": "Omeprazole 20mg for GI protection",
  "infiltration": true,
  "infiltrationDetail": "Cortisone infiltration in subacromial space",
  "ondesDeChoc": false,
  "arthroDistension": false,
  "chirurgie": false,
  "typeChirurgie": "",
POST /doctors/sessions/:sessionId/conduite-a-tenir
  "recommandations": "Avoid overhead activities for 2 weeks",
  "prochainRDV": "2026-05-14",
  "objectifs": "Reduce pain by 50%, improve ROM by 30°"
}

Response (200): { success: true }
```

#### Save Physiothérapie - Bilan

```
POST /doctors/sessions/:sessionId/physiotherapie/bilan
Content-Type: application/json

Request Body:
{
  "constantScore": {
    "douleur": 10,
    "activites": 12,
    "mobilite": 20,
    "force": 18
  },
  "quickDASH": {
    "q1": 2, "q2": 3, "q3": 2, "q4": 1, "q5": 2,
    "q6": 3, "q7": 2, "q8": 4, "q9": 1, "q10": 2, "q11": 2
  },
  "mobiliteArticulaire": {
    "antepulsion_active": 120,
    "antepulsion_passive": 140,
    "abduction_active": 80,
    "abduction_passive": 100,
    "retraction_active": 40,
    "retraction_passive": 50,
    "rot_ext_active": 60,
    "rot_ext_passive": 80,
    "rot_int_active": 70,
    "rot_int_passive": 85
  },
  "testingMusculaire": {
    "deltoides": 4,
    "sus_epineux": 3,
    "infra_epineux": 4,
    "sub_scapulaire": 5
  },
  "testsSpecifiques": {
    "jobe": true,
    "patte": true,
    "gerber": false,
POST /doctors/sessions/:sessionId/physiotherapie/bilan
    "hawkins": true
  }
}

Response (200): { success: true }
```

#### Save Physiothérapie - Protocole

```
POST /doctors/sessions/:sessionId/physiotherapie/protocole
Content-Type: application/json

Request Body:
{
  "objectifsCourt": "Reduce pain by 50%",
  "objectifsLong": "Full ROM recovery and return to tennis",
  "physiotherapieAntalgique": true,
  "massage": true,
  "balnéothérapie": false,
  "typesPhysio": "Ultrasound and TENS",
  "mobilisationsPassives": true,
  "mobilisationsActives": true,
  "renforcement": true,
  "proprioception": true,
  "exercicesDetail": "Pendulum exercises, wall slides, light resistance band work",
  "seancesParSemaine": 2,
  "dureeSemaines": 6,
POST /doctors/sessions/:sessionId/physiotherapie/protocole
  "typeOrthese": "Shoulder immobilizer sling"
}

Response (200): { success: true }
```

#### Save Physiothérapie - Résultats

```
POST /doctors/sessions/:sessionId/physiotherapie/resultat
Content-Type: application/json

Request Body:
{
  "constantScoreFinal": {
    "douleur": 12,
    "activites": 15,
    "mobilite": 28,
    "force": 22
  },
  "quickDASHFinal": {
    "q1": 1, "q2": 2, "q3": 1, "q4": 1, "q5": 1,
    "q6": 2, "q7": 1, "q8": 3, "q9": 1, "q10": 1, "q11": 1
  },
  "evaFinale": 4,
  "evolution": {
    "douleur": "amelioration",
    "mobilite": "amelioration",
    "force": "stable",
    "fonction": "amelioration"
  },
  "amplitudesFinales": {
    "antepulsion": 150,
    "abduction": 110,
    "rot_ext": 85,
    "rot_int": 90
  },
  "objectifsAtteints": true,
  "conclusionKine": "Good progress, patient compliant with exercises",
POST /doctors/sessions/:sessionId/physiotherapie/resultat
}

Response (200): { success: true }
```

---

### 3. Evolution Data

#### Get Patient Evolution Data

```
GET /patients/:patientId/evolution

Response (200):
{
  "sessions": [
    {
      "id": "session_1",
      "date": "2026-04-15",
      "physiotherapie": {
        "bilan": {
          "evaInitiale": 8,
          "constantScore": {
            "douleur": 10,
            "activites": 12,
            "mobilite": 20,
            "force": 18
          },
          "mobiliteArticulaire": {
            "antepulsion_active": 100,
            "abduction_active": 60
          }
        }
      }
    },
    {
      "id": "session_2",
      "date": "2026-04-30",
      "physiotherapie": {
        "bilan": {
          "evaInitiale": 6,
          "constantScore": {
            "douleur": 12,
            "activites": 15,
            "mobilite": 28,
            "force": 22
          },
          "mobiliteArticulaire": {
            "antepulsion_active": 120,
GET /doctors/patients/:patientId/evolution
          }
        }
      }
    }
  ]
}
```

---

## 🔐 Authentication

All endpoints require the Authorization header:

```
Authorization: Bearer <accessToken>
```

The token is automatically added by the axios interceptor in `src/services/api.js`

---

## 📊 Data Type Mappings

| Frontend Type  | Expected Backend                                                     | Notes              |
| -------------- | -------------------------------------------------------------------- | ------------------ |
| sexe           | "MALE" \| "FEMALE" \| "OTHER"                                        | Uppercase strings  |
| membreDominant | "DROIT" \| "GAUCHE"                                                  | French uppercase   |
| typeRythme     | "mecanique" \| "inflammatoire" \| "mixte"                            | Lowercase          |
| debutDouleur   | "progressif" \| "brutal"                                             | Lowercase          |
| severite       | "legere" \| "moderee" \| "severe"                                    | Lowercase          |
| typeEpaule     | "douloureuse" \| "hyperalgique" \| "pseudo-paralytique" \| "bloquee" | Lowercase          |
| evolution      | "amelioration" \| "stable" \| "aggravation"                          | Lowercase          |
| suitesDonnees  | "arret" \| "poursuite" \| "chirurgie"                                | Lowercase          |
| Scores         | 0-100 (integer)                                                      | Constant Score     |
| EVA            | 0-10 (integer)                                                       | Pain scale         |
| Angles         | 0-180 (integer)                                                      | Degrees            |
| QuickDASH      | 1-5 per question (integer)                                           | 11 questions total |

---

## ⚠️ Error Handling

Frontend expects error responses in this format:

```javascript
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

Example:

```javascript
// 400 Bad Request
{
  "message": "Invalid session date",
  "code": "INVALID_DATE"
}

// 404 Not Found
{
  "message": "Session not found",
  "code": "SESSION_NOT_FOUND"
}

// 500 Server Error
{
  "message": "Internal server error",
  "code": "SERVER_ERROR"
}
```

The frontend will display these messages in red toast notifications.

---

## 📁 File Upload Handling

For `POST /doctors/sessions/:sessionId/examen-complementaire`:

1. **File Validation (Frontend)**:
   - Accepted types: PDF, JPEG, PNG, JPG
   - Max size: 5MB
   - Rejected if wrong type or > 5MB

2. **Upload Format**:
   - Send as `multipart/form-data`
   - File field name: `file`
   - Should return `fileUrl` in response

3. **File Storage**:
   - Store files securely (private folder, CDN, S3, etc.)
   - Return public download URL

---

## 🧪 Testing Endpoints

### Quick Test Sequence:

1. **Create session**: POST `/doctors/patients/123/sessions`
   - Should return session with `id` field
2. **Save examen-clinique**: POST `/doctors/sessions/:sessionId/examen-clinique`
   - Send all required fields, verify `success: true`
3. **Add exam file**: POST `/doctors/sessions/:sessionId/examen-complementaire`
   - Upload a PDF file, verify `fileUrl` is returned
4. **Get evolution**: GET `/doctors/patients/123/evolution`
   - Should return array of sessions with metrics data

---

## 📝 Example cURL Commands

### Create Session

```bash
curl -X POST http://localhost:3000/patients/123/sessions \
  -H "Authorization: Bearer token123" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-04-30",
    "notes": "Follow-up session"
  }'
```

### Save Form Data

```bash
curl -X POST http://localhost:3000/sessions/session_123/diagnostic \
  -H "Authorization: Bearer token123" \
  -H "Content-Type: application/json" \
  -d '{
    "typeEpaule": "pseudo-paralytique",
    "diagnostic": "Rotator cuff tear",
    "severite": "severe"
  }'
```

### Upload File

```bash
curl -X POST http://localhost:3000/sessions/session_123/examen-complementaire \
  -H "Authorization: Bearer token123" \
  -F "type=radiographie" \
  -F "description=Shoulder X-ray" \
  -F "file=@shoulder.pdf"
```

---

## ✅ Implementation Checklist

Backend developer should:

- [ ] Create session collection/table with all fields
- [ ] Implement all 8 POST endpoints for form saves
- [ ] Implement GET endpoints for session retrieval
- [ ] Implement DELETE endpoint for exams
- [ ] Setup file upload handler (5MB limit validation)
- [ ] Return successful responses with proper format
- [ ] Handle errors with message + code structure
- [ ] Add proper error messages (not generic errors)
- [ ] Test file uploads (PDF + images)
- [ ] Validate all data types before saving
- [ ] Test with currency conversion if needed (for future billing)
- [ ] Setup CDN/S3 for file storage if using cloud
- [ ] Create database indices on frequently queried fields
- [ ] Setup audit logging for medical data modifications
- [ ] Configure HIPAA/GDPR compliance if required

---

**Last Updated**: April 30, 2026  
**Version**: 1.0  
**Frontend Ready**: ✅ Yes
