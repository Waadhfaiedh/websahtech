import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export default function PhysiotherapieForm({ session, patient, onSave }) {
  const [activeSubTab, setActiveSubTab] = useState("bilan");
  const [saving, setSaving] = useState(false);
  const examenClinique =
    session?.examenClinique ?? session?.examen_clinique ?? {};
  const physiotherapie = session?.physiotherapie ?? {};
  const bilanKinesitherapique =
    physiotherapie.bilanKinesitherapique ?? physiotherapie.bilan ?? {};
  const protocoleReeducation =
    physiotherapie.protocoleReeducation ?? physiotherapie.protocole ?? {};
  const resultatPhysiotherapie = physiotherapie.resultat ?? {};

  const splitFullName = (fullName) => {
    const parts = String(fullName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return { firstName: "", lastName: "" };
    }

    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  };

  const getBmiInfo = (heightCm, weightKg) => {
    const height = Number.parseFloat(heightCm);
    const weight = Number.parseFloat(weightKg);

    if (!height || !weight || height <= 0 || weight <= 0) {
      return { value: null, category: "—", isNormal: false };
    }

    const value = weight / ((height / 100) * (height / 100));

    if (value < 18.5) {
      return { value, category: "Insuffisance pondérale", isNormal: false };
    }

    if (value <= 24.9) {
      return { value, category: "Normal", isNormal: true };
    }

    if (value <= 29.9) {
      return { value, category: "Surpoids", isNormal: false };
    }

    return { value, category: "Obésité", isNormal: false };
  };

  const { firstName, lastName } = splitFullName(patient?.fullName);
  const patientInfo = patient?.patient ?? {};

  const parseStoredJson = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value !== "string") return value;

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const defaultConstantScore = {
    douleur: 0,
    activites: 0,
    mobilite: 0,
    force: 0,
  };

  const defaultQuickDash = {
    q1: 1,
    q2: 1,
    q3: 1,
    q4: 1,
    q5: 1,
    q6: 1,
    q7: 1,
    q8: 1,
    q9: 1,
    q10: 1,
    q11: 1,
  };

  const buildInitialBilanData = () => {
    const initialBilanConstantScore = parseStoredJson(
      bilanKinesitherapique.constantScore,
      defaultConstantScore,
    );
    const initialBilanQuickDash = parseStoredJson(
      bilanKinesitherapique.quickDashScore,
      defaultQuickDash,
    );

    const rawSexe = examenClinique.sexe ?? patient?.gender ?? "mâle";
    let sexeValue = rawSexe;
    if (rawSexe === "MALE") sexeValue = "mâle";
    else if (rawSexe === "FEMALE") sexeValue = "femelle";
    const rawMembreDominant = examenClinique.membreDominant ?? "DROIT";
    const membreDominantValue =
      rawMembreDominant === "DROIT" || rawMembreDominant === "droite"
        ? "droite"
        : "gauche";
    const rawMembreAtteint = examenClinique.membreAtteint ?? "DROIT";
    const membreAtteintValue =
      rawMembreAtteint === "DROIT" || rawMembreAtteint === "droite"
        ? "droite"
        : "gauche";

    return {
      patientFirstName: firstName,
      patientLastName: lastName,
      age: examenClinique.age ?? patientInfo.age ?? patient?.age ?? "",
      sexe: sexeValue,
      taille:
        examenClinique.taille ?? patientInfo.height ?? patient?.height ?? "",
      poids:
        examenClinique.poids ?? patientInfo.weight ?? patient?.weight ?? "",
      membreDominant: membreDominantValue,
      membreAtteint: membreAtteintValue,
      frequenceSportPratiquee: examenClinique.frequenceSportPratiquee ?? "",
      intensitePratique: examenClinique.intensitePratique ?? 5,
      antecedentsMedicauxEnabled:
        examenClinique.antecedentsMedicauxEnabled ?? false,
      antecedentsMedicauxDetails:
        examenClinique.antecedentsMedicauxDetails ?? "",
      antecedentsChirurgicauxEnabled:
        examenClinique.antecedentsChirurgicauxEnabled ?? false,
      antecedentsChirurgicauxDetails:
        examenClinique.antecedentsChirurgicauxDetails ?? "",
      profession: examenClinique.profession ?? "",
      plainte: bilanKinesitherapique.plainte ?? examenClinique.plainte ?? "",
      historique:
        bilanKinesitherapique.historique ?? examenClinique.historique ?? "",
      siegeDouleur:
        bilanKinesitherapique.siegeDouleur ?? examenClinique.siegeDouleur ?? "",
      irradiation:
        bilanKinesitherapique.irradiation ?? examenClinique.irradiation ?? "",
      intensiteEVA:
        bilanKinesitherapique.intensiteEVA ?? examenClinique.intensiteEVA ?? 5,
      typeDouleur:
        bilanKinesitherapique.typeDouleur ??
        examenClinique.typeDouleur ??
        "mecanique",
      facteurAggravant:
        bilanKinesitherapique.facteurAggravant ??
        examenClinique.facteurAggravant ??
        "",
      facteurSoulagement:
        bilanKinesitherapique.facteurSoulagement ??
        examenClinique.facteurSoulagement ??
        "",
      debutDouleur:
        bilanKinesitherapique.debutDouleur ??
        examenClinique.debutDouleur ??
        "progressif",
      retentissementAVQ:
        bilanKinesitherapique.retentissementAVQ ??
        examenClinique.retentissementAVQ ??
        false,
      retentissementProfessionnel:
        bilanKinesitherapique.retentissementProfessionnel ??
        examenClinique.retentissementPro ??
        false,
      retentissementSommeil:
        bilanKinesitherapique.retentissementSommeil ??
        examenClinique.retentissementSommeil ??
        false,
      constantScore: initialBilanConstantScore,
      quickDASH: initialBilanQuickDash,
      dashArabeScore: parseStoredJson(
        bilanKinesitherapique.dashArabeScore,
        defaultQuickDash,
      ),
      mobiliteArticulaire: {
        antepulsion_active: bilanKinesitherapique.antepulsionActive ?? 0,
        antepulsion_passive: bilanKinesitherapique.antepulsionPassive ?? 0,
        extension_active: bilanKinesitherapique.extensionActive ?? 0,
        extension_passive: bilanKinesitherapique.extensionPassive ?? 0,
        abduction_active: bilanKinesitherapique.abductionActive ?? 0,
        abduction_passive: bilanKinesitherapique.abductionPassive ?? 0,
        adduction_active: bilanKinesitherapique.adductionActive ?? 0,
        adduction_passive: bilanKinesitherapique.adductionPassive ?? 0,
        retraction_active: bilanKinesitherapique.retractionActive ?? 0,
        retraction_passive: bilanKinesitherapique.retractionPassive ?? 0,
        rot_ext_active: bilanKinesitherapique.rotationExterneActive ?? 0,
        rot_ext_passive: bilanKinesitherapique.rotationExternePassive ?? 0,
        rot_int_active: bilanKinesitherapique.rotationInterneActive ?? 0,
        rot_int_passive: bilanKinesitherapique.rotationInternePassive ?? 0,
      },
      analyseQualitative: {
        arcDouloureux: bilanKinesitherapique.arcDouloureux ?? false,
        arcDouloureuxIntervalle:
          bilanKinesitherapique.arcDouloureuxIntervalle ?? "",
        finDeCourse: bilanKinesitherapique.finDeCourse ?? "souple",
      },

      testsSpecifiques: {
        jobe: bilanKinesitherapique.testJobe ?? false,
        patte: bilanKinesitherapique.testPatte ?? false,
        gerber: bilanKinesitherapique.testGerber ?? false,
        neer: bilanKinesitherapique.testNeer ?? false,
        hawkins: bilanKinesitherapique.testHawkins ?? false,
      },
      bilanFonctionnel: {
        testsSimples: {
          mainBouche: bilanKinesitherapique.bilanFonctionnelMainBoucheStatus ?? "effectue",
          mainTete: bilanKinesitherapique.bilanFonctionnelMainTeteStatus ?? "effectue",
          mainNuque: bilanKinesitherapique.bilanFonctionnelMainNuqueStatus ?? "effectue",
          mainDos: bilanKinesitherapique.bilanFonctionnelMainDosStatus ?? "effectue",
        },
        constantScore: {
          douleur: bilanKinesitherapique.bilanFonctionnelConstantDouleur ?? 0,
          activites: bilanKinesitherapique.bilanFonctionnelConstantActivites ?? 0,
          mobilite: bilanKinesitherapique.bilanFonctionnelConstantMobilite ?? 0,
          force: bilanKinesitherapique.bilanFonctionnelConstantForce ?? 0,
        },
        quickDashScore: Object.fromEntries(
          Array.from({ length: 11 }, (_, i) => [
            `q${i + 1}`,
            bilanKinesitherapique[`bilanFonctionnelQuickDash_q${i + 1}`] ?? 1,
          ])
        ),
      },
      observations: bilanKinesitherapique.observations ?? "",
      // Cutaneous / Trophic
      cutanePlaie: bilanKinesitherapique.cutanePlaie ?? false,
      cutaneCicatrice: bilanKinesitherapique.cutaneCicatrice ?? false,
      trophiqueOedeme: bilanKinesitherapique.trophiqueOedeme ?? false,
      trophiqueEpanchement: bilanKinesitherapique.trophiqueEpanchement ?? false,
      // Douleur objective (palpation)
      pointsOsseux: {
        acromion: {
          present: bilanKinesitherapique.acromionPresent ?? false,
          douleur: bilanKinesitherapique.acromionDouleur ?? false,
        },
        claviculeDistale: {
          present: bilanKinesitherapique.claviculeDistalePresent ?? false,
          douleur: bilanKinesitherapique.claviculeDistaleDouleur ?? false,
        },
        articulationAC: {
          present: bilanKinesitherapique.articulationACPresent ?? false,
          douleur: bilanKinesitherapique.articulationACDouleur ?? false,
        },
        processusCoracoide: {
          present: bilanKinesitherapique.processusCoracoidePresent ?? false,
          douleur: bilanKinesitherapique.processusCoracoideDouleur ?? false,
        },
        tuberculeMajeur: {
          present: bilanKinesitherapique.tuberculeMajeurPresent ?? false,
          douleur: bilanKinesitherapique.tuberculeMajeurDouleur ?? false,
        },
        tuberculeMineur: {
          present: bilanKinesitherapique.tuberculeMineurPresent ?? false,
          douleur: bilanKinesitherapique.tuberculeMineurDouleur ?? false,
        },
        sillonBicipital: {
          present: bilanKinesitherapique.sillonBicipitalPresent ?? false,
          douleur: bilanKinesitherapique.sillonBicipitalDouleur ?? false,
        },
      },
      ligaments: {
        acromioClaviculaire: {
          present: bilanKinesitherapique.acromioClaviculairePresent ?? false,
          douleur: bilanKinesitherapique.acromioClaviculaireDouleur ?? false,
        },
        coracoAcromial: {
          present: bilanKinesitherapique.coracoAcromialPresent ?? false,
          douleur: bilanKinesitherapique.coracoAcromialDouleur ?? false,
        },
        coracoClaviculaire: {
          present: bilanKinesitherapique.coracoClaviculairePresent ?? false,
          douleur: bilanKinesitherapique.coracoClaviculaireDouleur ?? false,
        },
      },
      musclesPalpation: {
        deltoide: {
          douleur: bilanKinesitherapique.deltoideDouleur ?? false,
          contracture: bilanKinesitherapique.deltoideContracture ?? false,
        },
        supra_epineux: {
          douleur: bilanKinesitherapique.supraEpineuxDouleur ?? false,
          contracture: bilanKinesitherapique.supraEpineuxContracture ?? false,
        },
        infra_epineux: {
          douleur: bilanKinesitherapique.infraEpineuxDouleur ?? false,
          contracture: bilanKinesitherapique.infraEpineuxContracture ?? false,
        },
        subscapulaire: {
          douleur: bilanKinesitherapique.subscapulaireDouleur ?? false,
          contracture: bilanKinesitherapique.subscapulaireContracture ?? false,
        },
        trapeze: {
          douleur: bilanKinesitherapique.trapezeDouleur ?? false,
          contracture: bilanKinesitherapique.trapezeContracture ?? false,
        },
        grandPectoral: {
          douleur: bilanKinesitherapique.grandPectoralDouleur ?? false,
          contracture: bilanKinesitherapique.grandPectoralContracture ?? false,
        },
        grandDorsal: {
          douleur: bilanKinesitherapique.grandDorsalDouleur ?? false,
          contracture: bilanKinesitherapique.grandDorsalContracture ?? false,
        },
      },
      tendonsMTP: {
        supra_epineux: {
          douleur: bilanKinesitherapique.tendonSupraDouleur ?? false,
          epaisseur: bilanKinesitherapique.tendonSupraEpaisseur ?? false,
        },
        infra_epineux: {
          douleur: bilanKinesitherapique.tendonInfraDouleur ?? false,
          epaisseur: bilanKinesitherapique.tendonInfraEpaisseur ?? false,
        },
        subscapulaire: {
          douleur: bilanKinesitherapique.tendonSubscapulaireDouleur ?? false,
          epaisseur:
            bilanKinesitherapique.tendonSubscapulaireEpaisseur ?? false,
        },
        long_biceps: {
          douleur: bilanKinesitherapique.tendonLongBicepsDouleur ?? false,
          epaisseur: bilanKinesitherapique.tendonLongBicepsEpaisseur ?? false,
        },
      },
      peauAdherences: bilanKinesitherapique.peauAdherences ?? false,
      peauHypersensibilite: bilanKinesitherapique.peauHypersensibilite ?? false,
      // Morpho-statique
      morpho: {
        deDosTesCervical: bilanKinesitherapique.deDosTesCervical ?? "",
        deDosTesCervicalAutre: bilanKinesitherapique.deDosTesCervicalAutre ?? "",
        deDosEpaules: bilanKinesitherapique.deDosEpaules ?? "",
        deDosEpaulesAutre: bilanKinesitherapique.deDosEpaulesAutre ?? "",
        deDosScapulas: bilanKinesitherapique.deDosScapulas ?? "",
        deDosScapulasAutre: bilanKinesitherapique.deDosScapulasAutre ?? "",
        deDosAmyotrophie: bilanKinesitherapique.deDosAmyotrophie ?? "",
        deDosAmyotrophieAutre: bilanKinesitherapique.deDosAmyotrophieAutre ?? "",
        deDosRachis: bilanKinesitherapique.deDosRachis ?? "",
        deDosRachisAutre: bilanKinesitherapique.deDosRachisAutre ?? "",
        deDosBassin: bilanKinesitherapique.deDosBassin ?? "",
        deDosBassinAutre: bilanKinesitherapique.deDosBassinAutre ?? "",
        deDosMembresSup: bilanKinesitherapique.deDosMembresSup ?? "",
        deDosMembresSuperieursAutre: bilanKinesitherapique.deDosMembresSuperieursAutre ?? "",
        deDosAchille: bilanKinesitherapique.deDosAchille ?? "",
        deDosAchilleAutre: bilanKinesitherapique.deDosAchilleAutre ?? "",
        deFaceTete: bilanKinesitherapique.deFaceTete ?? "",
        deFaceTeteAutre: bilanKinesitherapique.deFaceTeteAutre ?? "",
        deFaceEpaule: bilanKinesitherapique.deFaceEpaule ?? "",
        deFaceEpauleAutre: bilanKinesitherapique.deFaceEpauleAutre ?? "",
        deFaceClavicule: bilanKinesitherapique.deFaceClavicule ?? "",
        deFaceClaviculeAutre: bilanKinesitherapique.deFaceClaviculeAutre ?? "",
        deFaceThorax: bilanKinesitherapique.deFaceThorax ?? "",
        deFaceThoraxAutre: bilanKinesitherapique.deFaceThoraxAutre ?? "",
        deFaceRachis: bilanKinesitherapique.deFaceRachis ?? "",
        deFaceRachisAutre: bilanKinesitherapique.deFaceRachisAutre ?? "",
        deFaceBassin: bilanKinesitherapique.deFaceBassin ?? "",
        deFaceBassinAutre: bilanKinesitherapique.deFaceBassinAutre ?? "",
        deFaceHanches: bilanKinesitherapique.deFaceHanches ?? "",
        deFaceHanchesAutre: bilanKinesitherapique.deFaceHanchesAutre ?? "",
        deFaceGenoux: bilanKinesitherapique.deFaceGenoux ?? "",
        deFaceGenouxAutre: bilanKinesitherapique.deFaceGenouxAutre ?? "",
        deFacePieds: bilanKinesitherapique.deFacePieds ?? "",
        deFacePiedsAutre: bilanKinesitherapique.deFacePiedsAutre ?? "",
        deProfilTete: bilanKinesitherapique.deProfilTete ?? "",
        deProfilTeteAutre: bilanKinesitherapique.deProfilTeteAutre ?? "",
        deProfilEpaule: bilanKinesitherapique.deProfilEpaule ?? "",
        deProfilEpauleAutre: bilanKinesitherapique.deProfilEpauleAutre ?? "",
        deProfilThorax: bilanKinesitherapique.deProfilThorax ?? "",
        deProfilThoraxAutre: bilanKinesitherapique.deProfilThoraxAutre ?? "",
        deProfilLombaires: bilanKinesitherapique.deProfilLombaires ?? "",
        deProfilLombairesAutre: bilanKinesitherapique.deProfilLombairesAutre ?? "",
        deProfilBassin: bilanKinesitherapique.deProfilBassin ?? "",
        deProfilBassinAutre: bilanKinesitherapique.deProfilBassinAutre ?? "",
        deProfilHanches: bilanKinesitherapique.deProfilHanches ?? "",
        deProfilHanchesAutre: bilanKinesitherapique.deProfilHanchesAutre ?? "",
        deProfilGenoux: bilanKinesitherapique.deProfilGenoux ?? "",
        deProfilGenouxAutre: bilanKinesitherapique.deProfilGenouxAutre ?? "",
        deProfilChevilles: bilanKinesitherapique.deProfilChevilles ?? "",
        deProfilChevillesAutre: bilanKinesitherapique.deProfilChevillesAutre ?? "",
        deProfilCentreGravite: bilanKinesitherapique.deProfilCentreGravite ?? "",
        deProfilCentreGraviteAutre: bilanKinesitherapique.deProfilCentreGraviteAutre ?? "",
      },
      // Scapulo-thoracique & articulations voisines
      scapuloThoracique: {
        elevationScapulaire: bilanKinesitherapique.elevationScapulaire ?? "",
        abaissementScapulaire:
          bilanKinesitherapique.abaissementScapulaire ?? "",
        abductionScapulaire: bilanKinesitherapique.abductionScapulaire ?? "",
        adductionScapulaire: bilanKinesitherapique.adductionScapulaire ?? "",
        sonnetteInterne: bilanKinesitherapique.sonnetteInterne ?? "",
        sonnetteExterne: bilanKinesitherapique.sonnetteExterne ?? "",
        mobiliteScapulaire:
          bilanKinesitherapique.mobiliteScapulaire ?? "Normale",
        dyskinésieScapulaire:
          bilanKinesitherapique.dyskinesieScapulaire ?? false,
      },
      acromioClaviculaire: {
        mobilite: bilanKinesitherapique.acromioMobilite ?? "Libre",
        douleur: bilanKinesitherapique.acromioDouleur ?? false,
      },
      sternoClaviculaire: {
        mobilite: bilanKinesitherapique.sternoMobilite ?? "Libre",
        douleur: bilanKinesitherapique.sternoDouleur ?? false,
      },
      rachisCervical: {
        flexion: bilanKinesitherapique.flexionCervicale ?? "",
        extension: bilanKinesitherapique.extensionCervicale ?? "",
        rotationDroite: bilanKinesitherapique.rotationDroite ?? "",
        rotationGauche: bilanKinesitherapique.rotationGauche ?? "",
        douleur: bilanKinesitherapique.rachisDouleur ?? false,
      },
      coude: {
        flexion: bilanKinesitherapique.flexionCoude ?? "",
        extension: bilanKinesitherapique.extensionCoude ?? "",
        pronation: bilanKinesitherapique.pronation ?? "",
        supination: bilanKinesitherapique.supination ?? "",
        mobilite: bilanKinesitherapique.coudeMobilite ?? "Normale",
      },
      // Musculaire qualitatif
      amyotrophie: {
        deltoide: bilanKinesitherapique.amyotrophieDeltoide ?? "",
        supra_epineux: bilanKinesitherapique.amyotrophieSupra ?? "",
        infra_epineux: bilanKinesitherapique.amyotrophieInfra ?? "",
        subscapulaire: bilanKinesitherapique.amyotrophieSubscapulaire ?? "",
        trapeze: bilanKinesitherapique.amyotrophieTrapeze ?? "",
      },
      amyotrophiePresence: bilanKinesitherapique.amyotrophiePresence ?? false,
      contractures: {
        deltoide: bilanKinesitherapique.contractureDeltoide ?? "",
        trapezeSuperieur: bilanKinesitherapique.contractureTrapeze ?? "",
        grandPectoral: bilanKinesitherapique.contractureGrandPectoral ?? "",
        grandDorsal: bilanKinesitherapique.contractureGrandDorsal ?? "",
      },
      contracturesPresence: bilanKinesitherapique.contracturesPresence ?? false,
      retractions: {
        grandPectoral: bilanKinesitherapique.retractionGrandPectoral ?? "",
        grandDorsal: bilanKinesitherapique.retractionGrandDorsal ?? "",
        capsulePosterieure: bilanKinesitherapique.retractionCapsulePost ?? "",
      },
      retractionsPresence: bilanKinesitherapique.retractionsPresence ?? false,
      // Quantitatif - testing musculaire (MRC)
      testingMusculaire: {
        supra_epineux: bilanKinesitherapique.supraEpineuxTesting ?? 3,
        infra_epineux: bilanKinesitherapique.infraEpineuxTesting ?? 3,
        subscapulaire: bilanKinesitherapique.subscapulaireTesting ?? 3,
        deltoide: bilanKinesitherapique.deltoideTesting ?? 3,
        grand_pectoral: bilanKinesitherapique.grandPectoralTesting ?? 3,
        grand_dorsal: bilanKinesitherapique.grandDorsalTesting ?? 3,
        trap_superieur: bilanKinesitherapique.trapSuperieurTesting ?? 3,
        trap_moyen: bilanKinesitherapique.trapMoyenTesting ?? 3,
        trap_inferieur: bilanKinesitherapique.trapInferieurTesting ?? 3,
        dentele_ant: bilanKinesitherapique.denteleAntTesting ?? 3,
        long_biceps: bilanKinesitherapique.longBicepsTesting ?? 3,
        triceps_long: bilanKinesitherapique.tricepsLongTesting ?? 3,
        deltoides: bilanKinesitherapique.deltoideTesting ?? 3,
      },
      deficitMusculaire: bilanKinesitherapique.deficitMusculaire ?? false,
      asymetrieDroiteGauche:
        bilanKinesitherapique.asymetrieDroiteGauche ?? false,
      syntheseMusculaire: {
        musclesDeficitaires: bilanKinesitherapique.musclesDeficitaires ?? "",
        musclesRetractes: bilanKinesitherapique.musclesRetractes ?? "",
        musclesDouloureux: bilanKinesitherapique.musclesDouloureux ?? "",
      },
      // Qualité de vie
      sf12Score: bilanKinesitherapique.sf12Score ?? "",
    };
  };

  const buildInitialProtocolData = () => ({
    objectifsCourt: protocoleReeducation.objectifsCourt ?? "",
    objectifsLong: protocoleReeducation.objectifsLong ?? "",
    physiotherapieAntalgique:
      protocoleReeducation.physiotherapieAntalgique ?? false,
    massage: protocoleReeducation.massage ?? false,
    balneotherapie: protocoleReeducation.balneotherapie ?? false,
    typesPhysio: protocoleReeducation.typesPhysio ?? "",
    mobilisationsPassives: protocoleReeducation.mobilisationsPassives ?? false,
    mobilisationsActives: protocoleReeducation.mobilisationsActives ?? false,
    renforcement: protocoleReeducation.renforcement ?? false,
    proprioception: protocoleReeducation.proprioception ?? false,
    exercicesDetail: protocoleReeducation.exercicesDetail ?? "",
    seancesParSemaine: protocoleReeducation.seancesParSemaine ?? 2,
    dureeSemaines: protocoleReeducation.dureeSemaines ?? 6,
    orthese: protocoleReeducation.orthese ?? false,
    typeOrthese: protocoleReeducation.typeOrthese ?? "",
  });

  const buildInitialResultatData = () => ({
    constantScoreFinal: parseStoredJson(
      resultatPhysiotherapie.constantScoreFinal,
      defaultConstantScore,
    ),
    quickDASHFinal: parseStoredJson(
      resultatPhysiotherapie.quickDashScoreFinal,
      defaultQuickDash,
    ),
    evaFinale: resultatPhysiotherapie.evaFinal ?? 5,
    evolution: {
      douleur: resultatPhysiotherapie.evolutionDouleur ?? "stable",
      mobilite: resultatPhysiotherapie.evolutionMobilite ?? "stable",
      force: resultatPhysiotherapie.evolutionForce ?? "stable",
      fonction: resultatPhysiotherapie.evolutionFonction ?? "stable",
    },
    amplitudesFinales: {
      antepulsion: resultatPhysiotherapie.antepulsionFinal ?? 0,
      extension: resultatPhysiotherapie.extensionFinal ?? 0,
      abduction: resultatPhysiotherapie.abductionFinal ?? 0,
      adduction: resultatPhysiotherapie.adductionFinal ?? 0,
      rot_ext: resultatPhysiotherapie.rotationExterneFinal ?? 0,
      rot_int: resultatPhysiotherapie.rotationInterneFinal ?? 0,
    },
    objectifsAtteints: resultatPhysiotherapie.objectifsAtteints ?? false,
    conclusionKine: resultatPhysiotherapie.conclusionKine ?? "",
    suitesDonnees: resultatPhysiotherapie.suitesDonnees ?? "arret",
  });

  // Bilan kiné state
  const [bilanData, setBilanData] = useState(() => buildInitialBilanData());

  const bmiInfo = getBmiInfo(bilanData.taille, bilanData.poids);

  // Protocole state
  const [protocolData, setProtocolData] = useState(() =>
    buildInitialProtocolData(),
  );

  // Résultats state
  const [resultatData, setResultatData] = useState(() =>
    buildInitialResultatData(),
  );

  useEffect(() => {
    setBilanData(buildInitialBilanData());
    setProtocolData(buildInitialProtocolData());
    setResultatData(buildInitialResultatData());
  }, [session, patient]);

  const QUESTIONS_QUICKDASH = [
    "Votre prise de poids ou sac de courses",
    "Tâches ménagères",
    "Déplacement à pied",
    "Sommeil",
    "Travail habituel",
    "Loisirs",
    "Hygiène personnelle",
    "Tâches faisant appel à la force",
    "Activités visuelles rapides",
    "Gêne occasionnée",
    "Gêne au travail",
  ];

  const calculateConstantTotal = (scores) => {
    return scores.douleur + scores.activites + scores.mobilite + scores.force;
  };

  const handleBilanChange = (field, value) => {
    setBilanData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBilanQuestionChange = (question, value) => {
    setBilanData((prev) => ({
      ...prev,
      quickDASH: {
        ...prev.quickDASH,
        [question]: Number.parseInt(value) || 1,
      },
    }));
  };

  const handleMobiliteChange = (field, value) => {
    setBilanData((prev) => ({
      ...prev,
      mobiliteArticulaire: {
        ...prev.mobiliteArticulaire,
        [field]: Number.parseInt(value) || 0,
      },
    }));
  };

  const handleTestingChange = (muscle, value) => {
    setBilanData((prev) => ({
      ...prev,
      testingMusculaire: {
        ...prev.testingMusculaire,
        [muscle]: Number.parseInt(value) || 0,
      },
    }));
  };

  // MRC modal for testing musculaire (0-5)
  const [mrcModalOpen, setMrcModalOpen] = useState(false);
  const [mrcModalMuscle, setMrcModalMuscle] = useState(null);

  const openMrcModal = (muscle) => {
    setMrcModalMuscle(muscle);
    setMrcModalOpen(true);
  };

  const closeMrcModal = () => {
    setMrcModalMuscle(null);
    setMrcModalOpen(false);
  };

  const setMrcValue = (value) => {
    handleTestingChange(mrcModalMuscle, value);
    closeMrcModal();
  };

  const handleProtocolChange = (field, value) => {
    setProtocolData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResultatChange = (field, value) => {
    setResultatData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        bilan: bilanData,
        protocole: protocolData,
        resultat: resultatData,
        activeSubTab,
      });
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
        {["bilan", "protocole", "resultat"].map((tab) => {
          const tabLabels = {
            bilan: "Bilan kiné",
            protocole: "Protocole",
            resultat: "Résultats",
          };
          const tabLabel = tabLabels[tab];

          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSubTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      {/* BILAN KINÉ TAB */}
      {activeSubTab === "bilan" && (
        <div className="space-y-6">
          {/* Interrogatoire */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Interrogatoire</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="bilan-patient-first-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prénom du patient
                  </label>
                  <input
                    id="bilan-patient-first-name"
                    type="text"
                    value={bilanData.patientFirstName || ""}
                    readOnly
                    className="input-field bg-gray-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bilan-patient-last-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom du patient
                  </label>
                  <input
                    id="bilan-patient-last-name"
                    type="text"
                    value={bilanData.patientLastName || ""}
                    readOnly
                    className="input-field bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <label
                    htmlFor="bilan-taille"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Taille (cm)
                  </label>
                  <input
                    id="bilan-taille"
                    type="text"
                    value={bilanData.taille || ""}
                    onChange={(e) =>
                      handleBilanChange("taille", e.target.value)
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bilan-poids"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Poids (kg)
                  </label>
                  <input
                    id="bilan-poids"
                    type="text"
                    value={bilanData.poids || ""}
                    onChange={(e) => handleBilanChange("poids", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div
                  className={`self-start rounded-lg border px-3 py-2 ${bmiInfo.isNormal ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}
                >
                  <p className="text-[11px] font-medium text-gray-500 mb-0.5">
                    IMC
                  </p>
                  <p className="text-xl font-bold text-gray-900 leading-tight">
                    {bmiInfo.value === null ? "—" : bmiInfo.value.toFixed(1)}
                  </p>
                  <p
                    className={`text-xs font-medium ${bmiInfo.isNormal ? "text-green-700" : "text-amber-700"}`}
                  >
                    {bmiInfo.category}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Norme: 18,5 - 24,9
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="bilan-age"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Âge
                  </label>
                  <input
                    id="bilan-age"
                    type="number"
                    value={bilanData.age || ""}
                    onChange={(e) => handleBilanChange("age", e.target.value)}
                    className="input-field"
                    placeholder="Âge"
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-1">
                    Sexe
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sexe"
                        value="mâle"
                        checked={bilanData.sexe === "mâle"}
                        onChange={(e) =>
                          handleBilanChange("sexe", e.target.value)
                        }
                      />
                      <span className="text-sm">mâle</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sexe"
                        value="femelle"
                        checked={bilanData.sexe === "femelle"}
                        onChange={(e) =>
                          handleBilanChange("sexe", e.target.value)
                        }
                      />
                      <span className="text-sm">femelle</span>
                    </label>
                  </div>
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-1">
                    Membre dominant
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="membreDominant"
                        value="droite"
                        checked={bilanData.membreDominant === "droite"}
                        onChange={(e) =>
                          handleBilanChange("membreDominant", e.target.value)
                        }
                      />
                      <span className="text-sm">droite</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="membreDominant"
                        value="gauche"
                        checked={bilanData.membreDominant === "gauche"}
                        onChange={(e) =>
                          handleBilanChange("membreDominant", e.target.value)
                        }
                      />
                      <span className="text-sm">gauche</span>
                    </label>
                  </div>
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-1">
                    Membre lésé
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="membreAtteint"
                        value="droite"
                        checked={bilanData.membreAtteint === "droite"}
                        onChange={(e) =>
                          handleBilanChange("membreAtteint", e.target.value)
                        }
                      />
                      <span className="text-sm">droite</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="membreAtteint"
                        value="gauche"
                        checked={bilanData.membreAtteint === "gauche"}
                        onChange={(e) =>
                          handleBilanChange("membreAtteint", e.target.value)
                        }
                      />
                      <span className="text-sm">gauche</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="bilan-frequence-sport"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Fréquence de sport pratiquée
                  </label>
                  <input
                    id="bilan-frequence-sport"
                    type="text"
                    value={bilanData.frequenceSportPratiquee || ""}
                    onChange={(e) =>
                      handleBilanChange(
                        "frequenceSportPratiquee",
                        e.target.value,
                      )
                    }
                    className="input-field"
                    placeholder="Ex: 3 fois par semaine"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bilan-intensite-pratique"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Intensité
                  </label>
                  <input
                    id="bilan-intensite-pratique"
                    type="text"
                    value={bilanData.intensitePratique || ""}
                    onChange={(e) =>
                      handleBilanChange("intensitePratique", e.target.value)
                    }
                    className="input-field"
                    placeholder="Ex: Modérée"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bilan-profession"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Profession
                  </label>
                  <input
                    id="bilan-profession"
                    type="text"
                    value={bilanData.profession || ""}
                    onChange={(e) =>
                      handleBilanChange("profession", e.target.value)
                    }
                    className="input-field"
                    placeholder="Profession"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bilan-antecedents-medicaux"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Antécédents médicaux
                  </label>
                  <select
                    id="bilan-antecedents-medicaux"
                    value={bilanData.antecedentsMedicauxEnabled ? "oui" : "non"}
                    onChange={(e) =>
                      handleBilanChange(
                        "antecedentsMedicauxEnabled",
                        e.target.value === "oui",
                      )
                    }
                    className="input-field w-28"
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </select>
                </div>
                {bilanData.antecedentsMedicauxEnabled && (
                  <div className="md:col-span-2">
                    <textarea
                      id="bilan-antecedents-medicaux-details"
                      value={bilanData.antecedentsMedicauxDetails || ""}
                      onChange={(e) =>
                        handleBilanChange(
                          "antecedentsMedicauxDetails",
                          e.target.value,
                        )
                      }
                      className="input-field min-h-28"
                      placeholder="Décrire les antécédents médicaux"
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="bilan-antecedents-chirurgicaux"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Antécédents chirurgicaux
                  </label>
                  <select
                    id="bilan-antecedents-chirurgicaux"
                    value={
                      bilanData.antecedentsChirurgicauxEnabled ? "oui" : "non"
                    }
                    onChange={(e) =>
                      handleBilanChange(
                        "antecedentsChirurgicauxEnabled",
                        e.target.value === "oui",
                      )
                    }
                    className="input-field w-28"
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </select>
                </div>
                {bilanData.antecedentsChirurgicauxEnabled && (
                  <div className="md:col-span-2">
                    <textarea
                      id="bilan-antecedents-chirurgicaux-details"
                      value={bilanData.antecedentsChirurgicauxDetails || ""}
                      onChange={(e) =>
                        handleBilanChange(
                          "antecedentsChirurgicauxDetails",
                          e.target.value,
                        )
                      }
                      className="input-field min-h-28"
                      placeholder="Décrire les antécédents chirurgicaux"
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label
                    htmlFor="bilan-plainte"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Plainte principale
                  </label>
                  <input
                    id="bilan-plainte"
                    type="text"
                    value={bilanData.plainte || ""}
                    onChange={(e) =>
                      handleBilanChange("plainte", e.target.value)
                    }
                    className="input-field"
                    placeholder="Motif de consultation..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="bilan-historique"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Historique
                  </label>
                  <textarea
                    id="bilan-historique"
                    value={bilanData.historique || ""}
                    onChange={(e) =>
                      handleBilanChange("historique", e.target.value)
                    }
                    rows={3}
                    className="input-field resize-none"
                    placeholder="ATCD, contexte, chronologie..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bilan cutané trophique */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">
              Bilan cutané trophique
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Cutané
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bilanData.cutanePlaie}
                    onChange={(e) =>
                      handleBilanChange("cutanePlaie", e.target.checked)
                    }
                  />
                  <span className="text-sm">Plaie</span>
                </label>
                <label className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    checked={bilanData.cutaneCicatrice}
                    onChange={(e) =>
                      handleBilanChange("cutaneCicatrice", e.target.checked)
                    }
                  />
                  <span className="text-sm">Cicatrice</span>
                </label>
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Trophique
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bilanData.trophiqueOedeme}
                    onChange={(e) =>
                      handleBilanChange("trophiqueOedeme", e.target.checked)
                    }
                  />
                  <span className="text-sm">Œdème</span>
                </label>
                <label className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    checked={bilanData.trophiqueEpanchement}
                    onChange={(e) =>
                      handleBilanChange(
                        "trophiqueEpanchement",
                        e.target.checked,
                      )
                    }
                  />
                  <span className="text-sm">Épanchement</span>
                </label>
              </div>
            </div>
          </div>

          {/* Douleur */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Douleur</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="bilan-siege-douleur"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Siège de la douleur
                  </label>
                  <input
                    id="bilan-siege-douleur"
                    type="text"
                    value={bilanData.siegeDouleur || ""}
                    onChange={(e) =>
                      handleBilanChange("siegeDouleur", e.target.value)
                    }
                    className="input-field"
                    placeholder="Ex: Épaule droite"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bilan-irradiation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Irradiation
                  </label>
                  <input
                    id="bilan-irradiation"
                    type="text"
                    value={bilanData.irradiation || ""}
                    onChange={(e) =>
                      handleBilanChange("irradiation", e.target.value)
                    }
                    className="input-field"
                    placeholder="Irradiation vers..."
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bilan-intensite-eva"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Intensité EVA: {bilanData.intensiteEVA || 5}/10
                </label>
                <input
                  id="bilan-intensite-eva"
                  type="range"
                  value={bilanData.intensiteEVA || 5}
                  onChange={(e) =>
                    handleBilanChange(
                      "intensiteEVA",
                      Number.parseFloat(e.target.value),
                    )
                  }
                  min="0"
                  max="10"
                  step="0.5"
                  className="w-full"
                />
              </div>

              {/* Douleur objective - palpation */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  Douleur objective (palpation)
                </h4>
                <div className="text-sm text-gray-700 mb-2">
                  Points osseux (pression locale statique)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { key: "acromion", label: "Acromion" },
                    { key: "claviculeDistale", label: "Clavicule distale" },
                    { key: "articulationAC", label: "Articulation AC" },
                    { key: "processusCoracoide", label: "Processus coracoïde" },
                    { key: "tuberculeMajeur", label: "Tubercule majeur" },
                    { key: "tuberculeMineur", label: "Tubercule mineur" },
                    { key: "sillonBicipital", label: "Sillon bicipital" },
                  ].map((p) => (
                    <div key={p.key} className="flex items-center gap-3">
                      <label className="flex-1">{p.label}</label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bilanData.pointsOsseux[p.key].present}
                          onChange={(e) =>
                            setBilanData((prev) => ({
                              ...prev,
                              pointsOsseux: {
                                ...prev.pointsOsseux,
                                [p.key]: {
                                  ...prev.pointsOsseux[p.key],
                                  present: e.target.checked,
                                },
                              },
                            }))
                          }
                        />{" "}
                        Présent
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bilanData.pointsOsseux[p.key].douleur}
                          onChange={(e) =>
                            setBilanData((prev) => ({
                              ...prev,
                              pointsOsseux: {
                                ...prev.pointsOsseux,
                                [p.key]: {
                                  ...prev.pointsOsseux[p.key],
                                  douleur: e.target.checked,
                                },
                              },
                            }))
                          }
                        />{" "}
                        Douleur
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  Ligaments (friction)
                </div>
                <div className="flex gap-4 mt-2">
                  {[
                    {
                      key: "acromioClaviculaire",
                      label: "Acromio-claviculaire",
                    },
                    { key: "coracoAcromial", label: "Coraco-acromial" },
                    { key: "coracoClaviculaire", label: "Coraco-claviculaire" },
                  ].map((l) => (
                    <label key={l.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bilanData.ligaments[l.key].present}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            ligaments: {
                              ...prev.ligaments,
                              [l.key]: {
                                ...prev.ligaments[l.key],
                                present: e.target.checked,
                              },
                            },
                          }))
                        }
                      />{" "}
                      {l.label}
                      <input
                        type="checkbox"
                        checked={bilanData.ligaments[l.key].douleur}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            ligaments: {
                              ...prev.ligaments,
                              [l.key]: {
                                ...prev.ligaments[l.key],
                                douleur: e.target.checked,
                              },
                            },
                          }))
                        }
                      />{" "}
                      Douleur
                    </label>
                  ))}
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  Muscles (pétrissage) — Douleur / Contracture
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {[
                    { key: "deltoide", label: "Deltoïde" },
                    { key: "supra_epineux", label: "Supra-épineux" },
                    { key: "infra_epineux", label: "Infra-épineux" },
                    { key: "subscapulaire", label: "Subscapulaire" },
                    { key: "trapeze", label: "Trapèze" },
                    { key: "grandPectoral", label: "Grand pectoral" },
                    { key: "grandDorsal", label: "Grand dorsal" },
                  ].map((m) => (
                    <div key={m.key} className="flex items-center gap-3">
                      <div className="flex-1">{m.label}</div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bilanData.musclesPalpation[m.key].douleur}
                          onChange={(e) =>
                            setBilanData((prev) => ({
                              ...prev,
                              musclesPalpation: {
                                ...prev.musclesPalpation,
                                [m.key]: {
                                  ...prev.musclesPalpation[m.key],
                                  douleur: e.target.checked,
                                },
                              },
                            }))
                          }
                        />{" "}
                        Douleur
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            bilanData.musclesPalpation[m.key].contracture
                          }
                          onChange={(e) =>
                            setBilanData((prev) => ({
                              ...prev,
                              musclesPalpation: {
                                ...prev.musclesPalpation,
                                [m.key]: {
                                  ...prev.musclesPalpation[m.key],
                                  contracture: e.target.checked,
                                },
                              },
                            }))
                          }
                        />{" "}
                        Contracture
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  Tendons (MTP) — Douleur / Épaississement
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {[
                    { key: "supra_epineux", label: "Supra-épineux" },
                    { key: "infra_epineux", label: "Infra-épineux" },
                    { key: "subscapulaire", label: "Subscapulaire" },
                    { key: "long_biceps", label: "Long biceps" },
                  ].map((t) => (
                    <div key={t.key} className="flex items-center gap-3">
                      <div className="flex-1">{t.label}</div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bilanData.tendonsMTP[t.key].douleur}
                          onChange={(e) =>
                            setBilanData((prev) => ({
                              ...prev,
                              tendonsMTP: {
                                ...prev.tendonsMTP,
                                [t.key]: {
                                  ...prev.tendonsMTP[t.key],
                                  douleur: e.target.checked,
                                },
                              },
                            }))
                          }
                        />{" "}
                        Douleur
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bilanData.tendonsMTP[t.key].epaisseur}
                          onChange={(e) =>
                            setBilanData((prev) => ({
                              ...prev,
                              tendonsMTP: {
                                ...prev.tendonsMTP,
                                [t.key]: {
                                  ...prev.tendonsMTP[t.key],
                                  epaisseur: e.target.checked,
                                },
                              },
                            }))
                          }
                        />{" "}
                        Épaississement
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-sm">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={bilanData.peauAdherences}
                      onChange={(e) =>
                        handleBilanChange("peauAdherences", e.target.checked)
                      }
                    />{" "}
                    <span className="ml-2">Adhérences cutanées</span>
                  </label>
                  <label className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={bilanData.peauHypersensibilite}
                      onChange={(e) =>
                        handleBilanChange(
                          "peauHypersensibilite",
                          e.target.checked,
                        )
                      }
                    />{" "}
                    <span className="ml-2">Hypersensibilité</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Douleur
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: "mecanique", label: "Mécanique" },
                    { value: "inflammatoire", label: "Inflammatoire" },
                    { value: "mixte", label: "Mixte" },
                  ].map((item) => (
                    <label key={item.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="typeDouleur"
                        value={item.value}
                        checked={bilanData.typeDouleur === item.value}
                        onChange={(e) =>
                          handleBilanChange("typeDouleur", e.target.value)
                        }
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="bilan-facteur-aggravant"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Facteur aggravant
                  </label>
                  <input
                    id="bilan-facteur-aggravant"
                    type="text"
                    value={bilanData.facteurAggravant || ""}
                    onChange={(e) =>
                      handleBilanChange("facteurAggravant", e.target.value)
                    }
                    className="input-field"
                    placeholder="Ce qui aggrave..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="bilan-facteur-soulagement"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Facteur soulagement
                  </label>
                  <input
                    id="bilan-facteur-soulagement"
                    type="text"
                    value={bilanData.facteurSoulagement || ""}
                    onChange={(e) =>
                      handleBilanChange("facteurSoulagement", e.target.value)
                    }
                    className="input-field"
                    placeholder="Ce qui soulage..."
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Début de la douleur
                  </div>
                  <div className="flex gap-4">
                    {[
                      { value: "progressif", label: "Progressif" },
                      { value: "brutal", label: "Brutal" },
                    ].map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="radio"
                          name="debutDouleur"
                          value={item.value}
                          checked={bilanData.debutDouleur === item.value}
                          onChange={(e) =>
                            handleBilanChange("debutDouleur", e.target.value)
                          }
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">
                    Retentissement
                  </h5>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!bilanData.retentissementAVQ}
                        onChange={(e) =>
                          handleBilanChange(
                            "retentissementAVQ",
                            e.target.checked,
                          )
                        }
                      />
                      <span className="text-sm text-gray-700">
                        Activités de la vie quotidienne
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!bilanData.retentissementProfessionnel}
                        onChange={(e) =>
                          handleBilanChange(
                            "retentissementProfessionnel",
                            e.target.checked,
                          )
                        }
                      />
                      <span className="text-sm text-gray-700">
                        Professionnel
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!bilanData.retentissementSommeil}
                        onChange={(e) =>
                          handleBilanChange(
                            "retentissementSommeil",
                            e.target.checked,
                          )
                        }
                      />
                      <span className="text-sm text-gray-700">Sommeil</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bilan morpho-statique */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">
              Bilan morpho-statique
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800">De face</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">

                  {/* Tête / Cervical */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Tête / Cervical</label>
                    <select
                      value={bilanData.morpho.deFaceTete}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceTete: e.target.value, deFaceTeteAutre: e.target.value !== "Autre" ? "" : prev.morpho.deFaceTeteAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Alignement normal">Alignement normal</option>
                      <option value="Inclinaison droite">Inclinaison droite</option>
                      <option value="Inclinaison gauche">Inclinaison gauche</option>
                      <option value="Rotation droite">Rotation droite</option>
                      <option value="Rotation gauche">Rotation gauche</option>
                      <option value="Tête projetée antérieurement">Tête projetée antérieurement</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deFaceTete === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deFaceTeteAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceTeteAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Épaules */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Épaules</label>
                    <select
                      value={bilanData.morpho.deFaceEpaule}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceEpaule: e.target.value, deFaceEpauleAutre: e.target.value !== "Autre" ? "" : prev.morpho.deFaceEpauleAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Symétriques">Symétriques</option>
                      <option value="Épaule droite haute">Épaule droite haute</option>
                      <option value="Épaule gauche haute">Épaule gauche haute</option>
                      <option value="Antériorisation">Antériorisation</option>
                      <option value="Épaules enroulées">Épaules enroulées</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deFaceEpaule === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deFaceEpauleAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceEpauleAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Clavicules */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Clavicules</label>
                    <select
                      value={bilanData.morpho.deFaceClavicule}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceClavicule: e.target.value, deFaceClaviculeAutre: e.target.value !== "Autre" ? "" : prev.morpho.deFaceClaviculeAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Symétriques">Symétriques</option>
                      <option value="Asymétriques">Asymétriques</option>
                      <option value="Saillie acromio-claviculaire">Saillie acromio-claviculaire</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deFaceClavicule === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deFaceClaviculeAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceClaviculeAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Thorax */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Thorax</label>
                    <select
                      value={bilanData.morpho.deFaceThorax}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceThorax: e.target.value, deFaceThoraxAutre: e.target.value !== "Autre" ? "" : prev.morpho.deFaceThoraxAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normal">Normal</option>
                      <option value="Cyphose visible">Cyphose visible</option>
                      <option value="Thorax asymétrique">Thorax asymétrique</option>
                      <option value="Pectus excavatum">Pectus excavatum</option>
                      <option value="Pectus carinatum">Pectus carinatum</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deFaceThorax === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deFaceThoraxAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceThoraxAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Rachis */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Rachis</label>
                    <select
                      value={bilanData.morpho.deFaceRachis}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceRachis: e.target.value, deFaceRachisAutre: e.target.value !== "Autre" ? "" : prev.morpho.deFaceRachisAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Alignement normal">Alignement normal</option>
                      <option value="Attitude scoliotique">Attitude scoliotique</option>
                      <option value="Scoliose">Scoliose</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deFaceRachis === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deFaceRachisAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceRachisAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Bassin */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Bassin</label>
                    <select
                      value={bilanData.morpho.deFaceBassin}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceBassin: e.target.value, deFaceBassinAutre: e.target.value !== "Autre" ? "" : prev.morpho.deFaceBassinAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Alignement normal">Alignement normal</option>
                      <option value="Bascule droite">Bascule droite</option>
                      <option value="Bascule gauche">Bascule gauche</option>
                      <option value="Rotation bassin">Rotation bassin</option>
                      <option value="Antéversion">Antéversion</option>
                      <option value="Rétroversion">Rétroversion</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deFaceBassin === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deFaceBassinAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceBassinAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Hanches */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Hanches</label>
                    <select
                      value={bilanData.morpho.deFaceHanches}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceHanches: e.target.value, deFaceHanchesAutre: e.target.value !== "Autre" ? "" : prev.morpho.deFaceHanchesAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Alignement normal">Alignement normal</option>
                      <option value="Rotation interne">Rotation interne</option>
                      <option value="Rotation externe">Rotation externe</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deFaceHanches === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deFaceHanchesAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceHanchesAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Genoux */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Genoux</label>
                    <select
                      value={bilanData.morpho.deFaceGenoux}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceGenoux: e.target.value, deFaceGenouxAutre: e.target.value !== "Autre" ? "" : prev.morpho.deFaceGenouxAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normaux">Normaux</option>
                      <option value="Genu valgum">Genu valgum</option>
                      <option value="Genu varum">Genu varum</option>
                      <option value="Flexum">Flexum</option>
                      <option value="Recurvatum">Recurvatum</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deFaceGenoux === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deFaceGenouxAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFaceGenouxAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Pieds */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Pieds</label>
                    <select
                      value={bilanData.morpho.deFacePieds}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFacePieds: e.target.value, deFacePiedsAutre: e.target.value !== "Autre" ? "" : prev.morpho.deFacePiedsAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normaux">Normaux</option>
                      <option value="Pieds plats">Pieds plats</option>
                      <option value="Pieds creux">Pieds creux</option>
                      <option value="Pronation">Pronation</option>
                      <option value="Supination">Supination</option>
                      <option value="Hallux valgus">Hallux valgus</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deFacePieds === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deFacePiedsAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deFacePiedsAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800">De profil</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">

                  {/* Tête / Cou */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Tête / Cou</label>
                    <select
                      value={bilanData.morpho.deProfilTete}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilTete: e.target.value, deProfilTeteAutre: e.target.value !== "Autre" ? "" : prev.morpho.deProfilTeteAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normale">Normale</option>
                      <option value="Tête projetée antérieurement">Tête projetée antérieurement</option>
                      <option value="Hyperlordose cervicale">Hyperlordose cervicale</option>
                      <option value="Rectitude cervicale">Rectitude cervicale</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deProfilTete === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deProfilTeteAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilTeteAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Épaules */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Épaules</label>
                    <select
                      value={bilanData.morpho.deProfilEpaule}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilEpaule: e.target.value, deProfilEpauleAutre: e.target.value !== "Autre" ? "" : prev.morpho.deProfilEpauleAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normales">Normales</option>
                      <option value="Antépulsion">Antépulsion</option>
                      <option value="Rétropulsion">Rétropulsion</option>
                      <option value="Épaules enroulées">Épaules enroulées</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deProfilEpaule === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deProfilEpauleAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilEpauleAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Thorax */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Thorax</label>
                    <select
                      value={bilanData.morpho.deProfilThorax}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilThorax: e.target.value, deProfilThoraxAutre: e.target.value !== "Autre" ? "" : prev.morpho.deProfilThoraxAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normal">Normal</option>
                      <option value="Hypercyphose">Hypercyphose</option>
                      <option value="Dos plat">Dos plat</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deProfilThorax === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deProfilThoraxAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilThoraxAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Lombaires */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Lombaires</label>
                    <select
                      value={bilanData.morpho.deProfilLombaires}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilLombaires: e.target.value, deProfilLombairesAutre: e.target.value !== "Autre" ? "" : prev.morpho.deProfilLombairesAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normales">Normales</option>
                      <option value="Hyperlordose">Hyperlordose</option>
                      <option value="Rectitude lombaire">Rectitude lombaire</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deProfilLombaires === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deProfilLombairesAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilLombairesAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Bassin */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Bassin</label>
                    <select
                      value={bilanData.morpho.deProfilBassin}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilBassin: e.target.value, deProfilBassinAutre: e.target.value !== "Autre" ? "" : prev.morpho.deProfilBassinAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normal">Normal</option>
                      <option value="Antéversion">Antéversion</option>
                      <option value="Rétroversion">Rétroversion</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deProfilBassin === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deProfilBassinAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilBassinAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Hanches */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Hanches</label>
                    <select
                      value={bilanData.morpho.deProfilHanches}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilHanches: e.target.value, deProfilHanchesAutre: e.target.value !== "Autre" ? "" : prev.morpho.deProfilHanchesAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normales">Normales</option>
                      <option value="Flexum">Flexum</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deProfilHanches === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deProfilHanchesAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilHanchesAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Genoux */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Genoux</label>
                    <select
                      value={bilanData.morpho.deProfilGenoux}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilGenoux: e.target.value, deProfilGenouxAutre: e.target.value !== "Autre" ? "" : prev.morpho.deProfilGenouxAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normaux">Normaux</option>
                      <option value="Flexum">Flexum</option>
                      <option value="Recurvatum">Recurvatum</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deProfilGenoux === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deProfilGenouxAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilGenouxAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Chevilles / Pieds */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Chevilles / Pieds</label>
                    <select
                      value={bilanData.morpho.deProfilChevilles}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilChevilles: e.target.value, deProfilChevillesAutre: e.target.value !== "Autre" ? "" : prev.morpho.deProfilChevillesAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normaux">Normaux</option>
                      <option value="Équin">Équin</option>
                      <option value="Talus">Talus</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deProfilChevilles === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deProfilChevillesAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilChevillesAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Centre de gravité */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Centre de gravité</label>
                    <select
                      value={bilanData.morpho.deProfilCentreGravite}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilCentreGravite: e.target.value, deProfilCentreGraviteAutre: e.target.value !== "Autre" ? "" : prev.morpho.deProfilCentreGraviteAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normal">Normal</option>
                      <option value="Projection antérieure">Projection antérieure</option>
                      <option value="Projection postérieure">Projection postérieure</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deProfilCentreGravite === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deProfilCentreGraviteAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deProfilCentreGraviteAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800">De dos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">

                  {/* Tête / Cervical */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Tête / Cervical</label>
                    <select
                      value={bilanData.morpho.deDosTesCervical}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosTesCervical: e.target.value, deDosTesCervicalAutre: e.target.value !== "Autre" ? "" : prev.morpho.deDosTesCervicalAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Alignement normal">Alignement normal</option>
                      <option value="Inclinaison">Inclinaison</option>
                      <option value="Rotation">Rotation</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deDosTesCervical === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deDosTesCervicalAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosTesCervicalAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Épaules */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Épaules</label>
                    <select
                      value={bilanData.morpho.deDosEpaules}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosEpaules: e.target.value, deDosEpaulesAutre: e.target.value !== "Autre" ? "" : prev.morpho.deDosEpaulesAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Symétriques">Symétriques</option>
                      <option value="Épaule droite haute">Épaule droite haute</option>
                      <option value="Épaule gauche haute">Épaule gauche haute</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deDosEpaules === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deDosEpaulesAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosEpaulesAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Scapulas */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Scapulas</label>
                    <select
                      value={bilanData.morpho.deDosScapulas}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosScapulas: e.target.value, deDosScapulasAutre: e.target.value !== "Autre" ? "" : prev.morpho.deDosScapulasAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normales">Normales</option>
                      <option value="Scapula alata">Scapula alata</option>
                      <option value="Dyskinésie scapulaire">Dyskinésie scapulaire</option>
                      <option value="Abduction scapulaire">Abduction scapulaire</option>
                      <option value="Adduction scapulaire">Adduction scapulaire</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deDosScapulas === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deDosScapulasAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosScapulasAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Amyotrophie */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Amyotrophie</label>
                    <select
                      value={bilanData.morpho.deDosAmyotrophie}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosAmyotrophie: e.target.value, deDosAmyotrophieAutre: e.target.value !== "Autre" ? "" : prev.morpho.deDosAmyotrophieAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Trapèze">Trapèze</option>
                      <option value="Deltoïde">Deltoïde</option>
                      <option value="Supra-épineux">Supra-épineux</option>
                      <option value="Infra-épineux">Infra-épineux</option>
                      <option value="Fessiers">Fessiers</option>
                      <option value="Quadriceps">Quadriceps</option>
                      <option value="Mollets">Mollets</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deDosAmyotrophie === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deDosAmyotrophieAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosAmyotrophieAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Rachis */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Rachis</label>
                    <select
                      value={bilanData.morpho.deDosRachis}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosRachis: e.target.value, deDosRachisAutre: e.target.value !== "Autre" ? "" : prev.morpho.deDosRachisAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normal">Normal</option>
                      <option value="Scoliose">Scoliose</option>
                      <option value="Gibbosité">Gibbosité</option>
                      <option value="Hypercyphose">Hypercyphose</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deDosRachis === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deDosRachisAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosRachisAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Bassin */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Bassin</label>
                    <select
                      value={bilanData.morpho.deDosBassin}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosBassin: e.target.value, deDosBassinAutre: e.target.value !== "Autre" ? "" : prev.morpho.deDosBassinAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Alignement normal">Alignement normal</option>
                      <option value="Bascule">Bascule</option>
                      <option value="Rotation pelvienne">Rotation pelvienne</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deDosBassin === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deDosBassinAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosBassinAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Membres inférieurs */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Membres inférieurs</label>
                    <select
                      value={bilanData.morpho.deDosMembresSup}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosMembresSup: e.target.value, deDosMembresSuperieursAutre: e.target.value !== "Autre" ? "" : prev.morpho.deDosMembresSuperieursAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Alignement normal">Alignement normal</option>
                      <option value="Varus">Varus</option>
                      <option value="Valgus">Valgus</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deDosMembresSup === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deDosMembresSuperieursAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosMembresSuperieursAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                  {/* Tendons d'Achille */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">Tendons d'Achille</label>
                    <select
                      value={bilanData.morpho.deDosAchille}
                      onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosAchille: e.target.value, deDosAchilleAutre: e.target.value !== "Autre" ? "" : prev.morpho.deDosAchilleAutre } }))}
                      className="input-field"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Normaux">Normaux</option>
                      <option value="Valgus calcanéen">Valgus calcanéen</option>
                      <option value="Varus calcanéen">Varus calcanéen</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {bilanData.morpho.deDosAchille === "Autre" && (
                      <textarea placeholder="Précisez..." value={bilanData.morpho.deDosAchilleAutre} onChange={(e) => setBilanData((prev) => ({ ...prev, morpho: { ...prev.morpho, deDosAchilleAutre: e.target.value } }))} className="input-field" rows={2} />
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Mobilité articulaire */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Bilan articulaire</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-gray-700 py-2">
                      Analyse quantitative
                    </th>
                    <th className="text-center font-medium text-gray-700 py-2">
                      Actif (°)
                    </th>
                    <th className="text-center font-medium text-gray-700 py-2">
                      Passif (°)
                    </th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { key: "antepulsion", label: "Élévation antérieure" },
                    { key: "extension", label: "Extension" },
                    { key: "abduction", label: "Élévation latérale" },
                    { key: "adduction", label: "Adduction" },
                    { key: "rot_ext", label: "Rotation externe" },
                    { key: "rot_int", label: "Rotation interne" },
                  ].map((mov) => (
                    <tr key={mov.key} className="border-b">
                      <td className="py-2 text-gray-700">{mov.label}</td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={
                            bilanData.mobiliteArticulaire[`${mov.key}_active`]
                          }
                          onChange={(e) =>
                            handleMobiliteChange(
                              `${mov.key}_active`,
                              e.target.value,
                            )
                          }
                          className="input-field text-center w-20"
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={
                            bilanData.mobiliteArticulaire[`${mov.key}_passive`]
                          }
                          onChange={(e) =>
                            handleMobiliteChange(
                              `${mov.key}_passive`,
                              e.target.value,
                            )
                          }
                          className="input-field text-center w-20"
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
<br />
          {/* Analyse qualitative */}
            <h3 className="font-bold text-gray-900 mb-4">
              Analyse qualitative
            </h3>
            <div className="space-y-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  Arc douloureux :
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="arcDouloureux"
                      value="oui"
                      checked={!!bilanData.analyseQualitative?.arcDouloureux}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          analyseQualitative: {
                            ...prev.analyseQualitative,
                            arcDouloureux: e.target.value === "oui",
                          },
                        }))
                      }
                    />
                    <span className="text-sm">Oui</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="arcDouloureux"
                      value="non"
                      checked={!bilanData.analyseQualitative?.arcDouloureux}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          analyseQualitative: {
                            ...prev.analyseQualitative,
                            arcDouloureux: e.target.value === "oui",
                          },
                        }))
                      }
                    />
                    <span className="text-sm">Non</span>
                  </label>
                </div>

                <div className="mt-3">
                  <div className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalle
                  </div>
                  <input
                    type="text"
                    value={
                      bilanData.analyseQualitative?.arcDouloureuxIntervalle ||
                      ""
                    }
                    onChange={(e) =>
                      setBilanData((prev) => ({
                        ...prev,
                        analyseQualitative: {
                          ...prev.analyseQualitative,
                          arcDouloureuxIntervalle: e.target.value,
                        },
                      }))
                    }
                    className="input-field"
                    placeholder="Intervalle..."
                  />
                </div>
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  Fin de course
                </div>
                <div className="flex gap-4">
                  {[
                    { value: "souple", label: "Souple" },
                    { value: "dure", label: "Dure" },
                    { value: "douloureuse", label: "Douloureuse" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="finDeCourse"
                        value={opt.value}
                        checked={
                          bilanData.analyseQualitative?.finDeCourse ===
                          opt.value
                        }
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            analyseQualitative: {
                              ...prev.analyseQualitative,
                              finDeCourse: e.target.value,
                            },
                          }))
                        }
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
<br />
          {/* Scapulo-thoracique & articulations voisines */}
            <h3 className="font-bold text-gray-900 mb-4">
              Scapulo-thoracique et articulations voisines
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Élévation scapulaire"
                  value={bilanData.scapuloThoracique.elevationScapulaire}
                  onChange={(e) =>
                    setBilanData((prev) => ({
                      ...prev,
                      scapuloThoracique: {
                        ...prev.scapuloThoracique,
                        elevationScapulaire: e.target.value,
                      },
                    }))
                  }
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Abaissement"
                  value={bilanData.scapuloThoracique.abaissementScapulaire}
                  onChange={(e) =>
                    setBilanData((prev) => ({
                      ...prev,
                      scapuloThoracique: {
                        ...prev.scapuloThoracique,
                        abaissementScapulaire: e.target.value,
                      },
                    }))
                  }
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Abduction"
                  value={bilanData.scapuloThoracique.abductionScapulaire}
                  onChange={(e) =>
                    setBilanData((prev) => ({
                      ...prev,
                      scapuloThoracique: {
                        ...prev.scapuloThoracique,
                        abductionScapulaire: e.target.value,
                      },
                    }))
                  }
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Adduction"
                  value={bilanData.scapuloThoracique.adductionScapulaire}
                  onChange={(e) =>
                    setBilanData((prev) => ({
                      ...prev,
                      scapuloThoracique: {
                        ...prev.scapuloThoracique,
                        adductionScapulaire: e.target.value,
                      },
                    }))
                  }
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Sonnette interne"
                  value={bilanData.scapuloThoracique.sonnetteInterne}
                  onChange={(e) =>
                    setBilanData((prev) => ({
                      ...prev,
                      scapuloThoracique: {
                        ...prev.scapuloThoracique,
                        sonnetteInterne: e.target.value,
                      },
                    }))
                  }
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Sonnette externe"
                  value={bilanData.scapuloThoracique.sonnetteExterne}
                  onChange={(e) =>
                    setBilanData((prev) => ({
                      ...prev,
                      scapuloThoracique: {
                        ...prev.scapuloThoracique,
                        sonnetteExterne: e.target.value,
                      },
                    }))
                  }
                  className="input-field"
                />
                <select
                  value={bilanData.scapuloThoracique.mobiliteScapulaire}
                  onChange={(e) =>
                    setBilanData((prev) => ({
                      ...prev,
                      scapuloThoracique: {
                        ...prev.scapuloThoracique,
                        mobiliteScapulaire: e.target.value,
                      },
                    }))
                  }
                  className="input-field"
                >
                  <option value="Normale">Normale</option>
                  <option value="Limitée">Limitée</option>
                </select>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bilanData.scapuloThoracique.dyskinésieScapulaire}
                    onChange={(e) =>
                      setBilanData((prev) => ({
                        ...prev,
                        scapuloThoracique: {
                          ...prev.scapuloThoracique,
                          dyskinésieScapulaire: e.target.checked,
                        },
                      }))
                    }
                  />{" "}
                  <span>Dyskinésie scapulaire</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-medium">
                    Articulation acromio-claviculaire
                  </h4>
                  <select
                    value={bilanData.acromioClaviculaire.mobilite}
                    onChange={(e) =>
                      setBilanData((prev) => ({
                        ...prev,
                        acromioClaviculaire: {
                          ...prev.acromioClaviculaire,
                          mobilite: e.target.value,
                        },
                      }))
                    }
                    className="input-field mt-2"
                  >
                    <option value="Libre">Libre</option>
                    <option value="Limitée">Limitée</option>
                  </select>
                  <label className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={bilanData.acromioClaviculaire.douleur}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          acromioClaviculaire: {
                            ...prev.acromioClaviculaire,
                            douleur: e.target.checked,
                          },
                        }))
                      }
                    />{" "}
                    Douleur
                  </label>
                </div>
                <div>
                  <h4 className="font-medium">
                    Articulation sterno-claviculaire
                  </h4>
                  <select
                    value={bilanData.sternoClaviculaire.mobilite}
                    onChange={(e) =>
                      setBilanData((prev) => ({
                        ...prev,
                        sternoClaviculaire: {
                          ...prev.sternoClaviculaire,
                          mobilite: e.target.value,
                        },
                      }))
                    }
                    className="input-field mt-2"
                  >
                    <option value="Libre">Libre</option>
                    <option value="Limitée">Limitée</option>
                  </select>
                  <label className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={bilanData.sternoClaviculaire.douleur}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          sternoClaviculaire: {
                            ...prev.sternoClaviculaire,
                            douleur: e.target.checked,
                          },
                        }))
                      }
                    />{" "}
                    Douleur
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-medium">Rachis cervical</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Flexion"
                      value={bilanData.rachisCervical.flexion}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          rachisCervical: {
                            ...prev.rachisCervical,
                            flexion: e.target.value,
                          },
                        }))
                      }
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Extension"
                      value={bilanData.rachisCervical.extension}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          rachisCervical: {
                            ...prev.rachisCervical,
                            extension: e.target.value,
                          },
                        }))
                      }
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Rotation droite"
                      value={bilanData.rachisCervical.rotationDroite}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          rachisCervical: {
                            ...prev.rachisCervical,
                            rotationDroite: e.target.value,
                          },
                        }))
                      }
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Rotation gauche"
                      value={bilanData.rachisCervical.rotationGauche}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          rachisCervical: {
                            ...prev.rachisCervical,
                            rotationGauche: e.target.value,
                          },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <label className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={bilanData.rachisCervical.douleur}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          rachisCervical: {
                            ...prev.rachisCervical,
                            douleur: e.target.checked,
                          },
                        }))
                      }
                    />{" "}
                    Douleur
                  </label>
                </div>
                <div>
                  <h4 className="font-medium">Coude</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Flexion"
                      value={bilanData.coude.flexion}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          coude: { ...prev.coude, flexion: e.target.value },
                        }))
                      }
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Extension"
                      value={bilanData.coude.extension}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          coude: {
                            ...prev.coude,
                            extension: e.target.value,
                          },
                        }))
                      }
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Pronation"
                      value={bilanData.coude.pronation}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          coude: {
                            ...prev.coude,
                            pronation: e.target.value,
                          },
                        }))
                      }
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Supination"
                      value={bilanData.coude.supination}
                      onChange={(e) =>
                        setBilanData((prev) => ({
                          ...prev,
                          coude: {
                            ...prev.coude,
                            supination: e.target.value,
                          },
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <select
                    value={bilanData.coude.mobilite}
                    onChange={(e) =>
                      setBilanData((prev) => ({
                        ...prev,
                        coude: { ...prev.coude, mobilite: e.target.value },
                      }))
                    }
                    className="input-field mt-2"
                  >
                    <option value="Normale">Normale</option>
                    <option value="Limitée">Limitée</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bilan musculaire */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-6">Bilan musculaire</h3>

            {/* Qualitatif */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-800 text-base border-b border-gray-200 pb-2 mb-4">
                Qualitatif
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Amyotrophie (palpation)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      { key: "deltoide", label: "Deltoïde" },
                      { key: "supra_epineux", label: "Supra-épineux" },
                      { key: "infra_epineux", label: "Infra-épineux" },
                      { key: "subscapulaire", label: "Subscapulaire" },
                      { key: "trapeze", label: "Trapèze" },
                    ].map((m) => (
                      <input
                        key={m.key}
                        type="text"
                        placeholder={m.label}
                        value={bilanData.amyotrophie[m.key]}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            amyotrophie: {
                              ...prev.amyotrophie,
                              [m.key]: e.target.value,
                            },
                          }))
                        }
                        className="input-field"
                      />
                    ))}
                  </div>
                  <label className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={bilanData.amyotrophiePresence}
                      onChange={(e) =>
                        handleBilanChange("amyotrophiePresence", e.target.checked)
                      }
                    />{" "}
                    Présence
                  </label>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Contracture (pétrissage)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      { key: "deltoide", label: "Deltoïde" },
                      { key: "trapezeSuperieur", label: "Trapèze supérieur" },
                      { key: "grandPectoral", label: "Grand pectoral" },
                      { key: "grandDorsal", label: "Grand dorsal" },
                    ].map((c) => (
                      <input
                        key={c.key}
                        type="text"
                        placeholder={c.label}
                        value={bilanData.contractures[c.key]}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            contractures: {
                              ...prev.contractures,
                              [c.key]: e.target.value,
                            },
                          }))
                        }
                        className="input-field"
                      />
                    ))}
                  </div>
                  <label className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={bilanData.contracturesPresence}
                      onChange={(e) =>
                        handleBilanChange(
                          "contracturesPresence",
                          e.target.checked,
                        )
                      }
                    />{" "}
                    Présence
                  </label>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Rétraction musculaire
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      { key: "grandPectoral", label: "Grand pectoral" },
                      { key: "grandDorsal", label: "Grand dorsal" },
                      {
                        key: "capsulePosterieure",
                        label: "Capsule postérieure (fonctionnel)",
                      },
                    ].map((r) => (
                      <input
                        key={r.key}
                        type="text"
                        placeholder={r.label}
                        value={bilanData.retractions[r.key]}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            retractions: {
                              ...prev.retractions,
                              [r.key]: e.target.value,
                            },
                          }))
                        }
                        className="input-field"
                      />
                    ))}
                  </div>
                  <label className="flex items-center gap-3 mt-2">
                    <input
                      type="checkbox"
                      checked={bilanData.retractionsPresence}
                      onChange={(e) =>
                        handleBilanChange("retractionsPresence", e.target.checked)
                      }
                    />{" "}
                    Présence
                  </label>
                </div>
              </div>
            </div>

            {/* Quantitatif */}
            <div>
              <h4 className="font-semibold text-gray-800 text-base border-b border-gray-200 pb-2 mb-4">
                Quantitatif — Testing musculaire (Échelle MRC 0-5)
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Cliquer sur la note pour ouvrir la grille MRC
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "supra_epineux", label: "Supra-épineux (abduction)" },
                  {
                    key: "infra_epineux",
                    label: "Infra-épineux (rotation externe)",
                  },
                  {
                    key: "subscapulaire",
                    label: "Subscapulaire (rotation interne)",
                  },
                  { key: "deltoide", label: "Deltoïde" },
                  { key: "grand_pectoral", label: "Grand pectoral" },
                  { key: "grand_dorsal", label: "Grand dorsal" },
                  { key: "trap_superieur", label: "Trapèze supérieur" },
                  { key: "trap_moyen", label: "Trapèze moyen" },
                  { key: "trap_inferieur", label: "Trapèze inférieur" },
                  { key: "dentele_ant", label: "Dentelé antérieur" },
                  { key: "long_biceps", label: "Long biceps" },
                  { key: "triceps_long", label: "Triceps (long chef)" },
                ].map((m) => (
                  <div key={m.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {m.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openMrcModal(m.key)}
                        className="px-3 py-2 border rounded input-field w-28 text-center"
                      >
                        {bilanData.testingMusculaire?.[m.key] ?? "—"}
                      </button>
                      <span className="text-xs text-gray-500">(0-5)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bilan Fonctionnel */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Bilan Fonctionnel</h3>
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-100 p-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  Tests fonctionnels simples
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Effectué / Effectué avec difficulté / Impossible
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "mainBouche", label: "Main - bouche" },
                    { key: "mainTete", label: "Main - tête" },
                    { key: "mainNuque", label: "Main - nuque" },
                    { key: "mainDos", label: "Main - dos" },
                  ].map((item) => (
                    <div key={item.key}>
                      <label
                        htmlFor={`bilan-kine-simple-${item.key}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {item.label}
                      </label>
                      <select
                        id={`bilan-kine-simple-${item.key}`}
                        value={bilanData.bilanFonctionnel.testsSimples[item.key]}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            bilanFonctionnel: {
                              ...prev.bilanFonctionnel,
                              testsSimples: {
                                ...prev.bilanFonctionnel.testsSimples,
                                [item.key]: e.target.value,
                              },
                            },
                          }))
                        }
                        className="input-field"
                      >
                        <option value="effectue">Effectué</option>
                        <option value="difficulte">Effectué avec difficulté</option>
                        <option value="impossible">Impossible</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-4 space-y-6">
                <h4 className="font-medium text-gray-800">Tests spécifiques</h4>

                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Constant Score</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Douleur (0-15)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        value={bilanData.bilanFonctionnel.constantScore.douleur}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            bilanFonctionnel: {
                              ...prev.bilanFonctionnel,
                              constantScore: {
                                ...prev.bilanFonctionnel.constantScore,
                                douleur: Number.parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activités (0-20)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={bilanData.bilanFonctionnel.constantScore.activites}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            bilanFonctionnel: {
                              ...prev.bilanFonctionnel,
                              constantScore: {
                                ...prev.bilanFonctionnel.constantScore,
                                activites: Number.parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobilité (0-40)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={bilanData.bilanFonctionnel.constantScore.mobilite}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            bilanFonctionnel: {
                              ...prev.bilanFonctionnel,
                              constantScore: {
                                ...prev.bilanFonctionnel.constantScore,
                                mobilite: Number.parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Force (0-25)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={bilanData.bilanFonctionnel.constantScore.force}
                        onChange={(e) =>
                          setBilanData((prev) => ({
                            ...prev,
                            bilanFonctionnel: {
                              ...prev.bilanFonctionnel,
                              constantScore: {
                                ...prev.bilanFonctionnel.constantScore,
                                force: Number.parseInt(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3 mt-4">
                    <p className="text-sm font-medium text-primary">
                      Total:{" "}
                      {Object.values(bilanData.bilanFonctionnel.constantScore).reduce((a, b) => a + b, 0)}
                      /100
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-3">QuickDASH Score</h5>
                  <p className="text-xs text-gray-500 mb-3">
                    Répondre à chaque question (1-5): 1=Aucune difficulté, 5=Impossible
                  </p>
                  <div className="space-y-3">
                    {QUESTIONS_QUICKDASH.map((question, idx) => (
                      <div key={`kine-quickdash-${idx + 1}`}>
                        <label
                          htmlFor={`kine-quickdash-${idx + 1}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {idx + 1}. {question}
                        </label>
                        <select
                          id={`kine-quickdash-${idx + 1}`}
                          value={bilanData.bilanFonctionnel.quickDashScore[`q${idx + 1}`]}
                          onChange={(e) =>
                            setBilanData((prev) => ({
                              ...prev,
                              bilanFonctionnel: {
                                ...prev.bilanFonctionnel,
                                quickDashScore: {
                                  ...prev.bilanFonctionnel.quickDashScore,
                                  [`q${idx + 1}`]: Number.parseInt(e.target.value) || 1,
                                },
                              },
                            }))
                          }
                          className="input-field"
                        >
                          {[1, 2, 3, 4, 5].map((score) => (
                            <option key={score} value={score}>{score}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3 mt-4">
                    <p className="text-sm font-medium text-primary">
                      Total:{" "}
                      {Object.values(bilanData.bilanFonctionnel.quickDashScore).reduce((a, b) => a + b, 0)}
                      /55
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Qualité de vie (SF-12) */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">
              Bilan de qualité de vie
            </h3>
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">
                SF-12 (score global ou note)
              </div>
              <input
                type="text"
                value={bilanData.sf12Score}
                onChange={(e) => handleBilanChange("sf12Score", e.target.value)}
                className="input-field"
                placeholder="Score SF-12 / résumé"
              />
            </div>
          </div>

          {/* Observations */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Observations</h3>
            <textarea
              value={bilanData.observations}
              onChange={(e) =>
                handleBilanChange("observations", e.target.value)
              }
              rows={4}
              className="input-field resize-none"
              placeholder="Observations et notes cliniques..."
            />
          </div>
        </div>
      )}

      {/* PROTOCOLE TAB */}
      {activeSubTab === "protocole" && (
        <div className="space-y-6">
          {/* Objectifs */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Objectifs</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="protocole-objectifs-court"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Objectifs court terme
                </label>
                <textarea
                  id="protocole-objectifs-court"
                  value={protocolData.objectifsCourt}
                  onChange={(e) =>
                    handleProtocolChange("objectifsCourt", e.target.value)
                  }
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Objectifs court terme..."
                />
              </div>
              <div>
                <label
                  htmlFor="protocole-objectifs-long"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Objectifs long terme
                </label>
                <textarea
                  id="protocole-objectifs-long"
                  value={protocolData.objectifsLong}
                  onChange={(e) =>
                    handleProtocolChange("objectifsLong", e.target.value)
                  }
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Objectifs long terme..."
                />
              </div>
            </div>
          </div>

          {/* Moyens physio */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Moyens physio</h3>
            <div className="space-y-3">
              {[
                {
                  name: "physiotherapieAntalgique",
                  label: "Physiothérapie antalgique",
                },
                { name: "massage", label: "Massage" },
                { name: "balneotherapie", label: "Balnéothérapie" },
              ].map((item) => (
                <label key={item.name} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={protocolData[item.name]}
                    onChange={(e) =>
                      handleProtocolChange(item.name, e.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
              {(protocolData.physiotherapieAntalgique ||
                protocolData.massage ||
                protocolData.balneotherapie) && (
                <input
                  type="text"
                  value={protocolData.typesPhysio}
                  onChange={(e) =>
                    handleProtocolChange("typesPhysio", e.target.value)
                  }
                  className="input-field"
                  placeholder="Détails des modalités..."
                />
              )}
            </div>
          </div>

          {/* Programme kiné */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Programme kiné</h3>
            <div className="space-y-3 mb-4">
              {[
                {
                  name: "mobilisationsPassives",
                  label: "Mobilisations passives",
                },
                {
                  name: "mobilisationsActives",
                  label: "Mobilisations actives",
                },
                { name: "renforcement", label: "Renforcement musculaire" },
                { name: "proprioception", label: "Proprioception" },
              ].map((item) => (
                <label key={item.name} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={protocolData[item.name]}
                    onChange={(e) =>
                      handleProtocolChange(item.name, e.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
            <div>
              <label
                htmlFor="protocole-exercices-detail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Détails des exercices
              </label>
              <textarea
                id="protocole-exercices-detail"
                value={protocolData.exercicesDetail}
                onChange={(e) =>
                  handleProtocolChange("exercicesDetail", e.target.value)
                }
                rows={3}
                className="input-field resize-none"
                placeholder="Description des exercices..."
              />
            </div>
          </div>

          {/* Fréquence */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Fréquence</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="protocole-seances-par-semaine"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Séances par semaine
                </label>
                <input
                  id="protocole-seances-par-semaine"
                  type="number"
                  min="1"
                  value={protocolData.seancesParSemaine}
                  onChange={(e) =>
                    handleProtocolChange(
                      "seancesParSemaine",
                      Number.parseInt(e.target.value) || 1,
                    )
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="protocole-duree-semaines"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Durée (semaines)
                </label>
                <input
                  id="protocole-duree-semaines"
                  type="number"
                  min="1"
                  value={protocolData.dureeSemaines}
                  onChange={(e) =>
                    handleProtocolChange(
                      "dureeSemaines",
                      Number.parseInt(e.target.value) || 1,
                    )
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Orthèse */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Orthèse</h3>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="orthese"
                checked={protocolData.orthese}
                onChange={(e) =>
                  handleProtocolChange("orthese", e.target.checked)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  Orthèse prescrite
                </span>
                {protocolData.orthese && (
                  <input
                    type="text"
                    value={protocolData.typeOrthese}
                    onChange={(e) =>
                      handleProtocolChange("typeOrthese", e.target.value)
                    }
                    className="input-field mt-2"
                    placeholder="Type d'orthèse..."
                  />
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* RÉSULTATS TAB */}
      {activeSubTab === "resultat" && (
        <div className="space-y-6">
          {/* Constant Score Final */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">
              Constant Score Final
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="resultat-constant-douleur"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Douleur (0-15)
                </label>
                <input
                  id="resultat-constant-douleur"
                  type="number"
                  min="0"
                  max="15"
                  value={resultatData.constantScoreFinal.douleur}
                  onChange={(e) =>
                    handleResultatChange("constantScoreFinal", {
                      ...resultatData.constantScoreFinal,
                      douleur: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="resultat-constant-activites"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Activités (0-20)
                </label>
                <input
                  id="resultat-constant-activites"
                  type="number"
                  min="0"
                  max="20"
                  value={resultatData.constantScoreFinal.activites}
                  onChange={(e) =>
                    handleResultatChange("constantScoreFinal", {
                      ...resultatData.constantScoreFinal,
                      activites: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="resultat-constant-mobilite"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mobilité (0-40)
                </label>
                <input
                  id="resultat-constant-mobilite"
                  type="number"
                  min="0"
                  max="40"
                  value={resultatData.constantScoreFinal.mobilite}
                  onChange={(e) =>
                    handleResultatChange("constantScoreFinal", {
                      ...resultatData.constantScoreFinal,
                      mobilite: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="resultat-constant-force"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Force (0-25)
                </label>
                <input
                  id="resultat-constant-force"
                  type="number"
                  min="0"
                  max="25"
                  value={resultatData.constantScoreFinal.force}
                  onChange={(e) =>
                    handleResultatChange("constantScoreFinal", {
                      ...resultatData.constantScoreFinal,
                      force: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-sm font-medium text-primary">
                  Total:{" "}
                  {calculateConstantTotal(resultatData.constantScoreFinal)}/100
                </p>
              </div>
            </div>
          </div>

          {/* QuickDASH Final */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">QuickDASH Final</h3>
            <p className="text-xs text-gray-500 mb-4">
              Répondre à chaque question (1-5)
            </p>
            <div className="space-y-3">
              {QUESTIONS_QUICKDASH.map((question, idx) => (
                <div key={question}>
                  <label
                    htmlFor={`resultat-quickdash-q${idx + 1}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {idx + 1}. {question}
                  </label>
                  <select
                    id={`resultat-quickdash-q${idx + 1}`}
                    value={resultatData.quickDASHFinal[`q${idx + 1}`]}
                    onChange={(e) =>
                      setResultatData((prev) => ({
                        ...prev,
                        quickDASHFinal: {
                          ...prev.quickDASHFinal,
                          [`q${idx + 1}`]: Number.parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* EVA Final */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">EVA Final</h3>
            <label
              htmlFor="resultat-eva-finale"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Intensité: {resultatData.evaFinale}/10
            </label>
            <input
              id="resultat-eva-finale"
              type="range"
              value={resultatData.evaFinale}
              onChange={(e) =>
                handleResultatChange(
                  "evaFinale",
                  Number.parseInt(e.target.value),
                )
              }
              min="0"
              max="10"
              className="w-full"
            />
          </div>

          {/* Évolution */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Évolution</h3>
            <div className="space-y-4">
              {[
                { key: "douleur", label: "Douleur" },
                { key: "mobilite", label: "Mobilité" },
                { key: "force", label: "Force" },
                { key: "fonction", label: "Fonction" },
              ].map((item) => (
                <div key={item.key}>
                  <label
                    htmlFor={`resultat-evolution-${item.key}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {item.label}
                  </label>
                  <select
                    id={`resultat-evolution-${item.key}`}
                    value={resultatData.evolution[item.key]}
                    onChange={(e) =>
                      handleResultatChange("evolution", {
                        ...resultatData.evolution,
                        [item.key]: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="amelioration">Amélioration</option>
                    <option value="stable">Stable</option>
                    <option value="aggravation">Aggravation</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Amplitudes finales */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Amplitudes finales</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "antepulsion", label: "Élévation antérieure (°)" },
                { key: "extension", label: "Extension (°)" },
                { key: "abduction", label: "Élévation latérale (°)" },
                { key: "adduction", label: "Adduction (°)" },
                { key: "rot_ext", label: "Rotation externe (°)" },
                { key: "rot_int", label: "Rotation interne (°)" },
              ].map((amp) => (
                <div key={amp.key}>
                  <label
                    htmlFor={`resultat-amplitude-${amp.key}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {amp.label}
                  </label>
                  <input
                    id={`resultat-amplitude-${amp.key}`}
                    type="number"
                    min="0"
                    max="180"
                    value={resultatData.amplitudesFinales[amp.key]}
                    onChange={(e) =>
                      handleResultatChange("amplitudesFinales", {
                        ...resultatData.amplitudesFinales,
                        [amp.key]: Math.max(
                          0,
                          Number.parseInt(e.target.value) || 0,
                        ),
                      })
                    }
                    className="input-field"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Conclusion</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="objectifsAtteints"
                  checked={resultatData.objectifsAtteints}
                  onChange={(e) =>
                    handleResultatChange("objectifsAtteints", e.target.checked)
                  }
                />
                <span className="text-sm font-medium text-gray-700">
                  Objectifs atteints
                </span>
              </label>

              <div>
                <label
                  htmlFor="resultat-conclusion-kine"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Conclusion kiné
                </label>
                <textarea
                  id="resultat-conclusion-kine"
                  value={resultatData.conclusionKine}
                  onChange={(e) =>
                    handleResultatChange("conclusionKine", e.target.value)
                  }
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Conclusion de la rééducation..."
                />
              </div>

              <div>
                <label
                  htmlFor="resultat-suites-donnees"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Suites données
                </label>
                <select
                  id="resultat-suites-donnees"
                  value={resultatData.suitesDonnees}
                  onChange={(e) =>
                    handleResultatChange("suitesDonnees", e.target.value)
                  }
                  className="input-field"
                >
                  <option value="arret">Arrêt de la rééducation</option>
                  <option value="poursuite">Poursuite de la rééducation</option>
                  <option value="chirurgie">Orientation chirurgie</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      {/* MRC Modal */}
      {mrcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 mx-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-bold">
                  Échelle MRC — {mrcModalMuscle}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Choisir la note (0 = aucune contraction, 5 = force normale)
                </p>
              </div>
              <button onClick={closeMrcModal} className="text-gray-500">
                Fermer
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="text-sm text-gray-700">
                <div>
                  <strong>0</strong> = aucune contraction
                </div>
                <div>
                  <strong>1</strong> = contraction visible sans mouvement
                </div>
                <div>
                  <strong>2</strong> = mouvement possible sans pesanteur
                </div>
                <div>
                  <strong>3</strong> = mouvement contre pesanteur
                </div>
                <div>
                  <strong>4</strong> = mouvement contre résistance modérée
                </div>
                <div>
                  <strong>5</strong> = force normale
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setMrcValue(n)}
                    className="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sauvegarde...
          </>
        ) : (
          "Sauvegarder"
        )}
      </button>
    </div>
  );
}

PhysiotherapieForm.propTypes = {
  session: PropTypes.object,
  patient: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
