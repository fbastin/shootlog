/**
 * Carnet de Tir (Shooting Logbook) — Tireur.org
 * Client-side Storage & Logic
 */

// Global State
let state = {
    weapons: [],
    sessions: [],
    maintenance: [],
    activeTab: 'dashboard',
    tempImpacts: [], // Temporary impacts for target plotting
    scaleMmPerPixel: 0.714, // Default scale (200mm / 280px total diameter)
    editingSessionId: null,
    editingWeaponId: null,
    editingMaintId: null
};

let activeLang = 'fr';

const I18N_CARNET = {
    fr: {
        // Headers & buttons
        'logbook-main-title': 'Carnet de Tir Numérique',
        'logbook-sub-title': 'Suivez vos armes, séances de tir et opérations d\'entretien. Fonctionne 100% hors-ligne et localement. Pour voir un exemple pré-rempli, visitez le <a href="/carnet-de-tir-exemple.php" style="text-decoration:underline; font-weight:500;">carnet d\'exemple</a>.',
        'logbook-demo-badge': 'EXEMPLE',
        'lbl-fullscreen': 'Plein écran',
        'lbl-print-blank': 'Imprimer fiche vierge',
        'lbl-new-session': 'Nouvelle séance',
        
        // Tabs
        'lbl-tab-dashboard': 'Tableau de bord',
        'lbl-tab-weapons': 'Mes Armes',
        'lbl-tab-sessions': 'Séances',
        'lbl-tab-maintenance': 'Entretien',
        'lbl-tab-settings': 'Réglages & Sauvegarde',
        
        // Dashboard Stats
        'lbl-stat-rounds': 'Coups tirés',
        'lbl-stat-sessions': 'Séances',
        'lbl-stat-weapons': 'Armes actives',
        'lbl-stat-maint': 'Entretiens',
        'lbl-title-chart': 'Volume de tir (6 derniers mois)',
        'lbl-title-recent': 'Séances récentes',
        
        // Weapons tab
        'lbl-add-weapon': 'Ajouter une arme',
        
        // Sessions tab
        'lbl-filter-weapon': 'Arme :',
        'opt-all-weapons': 'Toutes les armes',
        'lbl-filter-stand': 'Stand / Lieu :',
        'btn-reset-filters': 'Réinitialiser',
        
        // Maintenance tab
        'lbl-add-maint': 'Ajouter un entretien',
        
        // Settings tab
        'lbl-settings-title': 'Gestion locale des données',
        'lbl-settings-desc': 'Toutes les données de ce carnet de tir sont stockées dans le stockage local de votre navigateur (LocalStorage). Aucune donnée n\'est envoyée vers nos serveurs. Pour éviter toute perte en cas de nettoyage du navigateur, nous vous conseillons d\'effectuer des sauvegardes régulières.',
        'lbl-export-title': 'Exporter mes données',
        'lbl-export-desc': 'Téléchargez un fichier de sauvegarde contenant toutes vos armes, séances et entretiens.',
        'lbl-export-btn': 'Exporter au format JSON',
        'lbl-import-title': 'Importer une sauvegarde',
        'lbl-import-desc': 'Restaurez vos données ou fusionnez-les depuis un fichier précédemment exporté.',
        'lbl-import-btn': 'Importer un fichier',
        'lbl-danger-title': 'Zone de Danger',
        'lbl-danger-desc': 'Cette action effacera définitivement l\'intégralité du carnet de tir (armes, tirs, entretiens) sur ce navigateur.',
        'lbl-danger-btn': 'Réinitialiser le carnet de tir',
        
        // Weapon Modal
        'lbl-w-name': 'Modèle / Nom de l\'arme *',
        'lbl-w-caliber': 'Calibre *',
        'lbl-w-barrel-length': 'Longueur de canon (pouces)',
        'lbl-w-twist-rate': 'Pas de rayure (1:X pouces)',
        'lbl-w-zero-distance': 'Distance de zéro (mètres)',
        'lbl-w-optics': 'Lunette / Optique',
        'lbl-w-count': 'Compteur initial (tirs antérieurs)',
        'lbl-w-notes': 'Notes / Caractéristiques additionnelles',
        'btn-w-cancel': 'Annuler',
        'btn-w-save': 'Enregistrer',
        
        // Session Modal
        'lbl-s-date': 'Date de la séance *',
        'lbl-s-stand': 'Stand de tir / Lieu',
        'lbl-s-weapon': 'Arme utilisée *',
        'opt-s-select': '-- Sélectionner --',
        'lbl-s-caliber': 'Calibre',
        'lbl-s-sub-ammo': 'Munition & Balistique',
        'lbl-s-ammo': 'Munition / Ogive',
        'lbl-s-weight': 'Poids de balle (gr)',
        'lbl-s-charge': 'Charge de poudre (gr)',
        'lbl-s-velocity': 'Vitesse initiale mesurée (m/s)',
        'lbl-s-sub-cond': 'Conditions & Résultats',
        'lbl-s-distance': 'Distance (mètres) *',
        'lbl-s-temp': 'Température ambiante (°C)',
        'lbl-s-wind': 'Vitesse du vent (m/s)',
        'lbl-s-notes': 'Notes additionnelles',
        'lbl-plotter-title': 'Calculateur de dispersion interactif',
        'lbl-plotter-hint': 'Cliquez sur la cible pour tracer vos impacts',
        'lbl-plotter-undo': 'Annuler',
        'lbl-plotter-clear': 'Tout effacer',
        'lbl-plotter-preset': 'Type de cible / Échelle',
        'lbl-stat-col-1': 'Impacts',
        'lbl-stat-col-2': 'Dispersion (ES)',
        'lbl-stat-col-3': 'Dispersion (MOA)',
        'lbl-stat-col-4': 'Dispersion (MRAD)',
        'lbl-stat-mpi': 'Point moyen d\'impact (MPI)',
        'btn-s-cancel': 'Annuler',
        'lbl-s-discipline': 'Discipline',
        'opt-s-disp-none': '-- Sélectionner --',
        'opt-s-disp-prec': 'Précision / Loisir',
        'opt-s-disp-issf': 'Match ISSF',
        'opt-s-disp-tld': 'Tir Longue Distance (TLD)',
        'opt-s-disp-ipsc': 'IPSC / Tir Sportif de Vitesse',
        'opt-s-disp-other': 'Autre discipline',
        'lbl-s-objective': 'Objectif de la séance',
        'lbl-s-sub-review': 'Évaluation & Bilan de séance',
        'lbl-s-fatigue': 'Fatigue (1 = faible, 5 = élevée)',
        'lbl-s-concentration': 'Concentration (1 = faible, 5 = élevée)',
        'lbl-s-confidence': 'Confiance (1 = faible, 5 = élevée)',
        'lbl-s-errors': 'Erreurs identifiées',
        'lbl-s-actions': 'Actions pour la prochaine séance',
        'lbl-chrono-import-title': 'Importer des vitesses',
        'lbl-chrono-import-desc': 'Collez vos vitesses mesurées par votre chronographe (séparées par des virgules, des espaces ou des retours à la ligne).',
        'lbl-chrono-raw-data': 'Vitesses (m/s) :',
        'btn-chrono-cancel': 'Annuler',
        'btn-chrono-calc': 'Calculer',
        'btn-chrono-apply': 'Valider & Importer',
        'lbl-chrono-count': 'Nombre de tirs :',
        'lbl-chrono-avg': 'Vitesse moyenne :',
        'lbl-chrono-sd': 'Écart-type (SD) :',
        'lbl-chrono-minmax': 'Vitesse min/max :',
        'btn-s-save': 'Enregistrer la séance',
        'js-session-duplicate': 'Dupliquer',
        'js-session-duplicate-title': 'Dupliquer cette séance',
        'js-chrono-empty': 'Veuillez saisir des vitesses valides.',
        
        // Maintenance Modal
        'lbl-m-date': 'Date de l\'opération *',
        'lbl-m-weapon': 'Arme concernée *',
        'opt-m-select': '-- Sélectionner --',
        'lbl-m-type': 'Type d\'entretien *',
        'opt-m-clean': 'Nettoyage standard',
        'opt-m-piece': 'Changement de pièce',
        'opt-m-breakin': 'Rodage canon',
        'opt-m-other': 'Autre opération',
        'lbl-m-count': 'Tir à l\'entretien (Round count)',
        'lbl-m-desc': 'Description / Détails *',
        'btn-m-cancel': 'Annuler',
        'btn-m-save': 'Enregistrer',
        
        // Print Blank Modal
        'lbl-p-title': 'Imprimer une fiche de tir vierge',
        'lbl-p-desc': 'Sélectionnez le format de fiche de tir adapté à votre discipline ou entraînement.',
        'lbl-p-type': 'Discipline / Format de la fiche :',
        'opt-p-generic': 'Générique / Entraînement Standard (1 cible + table de 20 tirs)',
        'opt-p-issf': 'Match ISSF - 60 coups (6 cibles x 10 coups + tableau de scores)',
        'opt-p-tld': 'Tir Longue Distance - TLD (1 cible TLD + table balistique & clics)',
        'btn-p-cancel': 'Annuler',
        'btn-p-print': 'Imprimer',
        
        // Blank Sheet Template
        'lbl-print-tpl-title': 'Carnet de Tir Numérique — Fiche de Séance',
        'lbl-print-tpl-date': 'Date :',
        'lbl-print-tpl-stand': 'Lieu / Stand :',
        'lbl-print-tpl-weapon': 'Arme utilisée :',
        'lbl-print-tpl-caliber': 'Calibre :',
        'lbl-print-tpl-sub-ammo': 'Munition & Rechargement',
        'lbl-print-tpl-ammo': 'Munition / Ogive :',
        'lbl-print-tpl-weight': 'Poids de balle :',
        'lbl-print-tpl-charge': 'Poudre / Charge :',
        'lbl-print-tpl-velocity': 'Vitesse moyenne :',
        'lbl-print-tpl-sub-cond': 'Conditions de tir',
        'lbl-print-tpl-distance': 'Distance :',
        'lbl-print-tpl-temp': 'Température :',
        'lbl-print-tpl-wind': 'Vent :',
        'lbl-print-tpl-sub-notes': 'Notes / Observations',
        'lbl-print-tpl-target-title': 'Tracé des impacts',
        'lbl-print-tpl-target-caption': 'Cible de réglage (C50 proportionnelle)',
        
        // Placeholders
        'plh-w-name': 'Ex: Tikka T3x TAC A1, Glock 17...',
        'plh-w-caliber': 'Ex: 6.5 Creedmoor, 9x19mm...',
        'plh-w-barrel-length': 'Ex: 24, 4.5',
        'plh-w-twist-rate': 'Ex: 8, 10',
        'plh-w-zero-distance': 'Ex: 100, 25',
        'plh-w-optics': 'Ex: Vortex Viper PST II 5-25x50',
        'plh-w-notes': 'Poids de détente, rechargement favori, date d\'acquisition...',
        'plh-s-stand': 'Ex: Stand de tir de Versailles',
        'plh-s-caliber': 'Ex: 6.5 CM (autocomplété)',
        'plh-s-ammo': 'Ex: Lapua Scenar 139gr, S&B 124gr',
        'plh-s-weight': 'Ex: 139',
        'plh-s-charge': 'Ex: 37.5',
        'plh-s-velocity': 'Ex: 820',
        'plh-s-temp': 'Ex: 18',
        'plh-s-wind': 'Ex: 3',
        'plh-s-notes': 'Sensations, réglages de clics effectués...',
        'plh-m-count': 'Ex: 450 (facultatif)',
        'plh-m-desc': 'Ex: Nettoyage complet au solvant, remplacement du ressort de rappel...',
        'plh-filter-stand': 'Ex: CTF, Bordeaux...',
        
        // Informative banner
        'lbl-demo-banner-title': 'Version de démonstration / Exemple complet',
        'lbl-demo-banner-desc': 'Ce carnet de tir est pré-rempli avec des données fictives d\'exemples (armes, séances avec impacts sur cibles, et entretien) pour vous permettre de tester toutes les fonctionnalités (affichage plein écran, calculateur de dispersion, graphiques de statistiques, et export/import). Pour utiliser votre propre carnet de tir vide et sécurisé localement, accédez à la page <a href="/carnet-de-tir.php" style="font-weight:600; text-decoration: underline;">Carnet de tir personnel</a>.',

        // JS strings
        'js-weapon-unknown': 'Arme inconnue',
        'js-empty-recent-sessions': 'Aucune session enregistrée pour le moment. Cliquez sur "Séances" pour en ajouter une.',
        'js-empty-chart-history': 'Enregistrez des tirs pour visualiser l\'historique',
        'js-empty-weapons-title': 'Aucune arme enregistrée',
        'js-empty-weapons-desc': 'Commencez par ajouter votre première arme (carabine, pistolet) afin de pouvoir y associer vos séances de tir.',
        'js-empty-sessions-title': 'Aucune séance de tir',
        'js-empty-sessions-desc': 'Ajoutez votre première séance de tir pour enregistrer vos scores, conditions météo et dispersion de tirs.',
        'js-empty-sessions-filter': 'Aucune séance ne correspond aux filtres de recherche.',
        'js-empty-maint-title': 'Aucun entretien enregistré',
        'js-empty-maint-desc': 'Consignez vos nettoyages de canons, changements de pièces et rodages pour chaque arme.',
        'js-all-weapons': 'Toutes les armes',
        'js-select-weapon': '-- Sélectionner --',
        'js-weapon-canon': 'Canon',
        'js-weapon-rayure': 'Rayure',
        'js-weapon-zero': 'Zéro',
        'js-weapon-tirs': 'Tirs (Round Count)',
        'js-weapon-optique': 'Optique',
        'js-weapon-edit': 'Éditer',
        'js-weapon-delete': 'Supprimer',
        'js-session-print': 'Imprimer cette séance',
        'js-session-edit': 'Éditer',
        'js-session-delete': 'Supprimer',
        'js-session-stand': 'Stand de tir',
        'js-session-weapon-caliber': 'Arme & Calibre',
        'js-session-ammo-velocity': 'Munition & Vitesse',
        'js-session-dist-conditions': 'Distance & Conditions',
        'js-session-no-plotting': 'Aucun tracé',
        'js-session-coups': 'coups',
        'js-session-vent': 'vent',
        'js-session-pas-de-vent': 'Pas de vent',
        'js-maint-clean': 'Nettoyage',
        'js-maint-piece': 'Changement de pièce',
        'js-maint-breakin': 'Rodage canon',
        'js-maint-other': 'Autre opération',
        'js-maint-effectue-a': 'Effectué à',
        'js-maint-tirs': 'tirs',
        'js-confirm-delete-weapon': 'Êtes-vous sûr de vouloir supprimer l\'arme "{name}" ?',
        'js-confirm-delete-weapon-warning': '\nAttention : cette arme est liée à {count} séance(s) de tir. Celles-ci ne seront pas supprimées mais référenceront une arme inconnue.',
        'js-confirm-delete-session': 'Supprimer définitivement cette séance de tir ?',
        'js-confirm-delete-maint': 'Supprimer cette entrée du registre d\'entretien ?',
        'js-confirm-import-merge': 'Voulez-vous fusionner ces données avec vos données existantes ?\n(Cliquez sur Annuler pour écraser complètement votre base actuelle)',
        'js-confirm-clear-db': 'ATTENTION : Cette action supprimera définitivement toutes vos données locales (armes, séances de tir et entretien).\nCette action est irréversible.\n\nVoulez-vous continuer ?',
        'js-error-load': 'Erreur lors de la lecture des données locales.',
        'js-error-save': 'Erreur lors de la sauvegarde des données.',
        'js-success-weapon-update': 'Arme mise à jour avec succès.',
        'js-success-weapon-new': 'Nouvelle arme enregistrée.',
        'js-success-weapon-delete': 'Arme supprimée.',
        'js-success-session-update': 'Séance de tir mise à jour.',
        'js-success-session-new': 'Nouvelle séance enregistrée.',
        'js-success-session-delete': 'Séance de tir supprimée.',
        'js-success-maint-update': 'Opération d\'entretien mise à jour.',
        'js-success-maint-new': 'Opération d\'entretien enregistrée.',
        'js-success-maint-delete': 'Entrée d\'entretien supprimée.',
        'js-success-export': 'Données exportées avec succès.',
        'js-success-import-merge': 'Données fusionnées avec succès.',
        'js-success-import-overwrite': 'Base de données écrasée et restaurée.',
        'js-success-db-clear': 'Base de données réinitialisée.',
        'js-error-weapon-req': 'Le nom et le calibre sont obligatoires.',
        'js-error-session-req': 'La date et l\'arme sont obligatoires.',
        'js-error-maint-req': 'Veuillez remplir tous les champs obligatoires (*).',
        'js-session-duplicate': 'Dupliquer',
        'js-session-duplicate-title': 'Dupliquer cette séance',
        'js-chrono-empty': 'Veuillez saisir des vitesses valides.',
    },
    en: {
        // Headers & buttons
        'logbook-main-title': 'Digital Shooting Logbook',
        'logbook-sub-title': 'Track your firearms, shooting sessions and maintenance log. Works 100% offline and locally. To view a pre-filled example, visit the <a href="/carnet-de-tir-exemple.php" style="text-decoration:underline; font-weight:500;">demo logbook</a>.',
        'logbook-demo-badge': 'DEMO',
        'lbl-fullscreen': 'Full screen',
        'lbl-print-blank': 'Print blank sheet',
        'lbl-new-session': 'New session',
        
        // Tabs
        'lbl-tab-dashboard': 'Dashboard',
        'lbl-tab-weapons': 'My Weapons',
        'lbl-tab-sessions': 'Sessions',
        'lbl-tab-maintenance': 'Maintenance',
        'lbl-tab-settings': 'Settings & Backup',
        
        // Dashboard Stats
        'lbl-stat-rounds': 'Rounds fired',
        'lbl-stat-sessions': 'Sessions',
        'lbl-stat-weapons': 'Active weapons',
        'lbl-stat-maint': 'Maintenance logs',
        'lbl-title-chart': 'Shooting volume (last 6 months)',
        'lbl-title-recent': 'Recent sessions',
        
        // Weapons tab
        'lbl-add-weapon': 'Add a weapon',
        
        // Sessions tab
        'lbl-filter-weapon': 'Weapon:',
        'opt-all-weapons': 'All weapons',
        'lbl-filter-stand': 'Range / Location:',
        'btn-reset-filters': 'Reset',
        
        // Maintenance tab
        'lbl-add-maint': 'Add maintenance log',
        
        // Settings tab
        'lbl-settings-title': 'Local Data Management',
        'lbl-settings-desc': 'All data in this logbook is stored locally in your browser\'s LocalStorage. No data is sent to our servers. To prevent loss if you clear browser data, we recommend performing regular backups.',
        'lbl-export-title': 'Export my data',
        'lbl-export-desc': 'Download a backup file containing all your weapons, sessions, and maintenance logs.',
        'lbl-export-btn': 'Export as JSON format',
        'lbl-import-title': 'Import a backup',
        'lbl-import-desc': 'Restore your data or merge them from a previously exported file.',
        'lbl-import-btn': 'Import a file',
        'lbl-danger-title': 'Danger Zone',
        'lbl-danger-desc': 'This action will permanently delete the entire logbook (weapons, shots, maintenance) on this browser.',
        'lbl-danger-btn': 'Reset shooting logbook',
        
        // Weapon Modal
        'lbl-w-name': 'Model / Weapon Name *',
        'lbl-w-caliber': 'Caliber *',
        'lbl-w-barrel-length': 'Barrel Length (inches)',
        'lbl-w-twist-rate': 'Twist Rate (1:X inches)',
        'lbl-w-zero-distance': 'Zero Distance (meters)',
        'lbl-w-optics': 'Scope / Optics',
        'lbl-w-count': 'Initial Counter (previous shots)',
        'lbl-w-notes': 'Notes / Additional Features',
        'btn-w-cancel': 'Cancel',
        'btn-w-save': 'Save',
        
        // Session Modal
        'lbl-s-date': 'Session Date *',
        'lbl-s-stand': 'Shooting Range / Location',
        'lbl-s-weapon': 'Weapon Used *',
        'opt-s-select': '-- Select --',
        'lbl-s-caliber': 'Caliber',
        'lbl-s-sub-ammo': 'Ammo & Ballistics',
        'lbl-s-ammo': 'Ammo / Bullet',
        'lbl-s-weight': 'Bullet Weight (gr)',
        'lbl-s-charge': 'Powder Charge (gr)',
        'lbl-s-velocity': 'Measured Initial Velocity (m/s)',
        'lbl-s-sub-cond': 'Conditions & Results',
        'lbl-s-distance': 'Distance (meters) *',
        'lbl-s-temp': 'Ambient Temp (°C)',
        'lbl-s-wind': 'Wind Speed (m/s)',
        'lbl-s-notes': 'Additional Notes',
        'lbl-plotter-title': 'Interactive Grouping Calculator',
        'lbl-plotter-hint': 'Click on target to plot your impacts',
        'lbl-plotter-undo': 'Undo',
        'lbl-plotter-clear': 'Clear all',
        'lbl-plotter-preset': 'Target type / Scale',
        'lbl-stat-col-1': 'Impacts',
        'lbl-stat-col-2': 'Grouping (ES)',
        'lbl-stat-col-3': 'Grouping (MOA)',
        'lbl-stat-col-4': 'Grouping (MRAD)',
        'lbl-stat-mpi': 'Mean Point of Impact (MPI)',
        'btn-s-cancel': 'Cancel',
        'lbl-s-discipline': 'Discipline',
        'opt-s-disp-none': '-- Select --',
        'opt-s-disp-prec': 'Precision / Leisure',
        'opt-s-disp-issf': 'ISSF Match',
        'opt-s-disp-tld': 'Long Range Shooting (LRS)',
        'opt-s-disp-ipsc': 'IPSC / Action Shooting',
        'opt-s-disp-other': 'Other discipline',
        'lbl-s-objective': 'Session Objective',
        'lbl-s-sub-review': 'Self-Assessment & Review',
        'lbl-s-fatigue': 'Fatigue (1 = low, 5 = high)',
        'lbl-s-concentration': 'Concentration (1 = low, 5 = high)',
        'lbl-s-confidence': 'Confidence (1 = low, 5 = high)',
        'lbl-s-errors': 'Identified Errors',
        'lbl-s-actions': 'Actions for Next Session',
        'lbl-chrono-import-title': 'Import Velocities',
        'lbl-chrono-import-desc': 'Paste your velocities measured by your chronograph (separated by commas, spaces, or newlines).',
        'lbl-chrono-raw-data': 'Velocities (m/s):',
        'btn-chrono-cancel': 'Cancel',
        'btn-chrono-calc': 'Calculate',
        'btn-chrono-apply': 'Validate & Import',
        'lbl-chrono-count': 'Number of shots:',
        'lbl-chrono-avg': 'Average velocity:',
        'lbl-chrono-sd': 'Standard deviation (SD):',
        'lbl-chrono-minmax': 'Min/Max velocity:',
        'btn-s-save': 'Save Session',
        'js-session-duplicate': 'Duplicate',
        'js-session-duplicate-title': 'Duplicate this session',
        'js-chrono-empty': 'Please enter valid velocities.',
        
        // Maintenance Modal
        'lbl-m-date': 'Date of Operation *',
        'lbl-m-weapon': 'Weapon Concerned *',
        'opt-m-select': '-- Select --',
        'lbl-m-type': 'Maintenance Type *',
        'opt-m-clean': 'Standard Cleaning',
        'opt-m-piece': 'Part Replacement',
        'opt-m-breakin': 'Barrel Break-in',
        'opt-m-other': 'Other Operation',
        'lbl-m-count': 'Rounds at Maintenance (Round count)',
        'lbl-m-desc': 'Description / Details *',
        'btn-m-cancel': 'Cancel',
        'btn-m-save': 'Save',
        
        // Print Blank Modal
        'lbl-p-title': 'Print a Blank Shooting Sheet',
        'lbl-p-desc': 'Select the shooting sheet format suited for your discipline or training.',
        'lbl-p-type': 'Discipline / Sheet Format:',
        'opt-p-generic': 'Generic / Standard Training (1 target + 20 shots table)',
        'opt-p-issf': 'ISSF Match - 60 shots (6 targets x 10 shots + score table)',
        'opt-p-tld': 'Long Range Shooting - LRS (1 target + ballistics & click table)',
        'btn-p-cancel': 'Cancel',
        'btn-p-print': 'Print',
        
        // Blank Sheet Template
        'lbl-print-tpl-title': 'Digital Shooting Logbook — Session Sheet',
        'lbl-print-tpl-date': 'Date:',
        'lbl-print-tpl-stand': 'Range / Location:',
        'lbl-print-tpl-weapon': 'Weapon Used:',
        'lbl-print-tpl-caliber': 'Caliber:',
        'lbl-print-tpl-sub-ammo': 'Ammo & Reloading',
        'lbl-print-tpl-ammo': 'Ammo / Bullet:',
        'lbl-print-tpl-weight': 'Bullet Weight:',
        'lbl-print-tpl-charge': 'Powder / Charge:',
        'lbl-print-tpl-velocity': 'Average Velocity:',
        'lbl-print-tpl-sub-cond': 'Shooting Conditions',
        'lbl-print-tpl-distance': 'Distance:',
        'lbl-print-tpl-temp': 'Temperature:',
        'lbl-print-tpl-wind': 'Wind:',
        'lbl-print-tpl-sub-notes': 'Notes / Observations',
        'lbl-print-tpl-target-title': 'Shot Plotting',
        'lbl-print-tpl-target-caption': 'Sighting Target (Proportional C50)',
        
        // Placeholders
        'plh-w-name': 'e.g., Tikka T3x TAC A1, Glock 17...',
        'plh-w-caliber': 'e.g., 6.5 Creedmoor, 9x19mm...',
        'plh-w-barrel-length': 'e.g., 24, 4.5',
        'plh-w-twist-rate': 'e.g., 8, 10',
        'plh-w-zero-distance': 'e.g., 100, 25',
        'plh-w-optics': 'e.g., Vortex Viper PST II 5-25x50',
        'plh-w-notes': 'Trigger weight, favorite reload, purchase date...',
        'plh-s-stand': 'e.g., Versailles Shooting Range',
        'plh-s-caliber': 'e.g., 6.5 CM (autofilled)',
        'plh-s-ammo': 'e.g., Lapua Scenar 139gr, S&B 124gr',
        'plh-s-weight': 'e.g., 139',
        'plh-s-charge': 'e.g., 37.5',
        'plh-s-velocity': 'e.g., 820',
        'plh-s-temp': 'e.g., 18',
        'plh-s-wind': 'e.g., 3',
        'plh-s-notes': 'Feelings, click adjustments made...',
        'plh-m-count': 'e.g., 450 (optional)',
        'plh-m-desc': 'e.g., Complete cleaning with solvent, recoil spring replacement...',
        'plh-filter-stand': 'e.g., CTF, Bordeaux...',
        
        // Informative banner
        'lbl-demo-banner-title': 'Demo Version / Complete Example',
        'lbl-demo-banner-desc': 'This logbook is pre-filled with mock demonstration data (weapons, sessions with targets, and maintenance) to let you test all functionalities (fullscreen mode, group calculator, statistics charts, and export/import). To use your own empty and locally secured logbook, go to the <a href="/carnet-de-tir.php" style="font-weight:600; text-decoration: underline;">Personal Shooting Logbook</a> page.',

        // JS strings
        'js-weapon-unknown': 'Unknown Weapon',
        'js-empty-recent-sessions': 'No sessions recorded yet. Click on "Sessions" to add one.',
        'js-empty-chart-history': 'Record shots to visualize history',
        'js-empty-weapons-title': 'No weapons registered',
        'js-empty-weapons-desc': 'Start by adding your first weapon (rifle, handgun) to associate your shooting sessions.',
        'js-empty-sessions-title': 'No shooting sessions',
        'js-empty-sessions-desc': 'Add your first shooting session to record your scores, weather conditions, and grouping.',
        'js-empty-sessions-filter': 'No sessions match the search filters.',
        'js-empty-maint-title': 'No maintenance logs recorded',
        'js-empty-maint-desc': 'Log barrel cleanings, parts replacements, and break-ins for each weapon.',
        'js-all-weapons': 'All Weapons',
        'js-select-weapon': '-- Select --',
        'js-weapon-canon': 'Barrel',
        'js-weapon-rayure': 'Twist',
        'js-weapon-zero': 'Zero',
        'js-weapon-tirs': 'Rounds (Round Count)',
        'js-weapon-optique': 'Optics',
        'js-weapon-edit': 'Edit',
        'js-weapon-delete': 'Delete',
        'js-session-print': 'Print this session',
        'js-session-edit': 'Edit',
        'js-session-delete': 'Delete',
        'js-session-stand': 'Shooting Range',
        'js-session-weapon-caliber': 'Weapon & Caliber',
        'js-session-ammo-velocity': 'Ammo & Velocity',
        'js-session-dist-conditions': 'Distance & Conditions',
        'js-session-no-plotting': 'No plotting',
        'js-session-coups': 'shots',
        'js-session-vent': 'wind',
        'js-session-pas-de-vent': 'No wind',
        'js-maint-clean': 'Cleaning',
        'js-maint-piece': 'Part Replacement',
        'js-maint-breakin': 'Barrel Break-in',
        'js-maint-other': 'Other Operation',
        'js-maint-effectue-a': 'Performed at',
        'js-maint-tirs': 'shots',
        'js-confirm-delete-weapon': 'Are you sure you want to delete the weapon "{name}"?',
        'js-confirm-delete-weapon-warning': '\nWarning: this weapon is linked to {count} shooting session(s). These will not be deleted but will reference an unknown weapon.',
        'js-confirm-delete-session': 'Permanently delete this shooting session?',
        'js-confirm-delete-maint': 'Delete this maintenance log entry?',
        'js-confirm-import-merge': 'Do you want to merge this data with your existing data?\n(Click Cancel to completely overwrite your current database)',
        'js-confirm-clear-db': 'WARNING: This action will permanently delete all your local data (weapons, shooting sessions, and maintenance).\nThis action is irreversible.\n\nDo you want to continue?',
        'js-error-load': 'Error reading local data.',
        'js-error-save': 'Error saving data.',
        'js-success-weapon-update': 'Weapon updated successfully.',
        'js-success-weapon-new': 'New weapon registered.',
        'js-success-weapon-delete': 'Weapon deleted.',
        'js-success-session-update': 'Shooting session updated.',
        'js-success-session-new': 'New session registered.',
        'js-success-session-delete': 'Shooting session deleted.',
        'js-success-maint-update': 'Maintenance operation updated.',
        'js-success-maint-new': 'Maintenance operation recorded.',
        'js-success-maint-delete': 'Maintenance entry deleted.',
        'js-success-export': 'Data successfully exported.',
        'js-success-import-merge': 'Data successfully merged.',
        'js-success-import-overwrite': 'Database overwritten and restored.',
        'js-success-db-clear': 'Database reset.',
        'js-error-weapon-req': 'Name and caliber are required.',
        'js-error-session-req': 'Date and weapon are required.',
        'js-error-maint-req': 'Please fill out all required fields (*).',
        'js-session-duplicate': 'Duplicate',
        'js-session-duplicate-title': 'Duplicate this session',
        'js-chrono-empty': 'Please enter valid velocities.',
    }
};

function updateAppLanguage(lang) {
    activeLang = lang;
    localStorage.setItem('calibers_lang', lang);
    
    // Update local lang buttons UI
    const btnFr = document.getElementById('lang-btn-fr');
    const btnEn = document.getElementById('lang-btn-en');
    if (btnFr && btnEn) {
        if (lang === 'fr') {
            btnFr.classList.add('active');
            btnEn.classList.remove('active');
        } else {
            btnEn.classList.add('active');
            btnFr.classList.remove('active');
        }
    }
    
    if (typeof setTargetLanguage === 'function') {
        setTargetLanguage(lang);
    }
    
    const translations = I18N_CARNET[lang];
    if (!translations) return;
    
    for (let id in translations) {
        const el = document.getElementById(id);
        if (el) {
            // Check if option
            if (el.tagName === 'OPTION') {
                el.text = translations[id];
            } else {
                // If button or text with child span
                const labelSpan = el.querySelector('span');
                if (labelSpan) {
                    labelSpan.innerHTML = translations[id];
                } else {
                    el.innerHTML = translations[id];
                }
            }
        }
    }
    
    // Set placeholders
    const setPlaceholder = (id, key) => {
        const el = document.getElementById(id);
        if (el && translations[key]) {
            el.placeholder = translations[key];
        }
    };
    
    setPlaceholder('w_name', 'plh-w-name');
    setPlaceholder('w_caliber', 'plh-w-caliber');
    setPlaceholder('w_barrel_length', 'plh-w-barrel-length');
    setPlaceholder('w_twist_rate', 'plh-w-twist-rate');
    setPlaceholder('w_zero_distance', 'plh-w-zero-distance');
    setPlaceholder('w_optics', 'plh-w-optics');
    setPlaceholder('w_notes', 'plh-w-notes');
    setPlaceholder('s_stand', 'plh-s-stand');
    setPlaceholder('s_caliber', 'plh-s-caliber');
    setPlaceholder('s_ammo', 'plh-s-ammo');
    setPlaceholder('s_bullet_weight', 'plh-s-weight');
    setPlaceholder('s_powder_charge', 'plh-s-charge');
    setPlaceholder('s_velocity', 'plh-s-velocity');
    setPlaceholder('s_temp', 'plh-s-temp');
    setPlaceholder('s_wind', 'plh-s-wind');
    setPlaceholder('s_notes', 'plh-s-notes');
    setPlaceholder('m_round_count', 'plh-m-count');
    setPlaceholder('m_description', 'plh-m-desc');
    setPlaceholder('filter_stand', 'plh-filter-stand');

    // Translate target presets select
    const targetPresetSelect = document.getElementById('target_preset');
    if (targetPresetSelect) {
        const presetNames = {
            fr: {
                'issf_50m': 'C50 (50m Carabine)',
                'c200': 'C200 (200m Carabine - Visuel 400mm)',
                'issf_10m': 'ISSF 10m Pistolet',
                'issf_10m_rifle': 'ISSF 10m Carabine',
                'issf_25m_precision': 'ISSF 25m Pistolet Précision',
                'issf_25m_rapid': 'ISSF 25m Pistolet Tir Rapide',
                'issf_50m_pistol': 'ISSF 50m Pistolet Libre',
                'issf_300m': 'ISSF 300m Carabine',
                'biathlon_prone': 'Biathlon Couché (50m)',
                'biathlon_standing': 'Biathlon Debout (50m)',
                'ipsc': 'IPSC Classic Silhouette',
                'idpa': 'IDPA Silhouette',
                'field_target': 'Field Target',
                'standard_rings': 'Cible standard 180mm',
                'grouping': 'Cible de Groupement',
                'moa': 'Grille 1 MOA @ 100m',
                'inch': 'Grille 1 pouce (8" total)'
            },
            en: {
                'issf_50m': 'C50 (50m Rifle)',
                'c200': 'C200 (200m Rifle - 400mm Center)',
                'issf_10m': 'ISSF 10m Pistol',
                'issf_10m_rifle': 'ISSF 10m Rifle',
                'issf_25m_precision': 'ISSF 25m Pistol Precision',
                'issf_25m_rapid': 'ISSF 25m Pistol Rapid Fire',
                'issf_50m_pistol': 'ISSF 50m Pistol Free',
                'issf_300m': 'ISSF 300m Rifle',
                'biathlon_prone': 'Biathlon Prone (50m)',
                'biathlon_standing': 'Biathlon Standing (50m)',
                'ipsc': 'IPSC Classic Silhouette',
                'idpa': 'IDPA Silhouette',
                'field_target': 'Field Target',
                'standard_rings': 'Standard Target 180mm',
                'grouping': 'Grouping Target',
                'moa': '1 MOA @ 100m Grid',
                'inch': '1 Inch Grid (8" total)'
            }
        };
        Array.from(targetPresetSelect.options).forEach(opt => {
            if (presetNames[lang] && presetNames[lang][opt.value]) {
                opt.text = presetNames[lang][opt.value];
            }
        });
    }

    // Translate print blank type select
    const printBlankTypeSelect = document.getElementById('print_blank_type');
    if (printBlankTypeSelect) {
        const typeNames = {
            fr: {
                'generic': 'Générique / Entraînement Standard (1 cible + table de 20 tirs)',
                'issf': 'Match ISSF - 60 coups (6 cibles x 10 coups + tableau de scores)',
                'tld': 'Tir Longue Distance - TLD (1 cible TLD + table balistique & clics)'
            },
            en: {
                'generic': 'Generic / Standard Training (1 target + 20 shots table)',
                'issf': 'ISSF Match - 60 shots (6 targets x 10 shots + score table)',
                'tld': 'Long Range Shooting - LRS (1 target + ballistics & click table)'
            }
        };
        Array.from(printBlankTypeSelect.options).forEach(opt => {
            if (typeNames[lang] && typeNames[lang][opt.value]) {
                opt.text = typeNames[lang][opt.value];
            }
        });
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('calibers_lang') || 'fr';
    updateAppLanguage(savedLang);
    loadData();
    initCaliberDatalist();
    initEventListeners();
    renderAll();
});


// Caliber Database Integration
function initCaliberDatalist() {
    const list = document.getElementById('calibers_list');
    if (!list || !window.CALIBERS_DB) return;
    
    const values = new Set();
    window.CALIBERS_DB.forEach(cal => {
        if (cal.name) values.add(cal.name);
        if (cal.aliases) {
            cal.aliases.forEach(alias => values.add(alias));
        }
    });
    
    list.innerHTML = Array.from(values).map(val => `<option value="${escapeHTML(val)}"></option>`).join('');
}

function findCaliberInDB(caliberName) {
    if (!caliberName || !window.CALIBERS_DB) return null;
    const nameLower = caliberName.trim().toLowerCase();
    
    // 1. Exact match by name
    let matched = window.CALIBERS_DB.find(cal => cal.name.toLowerCase() === nameLower);
    if (matched) return matched;
    
    // 2. Exact match by aliases
    matched = window.CALIBERS_DB.find(cal => cal.aliases && cal.aliases.some(alias => alias.toLowerCase() === nameLower));
    if (matched) return matched;
    
    // 3. Loose normalize comparison (ignore dots, spaces, casing)
    // E.g. "6.5 CM" vs "6.5 Creedmoor" or "22 LR" vs ".22 Long Rifle"
    const cleanQuery = nameLower.replace(/\s+/g, '').replace(/\./g, '');
    matched = window.CALIBERS_DB.find(cal => {
        const cleanName = cal.name.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
        if (cleanName.includes(cleanQuery) || cleanQuery.includes(cleanName)) return true;
        
        return cal.aliases && cal.aliases.some(alias => {
            const cleanAlias = alias.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
            return cleanAlias.includes(cleanQuery) || cleanQuery.includes(cleanAlias);
        });
    });
    
    return matched || null;
}

function renderCaliberDbLink(caliberName) {
    if (!caliberName) return '';
    const cal = findCaliberInDB(caliberName);
    if (cal) {
        return `<a href="/calibres.php?id=${cal.id}" class="caliber-db-link" title="Voir les dimensions et infos CIP de cette cartouche dans la base des calibres" style="color:var(--color-accent); text-decoration:none; display:inline-flex; align-items:center; gap:0.25rem;"><i class="li-eye" style="font-size:0.85em;"></i> ${escapeHTML(caliberName)}</a>`;
    }
    return escapeHTML(caliberName);
}

// Load data from LocalStorage
function loadData() {
    if (typeof IS_DEMO !== 'undefined' && IS_DEMO) {
        loadDemoData();
        return;
    }
    try {
        state.weapons = JSON.parse(localStorage.getItem('tireur_weapons')) || [];
        state.sessions = JSON.parse(localStorage.getItem('tireur_sessions')) || [];
        state.maintenance = JSON.parse(localStorage.getItem('tireur_maintenance')) || [];
    } catch (e) {
        console.error("Error reading LocalStorage", e);
        const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
        showNotification(trans['js-error-load'], "error");
    }
}

// Save data to LocalStorage
function saveData() {
    if (typeof IS_DEMO !== 'undefined' && IS_DEMO) {
        return; // Don't write to LocalStorage in demo mode
    }
    try {
        localStorage.setItem('tireur_weapons', JSON.stringify(state.weapons));
        localStorage.setItem('tireur_sessions', JSON.stringify(state.sessions));
        localStorage.setItem('tireur_maintenance', JSON.stringify(state.maintenance));
    } catch (e) {
        console.error("Error saving to LocalStorage", e);
        const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
        showNotification(trans['js-error-save'], "error");
    }
}

// Load Demo Data for public example
function loadDemoData() {
    state.weapons = [
        {
            id: "w_tikka",
            name: "Tikka T3x TAC A1",
            caliber: "6.5 Creedmoor",
            barrelLength: 24,
            twistRate: 8,
            zeroDistance: 100,
            optics: "Vortex Viper PST II 5-25x50",
            initialRoundCount: 120,
            notes: "Carabine de précision pour le tir longue distance (TLD). Détente réglée à 800g. Rail picatinny 20 MOA."
        },
        {
            id: "w_glock",
            name: "Glock 17 Gen 5",
            caliber: "9x19mm",
            barrelLength: 4.5,
            twistRate: 10,
            zeroDistance: 25,
            optics: "Organes de visée d'origine (acier)",
            initialRoundCount: 350,
            notes: "Pistolet semi-automatique. Connecteur moins (-) installé pour adoucir la détente."
        }
    ];

    state.sessions = [
        {
            id: "s_demo_tikka",
            date: "2026-06-15",
            stand: "Stand National de Volmerange",
            weaponId: "w_tikka",
            caliber: "6.5 Creedmoor",
            ammo: "Lapua Scenar 139gr OTM",
            bulletWeight: 139,
            powderCharge: 41.5,
            velocity: 815,
            distance: 200,
            temp: 22,
            wind: 2,
            notes: "Vitesse mesurée au Labradar. Conditions optimales, vent très régulier venant de 3 heures.",
            roundsFired: 5,
            groupSize: 12.2,
            targetPreset: "c200",
            impacts: [
                { x: 138.5, y: 142.1 },
                { x: 141.2, y: 139.4 },
                { x: 139.8, y: 140.2 },
                { x: 142.0, y: 141.0 },
                { x: 140.5, y: 138.8 }
            ],
            mpi: { x: 140.4, y: 140.3 },
            discipline: "tld",
            objective: "Tenir la régularité et l'écart-type de vitesse",
            fatigue: 2,
            concentration: 5,
            confidence: 4,
            errors: "Rien à signaler de majeur, bon alignement.",
            actions: "Conserver le même lot d'amorces pour la régularité."
        },
        {
            id: "s_demo_glock",
            date: "2026-06-22",
            stand: "CTF (La Falaise)",
            weaponId: "w_glock",
            caliber: "9x19mm",
            ammo: "Geco 124gr FMJ",
            bulletWeight: 124,
            powderCharge: "",
            velocity: 360,
            distance: 25,
            temp: 25,
            wind: 0,
            notes: "Tir rapide et double-taps sur cible C50. Travail de la transition et du grip.",
            roundsFired: 10,
            groupSize: 58.4,
            targetPreset: "issf_50m",
            impacts: [
                { x: 128.5, y: 135.2 },
                { x: 145.1, y: 142.0 },
                { x: 138.2, y: 128.4 },
                { x: 142.0, y: 150.1 },
                { x: 135.5, y: 145.3 },
                { x: 148.0, y: 138.2 },
                { x: 125.2, y: 140.0 },
                { x: 152.1, y: 135.5 },
                { x: 140.0, y: 132.2 },
                { x: 137.4, y: 141.1 }
            ],
            mpi: { x: 139.2, y: 138.8 },
            discipline: "precision",
            objective: "Stabilité du grip en tir rapide",
            fatigue: 4,
            concentration: 3,
            confidence: 3,
            errors: "Précipitation sur les double-taps, lâcher un peu sec.",
            actions: "Travailler à sec sur la fluidité de la course de détente."
        }
    ];

    state.maintenance = [
        {
            id: "m_demo_1",
            date: "2026-06-16",
            weaponId: "w_tikka",
            type: "nettoyage",
            roundCount: 125,
            description: "Nettoyage approfondi après la séance. Solvant pour cuivre dans le canon, séchage, huilage léger avec Bore Tech."
        },
        {
            id: "m_demo_2",
            date: "2026-05-10",
            weaponId: "w_glock",
            type: "piece",
            roundCount: 350,
            description: "Remplacement préventif du ressort récupérateur d'origine Glock OEM."
        }
    ];
}

// Notification Helper
function showNotification(message, type = 'success') {
    const banner = document.createElement('div');
    banner.style.position = 'fixed';
    banner.style.bottom = '20px';
    banner.style.right = '20px';
    banner.style.padding = '0.75rem 1.25rem';
    banner.style.borderRadius = 'var(--radius)';
    banner.style.zIndex = '100000';
    banner.style.fontSize = '0.9rem';
    banner.style.fontWeight = '600';
    banner.style.boxShadow = 'var(--shadow-lg)';
    banner.style.transition = 'all 0.3s ease';
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(10px)';

    if (type === 'error') {
        banner.style.background = '#e74c3c';
        banner.style.color = '#fff';
        banner.innerHTML = `<i class="li-alert"></i> ${message}`;
    } else {
        banner.style.background = '#2ed573';
        banner.style.color = '#fff';
        banner.innerHTML = `<i class="li-check"></i> ${message}`;
    }

    document.body.appendChild(banner);
    setTimeout(() => {
        banner.style.opacity = '1';
        banner.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(10px)';
        setTimeout(() => banner.remove(), 300);
    }, 3000);
}

// Tab Switching
function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll('.logbook-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.logbook-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
    
    // Rerender active tab specific metrics
    if (tabId === 'dashboard') {
        renderDashboard();
    } else if (tabId === 'weapons') {
        renderWeapons();
    } else if (tabId === 'sessions') {
        renderSessions();
    } else if (tabId === 'maintenance') {
        renderMaintenance();
    }
}

// Setup Event Listeners
function initEventListeners() {
    // Language buttons click
    const btnFr = document.getElementById('lang-btn-fr');
    const btnEn = document.getElementById('lang-btn-en');
    if (btnFr && btnEn) {
        btnFr.addEventListener('click', () => {
            updateAppLanguage('fr');
            renderAll();
        });
        btnEn.addEventListener('click', () => {
            updateAppLanguage('en');
            renderAll();
        });
    }

    // Tabs click
    document.querySelectorAll('.logbook-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-tab'));
        });
    });

    // Handle session weapon change to auto fill caliber
    const sWeaponSelect = document.getElementById('s_weapon_id');
    if (sWeaponSelect) {
        sWeaponSelect.addEventListener('change', (e) => {
            const w = state.weapons.find(wp => wp.id === e.target.value);
            if (w) {
                document.getElementById('s_caliber').value = w.caliber || '';
                document.getElementById('s_distance').value = w.zeroDistance || '';
            }
        });
    }

    // Target preset scaling
    const tPresetSelect = document.getElementById('target_preset');
    if (tPresetSelect) {
        tPresetSelect.addEventListener('change', (e) => {
            updateTargetScale();
        });
    }

    // Click handler for plotting impacts
    const targetBoard = document.getElementById('plotter_board');
    if (targetBoard) {
        targetBoard.addEventListener('click', (e) => {
            const rect = targetBoard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Add impact (coordinates relative to 280px container)
            state.tempImpacts.push({ x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) });
            drawPlotterBoard();
            calculatePlotterStats();
        });
    }

    // Initialize interactive star rating widgets
    initStarRatings();
}

// ==========================================
// MOCK JSPDF DOCUMENT TO RENDER VECTOR SVGS
// ==========================================
class SvgDocMock {
    constructor(widthMm, heightMm, sizePx, isPrint = false) {
        this.widthMm = widthMm;
        this.heightMm = heightMm;
        this.sizePx = sizePx;
        this.pxPerMm = sizePx / Math.max(widthMm, heightMm);
        this.isPrint = isPrint;
        this.elements = [];
        
        // default settings
        this.fillColor = 'rgb(0,0,0)';
        this.drawColor = 'rgb(0,0,0)';
        this.textColor = 'rgb(0,0,0)';
        this.lineWidth = 0.2;
        this.fontSize = 9;
        this.fontFamily = 'helvetica';
        this.fontWeight = 'normal';
        this.fontStyle = 'normal';
    }
    
    toPx(mm) {
        return mm * this.pxPerMm;
    }
    
    setFillColor(r, g, b) {
        if (g === undefined && b === undefined) {
            this.fillColor = `rgb(${r},${r},${r})`;
        } else {
            this.fillColor = `rgb(${r},${g},${b})`;
        }
        return this;
    }
    
    setDrawColor(r, g, b) {
        if (g === undefined && b === undefined) {
            this.drawColor = `rgb(${r},${r},${r})`;
        } else {
            this.drawColor = `rgb(${r},${g},${b})`;
        }
        return this;
    }
    
    setTextColor(r, g, b) {
        if (g === undefined && b === undefined) {
            this.textColor = `rgb(${r},${r},${r})`;
        } else {
            this.textColor = `rgb(${r},${g},${b})`;
        }
        return this;
    }
    
    setLineWidth(w) {
        this.lineWidth = w;
        return this;
    }
    
    setFont(name, style) {
        this.fontFamily = name;
        if (style) {
            this.fontWeight = style.includes('bold') ? 'bold' : 'normal';
            this.fontStyle = style.includes('italic') ? 'italic' : 'normal';
        } else {
            this.fontWeight = 'normal';
            this.fontStyle = 'normal';
        }
        return this;
    }
    
    setFontSize(size) {
        this.fontSize = size;
        return this;
    }
    
    circle(x, y, r, style) {
        const cx = this.toPx(x);
        const cy = this.toPx(y);
        const radius = this.toPx(r);
        const strokeW = this.toPx(this.lineWidth);
        
        let fill = 'none';
        let stroke = 'none';
        
        if (style === 'F') {
            fill = this.fillColor;
        } else if (style === 'S') {
            stroke = this.drawColor;
        } else if (style === 'FD' || style === 'DF') {
            fill = this.fillColor;
            stroke = this.drawColor;
        } else {
            stroke = this.drawColor;
        }
        
        if (this.isPrint) {
            if (fill === 'rgb(0,0,0)' || fill === '#1a1a1a') fill = 'none';
            if (stroke === 'rgb(255,255,255)') stroke = '#333333';
        }
        
        this.elements.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW.toFixed(2)}" />`);
        return this;
    }
    
    rect(x, y, w, h, style) {
        const rx = this.toPx(x);
        const ry = this.toPx(y);
        const rw = this.toPx(w);
        const rh = this.toPx(h);
        const strokeW = this.toPx(this.lineWidth);
        
        let fill = 'none';
        let stroke = 'none';
        
        if (style === 'F') {
            fill = this.fillColor;
        } else if (style === 'S') {
            stroke = this.drawColor;
        } else if (style === 'FD' || style === 'DF') {
            fill = this.fillColor;
            stroke = this.drawColor;
        } else {
            stroke = this.drawColor;
        }
        
        this.elements.push(`<rect x="${rx.toFixed(2)}" y="${ry.toFixed(2)}" width="${rw.toFixed(2)}" height="${rh.toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW.toFixed(2)}" />`);
        return this;
    }
    
    line(x1, y1, x2, y2) {
        const px1 = this.toPx(x1);
        const py1 = this.toPx(y1);
        const px2 = this.toPx(x2);
        const py2 = this.toPx(y2);
        const strokeW = this.toPx(this.lineWidth);
        
        let stroke = this.drawColor;
        if (this.isPrint && stroke === 'rgb(255,255,255)') {
            stroke = '#333333';
        }
        
        this.elements.push(`<line x1="${px1.toFixed(2)}" y1="${py1.toFixed(2)}" x2="${px2.toFixed(2)}" y2="${py2.toFixed(2)}" stroke="${stroke}" stroke-width="${strokeW.toFixed(2)}" />`);
        return this;
    }
    
    lines(expressions, x, y, scale, style, closed) {
        const scX = scale ? scale[0] : 1;
        const scY = scale ? scale[1] : 1;
        
        let cx = x;
        let cy = y;
        
        let pathData = `M ${this.toPx(cx).toFixed(2)} ${this.toPx(cy).toFixed(2)}`;
        
        expressions.forEach(pt => {
            const dx = pt[0] * scX;
            const dy = pt[1] * scY;
            cx += dx;
            cy += dy;
            pathData += ` L ${this.toPx(cx).toFixed(2)} ${this.toPx(cy).toFixed(2)}`;
        });
        
        if (closed) {
            pathData += ' Z';
        }
        
        let fill = 'none';
        let stroke = 'none';
        const strokeW = this.toPx(this.lineWidth);
        
        if (style === 'F') {
            fill = this.fillColor;
        } else if (style === 'S') {
            stroke = this.drawColor;
        } else if (style === 'FD' || style === 'DF') {
            fill = this.fillColor;
            stroke = this.drawColor;
        } else {
            stroke = this.drawColor;
        }
        
        this.elements.push(`<path d="${pathData}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW.toFixed(2)}" />`);
        return this;
    }
    
    text(text, x, y, options) {
        const px = this.toPx(x);
        const py = this.toPx(y);
        
        let anchor = 'start';
        if (options && options.align) {
            if (options.align === 'center') anchor = 'middle';
            else if (options.align === 'right') anchor = 'end';
        }
        
        let dy = '0';
        if (options && options.baseline === 'middle') {
            dy = '0.35em';
        }
        
        const fontSizePx = this.toPx(this.fontSize * 0.3527); // 1 pt = 0.3527 mm
        
        let fill = this.textColor;
        if (this.isPrint && fill === 'rgb(255,255,255)') {
            fill = '#333333';
        }
        
        const styleAttrs = [];
        if (this.fontWeight === 'bold') styleAttrs.push('font-weight="bold"');
        if (this.fontStyle === 'italic') styleAttrs.push('font-style="italic"');
        
        this.elements.push(`<text x="${px.toFixed(2)}" y="${py.toFixed(2)}" dy="${dy}" fill="${fill}" font-size="${fontSizePx.toFixed(2)}" font-family="${this.fontFamily}" text-anchor="${anchor}" ${styleAttrs.join(' ')}>${text}</text>`);
        return this;
    }
    
    getTextWidth(text) {
        return text.length * this.fontSize * 0.3527 * 0.6;
    }
    
    addPage() { return this; }
    save() { return this; }
}

// Fallback grid drawer
function drawGridAt(doc, ox, oy, unit, mmPerUnit) {
    doc.setLineWidth(0.15);
    doc.setDrawColor(220, 220, 220);
    for (let i = -4; i <= 4; i++) {
        if (i === 0) continue;
        doc.line(ox + i * mmPerUnit, oy - 4 * mmPerUnit, ox + i * mmPerUnit, oy + 4 * mmPerUnit);
        doc.line(ox - 4 * mmPerUnit, oy + i * mmPerUnit, ox + 4 * mmPerUnit, oy + i * mmPerUnit);
    }
    
    doc.setLineWidth(0.4);
    doc.setDrawColor(50, 50, 50);
    doc.line(ox, oy - 4.5 * mmPerUnit, ox, oy + 4.5 * mmPerUnit);
    doc.line(ox - 4.5 * mmPerUnit, oy, ox + 4.5 * mmPerUnit, oy);
    
    for (let i = 1; i <= 4; i++) {
        const r = mmPerUnit * i;
        if (i === 1) {
            doc.setLineWidth(0.5);
            doc.setDrawColor(255, 71, 87);
        } else {
            doc.setLineWidth(0.3);
            doc.setDrawColor(50, 50, 50);
        }
        doc.circle(ox, oy, r, 'S');
        
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(8);
        const labelText = i + ' ' + (unit === 'MOA' ? 'M' : '"');
        doc.text(labelText, ox + r - 3, oy - 1, { align: 'right' });
    }
    
    doc.setFillColor(255, 71, 87);
    doc.circle(ox, oy, 1.0, 'F');
}

// Fallback ISSF Target drawer
function fallbackDrawISSF(doc, ox, oy, spec, scale = 1) {
    const diams = spec.diams.map(d => d * scale);
    const black = spec.black * scale;
    const innerTen = (spec.innerTen || 0) * scale;
    const numFont = Math.max(4, Math.min(spec.numFont || 9, (spec.numFont || 9) * scale));

    doc.setFillColor(26, 26, 26);
    doc.circle(ox, oy, black / 2, 'F');

    doc.setLineWidth(0.2);
    for (let i = 0; i < diams.length; i++) {
        if (diams[i] <= black) doc.setDrawColor(255, 255, 255);
        else doc.setDrawColor(50, 50, 50);
        doc.circle(ox, oy, diams[i] / 2, 'S');
    }

    if (innerTen > 0) {
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.15);
        doc.circle(ox, oy, innerTen / 2, 'S');
    }

    const start = spec.firstRingValue || 1;
    const n = (spec.labelCount != null) ? spec.labelCount : (diams.length - 1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(numFont);
    for (let k = 0; k < n; k++) {
        const value = start + k;
        const rMid = (diams[k] / 2 + diams[k + 1] / 2) / 2;
        const onBlack = (2 * rMid) <= black;
        doc.setTextColor(onBlack ? 255 : 50, onBlack ? 255 : 50, onBlack ? 255 : 50);
        const s = String(value);
        const opt = { align: "center", baseline: "middle" };
        doc.text(s, ox - rMid, oy, opt);
        doc.text(s, ox + rMid, oy, opt);
        doc.text(s, ox, oy - rMid, opt);
        doc.text(s, ox, oy + rMid, opt);
    }
}

// Get target dimensions and settings from global target_generator.js ISSF specs or fallbacks
function getTargetSpecification(presetKey) {
    let key = presetKey;
    if (key === 'c50') key = 'issf_50m';
    
    const hasGen = (typeof window.ISSF !== 'undefined');
    const currentTargetLang = activeLang;
    
    if (key === 'c200') {
        const base = (hasGen && window.ISSF['issf_50m']) || {
            diams: [154.4, 138.4, 122.4, 106.4, 90.4, 74.4, 58.4, 42.4, 26.4, 10.4],
            black: 112.4,
            innerTen: 5.0,
            numFont: 9,
            dist: 50
        };
        return {
            ...base,
            isISSF: true,
            diams: base.diams.map(d => d * 2),
            black: base.black * 2,
            innerTen: base.innerTen * 2,
            name: currentTargetLang === 'en' ? 'C200 (200m Rifle - 400mm Center)' : 'C200 (Cible 200m - Visuel 400mm)',
            diameterMm: base.diams[0] * 2 * 1.15
        };
    }
    
    if (hasGen && window.ISSF && window.ISSF[key]) {
        const spec = window.ISSF[key];
        let name = key;
        if (window.I18N && window.I18N[currentTargetLang] && window.I18N[currentTargetLang][spec.titleKey]) {
            name = window.I18N[currentTargetLang][spec.titleKey];
        } else {
            const names = {
                fr: {
                    issf_50m: 'ISSF 50m Carabine (C50)',
                    issf_10m: 'ISSF 10m Pistolet',
                    issf_10m_rifle: 'ISSF 10m Carabine',
                    issf_25m_precision: 'ISSF 25m Pistolet Précision',
                    issf_25m_rapid: 'ISSF 25m Pistolet Vitesse',
                    issf_50m_pistol: 'ISSF 50m Pistolet Libre',
                    issf_300m: 'ISSF 300m Carabine'
                },
                en: {
                    issf_50m: 'ISSF 50m Rifle (C50)',
                    issf_10m: 'ISSF 10m Pistol',
                    issf_10m_rifle: 'ISSF 10m Rifle',
                    issf_25m_precision: 'ISSF 25m Pistol Precision',
                    issf_25m_rapid: 'ISSF 25m Pistol Rapid Fire',
                    issf_50m_pistol: 'ISSF 50m Pistol Free',
                    issf_300m: 'ISSF 300m Rifle'
                }
            };
            const langKey = names[currentTargetLang] ? currentTargetLang : 'fr';
            name = names[langKey][key] || key;
        }
        return {
            ...spec,
            isISSF: true,
            name: name,
            diameterMm: spec.diams[0] * 1.15
        };
    }
    
    if (hasGen && window.BIATHLON && window.BIATHLON[key]) {
        const spec = window.BIATHLON[key];
        const name = key === 'biathlon_prone' 
            ? (currentTargetLang === 'en' ? 'Biathlon Prone (Ø45/115mm)' : 'Biathlon Couché (Ø45/115mm)')
            : (currentTargetLang === 'en' ? 'Biathlon Standing (Ø115mm)' : 'Biathlon Debout (Ø115mm)');
        return {
            isBiathlon: true,
            spec: spec,
            name: name,
            diameterMm: spec.aim * 1.15
        };
    }
    
    if (hasGen && window.SILHOUETTE && window.SILHOUETTE[key]) {
        const spec = window.SILHOUETTE[key];
        const name = key === 'ipsc' 
            ? (currentTargetLang === 'en' ? 'IPSC Classic Silhouette' : 'Silhouette IPSC Classic')
            : (currentTargetLang === 'en' ? 'IDPA Silhouette' : 'Silhouette IDPA');
        return {
            isSilhouette: true,
            spec: spec,
            name: name,
            diameterMm: Math.max(spec.w, spec.h) * 1.10
        };
    }
    
    if (key === 'field_target') {
        return {
            isFieldTarget: true,
            killZone: 40,
            name: currentTargetLang === 'en' ? 'Field Target (Kill Zone Ø40mm)' : 'Field Target (Kill Zone Ø40mm)',
            diameterMm: 70 * 1.15
        };
    }
    
    if (key === 'standard_rings') {
        return {
            isStandardRings: true,
            name: currentTargetLang === 'en' ? 'Standard Target 180mm' : 'Cible Loisir 180mm',
            diameterMm: 180 * 1.15
        };
    }
    
    if (key === 'grouping') {
        return {
            isGrouping: true,
            name: currentTargetLang === 'en' ? 'Grouping Target' : 'Cible de Groupement',
            diameterMm: 70 * 1.15
        };
    }
    
    if (key === 'moa') {
        return {
            isGrid: true,
            unit: 'MOA',
            mmPerUnit: 29.0888,
            diameterMm: 29.0888 * 8,
            name: currentTargetLang === 'en' ? '1 MOA @ 100m Grid' : 'Grille 1 MOA @ 100m'
        };
    }
    
    if (key === 'inch') {
        return {
            isGrid: true,
            unit: currentTargetLang === 'en' ? 'inch' : 'pouce',
            mmPerUnit: 25.4,
            diameterMm: 25.4 * 8,
            name: currentTargetLang === 'en' ? '1 Inch Grid (8" total)' : 'Grille 1 pouce (8" total)'
        };
    }
    
    return {
        isISSF: true,
        diams: [154.4, 138.4, 122.4, 106.4, 90.4, 74.4, 58.4, 42.4, 26.4, 10.4],
        black: 112.4,
        innerTen: 5.0,
        numFont: 9,
        name: 'Cible Standard C50',
        diameterMm: 154.4 * 1.15
    };
}

// Generate high quality vector SVG target representation using SvgDocMock and target_generator.js
function generateTargetSVG(presetKey, sizePx, impacts = [], mpi = null, drawGroup = false, groupSizePx = 0, isPrint = false) {
    const spec = getTargetSpecification(presetKey);
    const diameterMm = spec.diameterMm;
    const centerMm = diameterMm / 2;
    
    const doc = new SvgDocMock(diameterMm, diameterMm, sizePx, isPrint);
    
    if (spec.isISSF) {
        const scale = presetKey === 'c200' ? 2 : 1;
        if (typeof window.drawISSFAt === 'function') {
            window.drawISSFAt(doc, centerMm, centerMm, spec, scale);
        } else {
            fallbackDrawISSF(doc, centerMm, centerMm, spec, scale);
        }
    } else if (spec.isBiathlon) {
        if (typeof window.drawBiathlonAt === 'function') {
            window.drawBiathlonAt(doc, centerMm, centerMm, spec.spec);
        }
    } else if (spec.isSilhouette) {
        if (spec.spec && typeof spec.spec.draw === 'function') {
            spec.spec.draw(doc, centerMm, centerMm, 1);
        }
    } else if (spec.isFieldTarget) {
        if (typeof window.drawFieldTargetAt === 'function') {
            window.drawFieldTargetAt(doc, centerMm, centerMm, spec.killZone);
        }
    } else if (spec.isStandardRings) {
        if (typeof window.drawStandardAt === 'function') {
            window.drawStandardAt(doc, centerMm, centerMm);
        }
    } else if (spec.isGrouping) {
        if (typeof window.drawGroupingAt === 'function') {
            window.drawGroupingAt(doc, centerMm, centerMm);
        }
    } else if (spec.isGrid) {
        drawGridAt(doc, centerMm, centerMm, spec.unit, spec.mmPerUnit);
    }
    
    const bgColor = isPrint ? '#ffffff' : '#f5f2eb';
    
    let svg = `<svg viewBox="0 0 ${sizePx} ${sizePx}" width="${sizePx}" height="${sizePx}" xmlns="http://www.w3.org/2000/svg" style="border-radius:50%; overflow:hidden; display:block; box-shadow:inset 0 0 10px rgba(0,0,0,0.15);">`;
    svg += `<rect width="100%" height="100%" fill="${bgColor}" />`;
    svg += doc.elements.join('\n');
    
    const scaleFactor = sizePx / 280;
    
    if (drawGroup && impacts.length >= 2 && groupSizePx > 0 && mpi) {
        const cx = mpi.x * scaleFactor;
        const cy = mpi.y * scaleFactor;
        const r = (groupSizePx / 2) * scaleFactor;
        svg += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" stroke="#2ed573" stroke-width="1.5" stroke-dasharray="3,2" fill="none" />`;
    }
    
    if (mpi) {
        const cx = mpi.x * scaleFactor;
        const cy = mpi.y * scaleFactor;
        svg += `<line x1="${cx - 6}" y1="${cy}" x2="${cx + 6}" y2="${cy}" stroke="#ff9f43" stroke-width="2" />`;
        svg += `<line x1="${cx}" y1="${cy - 6}" x2="${cx}" y2="${cy + 6}" stroke="#ff9f43" stroke-width="2" />`;
        svg += `<circle cx="${cx}" cy="${cy}" r="2" fill="#ff9f43" stroke="#ffffff" stroke-width="0.5" />`;
    }
    
    impacts.forEach((imp, idx) => {
        const isNewest = idx === impacts.length - 1;
        const color = isNewest ? '#ff3333' : '#2ed573';
        const strokeColor = '#ffffff';
        const r = (isNewest ? 4.5 : 3.5) * scaleFactor;
        const cx = imp.x * scaleFactor;
        const cy = imp.y * scaleFactor;
        
        svg += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${color}" stroke="${strokeColor}" stroke-width="${(1 * scaleFactor).toFixed(2)}" />`;
        
        const fontSize = (isNewest ? 6 : 5) * scaleFactor;
        if (fontSize >= 3) {
            svg += `<text x="${cx.toFixed(2)}" y="${(cy + (fontSize * 0.35)).toFixed(2)}" fill="#ffffff" font-size="${fontSize.toFixed(2)}" font-family="sans-serif" font-weight="bold" text-anchor="middle">${idx + 1}</text>`;
        }
    });
    
    svg += `</svg>`;
    return svg;
}

// Redraw target background, impacts and stats on the plotter board
function drawPlotterBoard() {
    const board = document.getElementById('plotter_board');
    if (!board) return;
    
    const presetKey = document.getElementById('target_preset').value;
    const count = state.tempImpacts.length;
    let mpi = null;
    let maxDistPx = 0;
    
    if (count > 0) {
        let sumX = 0, sumY = 0;
        state.tempImpacts.forEach(pt => {
            sumX += pt.x;
            sumY += pt.y;
        });
        mpi = { x: sumX / count, y: sumY / count };
        
        if (count >= 2) {
            for (let i = 0; i < count; i++) {
                for (let j = i + 1; j < count; j++) {
                    const dx = state.tempImpacts[i].x - state.tempImpacts[j].x;
                    const dy = state.tempImpacts[i].y - state.tempImpacts[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist > maxDistPx) {
                        maxDistPx = dist;
                    }
                }
            }
        }
    }
    
    board.innerHTML = generateTargetSVG(presetKey, 280, state.tempImpacts, mpi, true, maxDistPx, false);
}

// Update the MM per pixel conversion based on selected preset
function updateTargetScale() {
    const presetKey = document.getElementById('target_preset').value;
    const spec = getTargetSpecification(presetKey);
    const diameterMm = spec.diameterMm;
    state.scaleMmPerPixel = diameterMm / 280;
    
    drawPlotterBoard();
    calculatePlotterStats();
}

// Calculate Group stats and draw MPI + Group circle
function calculatePlotterStats() {
    const count = state.tempImpacts.length;
    document.getElementById('lbl_shot_count').innerText = count;
    
    if (count === 0) {
        document.getElementById('lbl_mpi_x').innerText = '-';
        document.getElementById('lbl_mpi_y').innerText = '-';
        document.getElementById('lbl_group_size_mm').innerText = '-';
        document.getElementById('lbl_group_size_moa').innerText = '-';
        document.getElementById('lbl_group_size_mrad').innerText = '-';
        return;
    }
    
    // Calculate Mean Point of Impact (MPI)
    let sumX = 0, sumY = 0;
    state.tempImpacts.forEach(pt => {
        sumX += pt.x;
        sumY += pt.y;
    });
    
    const mpiX = sumX / count;
    const mpiY = sumY / count;
    
    // Coordinates relative to center (140px, 140px)
    const relX_px = mpiX - 140;
    const relY_px = 140 - mpiY; // invert Y for standard Cartesian graph
    
    // Convert MPI to millimeters
    const relX_mm = relX_px * state.scaleMmPerPixel;
    const relY_mm = relY_px * state.scaleMmPerPixel;
    
    document.getElementById('lbl_mpi_x').innerText = (relX_mm >= 0 ? '+' : '') + Math.round(relX_mm) + ' mm';
    document.getElementById('lbl_mpi_y').innerText = (relY_mm >= 0 ? '+' : '') + Math.round(relY_mm) + ' mm';
    
    // Calculate Extreme Spread (Max distance between any two shots)
    let maxDistPx = 0;
    
    if (count >= 2) {
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const dx = state.tempImpacts[i].x - state.tempImpacts[j].x;
                const dy = state.tempImpacts[i].y - state.tempImpacts[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > maxDistPx) {
                    maxDistPx = dist;
                }
            }
        }
    }
    
    // Group diameter size in mm
    const groupSizeMm = maxDistPx * state.scaleMmPerPixel;
    
    // Get target distance to calculate angular size (MOA & MRAD)
    const distanceVal = parseFloat(document.getElementById('s_distance').value) || 100;
    
    // MOA (1 MOA @ distance = distance * tan(1/60 deg))
    // Approx: 1 MOA at 100m = 29.0888 mm
    // MOA value = (size in mm) / (29.0888 * (distance in m / 100))
    const moaFactor = 29.0888 * (distanceVal / 100);
    const groupSizeMoa = moaFactor > 0 ? (groupSizeMm / moaFactor) : 0;
    
    // MRAD (1 MRAD = 100mm at 100m)
    // MRAD value = (size in mm) / (100 * (distance in m / 100)) = size in mm / distance
    const groupSizeMrad = distanceVal > 0 ? (groupSizeMm / distanceVal) : 0;
    
    document.getElementById('lbl_group_size_mm').innerText = groupSizeMm.toFixed(1) + ' mm';
    document.getElementById('lbl_group_size_moa').innerText = groupSizeMoa.toFixed(2) + ' MOA';
    document.getElementById('lbl_group_size_mrad').innerText = groupSizeMrad.toFixed(2) + ' MRAD';
    
    // Update raw values to be submitted
    document.getElementById('s_group_size').value = groupSizeMm.toFixed(1);
    document.getElementById('s_rounds_fired').value = count;
}

// Clear target plotter impacts
function clearPlotter() {
    state.tempImpacts = [];
    drawPlotterBoard();
    calculatePlotterStats();
}

// Undo last target plotter impact
function undoPlotter() {
    state.tempImpacts.pop();
    drawPlotterBoard();
    calculatePlotterStats();
}

// Render everything
function renderAll() {
    renderDashboard();
    renderWeapons();
    renderSessions();
    renderMaintenance();
    
    // Populate select lists for forms
    populateWeaponSelects();
}

// Render Dashboard Tab
function renderDashboard() {
    // Basic sums
    const totalSessions = state.sessions.length;
    const totalWeapons = state.weapons.length;
    
    // Calculate total round count
    let totalRounds = 0;
    state.weapons.forEach(w => {
        totalRounds += parseInt(w.initialRoundCount) || 0;
    });
    state.sessions.forEach(s => {
        totalRounds += parseInt(s.roundsFired) || 0;
    });
    
    // Sum maintenance tasks
    const totalMaint = state.maintenance.length;
    
    document.getElementById('stat_total_rounds').innerText = totalRounds;
    document.getElementById('stat_total_sessions').innerText = totalSessions;
    document.getElementById('stat_total_weapons').innerText = totalWeapons;
    document.getElementById('stat_total_maint').innerText = totalMaint;
    
    // Render Dashboard Charts & Tables
    renderDashboardRecentSessions();
    renderDashboardChart();
}

// Render recent sessions list in Dashboard
function renderDashboardRecentSessions() {
    const listDiv = document.getElementById('db_recent_sessions');
    if (!listDiv) return;
    
    if (state.sessions.length === 0) {
        listDiv.innerHTML = `<p style="color:var(--color-text-light);font-style:italic;">${I18N_CARNET[activeLang]['js-empty-recent-sessions']}</p>`;
        return;
    }
    
    // Sort and get last 3
    const sorted = [...state.sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    
    let html = '<div style="display:flex;flex-direction:column;gap:0.75rem;">';
    sorted.forEach(s => {
        const weapon = state.weapons.find(w => w.id === s.weaponId);
        const weaponName = weapon ? weapon.name : I18N_CARNET[activeLang]['js-weapon-unknown'];
        const shotsLabel = I18N_CARNET[activeLang]['js-session-coups'];
        const groupLabel = activeLang === 'fr' ? 'Dispersion' : 'Grouping';
        const detailsBtnLabel = activeLang === 'fr' ? 'Détails' : 'Details';
        html += `
            <div style="padding:0.75rem; border-left:3px solid var(--color-accent); background:var(--color-bg); border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:var(--color-text);">${formatDate(s.date)}</strong> &mdash; <span style="font-size:0.9rem;">${weaponName}</span>
                    <div style="font-size:0.8rem; color:var(--color-text-light); margin-top:0.15rem;">
                        ${s.stand ? s.stand + ' &bull; ' : ''}${s.distance}m &bull; ${s.roundsFired} ${shotsLabel} &bull; ${groupLabel}: <strong>${s.groupSize} mm</strong>
                    </div>
                </div>
                <button type="button" class="btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="switchTab('sessions')">${detailsBtnLabel}</button>
            </div>
        `;
    });
    html += '</div>';
    listDiv.innerHTML = html;
}

// Render SVG Chart on Dashboard
function renderDashboardChart() {
    const chartDiv = document.getElementById('db_chart_container');
    if (!chartDiv) return;
    
    if (state.sessions.length === 0) {
        chartDiv.innerHTML = `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--color-text-light);font-style:italic;">${I18N_CARNET[activeLang]['js-empty-chart-history']}</div>`;
        return;
    }
    
    // Group rounds fired by month/year
    const monthlyData = {};
    const monthsName = activeLang === 'fr' 
        ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get last 6 months list dynamically
    const now = new Date();
    const activeMonths = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        activeMonths.push({
            key: key,
            label: `${monthsName[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
        });
        monthlyData[key] = 0;
    }
    
    // Populate counts
    state.sessions.forEach(s => {
        const dateObj = new Date(s.date);
        const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData.hasOwnProperty(key)) {
            monthlyData[key] += parseInt(s.roundsFired) || 0;
        }
    });
    
    // Convert to values array
    const chartPoints = activeMonths.map(m => monthlyData[m.key]);
    const maxVal = Math.max(...chartPoints, 50); // Min height cap
    
    // Build SVG
    const width = 500;
    const height = 220;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    
    const xStep = chartW / 5;
    
    // Build line path
    let pointsStr = '';
    let areaPointsStr = `${padding.left},${height - padding.bottom} `;
    
    chartPoints.forEach((val, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + chartH - (val / maxVal) * chartH;
        pointsStr += `${x},${y} `;
        areaPointsStr += `${x},${y} `;
    });
    areaPointsStr += `${padding.left + 5 * xStep},${height - padding.bottom}`;
    
    let svg = `
        <svg viewBox="0 0 ${width} ${height}" class="chart-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Grid Lines & Axis -->
            <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" class="chart-axis" />
            <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" class="chart-axis" />
            
            <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" class="chart-grid-line" />
            <line x1="${padding.left}" y1="${padding.top + chartH/2}" x2="${width - padding.right}" y2="${padding.top + chartH/2}" class="chart-grid-line" />
            
            <!-- Axis Labels -->
            <text x="${padding.left - 10}" y="${padding.top + 4}" text-anchor="end" class="chart-text">${maxVal}</text>
            <text x="${padding.left - 10}" y="${padding.top + chartH/2 + 4}" text-anchor="end" class="chart-text">${Math.round(maxVal/2)}</text>
            <text x="${padding.left - 10}" y="${height - padding.bottom + 4}" text-anchor="end" class="chart-text">0</text>
    `;
    
    // X Axis labels
    activeMonths.forEach((m, i) => {
        const x = padding.left + i * xStep;
        svg += `<text x="${x}" y="${height - padding.bottom + 18}" text-anchor="middle" class="chart-text">${m.label}</text>`;
    });
    
    // Area & Line Path
    svg += `
        <polygon points="${areaPointsStr}" class="chart-area" />
        <polyline points="${pointsStr}" class="chart-line" />
    `;
    
    // Data Dots
    const roundsUnit = activeLang === 'fr' ? 'cartouches' : 'rounds';
    chartPoints.forEach((val, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + chartH - (val / maxVal) * chartH;
        svg += `
            <circle cx="${x}" cy="${y}" r="5" class="chart-dot">
                <title>${activeMonths[i].label}: ${val} ${roundsUnit}</title>
            </circle>
        `;
    });
    
    svg += `</svg>`;
    chartDiv.innerHTML = svg;
}

// Render Weapons Tab
function renderWeapons() {
    const grid = document.getElementById('weapons_grid');
    if (!grid) return;
    
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    
    if (state.weapons.length === 0) {
        grid.className = 'empty-state';
        grid.style.display = 'block';
        grid.innerHTML = `
            <span class="empty-state-icon"><i class="li-target"></i></span>
            <h4>${trans['js-empty-weapons-title']}</h4>
            <p>${trans['js-empty-weapons-desc']}</p>
            <button type="button" class="btn-primary" onclick="openWeaponModal()"><i class="li-plus"></i> ${trans['lbl-add-weapon']}</button>
        `;
        return;
    }
    
    grid.className = 'weapons-grid';
    grid.style.display = 'grid';
    
    let html = '';
    state.weapons.forEach(w => {
        // Calculate round count for this weapon
        const weaponRounds = (parseInt(w.initialRoundCount) || 0) + 
            state.sessions
                .filter(s => s.weaponId === w.id)
                .reduce((acc, s) => acc + (parseInt(s.roundsFired) || 0), 0);
                
        html += `
            <div class="weapon-card">
                <div class="weapon-header">
                    <h4 class="weapon-title">${escapeHTML(w.name)}</h4>
                    <span class="weapon-caliber">${renderCaliberDbLink(w.caliber)}</span>
                </div>
                <div class="weapon-details">
                    <span>${trans['js-weapon-canon']}: <strong>${w.barrelLength || '-'} "</strong></span>
                    <span>${trans['js-weapon-rayure']}: <strong>1:${w.twistRate || '-'} "</strong></span>
                    <span>${trans['js-weapon-zero']}: <strong>${w.zeroDistance || '-'} m</strong></span>
                    <span>${trans['js-weapon-tirs']}: <strong style="color:var(--color-accent);">${weaponRounds}</strong></span>
                    <span style="grid-column:1/-1;">${trans['js-weapon-optique']}: <strong>${escapeHTML(w.optics) || '-'}</strong></span>
                </div>
                ${w.notes ? `<div style="font-size:0.8rem; color:var(--color-text-light); margin-bottom:0.75rem; border-top:1px dashed var(--color-border); padding-top:0.5rem; font-style:italic;">${escapeHTML(w.notes)}</div>` : ''}
                <div class="weapon-actions">
                    <button type="button" class="btn-icon" title="${trans['js-weapon-edit']}" onclick="openWeaponModal('${w.id}')"><i class="li-pencil"></i></button>
                    <button type="button" class="btn-icon btn-danger" title="${trans['js-weapon-delete']}" onclick="deleteWeapon('${w.id}')"><i class="li-trash"></i></button>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

// Render Sessions Tab
function renderSessions() {
    const countEl = document.getElementById('nav_session_count');
    if (countEl) {
        countEl.innerText = state.sessions.length;
    }

    const listDiv = document.getElementById('sessions_list');
    if (!listDiv) return;
    
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    
    if (state.sessions.length === 0) {
        listDiv.className = 'empty-state';
        listDiv.innerHTML = `
            <span class="empty-state-icon"><i class="li-file-text"></i></span>
            <h4>${trans['js-empty-sessions-title']}</h4>
            <p>${trans['js-empty-sessions-desc']}</p>
            <button type="button" class="btn-primary" onclick="openSessionModal()"><i class="li-plus"></i> ${trans['lbl-new-session']}</button>
        `;
        return;
    }
    
    listDiv.className = ''; // remove empty-state
    
    // Sort chronological (newest first)
    let filtered = [...state.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply filters
    const filterWeapon = document.getElementById('filter_weapon').value;
    if (filterWeapon) {
        filtered = filtered.filter(s => s.weaponId === filterWeapon);
    }
    
    const filterStand = document.getElementById('filter_stand').value.toLowerCase().trim();
    if (filterStand) {
        filtered = filtered.filter(s => s.stand && s.stand.toLowerCase().includes(filterStand));
    }
    
    if (filtered.length === 0) {
        listDiv.innerHTML = `<div class="empty-state"><h4>${trans['js-empty-sessions-filter']}</h4></div>`;
        return;
    }
    
    let html = '';
    filtered.forEach(s => {
        const weapon = state.weapons.find(w => w.id === s.weaponId);
        const weaponName = weapon ? weapon.name : trans['js-weapon-unknown'];
        
        // Generate impacts preview HTML using target generator SVG representation
        let previewHtml = '';
        if (s.impacts && s.impacts.length > 0) {
            const targetSVG = generateTargetSVG(s.targetPreset || 'issf_50m', 140, s.impacts, s.mpi, false, 0, false);
            previewHtml += `<div class="session-target-preview-svg">${targetSVG}</div>`;
            previewHtml += `<div class="session-target-stats">${s.roundsFired} ${trans['js-session-coups']} &bull; ES: ${s.groupSize} mm</div>`;
        } else {
            previewHtml += `
                <div class="session-target-preview" style="background:#222;display:flex;align-items:center;justify-content:center;color:#666;font-size:0.75rem;flex-direction:column;border-color:#333;">
                    <i class="li-ban" style="font-size:1.8rem;margin-bottom:0.3rem;"></i>
                    ${trans['js-session-no-plotting']}
                </div>
                <div class="session-target-stats">${s.roundsFired} ${trans['js-session-coups']} &bull; ${activeLang === 'en' ? 'Group' : 'Gr'}: ${s.groupSize} mm</div>
            `;
        }
        
        html += `
            <div class="session-card" id="session-card-${s.id}">
                <div class="session-header">
                    <div class="session-title-block" style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                        <span class="session-date">${formatDate(s.date)}</span>
                        <span class="session-stand"><i class="li-target"></i> ${escapeHTML(s.stand) || trans['js-session-stand']}</span>
                        ${s.discipline ? `<span class="session-discipline-badge" style="background:var(--color-bg); border:1px solid var(--color-border); padding:0.15rem 0.5rem; font-size:0.75rem; font-weight:600; border-radius:12px; color:var(--color-text-light); text-transform:uppercase;">${trans['opt-s-disp-' + s.discipline] || s.discipline}</span>` : ''}
                    </div>
                    <div class="noprint" style="display:flex;gap:0.4rem;">
                        <button type="button" class="btn-icon" title="${trans['js-session-print']}" onclick="printSession('${s.id}')"><i class="li-printer"></i></button>
                        <button type="button" class="btn-icon" title="${trans['js-session-duplicate-title'] || 'Dupliquer cette séance'}" onclick="duplicateSession('${s.id}')"><i class="li-copy"></i></button>
                        <button type="button" class="btn-icon" title="${trans['js-session-edit']}" onclick="openSessionModal('${s.id}')"><i class="li-pencil"></i></button>
                        <button type="button" class="btn-icon btn-danger" title="${trans['js-session-delete']}" onclick="deleteSession('${s.id}')"><i class="li-trash"></i></button>
                    </div>
                </div>
                
                <div class="session-grid">
                    <div class="session-info-column">
                        <div class="session-info-block">
                            <h5>${trans['js-session-weapon-caliber']}</h5>
                            <p><strong>${escapeHTML(weaponName)}</strong><br><span style="font-size:0.8rem;color:var(--color-text-light);">${renderCaliberDbLink(s.caliber)}</span></p>
                        </div>
                        <div class="session-info-block">
                            <h5>${trans['js-session-ammo-velocity']}</h5>
                            <p>${escapeHTML(s.ammo) || 'N/A'}<br><span style="font-size:0.8rem;color:var(--color-text-light);">${s.bulletWeight ? s.bulletWeight+'gr &bull; ' : ''}${s.powderCharge ? s.powderCharge+'gr ' + (activeLang === 'en' ? 'powder' : 'poudre') + ' &bull; ' : ''}${s.velocity ? s.velocity+'m/s' : ''}</span></p>
                        </div>
                        <div class="session-info-block">
                            <h5>${trans['js-session-dist-conditions']}</h5>
                            <p>${s.distance} m<br><span style="font-size:0.8rem;color:var(--color-text-light);">${s.temp ? s.temp+'°C &bull; ' : ''}${s.wind ? s.wind+'m/s ' + trans['js-session-vent'] : trans['js-session-pas-de-vent']}</span></p>
                        </div>
                        ${(s.discipline || s.objective) ? `
                        <div class="session-info-block">
                            <h5>${trans['lbl-s-discipline']} &amp; ${trans['lbl-s-objective']}</h5>
                            <p>${s.discipline ? `<strong>${trans['opt-s-disp-' + s.discipline] || s.discipline}</strong>` : ''}${s.discipline && s.objective ? ' &bull; ' : ''}${s.objective ? `<span>${escapeHTML(s.objective)}</span>` : ''}</p>
                        </div>` : ''}
                        ${(s.fatigue || s.concentration || s.confidence) ? `
                        <div class="session-info-block">
                            <h5>${trans['lbl-s-sub-review']}</h5>
                            <p style="font-size:0.85rem; line-height:1.4;">
                                ${s.fatigue ? `<strong>${activeLang === 'en' ? 'Fatigue' : 'Fatigue'} :</strong> ${renderStars(s.fatigue)}<br>` : ''}
                                ${s.concentration ? `<strong>${activeLang === 'en' ? 'Concentration' : 'Concentration'} :</strong> ${renderStars(s.concentration)}<br>` : ''}
                                ${s.confidence ? `<strong>${activeLang === 'en' ? 'Confidence' : 'Confiance'} :</strong> ${renderStars(s.confidence)}` : ''}
                            </p>
                        </div>` : ''}
                        ${s.notes ? `<div class="session-notes">${escapeHTML(s.notes).replace(/\n/g, '<br>')}</div>` : ''}
                        ${s.errors ? `<div class="session-notes" style="border-left: 3px solid #e74c3c; padding-left: 0.5rem; margin-top: 0.5rem;"><strong>${trans['lbl-s-errors']} :</strong> ${escapeHTML(s.errors).replace(/\n/g, '<br>')}</div>` : ''}
                        ${s.actions ? `<div class="session-notes" style="border-left: 3px solid #2ecc71; padding-left: 0.5rem; margin-top: 0.5rem;"><strong>${trans['lbl-s-actions']} :</strong> ${escapeHTML(s.actions).replace(/\n/g, '<br>')}</div>` : ''}
                    </div>
                    
                    <div class="session-target-column">
                        ${previewHtml}
                    </div>
                </div>
            </div>
        `;
    });
    listDiv.innerHTML = html;
}

// Render Maintenance Tab
function renderMaintenance() {
    const listDiv = document.getElementById('maint_list');
    if (!listDiv) return;
    
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    
    if (state.maintenance.length === 0) {
        listDiv.className = 'empty-state';
        listDiv.innerHTML = `
            <span class="empty-state-icon"><i class="li-clock"></i></span>
            <h4>${trans['js-empty-maint-title']}</h4>
            <p>${trans['js-empty-maint-desc']}</p>
            <button type="button" class="btn-primary" onclick="openMaintModal()"><i class="li-plus"></i> ${trans['lbl-add-maint']}</button>
        `;
        return;
    }
    
    listDiv.className = 'maintenance-list';
    
    // Sort chronological (newest first)
    const sorted = [...state.maintenance].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    sorted.forEach(m => {
        const weapon = state.weapons.find(w => w.id === m.weaponId);
        const weaponName = weapon ? weapon.name : trans['js-weapon-unknown'];
        
        let typeLabel = m.type;
        if (m.type === 'nettoyage') typeLabel = trans['js-maint-clean'];
        else if (m.type === 'piece') typeLabel = trans['js-maint-piece'];
        else if (m.type === 'rodage') typeLabel = trans['js-maint-breakin'];
        else if (m.type === 'autre') typeLabel = trans['js-maint-other'];
        
        html += `
            <div class="maintenance-item">
                <div class="maint-info-block">
                    <span class="maint-date">${formatDate(m.date)}</span>
                    <div class="maint-details">
                        <h5>${typeLabel} <span class="maint-weapon">${escapeHTML(weaponName)}</span></h5>
                        <p>${escapeHTML(m.description)}</p>
                        ${m.roundCount ? `<p style="font-size:0.75rem;margin-top:0.15rem;color:var(--color-accent);font-weight:600;">${trans['js-maint-effectue-a']} : ${m.roundCount} ${trans['js-maint-tirs']}</p>` : ''}
                    </div>
                </div>
                <div class="maint-actions noprint">
                    <button type="button" class="btn-icon" title="${trans['js-session-edit']}" onclick="openMaintModal('${m.id}')"><i class="li-pencil"></i></button>
                    <button type="button" class="btn-icon btn-danger" title="${trans['js-session-delete']}" onclick="deleteMaint('${m.id}')"><i class="li-trash"></i></button>
                </div>
            </div>
        `;
    });
    listDiv.innerHTML = html;
}

// Populate weapon selector dropdowns in forms
function populateWeaponSelects() {
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    const list = [
        { id: 's_weapon_id', defaultKey: 'js-select-weapon' },
        { id: 'm_weapon_id', defaultKey: 'js-select-weapon' },
        { id: 'filter_weapon', defaultKey: 'js-all-weapons' }
    ];
    
    list.forEach(item => {
        const select = document.getElementById(item.id);
        if (!select) return;
        
        // Preserve active selection if possible
        const activeVal = select.value;
        
        select.innerHTML = `<option value="">${trans[item.defaultKey]}</option>`;
        state.weapons.forEach(w => {
            select.innerHTML += `<option value="${w.id}">${escapeHTML(w.name)} (${escapeHTML(w.caliber)})</option>`;
        });
        
        if (activeVal && select.querySelector(`option[value="${activeVal}"]`)) {
            select.value = activeVal;
        }
    });
}

// Apply filter from sessions filter bar
function applyFilters() {
    renderSessions();
}

// Reset filters in session filter bar
function resetFilters() {
    document.getElementById('filter_weapon').value = '';
    document.getElementById('filter_stand').value = '';
    renderSessions();
}

// Close any open modal dialog
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Clear editing variables
    if (modalId === 'modal_weapon') state.editingWeaponId = null;
    if (modalId === 'modal_session') state.editingSessionId = null;
    if (modalId === 'modal_maint') state.editingMaintId = null;
}

// Open Weapon Modal
function openWeaponModal(weaponId = null) {
    state.editingWeaponId = weaponId;
    const modal = document.getElementById('modal_weapon');
    const form = document.getElementById('form_weapon');
    
    document.getElementById('weapon_modal_title').innerText = weaponId ? (activeLang === 'en' ? "Edit Weapon" : "Éditer l'arme") : (activeLang === 'en' ? "Add Weapon" : "Ajouter une arme");
    form.reset();
    
    if (weaponId) {
        const w = state.weapons.find(wp => wp.id === weaponId);
        if (w) {
            document.getElementById('w_name').value = w.name;
            document.getElementById('w_caliber').value = w.caliber;
            document.getElementById('w_barrel_length').value = w.barrelLength || '';
            document.getElementById('w_twist_rate').value = w.twistRate || '';
            document.getElementById('w_zero_distance').value = w.zeroDistance || '';
            document.getElementById('w_optics').value = w.optics || '';
            document.getElementById('w_initial_round_count').value = w.initialRoundCount || 0;
            document.getElementById('w_notes').value = w.notes || '';
        }
    }
    
    modal.style.display = 'flex';
}

// Save Weapon Form
function saveWeapon(event) {
    event.preventDefault();
    
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    const name = document.getElementById('w_name').value.trim();
    const caliber = document.getElementById('w_caliber').value.trim();
    if (!name || !caliber) {
        showNotification(trans['js-error-weapon-req'], "error");
        return;
    }
    
    const wData = {
        name: name,
        caliber: caliber,
        barrelLength: document.getElementById('w_barrel_length').value.trim(),
        twistRate: document.getElementById('w_twist_rate').value.trim(),
        zeroDistance: document.getElementById('w_zero_distance').value.trim(),
        optics: document.getElementById('w_optics').value.trim(),
        initialRoundCount: parseInt(document.getElementById('w_initial_round_count').value) || 0,
        notes: document.getElementById('w_notes').value.trim()
    };
    
    if (state.editingWeaponId) {
        // Edit existing
        const idx = state.weapons.findIndex(w => w.id === state.editingWeaponId);
        if (idx !== -1) {
            state.weapons[idx] = { ...state.weapons[idx], ...wData };
            showNotification(trans['js-success-weapon-update']);
        }
    } else {
        // Add new
        wData.id = 'w_' + Math.random().toString(36).substr(2, 9);
        state.weapons.push(wData);
        showNotification(trans['js-success-weapon-new']);
    }
    
    saveData();
    closeModal('modal_weapon');
    renderAll();
}

// Delete Weapon
function deleteWeapon(weaponId) {
    const w = state.weapons.find(wp => wp.id === weaponId);
    if (!w) return;
    
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    // Check if sessions are using it
    const sessionCount = state.sessions.filter(s => s.weaponId === weaponId).length;
    let confirmMsg = trans['js-confirm-delete-weapon'].replace('{name}', w.name);
    if (sessionCount > 0) {
        confirmMsg += trans['js-confirm-delete-weapon-warning'].replace('{count}', sessionCount);
    }
    
    if (confirm(confirmMsg)) {
        state.weapons = state.weapons.filter(wp => wp.id !== weaponId);
        saveData();
        showNotification(trans['js-success-weapon-delete']);
        renderAll();
    }
}

// Open Session Modal
function openSessionModal(sessionId = null) {
    state.editingSessionId = sessionId;
    const modal = document.getElementById('modal_session');
    const form = document.getElementById('form_session');
    
    document.getElementById('session_modal_title').innerText = sessionId ? (activeLang === 'en' ? "Edit Session" : "Éditer la séance") : (activeLang === 'en' ? "Record a Shooting Session" : "Enregistrer une séance de tir");
    form.reset();
    
    // Default values for new session
    if (!sessionId) {
        document.getElementById('s_date').value = new Date().toISOString().split('T')[0];
        state.tempImpacts = [];
        document.getElementById('target_preset').value = 'issf_50m';
        document.getElementById('s_discipline').value = '';
        document.getElementById('s_objective').value = '';
        setRating('fatigue', 0);
        setRating('concentration', 0);
        setRating('confidence', 0);
        document.getElementById('s_errors').value = '';
        document.getElementById('s_actions').value = '';
    } else {
        const s = state.sessions.find(sn => sn.id === sessionId);
        if (s) {
            document.getElementById('s_date').value = s.date;
            document.getElementById('s_stand').value = s.stand || '';
            document.getElementById('s_weapon_id').value = s.weaponId;
            document.getElementById('s_caliber').value = s.caliber || '';
            document.getElementById('s_discipline').value = s.discipline || '';
            document.getElementById('s_objective').value = s.objective || '';
            document.getElementById('s_ammo').value = s.ammo || '';
            document.getElementById('s_bullet_weight').value = s.bulletWeight || '';
            document.getElementById('s_powder_charge').value = s.powderCharge || '';
            document.getElementById('s_velocity').value = s.velocity || '';
            document.getElementById('s_distance').value = s.distance || 100;
            document.getElementById('s_rounds_fired').value = s.roundsFired || 0;
            document.getElementById('s_group_size').value = s.groupSize || '';
            document.getElementById('s_notes').value = s.notes || '';
            document.getElementById('s_temp').value = s.temp || '';
            document.getElementById('s_wind').value = s.wind || '';
            
            // Set ratings
            setRating('fatigue', s.fatigue || 0);
            setRating('concentration', s.concentration || 0);
            setRating('confidence', s.confidence || 0);
            document.getElementById('s_errors').value = s.errors || '';
            document.getElementById('s_actions').value = s.actions || '';
            
            // Re-load impacts
            state.tempImpacts = s.impacts ? [...s.impacts] : [];
            // Detect target preset or default
            document.getElementById('target_preset').value = s.targetPreset || 'issf_50m';
        }
    }
    
    modal.style.display = 'flex';
    
    // Draw target board grid and impacts
    updateTargetScale();
}

// Save Session Form
function saveSession(event) {
    event.preventDefault();
    
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    const date = document.getElementById('s_date').value;
    const weaponId = document.getElementById('s_weapon_id').value;
    const distance = parseInt(document.getElementById('s_distance').value) || 100;
    const roundsFired = parseInt(document.getElementById('s_rounds_fired').value) || 0;
    const groupSize = document.getElementById('s_group_size').value.trim();
    
    if (!date || !weaponId) {
        showNotification(trans['js-error-session-req'], "error");
        return;
    }
    
    // Calculate MPI to save
    let mpi = null;
    if (state.tempImpacts.length > 0) {
        let sumX = 0, sumY = 0;
        state.tempImpacts.forEach(pt => {
            sumX += pt.x;
            sumY += pt.y;
        });
        mpi = {
            x: parseFloat((sumX / state.tempImpacts.length).toFixed(1)),
            y: parseFloat((sumY / state.tempImpacts.length).toFixed(1))
        };
    }
    
    const sData = {
        date: date,
        stand: document.getElementById('s_stand').value.trim(),
        weaponId: weaponId,
        caliber: document.getElementById('s_caliber').value.trim(),
        ammo: document.getElementById('s_ammo').value.trim(),
        bulletWeight: document.getElementById('s_bullet_weight').value.trim(),
        powderCharge: document.getElementById('s_powder_charge').value.trim(),
        velocity: document.getElementById('s_velocity').value.trim(),
        distance: distance,
        roundsFired: roundsFired,
        groupSize: groupSize ? parseFloat(groupSize) : 0,
        notes: document.getElementById('s_notes').value.trim(),
        temp: document.getElementById('s_temp').value.trim(),
        wind: document.getElementById('s_wind').value.trim(),
        impacts: state.tempImpacts,
        mpi: mpi,
        targetPreset: document.getElementById('target_preset').value,
        scaleMmPerPixel: state.scaleMmPerPixel,
        discipline: document.getElementById('s_discipline').value,
        objective: document.getElementById('s_objective').value.trim(),
        fatigue: parseInt(document.getElementById('rating_fatigue').getAttribute('data-rating')) || 0,
        concentration: parseInt(document.getElementById('rating_concentration').getAttribute('data-rating')) || 0,
        confidence: parseInt(document.getElementById('rating_confidence').getAttribute('data-rating')) || 0,
        errors: document.getElementById('s_errors').value.trim(),
        actions: document.getElementById('s_actions').value.trim()
    };
    
    if (state.editingSessionId) {
        // Edit existing
        const idx = state.sessions.findIndex(s => s.id === state.editingSessionId);
        if (idx !== -1) {
            state.sessions[idx] = { ...state.sessions[idx], ...sData };
            showNotification(trans['js-success-session-update']);
        }
    } else {
        // Add new
        sData.id = 's_' + Math.random().toString(36).substr(2, 9);
        state.sessions.push(sData);
        showNotification(trans['js-success-session-new']);
    }
    
    saveData();
    closeModal('modal_session');
    renderAll();
}

// Delete Session
function deleteSession(sessionId) {
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    if (confirm(trans['js-confirm-delete-session'])) {
        state.sessions = state.sessions.filter(s => s.id !== sessionId);
        saveData();
        showNotification(trans['js-success-session-delete']);
        renderAll();
    }
}

// Open Maintenance Modal
function openMaintModal(maintId = null) {
    state.editingMaintId = maintId;
    const modal = document.getElementById('modal_maint');
    const form = document.getElementById('form_maint');
    
    document.getElementById('maint_modal_title').innerText = maintId ? (activeLang === 'en' ? "Edit Maintenance Log" : "Éditer l'entretien") : (activeLang === 'en' ? "Add Maintenance Log" : "Ajouter un entretien");
    form.reset();
    
    if (!maintId) {
        document.getElementById('m_date').value = new Date().toISOString().split('T')[0];
    } else {
        const m = state.maintenance.find(mn => mn.id === maintId);
        if (m) {
            document.getElementById('m_date').value = m.date;
            document.getElementById('m_weapon_id').value = m.weaponId;
            document.getElementById('m_type').value = m.type;
            document.getElementById('m_description').value = m.description;
            document.getElementById('m_round_count').value = m.roundCount || '';
        }
    }
    
    modal.style.display = 'flex';
}

// Save Maintenance Form
function saveMaint(event) {
    event.preventDefault();
    
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    const date = document.getElementById('m_date').value;
    const weaponId = document.getElementById('m_weapon_id').value;
    const type = document.getElementById('m_type').value;
    const desc = document.getElementById('m_description').value.trim();
    
    if (!date || !weaponId || !desc) {
        showNotification(trans['js-error-maint-req'], "error");
        return;
    }
    
    const mData = {
        date: date,
        weaponId: weaponId,
        type: type,
        description: desc,
        roundCount: document.getElementById('m_round_count').value ? parseInt(document.getElementById('m_round_count').value) : ''
    };
    
    if (state.editingMaintId) {
        // Edit existing
        const idx = state.maintenance.findIndex(m => m.id === state.editingMaintId);
        if (idx !== -1) {
            state.maintenance[idx] = { ...state.maintenance[idx], ...mData };
            showNotification(trans['js-success-maint-update']);
        }
    } else {
        // Add new
        mData.id = 'm_' + Math.random().toString(36).substr(2, 9);
        state.maintenance.push(mData);
        showNotification(trans['js-success-maint-new']);
    }
    
    saveData();
    closeModal('modal_maint');
    renderAll();
}

// Delete Maintenance
function deleteMaint(maintId) {
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    if (confirm(trans['js-confirm-delete-maint'])) {
        state.maintenance = state.maintenance.filter(m => m.id !== maintId);
        saveData();
        showNotification(trans['js-success-maint-delete']);
        renderAll();
    }
}

// Export Database to JSON File
function exportData() {
    const backupObj = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        weapons: state.weapons,
        sessions: state.sessions,
        maintenance: state.maintenance
    };
    
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `carnet_de_tir_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showNotification("Données exportées avec succès.");
}

// Trigger hidden file input for import
function triggerImport() {
    document.getElementById('import_file_input').click();
}

// Import JSON database from File Upload
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate basic structure
            if (!data.weapons || !data.sessions || !data.maintenance) {
                throw new Error(activeLang === 'en' ? "Invalid file format." : "Format de fichier invalide.");
            }
            
            if (confirm(trans['js-confirm-import-merge'])) {
                // Merge data
                const mergeWeapons = [...state.weapons];
                data.weapons.forEach(nw => {
                    if (!mergeWeapons.some(w => w.id === nw.id)) mergeWeapons.push(nw);
                });
                
                const mergeSessions = [...state.sessions];
                data.sessions.forEach(ns => {
                    if (!mergeSessions.some(s => s.id === ns.id)) mergeSessions.push(ns);
                });
                
                const mergeMaint = [...state.maintenance];
                data.maintenance.forEach(nm => {
                    if (!mergeMaint.some(m => m.id === nm.id)) mergeMaint.push(nm);
                });
                
                state.weapons = mergeWeapons;
                state.sessions = mergeSessions;
                state.maintenance = mergeMaint;
                showNotification(trans['js-success-import-merge']);
            } else {
                // Overwrite data
                state.weapons = data.weapons;
                state.sessions = data.sessions;
                state.maintenance = data.maintenance;
                showNotification(trans['js-success-import-overwrite']);
            }
            
            saveData();
            renderAll();
            
        } catch (err) {
            console.error("Error importing file", err);
            alert(activeLang === 'en' ? "Error importing file. Make sure it is a valid JSON file exported from this tool." : "Erreur lors de l'importation du fichier. Assurez-vous qu'il s'agit d'un fichier JSON valide issu de cet outil.");
        }
    };
    reader.readAsText(file);
}

// Clear Database completely
function clearDatabase() {
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    if (confirm(trans['js-confirm-clear-db'])) {
        localStorage.removeItem('tireur_weapons');
        localStorage.removeItem('tireur_sessions');
        localStorage.removeItem('tireur_maintenance');
        state.weapons = [];
        state.sessions = [];
        state.maintenance = [];
        
        showNotification(trans['js-success-db-clear'], "error");
        renderAll();
    }
}

// Format Date Utility
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return dateStr;
}

// HTML Escaping Utility
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Fullscreen / Distraction-free Mode Toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn("Native fullscreen request failed, falling back to CSS toggle:", err);
            document.body.classList.toggle('logbook-fullscreen');
            updateFullscreenButton(document.body.classList.contains('logbook-fullscreen'));
        });
    } else {
        document.exitFullscreen();
    }
}

function updateFullscreenButton(isFull) {
    const btn = document.getElementById('btn-fullscreen');
    if (btn) {
        btn.innerHTML = isFull 
            ? '<i class="li-x"></i> Quitter plein écran' 
            : '<i class="li-eye"></i> Plein écran';
        btn.classList.toggle('btn-secondary', !isFull);
        btn.classList.toggle('btn-primary', isFull);
    }
}

// Track browser native fullscreen exit/enter
document.addEventListener('fullscreenchange', () => {
    const isFull = !!document.fullscreenElement;
    if (isFull) {
        document.body.classList.add('logbook-fullscreen');
    } else {
        document.body.classList.remove('logbook-fullscreen');
    }
    updateFullscreenButton(isFull);
});

// Printing functions
function printSession(sessionId) {
    const card = document.getElementById(`session-card-${sessionId}`);
    if (!card) return;
    
    // Add printing classes
    document.body.classList.add('print-single-session');
    card.classList.add('printing-this');
    
    // Open print dialog
    window.print();
    
    // Remove classes after print dialog
    setTimeout(() => {
        document.body.classList.remove('print-single-session');
        card.classList.remove('printing-this');
    }, 500);
}

function printBlankSheet() {
    // Open the new print options modal
    document.getElementById('modal_print_blank').style.display = 'flex';
}

function executePrintBlank() {
    const type = document.getElementById('print_blank_type').value;
    const templateContainer = document.getElementById('blank_print_template');
    if (!templateContainer) return;
    
    let html = '';
    if (type === 'issf') {
        html = generateIssfPrintTemplate();
    } else if (type === 'tld') {
        html = generateTldPrintTemplate();
    } else {
        html = generateGenericPrintTemplate();
    }
    
    templateContainer.innerHTML = html;
    
    // Close modal first so it doesn't block printing rendering
    closeModal('modal_print_blank');
    
    // Call print
    document.body.classList.add('print-blank-sheet');
    window.print();
    setTimeout(() => {
        document.body.classList.remove('print-blank-sheet');
    }, 500);
}

function generateGenericPrintTemplate() {
    return `
        <div class="print-header">
            <h2>Carnet de Tir Numérique — Fiche de Séance Générique</h2>
            <span class="print-website">www.tireur.org</span>
        </div>
        
        <div class="print-meta-grid">
            <div class="print-meta-item"><label>Date :</label> ____________________</div>
            <div class="print-meta-item"><label>Lieu / Stand :</label> ____________________</div>
            <div class="print-meta-item"><label>Arme utilisée :</label> ____________________</div>
            <div class="print-meta-item"><label>Calibre :</label> ____________________</div>
        </div>
        
        <div class="print-sections-grid">
            <div class="print-section-left">
                <div class="print-field-group">
                    <h3>Munition &amp; Rechargement</h3>
                    <div class="print-field"><strong>Munition / Ogive :</strong> _________________________</div>
                    <div class="print-field"><strong>Poids de balle :</strong> ________ gr &nbsp;&nbsp;&nbsp;&nbsp; <strong>Charge :</strong> ________ gr &nbsp;&nbsp;&nbsp;&nbsp; <strong>Vitesse :</strong> ________ m/s</div>
                </div>
                
                <div class="print-field-group">
                    <h3>Conditions de tir</h3>
                    <div class="print-field"><strong>Distance :</strong> ________ m &nbsp;&nbsp;&nbsp;&nbsp; <strong>Température :</strong> ________ °C &nbsp;&nbsp;&nbsp;&nbsp; <strong>Vent :</strong> ________ m/s</div>
                </div>
                
                <div class="print-field-group">
                    <h3>Journal des tirs (20 coups)</h3>
                    <table class="print-shot-table">
                        <thead>
                            <tr>
                                <th style="width:10%;">N°</th>
                                <th style="width:20%;">Score</th>
                                <th style="width:20%;">Notes / Écarts</th>
                                <th style="width:10%;">N°</th>
                                <th style="width:20%;">Score</th>
                                <th style="width:20%;">Notes / Écarts</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${[...Array(10)].map((_, i) => `
                                <tr>
                                    <td><strong>${i+1}</strong></td>
                                    <td></td>
                                    <td></td>
                                    <td><strong>${i+11}</strong></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="print-section-right">
                <h3>Tracé des impacts</h3>
                <div class="print-target-container">
                    <svg viewBox="0 0 280 280" width="260" height="260" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="140" cy="140" r="135" fill="none" stroke="#333" stroke-width="1.5" />
                        <circle cx="140" cy="140" r="121.5" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                        <circle cx="140" cy="140" r="108" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                        <circle cx="140" cy="140" r="94.5" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                        <circle cx="140" cy="140" r="81" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                        <circle cx="140" cy="140" r="67.5" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                        <circle cx="140" cy="140" r="54" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                        <circle cx="140" cy="140" r="40.5" fill="#f0f0f0" stroke="#333" stroke-width="1.5" />
                        <circle cx="140" cy="140" r="27" fill="none" stroke="#333" stroke-width="1.5" />
                        <circle cx="140" cy="140" r="13.5" fill="none" stroke="#333" stroke-width="1.5" />
                        <circle cx="140" cy="140" r="3.5" fill="#333" stroke="none" />
                        <line x1="140" y1="5" x2="140" y2="275" stroke="#ccc" stroke-width="0.8" stroke-dasharray="2,2" />
                        <line x1="5" y1="140" x2="275" y2="140" stroke="#ccc" stroke-width="0.8" stroke-dasharray="2,2" />
                        <text x="140" y="24" font-size="8" text-anchor="middle" fill="#666" font-family="monospace">1</text>
                        <text x="140" y="37.5" font-size="8" text-anchor="middle" fill="#666" font-family="monospace">2</text>
                        <text x="140" y="51" font-size="8" text-anchor="middle" fill="#666" font-family="monospace">3</text>
                        <text x="140" y="64.5" font-size="8" text-anchor="middle" fill="#666" font-family="monospace">4</text>
                        <text x="140" y="78" font-size="8" text-anchor="middle" fill="#666" font-family="monospace">5</text>
                        <text x="140" y="91.5" font-size="8" text-anchor="middle" fill="#666" font-family="monospace">6</text>
                        <text x="140" y="105" font-size="8" text-anchor="middle" fill="#666" font-family="monospace">7</text>
                        <text x="140" y="118.5" font-size="8" text-anchor="middle" fill="#666" font-family="monospace">8</text>
                        <text x="140" y="132" font-size="8" text-anchor="middle" fill="#666" font-family="monospace">9</text>
                    </svg>
                </div>
                <div class="print-target-caption">Cible C50 proportionnelle</div>
                
                <div class="print-field-group" style="width: 100%; margin-top: 1rem; flex-grow: 1;">
                    <h3>Notes de séance</h3>
                    <div class="print-notes-lines" style="margin-top: 0.5rem;">
                        <div class="print-line"></div>
                        <div class="print-line"></div>
                        <div class="print-line"></div>
                        <div class="print-line"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateIssfPrintTemplate() {
    return `
        <div class="print-header">
            <h2>Carnet de Tir Numérique — Fiche de Match ISSF (60 Coups)</h2>
            <span class="print-website">www.tireur.org</span>
        </div>
        
        <div class="print-meta-grid" style="margin-bottom: 1rem;">
            <div class="print-meta-item"><label>Date :</label> ____________________</div>
            <div class="print-meta-item"><label>Lieu / Stand :</label> ____________________</div>
            <div class="print-meta-item"><label>Arme utilisée :</label> ____________________</div>
            <div class="print-meta-item"><label>Calibre :</label> ____________________</div>
        </div>

        <div class="print-field-group" style="margin-bottom: 1rem;">
            <h3>Tableau de scores des Séries (10 coups par cible)</h3>
            <table class="print-shot-table" style="text-align: center; font-size: 0.8rem !important;">
                <thead>
                    <tr>
                        <th style="width:12%;">Série</th>
                        <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th>
                        <th style="width:10%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${[1, 2, 3, 4, 5, 6].map(s => `
                        <tr style="height: 1.8rem;">
                            <td><strong>Série ${s}</strong></td>
                            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                            <td></td>
                        </tr>
                    `).join('')}
                    <tr style="height: 2rem; font-weight: bold; background: #f5f5f5;">
                        <td colspan="11" style="text-align: right; padding-right: 1rem;">SCORE TOTAL :</td>
                        <td>/ 600</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 style="margin: 1rem 0 0.5rem 0; font-size: 1.05rem; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem; color: #000;">Tracé des cibles (Séries 1 à 6)</h3>
        <div class="print-issf-targets-grid">
            ${[1, 2, 3, 4, 5, 6].map(i => `
                <div class="print-issf-target-box">
                    <h4>Cible ${i}</h4>
                    <svg viewBox="0 0 160 160" width="110" height="110" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="80" cy="80" r="76" fill="none" stroke="#333" stroke-width="1.2" />
                        <circle cx="80" cy="80" r="68.4" fill="none" stroke="#555" stroke-width="0.8" stroke-dasharray="2,2" />
                        <circle cx="80" cy="80" r="60.8" fill="none" stroke="#555" stroke-width="0.8" stroke-dasharray="2,2" />
                        <circle cx="80" cy="80" r="53.2" fill="none" stroke="#555" stroke-width="0.8" stroke-dasharray="2,2" />
                        <circle cx="80" cy="80" r="45.6" fill="none" stroke="#555" stroke-width="0.8" stroke-dasharray="2,2" />
                        <circle cx="80" cy="80" r="38" fill="none" stroke="#555" stroke-width="0.8" stroke-dasharray="2,2" />
                        <circle cx="80" cy="80" r="30.4" fill="none" stroke="#555" stroke-width="0.8" stroke-dasharray="2,2" />
                        <circle cx="80" cy="80" r="22.8" fill="#f0f0f0" stroke="#333" stroke-width="1.2" />
                        <circle cx="80" cy="80" r="15.2" fill="none" stroke="#333" stroke-width="1.2" />
                        <circle cx="80" cy="80" r="7.6" fill="none" stroke="#333" stroke-width="1.2" />
                        <circle cx="80" cy="80" r="2" fill="#333" stroke="none" />
                        <line x1="80" y1="3" x2="80" y2="157" stroke="#ddd" stroke-width="0.6" stroke-dasharray="1,1" />
                        <line x1="3" y1="80" x2="157" y2="80" stroke="#ddd" stroke-width="0.6" stroke-dasharray="1,1" />
                        
                        <!-- Ring numbers inside target -->
                        <text x="80" y="14" font-size="6" text-anchor="middle" fill="#666" font-family="monospace">1</text>
                        <text x="80" y="21.6" font-size="6" text-anchor="middle" fill="#666" font-family="monospace">2</text>
                        <text x="80" y="29.2" font-size="6" text-anchor="middle" fill="#666" font-family="monospace">3</text>
                        <text x="80" y="36.8" font-size="6" text-anchor="middle" fill="#666" font-family="monospace">4</text>
                        <text x="80" y="44.4" font-size="6" text-anchor="middle" fill="#666" font-family="monospace">5</text>
                        <text x="80" y="52" font-size="6" text-anchor="middle" fill="#666" font-family="monospace">6</text>
                        <text x="80" y="59.6" font-size="6" text-anchor="middle" fill="#666" font-family="monospace">7</text>
                        <text x="80" y="67.2" font-size="6" text-anchor="middle" fill="#666" font-family="monospace">8</text>
                        <text x="80" y="74.8" font-size="6" text-anchor="middle" fill="#666" font-family="monospace">9</text>
                    </svg>
                </div>
            `).join('')}
        </div>
    `;
}

function generateTldPrintTemplate() {
    return `
        <div class="print-header">
            <h2>Carnet de Tir Numérique — Fiche Tir Longue Distance (TLD)</h2>
            <span class="print-website">www.tireur.org</span>
        </div>
        
        <div class="print-meta-grid">
            <div class="print-meta-item"><label>Date :</label> ____________________</div>
            <div class="print-meta-item"><label>Lieu / Stand :</label> ____________________</div>
            <div class="print-meta-item"><label>Arme utilisée :</label> ____________________</div>
            <div class="print-meta-item"><label>Calibre :</label> ____________________</div>
        </div>
        
        <div class="print-sections-grid">
            <div class="print-section-left">
                <div class="print-field-group">
                    <h3>Munition &amp; Rechargement</h3>
                    <div class="print-field"><strong>Munition :</strong> ____________________ &nbsp;&nbsp;&nbsp;&nbsp; <strong>Poids :</strong> ______ gr &nbsp;&nbsp;&nbsp;&nbsp; <strong>Vitesse :</strong> ______ m/s</div>
                </div>
                
                <div class="print-field-group">
                    <h3>Conditions Environnementales</h3>
                    <div class="print-tld-env">
                        <div><strong>Température :</strong> ______ °C</div>
                        <div><strong>Altitude / Pres. :</strong> ______ hPa</div>
                        <div><strong>Humidité :</strong> ______ %</div>
                        <div><strong>Vent (Vit/Dir) :</strong> ____ m/s à ____ h</div>
                        <div><strong>Lumière/Mirage :</strong> ______________</div>
                        <div><strong>Zéro de réf. :</strong> ______ m</div>
                    </div>
                </div>
                
                <div class="print-field-group">
                    <h3>Journal Balistique des Tirs (Clics &amp; Corrections)</h3>
                    <table class="print-shot-table">
                        <thead>
                            <tr>
                                <th style="width:8%;">Coup</th>
                                <th style="width:14%;">Dist. (m)</th>
                                <th style="width:18%;">Élévation</th>
                                <th style="width:18%;">Dérive</th>
                                <th style="width:14%;">Impact</th>
                                <th>Observations / Changement vent</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${[...Array(10)].map((_, i) => `
                                <tr style="height: 1.8rem;">
                                    <td><strong>${i+1}</strong></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="print-section-right">
                <h3>Cible de Précision (Grille 1 MOA)</h3>
                <div class="print-target-container">
                    <svg viewBox="0 0 280 280" width="260" height="260" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="280" height="280" fill="none" stroke="#ddd" stroke-width="1" />
                        ${[28, 56, 84, 112, 140, 168, 196, 224, 252].map(pos => `
                            <line x1="${pos}" y1="0" x2="${pos}" y2="280" stroke="#eee" stroke-width="0.8" />
                            <line x1="0" y1="${pos}" x2="280" y2="${pos}" stroke="#eee" stroke-width="0.8" />
                        `).join('')}
                        
                        <line x1="140" y1="0" x2="140" y2="280" stroke="#000" stroke-width="1.5" />
                        <line x1="0" y1="140" x2="280" y2="140" stroke="#000" stroke-width="1.5" />
                        
                        <circle cx="140" cy="140" r="112" fill="none" stroke="#000" stroke-width="1" />
                        <circle cx="140" cy="140" r="84" fill="none" stroke="#000" stroke-width="1.2" />
                        <circle cx="140" cy="140" r="56" fill="none" stroke="#000" stroke-width="1.5" />
                        <circle cx="140" cy="140" r="28" fill="#f0f0f0" stroke="#000" stroke-width="1.5" />
                        <circle cx="140" cy="140" r="8" fill="#000" stroke="none" />
                        
                        <text x="145" y="116" font-size="7" fill="#666" font-family="monospace">+1</text>
                        <text x="145" y="88" font-size="7" fill="#666" font-family="monospace">+2</text>
                        <text x="145" y="60" font-size="7" fill="#666" font-family="monospace">+3</text>
                        <text x="145" y="32" font-size="7" fill="#666" font-family="monospace">+4</text>
                        
                        <text x="145" y="172" font-size="7" fill="#666" font-family="monospace">-1</text>
                        <text x="145" y="200" font-size="7" fill="#666" font-family="monospace">-2</text>
                        <text x="145" y="228" font-size="7" fill="#666" font-family="monospace">-3</text>
                        <text x="145" y="256" font-size="7" fill="#666" font-family="monospace">-4</text>
                        
                        <text x="114" y="136" font-size="7" fill="#666" font-family="monospace">-1</text>
                        <text x="86" y="136" font-size="7" fill="#666" font-family="monospace">-2</text>
                        <text x="58" y="136" font-size="7" fill="#666" font-family="monospace">-3</text>
                        <text x="30" y="136" font-size="7" fill="#666" font-family="monospace">-4</text>
                        
                        <text x="170" y="136" font-size="7" fill="#666" font-family="monospace">+1</text>
                        <text x="198" y="136" font-size="7" fill="#666" font-family="monospace">+2</text>
                        <text x="226" y="136" font-size="7" fill="#666" font-family="monospace">+3</text>
                        <text x="254" y="136" font-size="7" fill="#666" font-family="monospace">+4</text>
                    </svg>
                </div>
                <div class="print-target-caption">Cible de Réglage MOA (1 div. = 1 MOA @ 100m)</div>
                
                <div class="print-field-group" style="width: 100%; margin-top: 1rem; flex-grow: 1;">
                    <h3>Observations de dérive / Mirage</h3>
                    <div class="print-notes-lines" style="margin-top: 0.5rem;">
                        <div class="print-line"></div>
                        <div class="print-line"></div>
                        <div class="print-line"></div>
                        <div class="print-line"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


/**
 * Star ratings and Chrono/Duplication Helpers
 */

function initStarRatings() {
    document.querySelectorAll('.star-rating').forEach(container => {
        const stars = container.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const val = parseInt(e.target.getAttribute('data-value')) || 0;
                container.setAttribute('data-rating', val);
                // Update active state
                stars.forEach((s, idx) => {
                    if (idx < val) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
    });
}

function setRating(type, val) {
    const container = document.getElementById(`rating_${type}`);
    if (!container) return;
    container.setAttribute('data-rating', val);
    const stars = container.querySelectorAll('i');
    stars.forEach((star, idx) => {
        if (idx < val) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function renderStars(rating) {
    rating = parseInt(rating) || 0;
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '&#9733;'; // ★
        } else {
            stars += '&#9734;'; // ☆
        }
    }
    return `<span style="color:#f1c40f; font-size:1.15rem; font-family: monospace; letter-spacing: 2px;">${stars}</span>`;
}

function openChronoImport() {
    document.getElementById('chrono_raw_data').value = '';
    document.getElementById('chrono_import_stats').style.display = 'none';
    document.getElementById('btn-chrono-apply').style.display = 'none';
    document.getElementById('modal_chrono_import').style.display = 'flex';
}

function calculateChronoStats() {
    const rawData = document.getElementById('chrono_raw_data').value;
    const trans = I18N_CARNET[activeLang] || I18N_CARNET['fr'];
    
    // Parse values: commas, spaces, or newlines
    const values = rawData
        .split(/[\s,\n\r]+/)
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v) && v > 0);
        
    if (values.length === 0) {
        showNotification(trans['js-chrono-empty'] || "Veuillez saisir des vitesses valides.", "error");
        return;
    }
    
    // Calculate stats
    const count = values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    
    // SD (Standard Deviation)
    let sd = 0;
    if (count > 1) {
        const sqDiffSum = values.reduce((accum, val) => accum + Math.pow(val - avg, 2), 0);
        sd = Math.sqrt(sqDiffSum / (count - 1)); // Sample standard deviation
    }
    
    // Update DOM
    document.getElementById('val_chrono_count').innerText = count;
    document.getElementById('val_chrono_avg').innerText = avg.toFixed(1);
    document.getElementById('val_chrono_sd').innerText = sd.toFixed(1);
    document.getElementById('val_chrono_min').innerText = min.toFixed(1);
    document.getElementById('val_chrono_max').innerText = max.toFixed(1);
    
    // Show stats and apply button
    document.getElementById('chrono_import_stats').style.display = 'block';
    document.getElementById('btn-chrono-apply').style.display = 'inline-block';
}

function applyChronoImport() {
    const avgVelocity = parseFloat(document.getElementById('val_chrono_avg').innerText) || 0;
    const count = parseInt(document.getElementById('val_chrono_count').innerText) || 0;
    
    if (avgVelocity > 0) {
        document.getElementById('s_velocity').value = Math.round(avgVelocity);
    }
    
    // If there are no plotted impacts, set s_rounds_fired and lbl_shot_count.
    if (state.tempImpacts.length === 0 && count > 0) {
        document.getElementById('s_rounds_fired').value = count;
        const lblShotCount = document.getElementById('lbl_shot_count');
        if (lblShotCount) {
            lblShotCount.innerText = count;
        }
    }
    
    closeModal('modal_chrono_import');
}

function duplicateSession(sessionId) {
    const s = state.sessions.find(sn => sn.id === sessionId);
    if (!s) return;
    
    // Open modal as a new session (so editingSessionId is null, when saved it creates a new session)
    state.editingSessionId = null;
    const modal = document.getElementById('modal_session');
    const form = document.getElementById('form_session');
    
    document.getElementById('session_modal_title').innerText = activeLang === 'en' ? "Record a Shooting Session" : "Enregistrer une séance de tir";
    form.reset();
    
    // Pre-fill with cloned data
    document.getElementById('s_date').value = new Date().toISOString().split('T')[0];
    document.getElementById('s_stand').value = s.stand || '';
    document.getElementById('s_weapon_id').value = s.weaponId;
    document.getElementById('s_caliber').value = s.caliber || '';
    document.getElementById('s_discipline').value = s.discipline || '';
    document.getElementById('s_objective').value = s.objective || '';
    
    document.getElementById('s_ammo').value = s.ammo || '';
    document.getElementById('s_bullet_weight').value = s.bulletWeight || '';
    document.getElementById('s_powder_charge').value = s.powderCharge || '';
    document.getElementById('s_velocity').value = s.velocity || '';
    
    document.getElementById('s_distance').value = s.distance || 100;
    document.getElementById('s_temp').value = s.temp || '';
    document.getElementById('s_wind').value = s.wind || '';
    
    // Clear plotter impacts and stats
    state.tempImpacts = [];
    document.getElementById('target_preset').value = s.targetPreset || 'issf_50m';
    document.getElementById('s_rounds_fired').value = 0;
    document.getElementById('s_group_size').value = 0;
    
    // Reset stars & reviews for the duplicate
    setRating('fatigue', 0);
    setRating('concentration', 0);
    setRating('confidence', 0);
    document.getElementById('s_notes').value = '';
    document.getElementById('s_errors').value = '';
    document.getElementById('s_actions').value = '';
    
    modal.style.display = 'flex';
    
    // Draw target board grid and impacts
    updateTargetScale();
}



