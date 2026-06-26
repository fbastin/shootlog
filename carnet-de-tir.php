<?php
$title = "Carnet de Tir Numérique — Tireur.org";
$meta_description = "Carnet de tir numérique local et hors-ligne : enregistrez vos armes, comptez vos tirs (round count), suivez vos séances au stand avec calcul automatique de dispersion et journal d'entretien.";
include 'header.php';
?>

<link rel="stylesheet" href="/css/carnet.css?v=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'].'/css/carnet.css'); ?>">

<div id="cadre">
    <?php
    $breadcrumb_links = [
        ['url' => '/index.php', 'label' => 'Accueil'],
        ['url' => '/outils.php', 'label' => 'Outils'],
        ['label' => 'Carnet de tir'],
    ];
    include $_SERVER['DOCUMENT_ROOT'] . '/includes/breadcrumb.php';
    ?>

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">
        <div>
            <h1 style="margin-bottom:0.25rem;"><span id="logbook-main-title">Carnet de Tir Numérique</span> <span style="font-size: 0.5em; font-weight: normal; vertical-align: middle; background: rgba(9, 132, 227, 0.1); color: var(--color-primary); padding: 0.2rem 0.5rem; border-radius: 12px; margin-left: 0.5rem; border: 1px solid rgba(9, 132, 227, 0.2);">beta</span></h1>
            <p id="logbook-sub-title" style="color:var(--color-text-light); margin:0;">Suivez vos armes, séances de tir et opérations d'entretien. Fonctionne 100% hors-ligne et localement. Pour voir un exemple pré-rempli, visitez le <a href="/carnet-de-tir-exemple.php" style="text-decoration:underline; font-weight:500;">carnet d'exemple</a>.</p>
        </div>
        <div class="noprint" style="display:flex; gap:0.5rem; align-items:center;">
            <div class="lang-selector noprint" style="margin-right:0.25rem;">
                <button class="lang-btn active" data-lang="fr" id="lang-btn-fr">FR</button>
                <button class="lang-btn" data-lang="en" id="lang-btn-en">EN</button>
            </div>
            <button type="button" id="btn-fullscreen" class="btn-secondary" onclick="toggleFullscreen()"><i class="li-eye"></i> <span id="lbl-fullscreen">Plein écran</span></button>
            <button type="button" class="btn-secondary" onclick="printBlankSheet()"><i class="li-printer"></i> <span id="lbl-print-blank">Imprimer fiche vierge</span></button>
            <button type="button" class="btn-primary" onclick="openSessionModal()"><i class="li-plus"></i> <span id="lbl-new-session">Nouvelle séance</span></button>
        </div>
    </div>

    <!-- Navigation par Onglets -->
    <nav class="logbook-nav noprint">
        <button class="logbook-tab-btn active" data-tab="dashboard" id="tab-dashboard"><i class="li-image"></i> <span id="lbl-tab-dashboard">Tableau de bord</span></button>
        <button class="logbook-tab-btn" data-tab="weapons" id="tab-weapons"><i class="li-target"></i> <span id="lbl-tab-weapons">Mes Armes</span></button>
        <button class="logbook-tab-btn" data-tab="sessions" id="tab-btn-sessions"><i class="li-file-text"></i> <span id="lbl-tab-sessions">Séances</span> (<span id="nav_session_count">0</span>)</button>
        <button class="logbook-tab-btn" data-tab="maintenance" id="tab-maintenance"><i class="li-clock"></i> <span id="lbl-tab-maintenance">Entretien</span></button>
        <button class="logbook-tab-btn" data-tab="settings" id="tab-settings"><i class="li-settings"></i> <span id="lbl-tab-settings">Réglages &amp; Sauvegarde</span></button>
    </nav>

    <div class="logbook-container">
        
        <!-- ONGLET : Tableau de bord -->
        <section id="dashboard" class="logbook-tab-content active">
            <div class="db-grid">
                <div class="db-card">
                    <div class="db-card-icon"><i class="li-target"></i></div>
                    <div class="db-card-info">
                        <h4 id="lbl-stat-rounds">Coups tirés</h4>
                        <p id="stat_total_rounds" class="db-val">0</p>
                    </div>
                </div>
                <div class="db-card">
                    <div class="db-card-icon"><i class="li-file-text"></i></div>
                    <div class="db-card-info">
                        <h4 id="lbl-stat-sessions">Séances</h4>
                        <p id="stat_total_sessions" class="db-val">0</p>
                    </div>
                </div>
                <div class="db-card">
                    <div class="db-card-icon"><i class="li-target"></i></div>
                    <div class="db-card-info">
                        <h4 id="lbl-stat-weapons">Armes actives</h4>
                        <p id="stat_total_weapons" class="db-val">0</p>
                    </div>
                </div>
                <div class="db-card">
                    <div class="db-card-icon"><i class="li-clock"></i></div>
                    <div class="db-card-info">
                        <h4 id="lbl-stat-maint">Entretiens</h4>
                        <p id="stat_total_maint" class="db-val">0</p>
                    </div>
                </div>
            </div>

            <div class="db-sections-grid">
                <div class="db-panel">
                    <h3 id="lbl-title-chart">Volume de tir (6 derniers mois)</h3>
                    <div id="db_chart_container" class="chart-container">
                        <!-- Généré en SVG via JS -->
                    </div>
                </div>
                <div class="db-panel">
                    <h3 id="lbl-title-recent">Séances récentes</h3>
                    <div id="db_recent_sessions">
                        <!-- Généré en JS -->
                    </div>
                </div>
            </div>
        </section>

        <!-- ONGLET : Mes Armes -->
        <section id="weapons" class="logbook-tab-content">
            <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;" class="noprint">
                <button type="button" class="btn-primary" onclick="openWeaponModal()"><i class="li-plus"></i> <span id="lbl-add-weapon">Ajouter une arme</span></button>
            </div>
            <div id="weapons_grid">
                <!-- Cartes d'armes générées en JS -->
            </div>
        </section>

        <!-- ONGLET : Séances -->
        <section id="sessions" class="logbook-tab-content">
            <!-- Barre de filtre -->
            <div class="sessions-filter-bar noprint">
                <div class="filter-group">
                    <label for="filter_weapon" id="lbl-filter-weapon">Arme :</label>
                    <select id="filter_weapon" onchange="applyFilters()">
                        <option value="" id="opt-all-weapons">Toutes les armes</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filter_stand" id="lbl-filter-stand">Stand / Lieu :</label>
                    <input type="text" id="filter_stand" placeholder="Ex: CTF, Bordeaux..." oninput="applyFilters()">
                </div>
                <button type="button" class="btn-secondary" id="btn-reset-filters" onclick="resetFilters()">Réinitialiser</button>
            </div>

            <div id="sessions_list">
                <!-- Liste des séances générée en JS -->
            </div>
        </section>

        <!-- ONGLET : Entretien -->
        <section id="maintenance" class="logbook-tab-content">
            <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;" class="noprint">
                <button type="button" class="btn-primary" onclick="openMaintModal()"><i class="li-plus"></i> <span id="lbl-add-maint">Ajouter un entretien</span></button>
            </div>
            <div id="maint_list">
                <!-- Registre d'entretien généré en JS -->
            </div>
        </section>

        <!-- ONGLET : Sauvegarde & Réglages -->
        <section id="settings" class="logbook-tab-content">
            <div class="db-panel" style="max-width: 650px; margin: 0 auto;">
                <h3 id="lbl-settings-title">Gestion locale des données</h3>
                <p id="lbl-settings-desc" style="font-size:0.9rem; color:var(--color-text-light); line-height:1.5; margin-bottom:1.5rem;">
                    Toutes les données de ce carnet de tir sont stockées dans le stockage local de votre navigateur (LocalStorage). 
                    Aucune donnée n'est envoyée vers nos serveurs. Pour éviter toute perte en cas de nettoyage du navigateur, 
                    nous vous conseillons d'effectuer des sauvegardes régulières.
                </p>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2rem;">
                    <div style="border:1px solid var(--color-border); padding:1rem; border-radius:var(--radius); text-align:center;">
                        <h4 id="lbl-export-title" style="margin:0 0 0.5rem 0;">Exporter mes données</h4>
                        <p id="lbl-export-desc" style="font-size:0.8rem; color:var(--color-text-light); margin-bottom:1rem;">Téléchargez un fichier de sauvegarde contenant toutes vos armes, séances et entretiens.</p>
                        <button type="button" class="btn-primary" style="width:100%; justify-content:center;" onclick="exportData()"><i class="li-file-text"></i> <span id="lbl-export-btn">Exporter au format JSON</span></button>
                    </div>
                    <div style="border:1px solid var(--color-border); padding:1rem; border-radius:var(--radius); text-align:center;">
                        <h4 id="lbl-import-title" style="margin:0 0 0.5rem 0;">Importer une sauvegarde</h4>
                        <p id="lbl-import-desc" style="font-size:0.8rem; color:var(--color-text-light); margin-bottom:1rem;">Restaurez vos données ou fusionnez-les depuis un fichier précédemment exporté.</p>
                        <button type="button" class="btn-secondary" style="width:100%; justify-content:center;" onclick="triggerImport()"><i class="li-folder"></i> <span id="lbl-import-btn">Importer un fichier</span></button>
                        <input type="file" id="import_file_input" style="display:none;" accept=".json" onchange="importData(event)">
                    </div>
                </div>

                <div style="border:1px solid #f5c2c2; background:rgba(231, 76, 60, 0.03); padding:1.25rem; border-radius:var(--radius); margin-top:2rem;">
                    <h4 id="lbl-danger-title" style="color:#e74c3c; margin:0 0 0.5rem 0;"><i class="li-alert"></i> Zone de Danger</h4>
                    <p id="lbl-danger-desc" style="font-size:0.85rem; color:var(--color-text-light); margin-bottom:1rem;">Cette action effacera définitivement l'intégralité du carnet de tir (armes, tirs, entretiens) sur ce navigateur.</p>
                    <button type="button" class="btn-secondary btn-danger-text" id="lbl-danger-btn" onclick="clearDatabase()">Réinitialiser le carnet de tir</button>
                </div>
            </div>
        </section>

    </div>
</div>

<!-- ==========================================
     MODALS / DIALOGUES DE SAISIE
     ========================================== -->

<!-- MODAL : Arme -->
<div id="modal_weapon" class="modal-overlay">
    <div class="modal-box">
        <div class="modal-header">
            <h3 id="weapon_modal_title">Ajouter une arme</h3>
            <button class="modal-close" onclick="closeModal('modal_weapon')">&times;</button>
        </div>
        <form id="form_weapon" onsubmit="saveWeapon(event)">
            <div class="modal-body">
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label for="w_name" id="lbl-w-name">Modèle / Nom de l'arme *</label>
                        <input type="text" id="w_name" placeholder="Ex: Tikka T3x TAC A1, Glock 17..." required>
                    </div>
                    <div class="form-group">
                        <label for="w_caliber" id="lbl-w-caliber">Calibre *</label>
                        <input type="text" id="w_caliber" placeholder="Ex: 6.5 Creedmoor, 9x19mm..." list="calibers_list" required>
                        <div id="w_caliber_info" style="margin-top:0.25rem; font-size:0.8rem; display:none;"></div>
                    </div>
                    <div class="form-group">
                        <label for="w_barrel_length" id="lbl-w-barrel-length">Longueur de canon (pouces)</label>
                        <input type="number" id="w_barrel_length" step="0.1" placeholder="Ex: 24, 4.5">
                    </div>
                    <div class="form-group">
                        <label for="w_twist_rate" id="lbl-w-twist-rate">Pas de rayure (1:X pouces)</label>
                        <input type="number" id="w_twist_rate" step="0.1" placeholder="Ex: 8, 10">
                    </div>
                    <div class="form-group">
                        <label for="w_zero_distance" id="lbl-w-zero-distance">Distance de zéro (mètres)</label>
                        <input type="number" id="w_zero_distance" placeholder="Ex: 100, 25">
                    </div>
                    <div class="form-group full-width">
                        <label for="w_optics" id="lbl-w-optics">Lunette / Optique</label>
                        <input type="text" id="w_optics" placeholder="Ex: Vortex Viper PST II 5-25x50">
                    </div>
                    <div class="form-group">
                        <label for="w_initial_round_count" id="lbl-w-count">Compteur initial (tirs antérieurs)</label>
                        <input type="number" id="w_initial_round_count" value="0" min="0">
                    </div>
                    <div class="form-group full-width">
                        <label for="w_notes" id="lbl-w-notes">Notes / Caractéristiques additionnelles</label>
                        <textarea id="w_notes" rows="3" placeholder="Poids de détente, rechargement favori, date d'acquisition..."></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('modal_weapon')" id="btn-w-cancel">Annuler</button>
                <button type="submit" class="btn-primary" id="btn-w-save">Enregistrer</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL : Séance de tir -->
<div id="modal_session" class="modal-overlay">
    <div class="modal-box" style="max-width:850px;">
        <div class="modal-header">
            <h3 id="session_modal_title">Enregistrer une séance</h3>
            <button class="modal-close" onclick="closeModal('modal_session')">&times;</button>
        </div>
        <form id="form_session" onsubmit="saveSession(event)">
            <div class="modal-body" style="padding:1.25rem;">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="s_date" id="lbl-s-date">Date de la séance *</label>
                        <input type="date" id="s_date" required>
                    </div>
                    <div class="form-group">
                        <label for="s_stand" id="lbl-s-stand">Stand de tir / Lieu</label>
                        <input type="text" id="s_stand" placeholder="Ex: Stand de tir de Versailles">
                    </div>
                    <div class="form-group">
                        <label for="s_weapon_id" id="lbl-s-weapon">Arme utilisée *</label>
                        <select id="s_weapon_id" required>
                            <option value="" id="opt-s-select">-- Sélectionner --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="s_caliber" id="lbl-s-caliber">Calibre</label>
                        <input type="text" id="s_caliber" placeholder="Ex: 6.5 CM (autocomplété)" list="calibers_list">
                        <div id="s_caliber_info" style="margin-top:0.25rem; font-size:0.8rem; display:none;"></div>
                    </div>
                    <div class="form-group">
                        <label for="s_discipline" id="lbl-s-discipline">Discipline</label>
                        <select id="s_discipline">
                            <option value="" id="opt-s-disp-none">-- Sélectionner --</option>
                            <option value="precision" id="opt-s-disp-prec">Précision / Loisir</option>
                            <option value="issf" id="opt-s-disp-issf">Match ISSF</option>
                            <option value="tld" id="opt-s-disp-tld">Tir Longue Distance (TLD)</option>
                            <option value="ipsc" id="opt-s-disp-ipsc">IPSC / Tir Sportif de Vitesse</option>
                            <option value="autre" id="opt-s-disp-other">Autre discipline</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="s_objective" id="lbl-s-objective">Objectif de la séance</label>
                        <input type="text" id="s_objective" placeholder="Ex: Lâcher, lecture du vent...">
                    </div>
                    
                    <h4 class="full-width" id="lbl-s-sub-ammo" style="margin:1rem 0 0.5rem 0; border-bottom:1px solid var(--color-border); padding-bottom:0.25rem;">Munition &amp; Balistique</h4>
                    
                    <div class="form-group">
                        <label for="s_ammo" id="lbl-s-ammo">Munition / Ogive</label>
                        <input type="text" id="s_ammo" placeholder="Ex: Lapua Scenar 139gr, S&amp;B 124gr">
                    </div>
                    <div class="form-group">
                        <label for="s_bullet_weight" id="lbl-s-weight">Poids de balle (gr)</label>
                        <input type="number" id="s_bullet_weight" placeholder="Ex: 139">
                    </div>
                    <div class="form-group">
                        <label for="s_powder_charge" id="lbl-s-charge">Charge de poudre (gr)</label>
                        <input type="number" id="s_powder_charge" step="0.01" placeholder="Ex: 37.5">
                    </div>
                    <div class="form-group">
                        <label for="s_velocity" id="lbl-s-velocity">Vitesse initiale mesurée (m/s)</label>
                        <div style="display:flex; gap:0.25rem;">
                            <input type="number" id="s_velocity" placeholder="Ex: 820" style="flex:1;">
                            <button type="button" class="btn-secondary" style="padding:0 0.5rem;" onclick="openChronoImport()" id="btn-chrono-import" title="Importer des vitesses de chronographe"><i class="li-clock"></i></button>
                        </div>
                    </div>
                    
                    <div class="full-width" style="display:flex; justify-content:space-between; align-items:center; margin:1rem 0 0.5rem 0; border-bottom:1px solid var(--color-border); padding-bottom:0.25rem;">
                        <h4 id="lbl-s-sub-cond" style="margin:0;">Conditions &amp; Résultats</h4>
                        <button type="button" class="btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.8rem; display:flex; align-items:center; gap:0.25rem;" onclick="fetchLocalWeather()" id="btn-weather-fetch"><i class="li-sun"></i> <span id="lbl-weather-btn">Météo auto</span></button>
                    </div>
                    
                    <div class="form-group">
                        <label for="s_distance" id="lbl-s-distance">Distance (mètres) *</label>
                        <input type="number" id="s_distance" value="100" required>
                    </div>
                    <div class="form-group">
                        <label for="s_temp" id="lbl-s-temp">Température ambiante (°C)</label>
                        <input type="number" id="s_temp" placeholder="Ex: 18">
                    </div>
                    <div class="form-group">
                        <label for="s_wind" id="lbl-s-wind">Vitesse du vent (m/s)</label>
                        <input type="number" id="s_wind" placeholder="Ex: 3">
                    </div>
                    <div class="form-group">
                        <label for="s_notes" id="lbl-s-notes">Notes additionnelles</label>
                        <input type="text" id="s_notes" placeholder="Sensations, réglages de clics effectués...">
                    </div>
 
                    <h4 class="full-width" id="lbl-s-sub-review" style="margin:1rem 0 0.5rem 0; border-bottom:1px solid var(--color-border); padding-bottom:0.25rem;">Évaluation &amp; Bilan de séance</h4>
                    
                    <div class="form-group">
                        <label id="lbl-s-fatigue">Fatigue (1 = faible, 5 = élevée)</label>
                        <div class="star-rating" id="rating_fatigue" data-rating="0">
                            <i class="li-star" data-value="1"></i>
                            <i class="li-star" data-value="2"></i>
                            <i class="li-star" data-value="3"></i>
                            <i class="li-star" data-value="4"></i>
                            <i class="li-star" data-value="5"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label id="lbl-s-concentration">Concentration (1 = faible, 5 = élevée)</label>
                        <div class="star-rating" id="rating_concentration" data-rating="0">
                            <i class="li-star" data-value="1"></i>
                            <i class="li-star" data-value="2"></i>
                            <i class="li-star" data-value="3"></i>
                            <i class="li-star" data-value="4"></i>
                            <i class="li-star" data-value="5"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label id="lbl-s-confidence">Confiance (1 = faible, 5 = élevée)</label>
                        <div class="star-rating" id="rating_confidence" data-rating="0">
                            <i class="li-star" data-value="1"></i>
                            <i class="li-star" data-value="2"></i>
                            <i class="li-star" data-value="3"></i>
                            <i class="li-star" data-value="4"></i>
                            <i class="li-star" data-value="5"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <!-- Balance grid -->
                    </div>
                    
                    <div class="form-group full-width" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                        <div>
                            <label for="s_errors" id="lbl-s-errors">Erreurs identifiées</label>
                            <textarea id="s_errors" rows="2" placeholder="Ex: Doigt trop haut sur la détente, précipitation..."></textarea>
                        </div>
                        <div>
                            <label for="s_actions" id="lbl-s-actions">Actions pour la prochaine séance</label>
                            <textarea id="s_actions" rows="2" placeholder="Ex: Ralentir le rythme de tir, travailler la respiration..."></textarea>
                        </div>
                    </div>
 
                    <!-- Plotter de cible interactif -->
                    <div class="form-group full-width">
                        <label style="display:flex; justify-content:space-between;">
                            <span id="lbl-plotter-title">Calculateur de dispersion interactif</span>
                            <span id="lbl-plotter-hint" style="font-weight:normal;color:var(--color-text-light);">Cliquez sur la cible pour tracer vos impacts</span>
                        </label>
                        
                        <div class="target-plotter-container">
                            <div class="target-board-wrapper">
                                <div id="plotter_board" class="target-board">
                                    <!-- Axes, anneaux et impacts générés par JS -->
                                </div>
                                <div class="target-controls">
                                    <button type="button" class="btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="undoPlotter()"><i class="li-arrow-left"></i> <span id="lbl-plotter-undo">Annuler</span></button>
                                    <button type="button" class="btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="clearPlotter()"><i class="li-trash"></i> <span id="lbl-plotter-clear">Tout effacer</span></button>
                                </div>
                            </div>
                            
                            <div class="target-plotter-stats">
                                <div style="margin-bottom:0.75rem;">
                                    <label for="target_preset" id="lbl-plotter-preset" style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.25rem;">Type de cible / Échelle</label>
                                    <select id="target_preset" style="width:100%;font-size:0.85rem;padding:0.4rem;">
                                        <option value="issf_50m" selected>C50 (50m Carabine)</option>
                                        <option value="c200">C200 (200m Carabine - Visuel 400mm)</option>
                                        <option value="issf_10m">ISSF 10m Pistolet</option>
                                        <option value="issf_10m_rifle">ISSF 10m Carabine</option>
                                        <option value="issf_25m_precision">ISSF 25m Pistolet Précision</option>
                                        <option value="issf_25m_rapid">ISSF 25m Pistolet Tir Rapide</option>
                                        <option value="issf_50m_pistol">ISSF 50m Pistolet Libre</option>
                                        <option value="issf_300m">ISSF 300m Carabine</option>
                                        <option value="biathlon_prone">Biathlon Couché (50m)</option>
                                        <option value="biathlon_standing">Biathlon Debout (50m)</option>
                                        <option value="ipsc">IPSC Classic Silhouette</option>
                                        <option value="idpa">IDPA Silhouette</option>
                                        <option value="field_target">Field Target</option>
                                        <option value="standard_rings">Cible standard 180mm</option>
                                        <option value="grouping">Cible de Groupement</option>
                                        <option value="moa">Grille 1 MOA @ 100m</option>
                                        <option value="inch">Grille 1 pouce (8" total)</option>
                                    </select>
                                </div>
                                
                                <div class="target-stats-grid">
                                    <div class="target-stat-item">
                                        <label id="lbl-stat-col-1">Impacts</label>
                                        <div id="lbl_shot_count" class="target-stat-val">0</div>
                                    </div>
                                    <div class="target-stat-item">
                                        <label id="lbl-stat-col-2">Dispersion (ES)</label>
                                        <div id="lbl_group_size_mm" class="target-stat-val">-</div>
                                    </div>
                                    <div class="target-stat-item">
                                        <label id="lbl-stat-col-3">Dispersion (MOA)</label>
                                        <div id="lbl_group_size_moa" class="target-stat-val">-</div>
                                    </div>
                                    <div class="target-stat-item">
                                        <label id="lbl-stat-col-4">Dispersion (MRAD)</label>
                                        <div id="lbl_group_size_mrad" class="target-stat-val">-</div>
                                    </div>
                                    <div class="target-stat-item" style="grid-column: 1 / -1;">
                                        <label id="lbl-stat-mpi">Point moyen d'impact (MPI)</label>
                                        <div style="font-size:0.85rem;font-weight:bold;">
                                            X: <span id="lbl_mpi_x">-</span> | Y: <span id="lbl_mpi_y">-</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
 
                    <!-- Champs de valeur finale liés au plotter -->
                    <input type="hidden" id="s_rounds_fired" value="0">
                    <input type="hidden" id="s_group_size" value="0">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('modal_session')" id="btn-s-cancel">Annuler</button>
                <button type="submit" class="btn-primary" id="btn-s-save">Enregistrer la séance</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL : Entretien -->
<div id="modal_maint" class="modal-overlay">
    <div class="modal-box">
        <div class="modal-header">
            <h3 id="maint_modal_title">Ajouter un entretien</h3>
            <button class="modal-close" onclick="closeModal('modal_maint')">&times;</button>
        </div>
        <form id="form_maint" onsubmit="saveMaint(event)">
            <div class="modal-body">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="m_date" id="lbl-m-date">Date de l'opération *</label>
                        <input type="date" id="m_date" required>
                    </div>
                    <div class="form-group">
                        <label for="m_weapon_id" id="lbl-m-weapon">Arme concernée *</label>
                        <select id="m_weapon_id" required>
                            <option value="" id="opt-m-select">-- Sélectionner --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="m_type" id="lbl-m-type">Type d'entretien *</label>
                        <select id="m_type" required>
                            <option value="nettoyage" id="opt-m-clean">Nettoyage standard</option>
                            <option value="piece" id="opt-m-piece">Changement de pièce</option>
                            <option value="rodage" id="opt-m-breakin">Rodage canon</option>
                            <option value="autre" id="opt-m-other">Autre opération</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="m_round_count" id="lbl-m-count">Tir à l'entretien (Round count)</label>
                        <input type="number" id="m_round_count" placeholder="Ex: 450 (facultatif)">
                    </div>
                    <div class="form-group full-width">
                        <label for="m_description" id="lbl-m-desc">Description / Détails *</label>
                        <textarea id="m_description" rows="3" placeholder="Ex: Nettoyage complet au solvant, remplacement du ressort de rappel..." required></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('modal_maint')" id="btn-m-cancel">Annuler</button>
                <button type="submit" class="btn-primary" id="btn-m-save">Enregistrer</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL : Choix de la fiche d'impression vierge -->
<div id="modal_print_blank" class="modal-overlay">
    <div class="modal-box" style="max-width: 500px;">
        <div class="modal-header">
            <h3 id="lbl-p-title">Imprimer une fiche de tir vierge</h3>
            <button class="modal-close" onclick="closeModal('modal_print_blank')">&times;</button>
        </div>
        <div class="modal-body">
            <p id="lbl-p-desc" style="font-size:0.9rem; color:var(--color-text-light); margin-bottom:1.25rem;">
                Sélectionnez le format de fiche de tir adapté à votre discipline ou entraînement.
            </p>
            <div class="form-group">
                <label for="print_blank_type" id="lbl-p-type" style="font-weight:600; display:block; margin-bottom:0.25rem;">Discipline / Format de la fiche :</label>
                <select id="print_blank_type" style="width:100%; padding:0.6rem; font-size:0.95rem; border-radius:var(--radius); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text);">
                    <option value="generic" id="opt-p-generic">Générique / Entraînement Standard (1 cible + table de 20 tirs)</option>
                    <option value="issf" id="opt-p-issf">Match ISSF - 60 coups (6 cibles x 10 coups + tableau de scores)</option>
                    <option value="tld" id="opt-p-tld">Tir Longue Distance - TLD (1 cible TLD + table balistique & clics)</option>
                </select>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn-secondary" onclick="closeModal('modal_print_blank')" id="btn-p-cancel">Annuler</button>
            <button type="button" class="btn-primary" onclick="executePrintBlank()" id="btn-p-print"><i class="li-printer"></i> Imprimer</button>
        </div>
    </div>
</div>

<!-- Template d'impression de fiche vierge -->
<div id="blank_print_template">
    <div class="print-header">
        <h2 id="lbl-print-tpl-title">Carnet de Tir Numérique — Fiche de Séance</h2>
        <span class="print-website">www.tireur.org</span>
    </div>
    
    <div class="print-meta-grid">
        <div class="print-meta-item"><label id="lbl-print-tpl-date">Date :</label> ____________________</div>
        <div class="print-meta-item"><label id="lbl-print-tpl-stand">Lieu / Stand :</label> ____________________</div>
        <div class="print-meta-item"><label id="lbl-print-tpl-weapon">Arme utilisée :</label> ____________________</div>
        <div class="print-meta-item"><label id="lbl-print-tpl-caliber">Calibre :</label> ____________________</div>
    </div>
    
    <div class="print-sections-grid">
        <div class="print-section-left">
            <div class="print-field-group">
                <h3 id="lbl-print-tpl-sub-ammo">Munition &amp; Rechargement</h3>
                <div class="print-field"><strong id="lbl-print-tpl-ammo">Munition / Ogive :</strong> _________________________</div>
                <div class="print-field"><strong id="lbl-print-tpl-weight">Poids de balle :</strong> ________ gr</div>
                <div class="print-field"><strong id="lbl-print-tpl-charge">Poudre / Charge :</strong> ________ gr</div>
                <div class="print-field"><strong id="lbl-print-tpl-velocity">Vitesse moyenne :</strong> ________ m/s</div>
            </div>
            
            <div class="print-field-group">
                <h3 id="lbl-print-tpl-sub-cond">Conditions de tir</h3>
                <div class="print-field"><strong id="lbl-print-tpl-distance">Distance :</strong> ________ m</div>
                <div class="print-field"><strong id="lbl-print-tpl-temp">Température :</strong> ________ °C</div>
                <div class="print-field"><strong id="lbl-print-tpl-wind">Vent :</strong> ________ m/s (Dir: ________)</div>
            </div>
            
            <div class="print-field-group" style="flex-grow: 1;">
                <h3 id="lbl-print-tpl-sub-notes">Notes / Observations</h3>
                <div class="print-notes-lines">
                    <div class="print-line"></div>
                    <div class="print-line"></div>
                    <div class="print-line"></div>
                    <div class="print-line"></div>
                    <div class="print-line"></div>
                </div>
            </div>
        </div>
        
        <div class="print-section-right">
            <h3 id="lbl-print-tpl-target-title">Tracé des impacts</h3>
            <div class="print-target-container">
                <svg viewBox="0 0 280 280" width="280" height="280" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="140" cy="140" r="135" fill="none" stroke="#333" stroke-width="1.5" />
                    <!-- Rings 1 to 6 -->
                    <circle cx="140" cy="140" r="121.5" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                    <circle cx="140" cy="140" r="108" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                    <circle cx="140" cy="140" r="94.5" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                    <circle cx="140" cy="140" r="81" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                    <circle cx="140" cy="140" r="67.5" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                    <circle cx="140" cy="140" r="54" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
                    <!-- Rings 7 to 10 filled with light grey -->
                    <circle cx="140" cy="140" r="40.5" fill="#f0f0f0" stroke="#333" stroke-width="1.5" />
                    <circle cx="140" cy="140" r="27" fill="none" stroke="#333" stroke-width="1.5" />
                    <circle cx="140" cy="140" r="13.5" fill="none" stroke="#333" stroke-width="1.5" />
                    <circle cx="140" cy="140" r="3.5" fill="#333" stroke="none" />
                    
                    <!-- Axes -->
                    <line x1="140" y1="5" x2="140" y2="275" stroke="#ccc" stroke-width="0.8" stroke-dasharray="2,2" />
                    <line x1="5" y1="140" x2="275" y2="140" stroke="#ccc" stroke-width="0.8" stroke-dasharray="2,2" />
                    
                    <!-- Ring Labels -->
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
            <div class="print-target-caption" id="lbl-print-tpl-target-caption">Cible de réglage (C50 proportionnelle)</div>
        </div>
    </div>
</div>

<!-- MODAL : Import de vitesses -->
<div id="modal_chrono_import" class="modal-overlay" style="z-index: 1100;">
    <div class="modal-box" style="max-width: 450px;">
        <div class="modal-header">
            <h3 id="lbl-chrono-import-title">Importer des vitesses</h3>
            <button type="button" class="modal-close" onclick="closeModal('modal_chrono_import')">&times;</button>
        </div>
        <div class="modal-body" style="padding:1.25rem;">
            <p id="lbl-chrono-import-desc" style="font-size:0.85rem; color:var(--color-text-light); margin-bottom:1rem;">
                Collez vos vitesses mesurées par votre chronographe (séparées par des virgules, des espaces ou des retours à la ligne).
            </p>
            <div class="form-group" style="margin-bottom:1rem;">
                <label for="chrono_raw_data" id="lbl-chrono-raw-data" style="font-weight:600; display:block; margin-bottom:0.25rem;">Vitesses (m/s) :</label>
                <textarea id="chrono_raw_data" rows="5" placeholder="Ex: 820, 818, 825, 822, 819" style="width:100%; font-family: monospace; padding:0.5rem; border-radius:var(--radius); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text);"></textarea>
            </div>
            <div id="chrono_import_stats" style="margin-top:1rem; font-size:0.85rem; display:none; background:var(--color-bg); padding:0.75rem; border-radius:var(--radius); border:1px dashed var(--color-border); color:var(--color-text); line-height:1.6;">
                <div><strong id="lbl-chrono-count">Nombre de tirs :</strong> <span id="val_chrono_count">0</span></div>
                <div><strong id="lbl-chrono-avg">Vitesse moyenne :</strong> <span id="val_chrono_avg">0</span> m/s</div>
                <div><strong id="lbl-chrono-sd">Écart-type (SD) :</strong> <span id="val_chrono_sd">0</span> m/s</div>
                <div><strong id="lbl-chrono-minmax">Vitesse min/max :</strong> <span id="val_chrono_min">0</span> / <span id="val_chrono_max">0</span> m/s</div>
            </div>
        </div>
        <div class="modal-footer" style="padding:1rem 1.25rem; background:var(--color-surface); border-top:1px solid var(--color-border); display:flex; justify-content:flex-end; gap:0.5rem; border-radius:0 0 var(--radius) var(--radius);">
            <button type="button" class="btn-secondary" onclick="closeModal('modal_chrono_import')" id="btn-chrono-cancel">Annuler</button>
            <button type="button" class="btn-primary" onclick="calculateChronoStats()" id="btn-chrono-calc">Calculer</button>
            <button type="button" class="btn-primary" onclick="applyChronoImport()" id="btn-chrono-apply" style="display:none;">Valider &amp; Importer</button>
        </div>
    </div>
</div>

<script>
    const CALIBERS_DB = <?php echo file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/calibers/calibers.json'); ?>;
</script>
<datalist id="calibers_list"></datalist>
<script src="/js/targets/target_generator.js?v=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'].'/js/targets/target_generator.js'); ?>"></script>
<script src="/js/carnet.js?v=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'].'/js/carnet.js'); ?>"></script>

<?php include 'footer.php'; ?>
