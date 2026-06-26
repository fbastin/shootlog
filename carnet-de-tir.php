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
            <h1 style="margin-bottom:0.25rem;">Carnet de Tir Numérique</h1>
            <p style="color:var(--color-text-light); margin:0;">Suivez vos armes, séances de tir et opérations d'entretien. Fonctionne 100% hors-ligne et localement. Pour voir un exemple pré-rempli, visitez le <a href="/carnet-de-tir-exemple.php" style="text-decoration:underline; font-weight:500;">carnet d'exemple</a>.</p>
        </div>
        <div class="noprint" style="display:flex; gap:0.5rem; align-items:center;">
            <button type="button" id="btn-fullscreen" class="btn-secondary" onclick="toggleFullscreen()"><i class="li-eye"></i> Plein écran</button>
            <button type="button" class="btn-secondary" onclick="printBlankSheet()"><i class="li-printer"></i> Imprimer fiche vierge</button>
            <button type="button" class="btn-primary" onclick="openSessionModal()"><i class="li-plus"></i> Nouvelle séance</button>
        </div>
    </div>

    <!-- Navigation par Onglets -->
    <nav class="logbook-nav noprint">
        <button class="logbook-tab-btn active" data-tab="dashboard"><i class="li-image"></i> Tableau de bord</button>
        <button class="logbook-tab-btn" data-tab="weapons"><i class="li-target"></i> Mes Armes</button>
        <button class="logbook-tab-btn" data-tab="sessions" id="tab-btn-sessions"><i class="li-file-text"></i> Séances (<span id="nav_session_count">0</span>)</button>
        <button class="logbook-tab-btn" data-tab="maintenance"><i class="li-clock"></i> Entretien</button>
        <button class="logbook-tab-btn" data-tab="settings"><i class="li-settings"></i> Réglages &amp; Sauvegarde</button>
    </nav>

    <div class="logbook-container">
        
        <!-- ONGLET : Tableau de bord -->
        <section id="dashboard" class="logbook-tab-content active">
            <div class="db-grid">
                <div class="db-card">
                    <div class="db-card-icon"><i class="li-target"></i></div>
                    <div class="db-card-info">
                        <h4>Coups tirés</h4>
                        <p id="stat_total_rounds" class="db-val">0</p>
                    </div>
                </div>
                <div class="db-card">
                    <div class="db-card-icon"><i class="li-file-text"></i></div>
                    <div class="db-card-info">
                        <h4>Séances</h4>
                        <p id="stat_total_sessions" class="db-val">0</p>
                    </div>
                </div>
                <div class="db-card">
                    <div class="db-card-icon"><i class="li-target"></i></div>
                    <div class="db-card-info">
                        <h4>Armes actives</h4>
                        <p id="stat_total_weapons" class="db-val">0</p>
                    </div>
                </div>
                <div class="db-card">
                    <div class="db-card-icon"><i class="li-clock"></i></div>
                    <div class="db-card-info">
                        <h4>Entretiens</h4>
                        <p id="stat_total_maint" class="db-val">0</p>
                    </div>
                </div>
            </div>

            <div class="db-sections-grid">
                <div class="db-panel">
                    <h3>Volume de tir (6 derniers mois)</h3>
                    <div id="db_chart_container" class="chart-container">
                        <!-- Généré en SVG via JS -->
                    </div>
                </div>
                <div class="db-panel">
                    <h3>Séances récentes</h3>
                    <div id="db_recent_sessions">
                        <!-- Généré en JS -->
                    </div>
                </div>
            </div>
        </section>

        <!-- ONGLET : Mes Armes -->
        <section id="weapons" class="logbook-tab-content">
            <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;" class="noprint">
                <button type="button" class="btn-primary" onclick="openWeaponModal()"><i class="li-plus"></i> Ajouter une arme</button>
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
                    <label for="filter_weapon">Arme :</label>
                    <select id="filter_weapon" onchange="applyFilters()">
                        <option value="">Toutes les armes</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filter_stand">Stand / Lieu :</label>
                    <input type="text" id="filter_stand" placeholder="Ex: CTF, Bordeaux..." oninput="applyFilters()">
                </div>
                <button type="button" class="btn-secondary" onclick="resetFilters()">Réinitialiser</button>
            </div>

            <div id="sessions_list">
                <!-- Liste des séances générée en JS -->
            </div>
        </section>

        <!-- ONGLET : Entretien -->
        <section id="maintenance" class="logbook-tab-content">
            <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;" class="noprint">
                <button type="button" class="btn-primary" onclick="openMaintModal()"><i class="li-plus"></i> Ajouter un entretien</button>
            </div>
            <div id="maint_list">
                <!-- Registre d'entretien généré en JS -->
            </div>
        </section>

        <!-- ONGLET : Sauvegarde & Réglages -->
        <section id="settings" class="logbook-tab-content">
            <div class="db-panel" style="max-width: 650px; margin: 0 auto;">
                <h3>Gestion locale des données</h3>
                <p style="font-size:0.9rem; color:var(--color-text-light); line-height:1.5; margin-bottom:1.5rem;">
                    Toutes les données de ce carnet de tir sont stockées dans le stockage local de votre navigateur (LocalStorage). 
                    Aucune donnée n'est envoyée vers nos serveurs. Pour éviter toute perte en cas de nettoyage du navigateur, 
                    nous vous conseillons d'effectuer des sauvegardes régulières.
                </p>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2rem;">
                    <div style="border:1px solid var(--color-border); padding:1rem; border-radius:var(--radius); text-align:center;">
                        <h4 style="margin:0 0 0.5rem 0;">Exporter mes données</h4>
                        <p style="font-size:0.8rem; color:var(--color-text-light); margin-bottom:1rem;">Téléchargez un fichier de sauvegarde contenant toutes vos armes, séances et entretiens.</p>
                        <button type="button" class="btn-primary" style="width:100%; justify-content:center;" onclick="exportData()"><i class="li-file-text"></i> Exporter au format JSON</button>
                    </div>
                    <div style="border:1px solid var(--color-border); padding:1rem; border-radius:var(--radius); text-align:center;">
                        <h4 style="margin:0 0 0.5rem 0;">Importer une sauvegarde</h4>
                        <p style="font-size:0.8rem; color:var(--color-text-light); margin-bottom:1rem;">Restaurez vos données ou fusionnez-les depuis un fichier précédemment exporté.</p>
                        <button type="button" class="btn-secondary" style="width:100%; justify-content:center;" onclick="triggerImport()"><i class="li-folder"></i> Importer un fichier</button>
                        <input type="file" id="import_file_input" style="display:none;" accept=".json" onchange="importData(event)">
                    </div>
                </div>

                <div style="border:1px solid #f5c2c2; background:rgba(231, 76, 60, 0.03); padding:1.25rem; border-radius:var(--radius); margin-top:2rem;">
                    <h4 style="color:#e74c3c; margin:0 0 0.5rem 0;"><i class="li-alert"></i> Zone de Danger</h4>
                    <p style="font-size:0.85rem; color:var(--color-text-light); margin-bottom:1rem;">Cette action effacera définitivement l'intégralité du carnet de tir (armes, tirs, entretiens) sur ce navigateur.</p>
                    <button type="button" class="btn-secondary btn-danger-text" onclick="clearDatabase()">Réinitialiser le carnet de tir</button>
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
                        <label for="w_name">Modèle / Nom de l'arme *</label>
                        <input type="text" id="w_name" placeholder="Ex: Tikka T3x TAC A1, Glock 17..." required>
                    </div>
                    <div class="form-group">
                        <label for="w_caliber">Calibre *</label>
                        <input type="text" id="w_caliber" placeholder="Ex: 6.5 Creedmoor, 9x19mm..." list="calibers_list" required>
                    </div>
                    <div class="form-group">
                        <label for="w_barrel_length">Longueur de canon (pouces)</label>
                        <input type="number" id="w_barrel_length" step="0.1" placeholder="Ex: 24, 4.5">
                    </div>
                    <div class="form-group">
                        <label for="w_twist_rate">Pas de rayure (1:X pouces)</label>
                        <input type="number" id="w_twist_rate" step="0.1" placeholder="Ex: 8, 10">
                    </div>
                    <div class="form-group">
                        <label for="w_zero_distance">Distance de zéro (mètres)</label>
                        <input type="number" id="w_zero_distance" placeholder="Ex: 100, 25">
                    </div>
                    <div class="form-group full-width">
                        <label for="w_optics">Lunette / Optique</label>
                        <input type="text" id="w_optics" placeholder="Ex: Vortex Viper PST II 5-25x50">
                    </div>
                    <div class="form-group">
                        <label for="w_initial_round_count">Compteur initial (tirs antérieurs)</label>
                        <input type="number" id="w_initial_round_count" value="0" min="0">
                    </div>
                    <div class="form-group full-width">
                        <label for="w_notes">Notes / Caractéristiques additionnelles</label>
                        <textarea id="w_notes" rows="3" placeholder="Poids de détente, rechargement favori, date d'acquisition..."></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('modal_weapon')">Annuler</button>
                <button type="submit" class="btn-primary">Enregistrer</button>
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
                        <label for="s_date">Date de la séance *</label>
                        <input type="date" id="s_date" required>
                    </div>
                    <div class="form-group">
                        <label for="s_stand">Stand de tir / Lieu</label>
                        <input type="text" id="s_stand" placeholder="Ex: Stand de tir de Versailles">
                    </div>
                    <div class="form-group">
                        <label for="s_weapon_id">Arme utilisée *</label>
                        <select id="s_weapon_id" required>
                            <option value="">-- Sélectionner --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="s_caliber">Calibre</label>
                        <input type="text" id="s_caliber" placeholder="Ex: 6.5 CM (autocomplété)" list="calibers_list">
                    </div>
                    
                    <h4 class="full-width" style="margin:1rem 0 0.5rem 0; border-bottom:1px solid var(--color-border); padding-bottom:0.25rem;">Munition &amp; Balistique</h4>
                    
                    <div class="form-group">
                        <label for="s_ammo">Munition / Ogive</label>
                        <input type="text" id="s_ammo" placeholder="Ex: Lapua Scenar 139gr, S&amp;B 124gr">
                    </div>
                    <div class="form-group">
                        <label for="s_bullet_weight">Poids de balle (gr)</label>
                        <input type="number" id="s_bullet_weight" placeholder="Ex: 139">
                    </div>
                    <div class="form-group">
                        <label for="s_powder_charge">Charge de poudre (gr)</label>
                        <input type="number" id="s_powder_charge" step="0.01" placeholder="Ex: 37.5">
                    </div>
                    <div class="form-group">
                        <label for="s_velocity">Vitesse initiale mesurée (m/s)</label>
                        <input type="number" id="s_velocity" placeholder="Ex: 820">
                    </div>
                    
                    <h4 class="full-width" style="margin:1rem 0 0.5rem 0; border-bottom:1px solid var(--color-border); padding-bottom:0.25rem;">Conditions &amp; Résultats</h4>
                    
                    <div class="form-group">
                        <label for="s_distance">Distance (mètres) *</label>
                        <input type="number" id="s_distance" value="100" required>
                    </div>
                    <div class="form-group">
                        <label for="s_temp">Température ambiante (°C)</label>
                        <input type="number" id="s_temp" placeholder="Ex: 18">
                    </div>
                    <div class="form-group">
                        <label for="s_wind">Vitesse du vent (m/s)</label>
                        <input type="number" id="s_wind" placeholder="Ex: 3">
                    </div>
                    <div class="form-group">
                        <label for="s_notes">Notes additionnelles</label>
                        <input type="text" id="s_notes" placeholder="Sensations, réglages de clics effectués...">
                    </div>

                    <!-- Plotter de cible interactif -->
                    <div class="form-group full-width">
                        <label style="display:flex; justify-content:space-between;">
                            <span>Calculateur de dispersion interactif</span>
                            <span style="font-weight:normal;color:var(--color-text-light);">Cliquez sur la cible pour tracer vos impacts</span>
                        </label>
                        
                        <div class="target-plotter-container">
                            <div class="target-board-wrapper">
                                <div id="plotter_board" class="target-board">
                                    <!-- Axes, anneaux et impacts générés par JS -->
                                </div>
                                <div class="target-controls">
                                    <button type="button" class="btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="undoPlotter()"><i class="li-arrow-left"></i> Annuler</button>
                                    <button type="button" class="btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="clearPlotter()"><i class="li-trash"></i> Tout effacer</button>
                                </div>
                            </div>
                            
                            <div class="target-plotter-stats">
                                <div style="margin-bottom:0.75rem;">
                                    <label for="target_preset" style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.25rem;">Type de cible / Échelle</label>
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
                                        <label>Impacts</label>
                                        <div id="lbl_shot_count" class="target-stat-val">0</div>
                                    </div>
                                    <div class="target-stat-item">
                                        <label>Dispersion (ES)</label>
                                        <div id="lbl_group_size_mm" class="target-stat-val">-</div>
                                    </div>
                                    <div class="target-stat-item">
                                        <label>Dispersion (MOA)</label>
                                        <div id="lbl_group_size_moa" class="target-stat-val">-</div>
                                    </div>
                                    <div class="target-stat-item">
                                        <label>Dispersion (MRAD)</label>
                                        <div id="lbl_group_size_mrad" class="target-stat-val">-</div>
                                    </div>
                                    <div class="target-stat-item" style="grid-column: 1 / -1;">
                                        <label>Point moyen d'impact (MPI)</label>
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
                <button type="button" class="btn-secondary" onclick="closeModal('modal_session')">Annuler</button>
                <button type="submit" class="btn-primary">Enregistrer la séance</button>
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
                        <label for="m_date">Date de l'opération *</label>
                        <input type="date" id="m_date" required>
                    </div>
                    <div class="form-group">
                        <label for="m_weapon_id">Arme concernée *</label>
                        <select id="m_weapon_id" required>
                            <option value="">-- Sélectionner --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="m_type">Type d'entretien *</label>
                        <select id="m_type" required>
                            <option value="nettoyage">Nettoyage standard</option>
                            <option value="piece">Changement de pièce</option>
                            <option value="rodage">Rodage canon</option>
                            <option value="autre">Autre opération</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="m_round_count">Tir à l'entretien (Round count)</label>
                        <input type="number" id="m_round_count" placeholder="Ex: 450 (facultatif)">
                    </div>
                    <div class="form-group full-width">
                        <label for="m_description">Description / Détails *</label>
                        <textarea id="m_description" rows="3" placeholder="Ex: Nettoyage complet au solvant, remplacement du ressort de rappel..." required></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('modal_maint')">Annuler</button>
                <button type="submit" class="btn-primary">Enregistrer</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL : Choix de la fiche d'impression vierge -->
<div id="modal_print_blank" class="modal-overlay">
    <div class="modal-box" style="max-width: 500px;">
        <div class="modal-header">
            <h3>Imprimer une fiche de tir vierge</h3>
            <button class="modal-close" onclick="closeModal('modal_print_blank')">&times;</button>
        </div>
        <div class="modal-body">
            <p style="font-size:0.9rem; color:var(--color-text-light); margin-bottom:1.25rem;">
                Sélectionnez le format de fiche de tir adapté à votre discipline ou entraînement.
            </p>
            <div class="form-group">
                <label for="print_blank_type" style="font-weight:600; display:block; margin-bottom:0.25rem;">Discipline / Format de la fiche :</label>
                <select id="print_blank_type" style="width:100%; padding:0.6rem; font-size:0.95rem; border-radius:var(--radius); border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text);">
                    <option value="generic">Générique / Entraînement Standard (1 cible + table de 20 tirs)</option>
                    <option value="issf">Match ISSF - 60 coups (6 cibles x 10 coups + tableau de scores)</option>
                    <option value="tld">Tir Longue Distance - TLD (1 cible TLD + table balistique & clics)</option>
                </select>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn-secondary" onclick="closeModal('modal_print_blank')">Annuler</button>
            <button type="button" class="btn-primary" onclick="executePrintBlank()"><i class="li-printer"></i> Imprimer</button>
        </div>
    </div>
</div>

<!-- Template d'impression de fiche vierge -->
<div id="blank_print_template">
    <div class="print-header">
        <h2>Carnet de Tir Numérique — Fiche de Séance</h2>
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
                <div class="print-field"><strong>Poids de balle :</strong> ________ gr</div>
                <div class="print-field"><strong>Poudre / Charge :</strong> ________ gr</div>
                <div class="print-field"><strong>Vitesse moyenne :</strong> ________ m/s</div>
            </div>
            
            <div class="print-field-group">
                <h3>Conditions de tir</h3>
                <div class="print-field"><strong>Distance :</strong> ________ m</div>
                <div class="print-field"><strong>Température :</strong> ________ °C</div>
                <div class="print-field"><strong>Vent :</strong> ________ m/s (Dir: ________)</div>
            </div>
            
            <div class="print-field-group" style="flex-grow: 1;">
                <h3>Notes / Observations</h3>
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
            <h3>Tracé des impacts</h3>
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
            <div class="print-target-caption">Cible de réglage (C50 proportionnelle)</div>
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
