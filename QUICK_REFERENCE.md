# Medical Session UI - Quick Reference Guide

## 🎯 What Was Built

A complete medical session management system for SAHTECK specialists with 5 comprehensive examination forms, charts, and workflow.

---

## 📁 File Structure

```
src/
├── pages/specialist/
│   ├── SessionDetailPage.jsx ........................ NEW: Main session editor
│   ├── PatientDetailPage.jsx ........................ MODIFIED: Added tabs & modal
│   └── ...
├── components/
│   ├── forms/ ...................................... NEW FOLDER
│   │   ├── ExamenCliniqueForm.jsx
│   │   ├── ExamenComplementaireForm.jsx
│   │   ├── DiagnosticForm.jsx
│   │   ├── ConduiteATenirForm.jsx
│   │   └── PhysiotherapieForm.jsx
│   ├── modals/ ..................................... NEW FOLDER
│   │   └── NewSessionModal.jsx
│   ├── charts/ ..................................... NEW FOLDER
│   │   └── EvolutionCharts.jsx
│   └── ...
├── App.jsx ......................................... MODIFIED: Added route
└── ...
```

---

## 🔗 Routes

| Route                                                 | Component         | Purpose                                     |
| ----------------------------------------------------- | ----------------- | ------------------------------------------- |
| `/specialist/patients/:id`                            | PatientDetailPage | Patient overview + session list + evolution |
| `/specialist/patients/:patientId/sessions/:sessionId` | SessionDetailPage | Edit medical session forms                  |

---

## 📋 Forms & Sections

### Examen Clinique (Clinical Exam)

- Interrogatoire, Douleur, Retentissement, Mobilité, Tests

### Examen Complémentaire (Lab/Imaging)

- Add exams with files
- Support: PDF + JPG/PNG, max 5MB

### Diagnostic

- Shoulder type selector (4 interactive cards)
- Diagnosis + differential diagnosis
- Severity level

### Conduite à Tenir (Treatment Plan)

- Medications (analgesics, antiflammatory, etc.)
- Local treatment (infiltration, shock waves, etc.)
- Surgery planning
- Recommendations & follow-up

### Physiothérapie (Rehabilitation)

**3 Sub-tabs:**

- **Bilan**: Constant Score, QuickDASH, ROM, muscle testing
- **Protocole**: Objectives, therapy type, exercise plan, duration
- **Résultats**: Final scores, evolution, amplitude changes, conclusion

---

## 🎨 Key Features

✅ **Two-column layout** - Sidebar navigation + form content  
✅ **Section status** - Green checkmarks show completed forms  
✅ **File uploads** - Drag-and-drop for exams (5MB limit)  
✅ **Auto-calculations** - Constant Score totals, QuickDASH scores  
✅ **Evolution charts** - 3 recharts showing progress:

- Pain (EVA) over sessions
- Function (Constant Score) over sessions
- ROM (Antépulsion + Abduction) over sessions

✅ **New session modal** - Create sessions with date + optional notes  
✅ **Toast notifications** - Success/error feedback  
✅ **Form persistence** - Data saved locally when switching sections

---

## 🚀 User Workflows

### Create New Session

1. Go to patient detail → **"Dossier médical"** tab
2. Click **"+ Nouvelle session"** button
3. Select date, enter optional notes
4. Click **"Créer"**
5. ✅ Redirected to new session editor

### Edit Session

1. Click any session card from the timeline
2. Select form section from left sidebar
3. Fill form fields
4. Click **"Sauvegarder"**
5. ✅ Success toast appears, form refreshes

### View Patient Evolution

1. Go to patient detail → **"Évolution"** tab
2. 📊 See 3 charts of patient progress
3. X-axis: session dates
4. Y-axis: score/degrees

---

## 💾 API Integration Points

### Session CRUD

```
POST /doctors/patients/:patientId/sessions
GET /doctors/patients/:id/sessions
GET /doctors/patients/:patientId/sessions/:sessionId
```

### Form Saves

```
POST /doctors/sessions/:sessionId/examen-clinique
POST /doctors/sessions/:sessionId/diagnostic
[... 5 more endpoints]
```

### Data Fetch

```
GET /doctors/patients/:patientId/evolution
```

### Files

```
POST /doctors/sessions/:sessionId/examen-complementaire (multipart/form-data)
DELETE /doctors/examen-complementaire/:id
```

---

## 🎯 Component Hierarchy

```
PatientDetailPage
├── [existing tabs: info, treatment, notes, reports]
├── NEW: "Dossier médical" tab
│   ├── "+ Nouvelle session" button → NewSessionModal
│   └── Sessions list (clickable cards)
│
├── NEW: "Évolution" tab
│   └── EvolutionCharts (3 responsive charts)
│
└── NewSessionModal (dialog overlay)
    ├── Date picker
    ├── Notes textarea
    └── Create/Cancel buttons

SessionDetailPage
├── Left Sidebar Navigation (5 icons + labels)
│   ├── Examen Clinique
│   ├── Examen Complémentaire
│   ├── Diagnostic
│   ├── Conduite à Tenir
│   └── Physiothérapie (with 3 sub-tabs)
│
└── Right Content Area
    ├── ExamenCliniqueForm
    ├── ExamenComplementaireForm
    ├── DiagnosticForm
    ├── ConduiteATenirForm
    └── PhysiotherapieForm
```

---

## 🎨 Design System

| Element       | Style                                  |
| ------------- | -------------------------------------- |
| Primary Color | `#3B82F6` (blue)                       |
| Success Color | `#10B981` (green)                      |
| Cards         | `.card` class (white, shadow, rounded) |
| Buttons       | `.btn-primary` / `.btn-secondary`      |
| Inputs        | `.input-field` (consistent styling)    |
| Toggles       | Pill-shaped, blue when active          |
| Loading       | Spinning border animation              |
| Forms         | Tailwind grid responsive layout        |

---

## 📊 Form Data Structure Example

```javascript
{
  // Examen Clinique
  age: 45,
  sexe: "MALE",
  profession: "Software Engineer",
  membreDominant: "DROIT",
  seizeDouleur: "Shoulder right",
  intensiteEVA: 7,
  mobilite: {
    antepu_active: 120,
    antepu_passive: 140,
    abduction_active: 80,
    // ...
  },
  testsConflits: { neer: true, hawkins: false, yocum: true },
  bilanFonctionnel: { mainBouche: true, mainTete: false, // ... },

  // Examen Complémentaire
  examen_complementaire: [{
    type: "radiographie",
    description: "X-ray shoulder",
    resultat: "Slight degenerative changes",
    date: "2026-04-30",
    fileUrl: "..."
  }],

  // Diagnostic
  diagnostic: {
    typeEpaule: "pseudo-paralytique",
    diagnostic: "Rotator cuff tear, likely supraspinatus",
    severite: "severe"
  },

  // Physiotherapie
  physiotherapie: {
    bilan: {
      constantScore: { douleur: 10, activites: 12, mobilite: 20, force: 18 },
      quickDASH: { q1: 2, q2: 3, /* ... */ },
      mobiliteArticulaire: { antepulsion_active: 120, /* ... */ },
      testingMusculaire: { deltoides: 4, /* ... */ }
    },
    protocole: {
      objectifsCourt: "Reduce pain...",
      seancesParSemaine: 2,
      dureeSemaines: 6
    },
    resultat: {
      constantScoreFinal: { /* ... */ },
      evolution: { douleur: "amelioration", /* ... */ },
      suitesDonnees: "poursuite"
    }
  }
}
```

---

## 🧪 Quick Test Checklist

- [ ] Create session → modal appears with date + notes
- [ ] Click form section → renders correct form, sidebar updates
- [ ] Fill form → save button works, shows loading spinner
- [ ] Try file upload → accepts PDF/images, rejects oversized files
- [ ] Switch sections → form data persists
- [ ] View patient evolution → charts appear if 2+ sessions exist
- [ ] Check error handling → API errors show toast notifications
- [ ] Test on mobile → layout remains usable

---

## 🔧 Customization Points

### Add New Form Section

1. Create component in `src/components/forms/NewSectionForm.jsx`
2. Add to `SECTIONS` array in SessionDetailPage.jsx
3. Add API endpoint handler
4. Update database schema if needed

### Change Colors

Edit Tailwind classes (e.g., `bg-primary` = `bg-blue-500`)

### Add Validation

Add validation logic in form components before `onSave()` call

### Modify Charts

Edit data transformation in EvolutionCharts.jsx, add/remove lines in recharts configuration

---

## 📞 Support

**API Response Expected Format:**

```javascript
// Session data
{
  id: "123",
  date: "2026-04-30",
  patientId: "456",
  examen_clinique: { /* form data */ },
  diagnostic: { /* form data */ },
  physiotherapie: { /* form data */ },
  // ...
}

// Evolution data
{
  sessions: [
    { date: "2026-04-15", evaInitiale: 8, constantScore: 45, /* ... */ },
    { date: "2026-04-30", evaInitiale: 6, constantScore: 55, /* ... */ }
  ]
}
```

---

**Last Updated**: April 30, 2026  
**Status**: ✅ Ready for Development/Testing
