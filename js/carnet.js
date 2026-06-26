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

// Target board definitions
const TARGET_PRESETS = {
    'c50': { name: 'C50 (Cible 50m - Visuel 200mm)', diameterMm: 200, label: 'mm' },
    'c200': { name: 'C200 (Cible 200m - Visuel 400mm)', diameterMm: 400, label: 'mm' },
    'moa': { name: 'Cible MOA (Grille 1 MOA à 100m / 29.1mm)', diameterMm: 232.8, label: 'MOA' }, // 8 MOA total width
    'inch': { name: 'Grille 1 pouce (Total 8 pouces / 203.2mm)', diameterMm: 203.2, label: 'in' }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
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
        showNotification("Erreur lors de la lecture des données locales.", "error");
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
        showNotification("Erreur lors de la sauvegarde des données.", "error");
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
            mpi: { x: 140.4, y: 140.3 }
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
            mpi: { x: 139.2, y: 138.8 }
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
            name: 'C200 (Cible 200m - Visuel 400mm)',
            diameterMm: base.diams[0] * 2 * 1.15
        };
    }
    
    if (hasGen && window.ISSF && window.ISSF[key]) {
        const spec = window.ISSF[key];
        let name = key;
        if (window.I18N && window.I18N['fr'] && window.I18N['fr'][spec.titleKey]) {
            name = window.I18N['fr'][spec.titleKey];
        } else {
            const names = {
                issf_50m: 'ISSF 50m Carabine (C50)',
                issf_10m: 'ISSF 10m Pistolet',
                issf_10m_rifle: 'ISSF 10m Carabine',
                issf_25m_precision: 'ISSF 25m Pistolet Précision',
                issf_25m_rapid: 'ISSF 25m Pistolet Vitesse',
                issf_50m_pistol: 'ISSF 50m Pistolet Libre',
                issf_300m: 'ISSF 300m Carabine'
            };
            name = names[key] || key;
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
        const name = key === 'biathlon_prone' ? 'Biathlon Couché (Ø45/115mm)' : 'Biathlon Debout (Ø115mm)';
        return {
            isBiathlon: true,
            spec: spec,
            name: name,
            diameterMm: spec.aim * 1.15
        };
    }
    
    if (hasGen && window.SILHOUETTE && window.SILHOUETTE[key]) {
        const spec = window.SILHOUETTE[key];
        const name = key === 'ipsc' ? 'Silhouette IPSC Classic' : 'Silhouette IDPA';
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
            name: 'Field Target (Kill Zone Ø40mm)',
            diameterMm: 70 * 1.15
        };
    }
    
    if (key === 'standard_rings') {
        return {
            isStandardRings: true,
            name: 'Cible Loisir 180mm',
            diameterMm: 180 * 1.15
        };
    }
    
    if (key === 'grouping') {
        return {
            isGrouping: true,
            name: 'Cible de Groupement',
            diameterMm: 70 * 1.15
        };
    }
    
    if (key === 'moa') {
        return {
            isGrid: true,
            unit: 'MOA',
            mmPerUnit: 29.0888,
            diameterMm: 29.0888 * 8,
            name: 'Grille 1 MOA @ 100m'
        };
    }
    
    if (key === 'inch') {
        return {
            isGrid: true,
            unit: 'pouce',
            mmPerUnit: 25.4,
            diameterMm: 25.4 * 8,
            name: 'Grille 1 pouce (8" total)'
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
        listDiv.innerHTML = `<p style="color:var(--color-text-light);font-style:italic;">Aucune session enregistrée pour le moment. Cliquez sur "Séances" pour en ajouter une.</p>`;
        return;
    }
    
    // Sort and get last 3
    const sorted = [...state.sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    
    let html = '<div style="display:flex;flex-direction:column;gap:0.75rem;">';
    sorted.forEach(s => {
        const weapon = state.weapons.find(w => w.id === s.weaponId);
        const weaponName = weapon ? weapon.name : 'Arme inconnue';
        html += `
            <div style="padding:0.75rem; border-left:3px solid var(--color-accent); background:var(--color-bg); border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:var(--color-text);">${formatDate(s.date)}</strong> &mdash; <span style="font-size:0.9rem;">${weaponName}</span>
                    <div style="font-size:0.8rem; color:var(--color-text-light); margin-top:0.15rem;">
                        ${s.stand ? s.stand + ' &bull; ' : ''}${s.distance}m &bull; ${s.roundsFired} coups &bull; Dispersion: <strong>${s.groupSize} mm</strong>
                    </div>
                </div>
                <button type="button" class="btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="switchTab('sessions')">Détails</button>
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
        chartDiv.innerHTML = `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--color-text-light);font-style:italic;">Enregistrez des tirs pour visualiser l'historique</div>`;
        return;
    }
    
    // Group rounds fired by month/year
    const monthlyData = {};
    const monthsName = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
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
    chartPoints.forEach((val, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + chartH - (val / maxVal) * chartH;
        svg += `
            <circle cx="${x}" cy="${y}" r="5" class="chart-dot">
                <title>${activeMonths[i].label}: ${val} cartouches</title>
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
    
    if (state.weapons.length === 0) {
        grid.className = 'empty-state';
        grid.style.display = 'block';
        grid.innerHTML = `
            <span class="empty-state-icon"><i class="li-target"></i></span>
            <h4>Aucune arme enregistrée</h4>
            <p>Commencez par ajouter votre première arme (carabine, pistolet) afin de pouvoir y associer vos séances de tir.</p>
            <button type="button" class="btn-primary" onclick="openWeaponModal()"><i class="li-plus"></i> Ajouter une arme</button>
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
                    <span>Canon: <strong>${w.barrelLength || '-'} "</strong></span>
                    <span>Rayure: <strong>1:${w.twistRate || '-'} "</strong></span>
                    <span>Zéro: <strong>${w.zeroDistance || '-'} m</strong></span>
                    <span>Tirs (Round Count): <strong style="color:var(--color-accent);">${weaponRounds}</strong></span>
                    <span style="grid-column:1/-1;">Optique: <strong>${escapeHTML(w.optics) || '-'}</strong></span>
                </div>
                ${w.notes ? `<div style="font-size:0.8rem; color:var(--color-text-light); margin-bottom:0.75rem; border-top:1px dashed var(--color-border); padding-top:0.5rem; font-style:italic;">${escapeHTML(w.notes)}</div>` : ''}
                <div class="weapon-actions">
                    <button type="button" class="btn-icon" title="Éditer" onclick="openWeaponModal('${w.id}')"><i class="li-pencil"></i></button>
                    <button type="button" class="btn-icon btn-danger" title="Supprimer" onclick="deleteWeapon('${w.id}')"><i class="li-trash"></i></button>
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
    
    if (state.sessions.length === 0) {
        listDiv.className = 'empty-state';
        listDiv.innerHTML = `
            <span class="empty-state-icon"><i class="li-file-text"></i></span>
            <h4>Aucune séance de tir</h4>
            <p>Ajoutez votre première séance de tir pour enregistrer vos scores, conditions météo et dispersion de tirs.</p>
            <button type="button" class="btn-primary" onclick="openSessionModal()"><i class="li-plus"></i> Enregistrer une séance</button>
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
        listDiv.innerHTML = `<div class="empty-state"><h4>Aucune séance ne correspond aux filtres de recherche.</h4></div>`;
        return;
    }
    
    let html = '';
    filtered.forEach(s => {
        const weapon = state.weapons.find(w => w.id === s.weaponId);
        const weaponName = weapon ? weapon.name : 'Arme inconnue';
        
        // Generate impacts preview HTML using target generator SVG representation
        let previewHtml = '';
        if (s.impacts && s.impacts.length > 0) {
            const targetSVG = generateTargetSVG(s.targetPreset || 'issf_50m', 140, s.impacts, s.mpi, false, 0, false);
            previewHtml += `<div class="session-target-preview-svg">${targetSVG}</div>`;
            previewHtml += `<div class="session-target-stats">${s.roundsFired} coups &bull; ES: ${s.groupSize} mm</div>`;
        } else {
            previewHtml += `
                <div class="session-target-preview" style="background:#222;display:flex;align-items:center;justify-content:center;color:#666;font-size:0.75rem;flex-direction:column;border-color:#333;">
                    <i class="li-ban" style="font-size:1.8rem;margin-bottom:0.3rem;"></i>
                    Aucun tracé
                </div>
                <div class="session-target-stats">${s.roundsFired} coups &bull; Gr: ${s.groupSize} mm</div>
            `;
        }
        
        html += `
            <div class="session-card" id="session-card-${s.id}">
                <div class="session-header">
                    <div class="session-title-block">
                        <span class="session-date">${formatDate(s.date)}</span>
                        <span class="session-stand"><i class="li-target"></i> ${escapeHTML(s.stand) || 'Stand de tir'}</span>
                    </div>
                    <div class="noprint" style="display:flex;gap:0.4rem;">
                        <button type="button" class="btn-icon" title="Imprimer cette séance" onclick="printSession('${s.id}')"><i class="li-printer"></i></button>
                        <button type="button" class="btn-icon" title="Éditer" onclick="openSessionModal('${s.id}')"><i class="li-pencil"></i></button>
                        <button type="button" class="btn-icon btn-danger" title="Supprimer" onclick="deleteSession('${s.id}')"><i class="li-trash"></i></button>
                    </div>
                </div>
                
                <div class="session-grid">
                    <div class="session-info-column">
                        <div class="session-info-block">
                            <h5>Arme &amp; Calibre</h5>
                            <p><strong>${escapeHTML(weaponName)}</strong><br><span style="font-size:0.8rem;color:var(--color-text-light);">${renderCaliberDbLink(s.caliber)}</span></p>
                        </div>
                        <div class="session-info-block">
                            <h5>Munition &amp; Vitesse</h5>
                            <p>${escapeHTML(s.ammo) || 'N/A'}<br><span style="font-size:0.8rem;color:var(--color-text-light);">${s.bulletWeight ? s.bulletWeight+'gr &bull; ' : ''}${s.powderCharge ? s.powderCharge+'gr poudre &bull; ' : ''}${s.velocity ? s.velocity+'m/s' : ''}</span></p>
                        </div>
                        <div class="session-info-block">
                            <h5>Distance &amp; Conditions</h5>
                            <p>${s.distance} m<br><span style="font-size:0.8rem;color:var(--color-text-light);">${s.temp ? s.temp+'°C &bull; ' : ''}${s.wind ? s.wind+'m/s vent' : 'Pas de vent'}</span></p>
                        </div>
                        ${s.notes ? `<div class="session-notes">${escapeHTML(s.notes).replace(/\n/g, '<br>')}</div>` : ''}
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
    
    if (state.maintenance.length === 0) {
        listDiv.className = 'empty-state';
        listDiv.innerHTML = `
            <span class="empty-state-icon"><i class="li-clock"></i></span>
            <h4>Aucun entretien enregistré</h4>
            <p>Consignez vos nettoyages de canons, changements de pièces et rodages pour chaque arme.</p>
            <button type="button" class="btn-primary" onclick="openMaintModal()"><i class="li-plus"></i> Ajouter un entretien</button>
        `;
        return;
    }
    
    listDiv.className = 'maintenance-list';
    
    // Sort chronological (newest first)
    const sorted = [...state.maintenance].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    sorted.forEach(m => {
        const weapon = state.weapons.find(w => w.id === m.weaponId);
        const weaponName = weapon ? weapon.name : 'Arme inconnue';
        
        let typeLabel = m.type;
        if (m.type === 'nettoyage') typeLabel = 'Nettoyage';
        else if (m.type === 'piece') typeLabel = 'Changement de pièce';
        else if (m.type === 'rodage') typeLabel = 'Rodage canon';
        else if (m.type === 'autre') typeLabel = 'Autre opération';
        
        html += `
            <div class="maintenance-item">
                <div class="maint-info-block">
                    <span class="maint-date">${formatDate(m.date)}</span>
                    <div class="maint-details">
                        <h5>${typeLabel} <span class="maint-weapon">${escapeHTML(weaponName)}</span></h5>
                        <p>${escapeHTML(m.description)}</p>
                        ${m.roundCount ? `<p style="font-size:0.75rem;margin-top:0.15rem;color:var(--color-accent);font-weight:600;">Effectué à : ${m.roundCount} tirs</p>` : ''}
                    </div>
                </div>
                <div class="maint-actions noprint">
                    <button type="button" class="btn-icon" title="Éditer" onclick="openMaintModal('${m.id}')"><i class="li-pencil"></i></button>
                    <button type="button" class="btn-icon btn-danger" title="Supprimer" onclick="deleteMaint('${m.id}')"><i class="li-trash"></i></button>
                </div>
            </div>
        `;
    });
    listDiv.innerHTML = html;
}

// Populate weapon selector dropdowns in forms
function populateWeaponSelects() {
    const list = [
        { id: 's_weapon_id', defaultText: '-- Sélectionner --' },
        { id: 'm_weapon_id', defaultText: '-- Sélectionner --' },
        { id: 'filter_weapon', defaultText: 'Toutes les armes' }
    ];
    
    list.forEach(item => {
        const select = document.getElementById(item.id);
        if (!select) return;
        
        // Preserve active selection if possible
        const activeVal = select.value;
        
        select.innerHTML = `<option value="">${item.defaultText}</option>`;
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
    
    document.getElementById('weapon_modal_title').innerText = weaponId ? "Éditer l'arme" : "Ajouter une arme";
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
    
    const name = document.getElementById('w_name').value.trim();
    const caliber = document.getElementById('w_caliber').value.trim();
    if (!name || !caliber) {
        showNotification("Le nom et le calibre sont obligatoires.", "error");
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
            showNotification("Arme mise à jour avec succès.");
        }
    } else {
        // Add new
        wData.id = 'w_' + Math.random().toString(36).substr(2, 9);
        state.weapons.push(wData);
        showNotification("Nouvelle arme enregistrée.");
    }
    
    saveData();
    closeModal('modal_weapon');
    renderAll();
}

// Delete Weapon
function deleteWeapon(weaponId) {
    const w = state.weapons.find(wp => wp.id === weaponId);
    if (!w) return;
    
    // Check if sessions are using it
    const sessionCount = state.sessions.filter(s => s.weaponId === weaponId).length;
    let confirmMsg = `Êtes-vous sûr de vouloir supprimer l'arme "${w.name}" ?`;
    if (sessionCount > 0) {
        confirmMsg += `\nAttention : cette arme est liée à ${sessionCount} séance(s) de tir. Celles-ci ne seront pas supprimées mais référenceront une arme inconnue.`;
    }
    
    if (confirm(confirmMsg)) {
        state.weapons = state.weapons.filter(wp => wp.id !== weaponId);
        saveData();
        showNotification("Arme supprimée.");
        renderAll();
    }
}

// Open Session Modal
function openSessionModal(sessionId = null) {
    state.editingSessionId = sessionId;
    const modal = document.getElementById('modal_session');
    const form = document.getElementById('form_session');
    
    document.getElementById('session_modal_title').innerText = sessionId ? "Éditer la séance" : "Enregistrer une séance de tir";
    form.reset();
    
    // Default values for new session
    if (!sessionId) {
        document.getElementById('s_date').value = new Date().toISOString().split('T')[0];
        state.tempImpacts = [];
        document.getElementById('target_preset').value = 'issf_50m';
    } else {
        const s = state.sessions.find(sn => sn.id === sessionId);
        if (s) {
            document.getElementById('s_date').value = s.date;
            document.getElementById('s_stand').value = s.stand || '';
            document.getElementById('s_weapon_id').value = s.weaponId;
            document.getElementById('s_caliber').value = s.caliber || '';
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
    
    const date = document.getElementById('s_date').value;
    const weaponId = document.getElementById('s_weapon_id').value;
    const distance = parseInt(document.getElementById('s_distance').value) || 100;
    const roundsFired = parseInt(document.getElementById('s_rounds_fired').value) || 0;
    const groupSize = document.getElementById('s_group_size').value.trim();
    
    if (!date || !weaponId) {
        showNotification("La date et l'arme sont obligatoires.", "error");
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
        scaleMmPerPixel: state.scaleMmPerPixel
    };
    
    if (state.editingSessionId) {
        // Edit existing
        const idx = state.sessions.findIndex(s => s.id === state.editingSessionId);
        if (idx !== -1) {
            state.sessions[idx] = { ...state.sessions[idx], ...sData };
            showNotification("Séance de tir mise à jour.");
        }
    } else {
        // Add new
        sData.id = 's_' + Math.random().toString(36).substr(2, 9);
        state.sessions.push(sData);
        showNotification("Nouvelle séance enregistrée.");
    }
    
    saveData();
    closeModal('modal_session');
    renderAll();
}

// Delete Session
function deleteSession(sessionId) {
    if (confirm("Supprimer définitivement cette séance de tir ?")) {
        state.sessions = state.sessions.filter(s => s.id !== sessionId);
        saveData();
        showNotification("Séance de tir supprimée.");
        renderAll();
    }
}

// Open Maintenance Modal
function openMaintModal(maintId = null) {
    state.editingMaintId = maintId;
    const modal = document.getElementById('modal_maint');
    const form = document.getElementById('form_maint');
    
    document.getElementById('maint_modal_title').innerText = maintId ? "Éditer l'entretien" : "Ajouter un entretien";
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
    
    const date = document.getElementById('m_date').value;
    const weaponId = document.getElementById('m_weapon_id').value;
    const type = document.getElementById('m_type').value;
    const desc = document.getElementById('m_description').value.trim();
    
    if (!date || !weaponId || !desc) {
        showNotification("Veuillez remplir tous les champs obligatoires (*).", "error");
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
            showNotification("Opération d'entretien mise à jour.");
        }
    } else {
        // Add new
        mData.id = 'm_' + Math.random().toString(36).substr(2, 9);
        state.maintenance.push(mData);
        showNotification("Opération d'entretien enregistrée.");
    }
    
    saveData();
    closeModal('modal_maint');
    renderAll();
}

// Delete Maintenance
function deleteMaint(maintId) {
    if (confirm("Supprimer cette entrée du registre d'entretien ?")) {
        state.maintenance = state.maintenance.filter(m => m.id !== maintId);
        saveData();
        showNotification("Entrée d'entretien supprimée.");
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
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate basic structure
            if (!data.weapons || !data.sessions || !data.maintenance) {
                throw new Error("Format de fichier invalide.");
            }
            
            if (confirm("Voulez-vous fusionner ces données avec vos données existantes ?\n(Cliquez sur Annuler pour écraser complètement votre base actuelle)")) {
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
                showNotification("Données fusionnées avec succès.");
            } else {
                // Overwrite data
                state.weapons = data.weapons;
                state.sessions = data.sessions;
                state.maintenance = data.maintenance;
                showNotification("Base de données écrasée et restaurée.");
            }
            
            saveData();
            renderAll();
            
        } catch (err) {
            console.error("Error importing file", err);
            alert("Erreur lors de l'importation du fichier. Assurez-vous qu'il s'agit d'un fichier JSON valide issu de cet outil.");
        }
    };
    reader.readAsText(file);
}

// Clear Database completely
function clearDatabase() {
    if (confirm("ATTENTION : Cette action supprimera définitivement toutes vos données locales (armes, séances de tir et entretien).\nCette action est irréversible.\n\nVoulez-vous continuer ?")) {
        localStorage.removeItem('tireur_weapons');
        localStorage.removeItem('tireur_sessions');
        localStorage.removeItem('tireur_maintenance');
        state.weapons = [];
        state.sessions = [];
        state.maintenance = [];
        
        showNotification("Base de données réinitialisée.", "error");
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


