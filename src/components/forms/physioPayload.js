/**
 * physioPayload.js
 * Pure normalizer functions: front-end state shape → Prisma field names.
 * Each function returns the backend-ready payload plus a `_pendingBackend`
 * key that groups fields the form captures but the current schema/DTO doesn't
 * store yet (visible in the network tab, silently ignored by the backend).
 */

const num = (v) =>
  v !== "" && v !== null && v !== undefined ? Number(v) : undefined;

const clamp0 = (v) => Math.max(0, Number.parseInt(v, 10) || 0);

const str = (v) => (v !== null && v !== undefined ? JSON.stringify(v) : undefined);

const blank = (v) => (v && String(v).trim() ? v : undefined);

// ─── Bilan Kinésithérapique ───────────────────────────────────────────────────

export function normalizeBilanPayload(b = {}) {
  const ma  = b.mobiliteArticulaire  ?? {};
  const aq  = b.analyseQualitative   ?? {};
  const ts  = b.testsSpecifiques     ?? {};
  const bf  = b.bilanFonctionnel     ?? {};
  const tm  = b.testingMusculaire    ?? {};
  const simple = bf.testsSimples     ?? {};

  return {
    // ── Douleur ──────────────────────────────────────────────────────────────
    intensiteEVA:                num(b.intensiteEVA),
    siegeDouleur:                blank(b.siegeDouleur),
    irradiation:                 blank(b.irradiation),
    typeDouleur:                 blank(b.typeDouleur),
    facteurAggravant:            blank(b.facteurAggravant),
    facteurSoulageant:           blank(b.facteursoulageant),  // ⚠️ renamed: lowercase s → uppercase S
    debutDouleur:                blank(b.debutDouleur),
    retentissementAVQ:           b.retentissementAVQ,
    retentissementProfessionnel: b.retentissementProfessionnel,
    retentissementSommeil:       b.retentissementSommeil,

    // ── Scores (Json in DB — must be stringified) ─────────────────────────
    constantScore:  str(b.constantScore),
    quickDashScore: str(b.quickDASH),        // ⚠️ renamed: quickDASH → quickDashScore
    dashArabeScore: str(b.dashArabeScore),

    // ── ROM active — 7 movements (snake_case → camelCase + flatten) ────────
    antepulsionActive:     num(ma.antepulsion_active),
    extensionActive:       num(ma.extension_active),
    abductionActive:       num(ma.abduction_active),
    adductionActive:       num(ma.adduction_active),
    retractionActive:      num(ma.retraction_active),
    rotationExterneActive: num(ma.rot_ext_active),
    rotationInterneActive: num(ma.rot_int_active),

    // ── ROM passive — 7 movements ─────────────────────────────────────────
    antepulsionPassive:     num(ma.antepulsion_passive),
    extensionPassive:       num(ma.extension_passive),
    abductionPassive:       num(ma.abduction_passive),
    adductionPassive:       num(ma.adduction_passive),
    retractionPassive:      num(ma.retraction_passive),
    rotationExternePassive: num(ma.rot_ext_passive),
    rotationInternePassive: num(ma.rot_int_passive),

    // ── Analyse qualitative (nested → flat) ───────────────────────────────
    arcDouloureux:           aq.arcDouloureux,
    arcDouloureuxIntervalle: blank(aq.arcDouloureuxIntervalle),
    finDeCourse:             blank(aq.finDeCourse),

    // ── Cutané-trophique ──────────────────────────────────────────────────
    cutanePlaie:          b.cutanePlaie,
    cutaneCicatrice:      b.cutaneCicatrice,
    trophiqueOedeme:      b.trophiqueOedeme,
    trophiqueEpanchement: b.trophiqueEpanchement,
    peauAdherences:       b.peauAdherences,
    peauHypersensibilite: b.peauHypersensibilite,

    // ── Palpation — kept as nested JSON objects (schema stores as Json?) ───
    pointsOsseux:     b.pointsOsseux,
    ligaments:        b.ligaments,
    musclesPalpation: b.musclesPalpation,
    tendonsMTP:       b.tendonsMTP,

    // ── Posture / joints adjacents (schema stores as Json?) ───────────────
    morphoStatique:     b.morpho,               // ⚠️ renamed: morpho → morphoStatique
    scapuloThoracique:  b.scapuloThoracique,
    acromioClaviculaire: b.acromioClaviculaire,
    sternoClaviculaire: b.sternoClaviculaire,
    rachisCervical:     b.rachisCervical,
    coude:              b.coude,

    // ── Testing musculaire MRC (nested snake_case → flat, actual API field names)
    deltoideTesting:       num(tm.deltoide),
    supraEpineuxTesting:   num(tm.supra_epineux),   // actual DB column name
    infraEpineuxTesting:   num(tm.infra_epineux),
    subscapulaireTesting:  num(tm.subscapulaire),   // actual DB column name
    grandPectoralTesting:  num(tm.grand_pectoral),
    grandDorsalTesting:    num(tm.grand_dorsal),
    trapSuperieurTesting:  num(tm.trap_superieur),  // actual DB column name
    trapMoyenTesting:      num(tm.trap_moyen),      // actual DB column name
    trapInferieurTesting:  num(tm.trap_inferieur),  // actual DB column name
    denteleAntTesting:     num(tm.dentele_ant),     // actual DB column name
    longBicepsTesting:     num(tm.long_biceps),
    tricepsLongTesting:    num(tm.triceps_long),
    deficitMusculaire:      b.deficitMusculaire,
    asymetrieDroiteGauche:  b.asymetrieDroiteGauche,
    syntheseMusculaire:     b.syntheseMusculaire,

    // ── Analyse musculaire qualitative (Json objects) ─────────────────────
    amyotrophie:          b.amyotrophie,
    amyotrophiePresence:  b.amyotrophiePresence,
    contractures:         b.contractures,
    contracturesPresence: b.contracturesPresence,
    retractions:          b.retractions,
    retractionsPresence:  b.retractionsPresence,

    // ── Tests spécifiques (nested → flat, add "test" prefix) ──────────────
    testJobe:    ts.jobe,
    testPatte:   ts.patte,
    testGerber:  ts.gerber,
    testNeer:    ts.neer,
    testHawkins: ts.hawkins,

    // ── Bilan fonctionnel — testsSimples: string → boolean ────────────────
    mainBouche: simple.mainBouche !== "impossible",
    mainTete:   simple.mainTete   !== "impossible",
    mainNuque:  simple.mainNuque  !== "impossible",
    mainDos:    simple.mainDos    !== "impossible",

    sf12Score:    blank(b.sf12Score),
    observations: blank(b.observations),

    // ── bilanFonctionnel stored as Json column (confirmed from API response) ─
    bilanFonctionnel: {
      testsSimples:   bf.testsSimples   ?? {},
      constantScore:  bf.constantScore  ?? {},
      quickDashScore: bf.quickDashScore ?? {},
    },

    _pendingBackend: {}, // all bilan fields are now covered
  };
}

// ─── Protocole de Rééducation ─────────────────────────────────────────────────

export function normalizeProtocolePayload(p = {}) {
  return {
    // Objectifs & phase
    objectifsCourt:            blank(p.objectifsCourt),
    objectifsLong:             blank(p.objectifsLong),
    phaseActive:               blank(p.phaseActive),
    phaseDebutDate:            p.phaseDebutDate || undefined,
    phaseObjectifsSpecifiques: blank(p.phaseObjectifsSpecifiques),

    // Électrophysiothérapie
    tensAntalgique:        p.tensAntalgique,
    courantsExcitoMoteurs: p.courantsExcitoMoteurs,
    ultrasons:             p.ultrasons,
    ondesDeChoc:           p.ondesDeChoc,
    cryotherapie:          p.cryotherapie,
    thermotherapie:        p.thermotherapie,
    electrophysioAutre:    blank(p.electrophysioAutre),

    // Thérapie manuelle antalgique
    massageDecontracturant: p.massageDecontracturant,
    mtp:                    p.mtp,
    triggerPoints:          p.triggerPoints,
    drainageLymphatique:    p.drainageLymphatique,
    therapieManuAutre:      blank(p.therapieManuAutre),

    // Balnéothérapie & taping
    balneotherapie:          p.balneotherapie,
    balneotherapiePrecisions: blank(p.balneotherapiePrecisions),
    taping:                  p.taping,
    tapingType:              blank(p.tapingType),

    // Techniques manuelles kiné
    mobPassivesGlenoHumerales:     p.mobPassivesGlenoHumerales,
    mobPassivesScapulothoraciques: p.mobPassivesScapulothoraciques,
    maitlandGrade:                 blank(p.maitlandGrade),
    mulligan:                      p.mulligan,
    mobActivesAssistees:           p.mobActivesAssistees,
    pendulairesCodeman:            p.pendulairesCodeman,
    etirementsCapsulairesPost:     p.etirementsCapsulairesPost,
    etirementsCapsulairesAnt:      p.etirementsCapsulairesAnt,
    etirementsCapsulairesInf:      p.etirementsCapsulairesInf,
    pompagesCapsulaires:           p.pompagesCapsulaires,
    leveesDeTension:               p.leveesDeTension,
    techManuAutre:                 blank(p.techManuAutre),

    // Renforcement — ⚠️ form uses snake_case, schema uses camelCase
    renfIsometrique:          p.renf_isometrique,
    renfConcentrique:         p.renf_concentrique,
    renfExcentrique:          p.renf_excentrique,
    renfPliometrique:         p.renf_pliometrique,
    renfChaineCinOuverte:     p.renf_chaineCinOuverte,
    renfChaineCinFermee:      p.renf_chaineCinFermee,
    muscleCoiffe:             p.muscle_coiffe,
    muscleDeltoide:           p.muscle_deltoide,
    muscleStabilisateursScap: p.muscle_stabilisateursScap,
    muscleGrandPecGrandDorsal: p.muscle_grandPecGrandDorsal,
    muscleBicepsTriceps:      p.muscle_bicepsTriceps,
    renforcementAutre:        blank(p.renforcementAutre),

    // Contrôle moteur
    stabilisationScapDyn:    p.stabilisationScapDyn,
    recentrageGH:            p.recentrageGH,
    coordinationScapHum:     p.coordinationScapHum,
    proprioStatique:         p.proprioStatique,
    proprioDynamique:        p.proprioDynamique,
    travailPostural:         p.travailPostural,
    correctionCompensations: p.correctionCompensations,
    controleMoteurAutre:     blank(p.controleMoteurAutre),

    // Réathlétisation
    gestesSpecifiques:   p.gestesSpecifiques,
    pliometrieMS:        p.pliometrieMS,
    travailArme:         p.travailArme,
    reintegrationCharge: p.reintegrationCharge,

    // Exercices
    exercicesDetail: blank(p.exercicesDetail),

    // Critères de progression
    criteresRomFlexion:    p.criteresRomFlexion,
    criteresRomAbduction:  p.criteresRomAbduction,
    criteresRomRotExt:     p.criteresRomRotExt,
    criteresEvaMax:        p.criteresEvaMax,
    criteresConstantMin:   p.criteresConstantMin,
    criteresQuickDASHMax:  p.criteresQuickDASHMax,
    criteresSymetrieMin:   p.criteresSymetrieMin,
    criteresAbsenceCompIA: p.criteresAbsenceCompIA,
    criteresAutres:        blank(p.criteresAutres),

    // HEP
    hepPrescrit:         p.hepPrescrit,
    hepExercices:        blank(p.hepExercices),
    hepSeancesJour:      p.hepSeancesJour,
    hepRepetitions:      p.hepRepetitions,
    hepSeries:           p.hepSeries,
    hepFrequence:        blank(p.hepFrequence),
    hepConsignesDouleur: blank(p.hepConsignesDouleur),

    // Éducation thérapeutique
    eduPosturaux:            p.eduPosturaux,
    eduLoadManagement:       p.eduLoadManagement,
    eduSommeil:              p.eduSommeil,
    eduNeuroscienceDouleur:  p.eduNeuroscienceDouleur,
    eduActivitesEviter:      p.eduActivitesEviter,
    eduActivitesPrivilegier: p.eduActivitesPrivilegier,
    eduNotes:                blank(p.eduNotes),

    // Contre-indications
    ciMouvementsInterdits:    blank(p.ciMouvementsInterdits),
    ciDelaisPostChirurgicaux: blank(p.ciDelaisPostChirurgicaux),
    ciPathologiesAssociees:   blank(p.ciPathologiesAssociees),
    ciPostOp:                 p.ciPostOp,
    ciDateChirurgie:          p.ciDateChirurgie || undefined,
    ciTypeChirurgie:          blank(p.ciTypeChirurgie),

    // Fréquence & organisation
    seancesParSemaine:       p.seancesParSemaine,
    dureeSemaines:           p.dureeSemaines,
    dureeSeance:             p.dureeSeance,
    repartition:             blank(p.repartition),
    decroissanceProgressive: p.decroissanceProgressive,
    modalitesSevrage:        blank(p.modalitesSevrage),

    // Orthèse
    orthese:     p.orthese,
    typeOrthese: blank(p.typeOrthese),

    // ── Fields the schema has but the form doesn't expose yet ─────────────
    _pendingBackend: {
      physiotherapieAntalgique: undefined,
      typesPhysio:              undefined,
      massage:                  undefined,
      massageDetail:            undefined,
      mobilisationsPassives:    undefined,  // form uses sub-fields instead
      mobilisationsActives:     undefined,  // form uses sub-fields instead
      renforcement:             undefined,  // form uses sub-fields instead
      proprioception:           undefined,  // form uses sub-fields instead
      exerciceIds:              [],
      observations:             undefined,
    },
  };
}

// ─── Résultat Physiothérapie ──────────────────────────────────────────────────

export function normalizeResultatPayload(r = {}) {
  const af  = r.amplitudesFinales ?? {};
  const evo = r.evolution         ?? {};

  return {
    // DTO expects quickDASHFinal (capital DASH) — backend maps it to quickDashScoreFinal column
    constantScoreFinal: str(r.constantScoreFinal),
    quickDASHFinal:     str(r.quickDASHFinal),
    evaFinal:           r.evaFinale,

    // ⚠️ nested evolution → flat fields
    evolutionDouleur:  evo.douleur  || undefined,
    evolutionMobilite: evo.mobilite || undefined,
    evolutionForce:    evo.force    || undefined,
    evolutionFonction: evo.fonction || undefined,

    // ⚠️ nested amplitudesFinales → flat fields + rename
    antepulsionFinal:     clamp0(af.antepulsion),
    extensionFinal:       clamp0(af.extension),
    abductionFinal:       clamp0(af.abduction),
    adductionFinal:       clamp0(af.adduction),
    rotationExterneFinal: clamp0(af.rot_ext),
    rotationInterneFinal: clamp0(af.rot_int),

    objectifsAtteints: r.objectifsAtteints,
    conclusionKine:    blank(r.conclusionKine),
    suitesDonnees:     blank(r.suitesDonnees),

    _pendingBackend: {}, // all resultat fields are covered
  };
}

/** Strip the _pendingBackend key before the API call. */
export function stripPending(payload) {
  if (!payload) return payload;
  // eslint-disable-next-line no-unused-vars
  const { _pendingBackend, ...rest } = payload;
  return rest;
}
