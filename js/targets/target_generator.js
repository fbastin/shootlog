/**
 * Tireur.org Target Generator Library
 * Generates vector PDF shooting targets (ISSF, MOA, etc.) using jsPDF.
 */

const I18N = {
    fr: {
        issf_50m: "50 m Carabine",
        issf_10m: "10 m Pistolet",
        issf_10m_rifle: "10 m Carabine",
        issf_25m_precision: "25 m Pistolet (précision)",
        issf_25m_rapid: "25 m Pistolet (tir rapide)",
        issf_50m_pistol: "50 m Pistolet",
        issf_300m: "300 m Carabine",
        biathlon_prone: "Biathlon 50 m — couché (mouche Ø 45 mm)",
        biathlon_standing: "Biathlon 50 m — debout (mouche Ø 115 mm)",
        ipsc: "IPSC Classic (reconstruction)",
        idpa: "IDPA (reconstruction)",
        ft_title: "Field Target — kill zone Ø",
        ft_note: "La kill zone est imprimée à sa taille réelle (échelle 100 %). La difficulté dépend de la distance de tir.",
        crop_note: "centre uniquement (échelle 100 %)",
        tile_hint: "Découpez sur les repères et assemblez",
        actual_size: "Taille réelle — 50 m",
        custom_dist: "Personnalisée…",
        checkers_title: "Damier - 1 MOA à",
        standard_title: "Cible standard (anneaux concentriques)",
        grouping_title: "Cible de groupement",
        cross_title: "Croix de réglage (grille 1 cm)",
        scale_verif: "VÉRIFICATION D'ÉCHELLE :",
        segment_len: "Ce segment doit mesurer exactement 5 cm",
        print_warn: "ATTENTION : IMPRIMEZ À TAILLE RÉELLE (100%)",
        no_fit: "Ne pas utiliser 'Ajuster à la page' dans les paramètres.",
        too_large: "La cible est trop grande pour {n} par page.\nChoisissez moins de cibles par page, une distance réduite ou une cible plus petite.",
        dist_moa: "Distance de tir (cible MOA) :",
        moa_note: "Chaque carreau représente 1 MOA à la distance choisie.",
        dist_reduced: "Distance de tir (cible réduite) :",
        reduced_note: "La cible est mise à l'échelle pour conserver la même difficulté angulaire qu'à la distance officielle."
    },
    en: {
        issf_50m: "50m Rifle",
        issf_10m: "10m Air Pistol",
        issf_10m_rifle: "10m Air Rifle",
        issf_25m_precision: "25m Pistol (precision)",
        issf_25m_rapid: "25m Pistol (rapid fire)",
        issf_50m_pistol: "50m Pistol",
        issf_300m: "300m Rifle",
        biathlon_prone: "Biathlon 50m — prone (Ø 45 mm)",
        biathlon_standing: "Biathlon 50m — standing (Ø 115 mm)",
        ipsc: "IPSC Classic (reconstruction)",
        idpa: "IDPA (reconstruction)",
        ft_title: "Field Target — kill zone Ø",
        ft_note: "The kill zone is printed at true size (100% scale). Difficulty comes from the shooting distance.",
        crop_note: "center only (100% scale)",
        tile_hint: "Cut on the marks and assemble",
        actual_size: "Actual Size — 50 m",
        custom_dist: "Custom…",
        checkers_title: "Checkers - 1 MOA at",
        standard_title: "Standard target (concentric rings)",
        grouping_title: "Grouping target",
        cross_title: "Optical sighting cross (1 cm grid)",
        scale_verif: "SCALE VERIFICATION:",
        segment_len: "This segment must measure exactly 5 cm",
        print_warn: "WARNING: PRINT AT ACTUAL SIZE (100%)",
        no_fit: "Do not use 'Fit to page' in print settings.",
        too_large: "The target is too large for {n} per page.\nChoose fewer targets per page, a reduced distance, or a smaller target.",
        dist_moa: "Shooting distance (MOA target):",
        moa_note: "Each square represents 1 MOA at the chosen distance.",
        dist_reduced: "Shooting distance (reduced target):",
        reduced_note: "The target is scaled to maintain the same angular difficulty as at the official distance."
    }
};

let currentLang = 'en';

function setTargetLanguage(lang) {
    if (I18N[lang]) {
        currentLang = lang;
        if (typeof document !== 'undefined') {
            updateDistanceVisibility(); // Refresh UI texts if we are in browser
        }
    }
}

function t(key) {
    return I18N[currentLang][key] || key;
}

// Official ISSF Diameters (mm), from zone 1 (outer) to zone 10 (center).
// dist = official distance (m) ; reducible = available for reduced shooting distances.
const ISSF = {
    issf_50m: {
        titleKey: "issf_50m",
        diams: [154.4, 138.4, 122.4, 106.4, 90.4, 74.4, 58.4, 42.4, 26.4, 10.4],
        black: 112.4, // black zone (zones 4 to 10)
        innerTen: 5.0,
        numFont: 9,
        dist: 50,
        reducible: true
    },
    issf_10m: {
        titleKey: "issf_10m",
        diams: [155.5, 139.5, 123.5, 107.5, 91.5, 75.5, 59.5, 43.5, 27.5, 11.5],
        black: 59.5, // black zone (zones 7 to 10)
        innerTen: 5.0,
        numFont: 9,
        dist: 10,
        reducible: false
    },
    issf_10m_rifle: {
        titleKey: "issf_10m_rifle",
        diams: [45.5, 40.5, 35.5, 30.5, 25.5, 20.5, 15.5, 10.5, 5.5, 0.5],
        black: 30.5,   // black zone (zones 4 to 9)
        innerTen: 0,   // no inner ten visible : zone 10 is already 0.5 mm
        numFont: 5,    // very small target (Ø 45.5 mm) : smaller font
        dist: 10,
        reducible: false
    },
    // ISSF 25 m Precision Pistol target (also Sport/Standard slow fire) : zones 1..10,
    // 50 mm steps, black zone = zones 7-10 (Ø 200 mm), inner ten Ø 25 mm. Outer Ø 500 mm.
    issf_25m_precision: {
        titleKey: "issf_25m_precision",
        diams: [500, 450, 400, 350, 300, 250, 200, 150, 100, 50],
        black: 200,
        innerTen: 25,
        numFont: 11,
        dist: 25,
        reducible: false,
        oversize: true
    },
    // ISSF 25 m Rapid Fire Pistol target : zones 5..10 only, 80 mm steps, fully black
    // (black zone = whole Ø 500 mm), inner ten Ø 50 mm. Numbers 5..9 are white on black.
    issf_25m_rapid: {
        titleKey: "issf_25m_rapid",
        diams: [500, 420, 340, 260, 180, 100],
        black: 500,
        innerTen: 50,
        numFont: 13,
        firstRingValue: 5,
        labelCount: 5,
        dist: 25,
        reducible: false,
        oversize: true
    },
    // ISSF 300 m Rifle target : zones 1..10, 100 mm steps, black zone = zones 5-10 (Ø 600 mm),
    // inner ten Ø 50 mm. Outer Ø 1000 mm. Same face geometry as the 50 m target, scaled x2.
    issf_300m: {
        titleKey: "issf_300m",
        diams: [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100],
        black: 600,
        innerTen: 50,
        numFont: 18,
        dist: 300,
        reducible: false,
        oversize: true
    },
    // ISSF 50 m Pistol target (Free Pistol) : identical face to the 25 m Precision target —
    // zones 1..10, 50 mm steps, black zone = zones 7-10 (Ø 200 mm), inner ten Ø 25 mm, outer Ø 500 mm.
    issf_50m_pistol: {
        titleKey: "issf_50m_pistol",
        diams: [500, 450, 400, 350, 300, 250, 200, 150, 100, 50],
        black: 200,
        innerTen: 25,
        numFont: 11,
        dist: 50,
        reducible: false,
        oversize: true
    }
};

// Paper sizes as [short side, long side] in mm. Orientation is applied by jsPDF.
const PAPER = {
    a4:      [210, 297],
    a3:      [297, 420],
    a2:      [420, 594],
    a1:      [594, 841],
    letter:  [215.9, 279.4],
    tabloid: [279.4, 431.8], // ANSI B / Ledger, 11 x 17 in
    ansid:   [558.8, 863.6]  // ANSI D, 22 x 34 in
};

// IBU biathlon targets (50 m) : black aiming disc Ø 115 mm ; knockdown hit zone Ø 45 mm
// (prone) or 115 mm (standing). aim = visible black mark, hit = scoring/knockdown circle.
const BIATHLON = {
    biathlon_prone:    { hit: 45,  aim: 115 },
    biathlon_standing: { hit: 115, aim: 115 }
};

// Reduced shooting distances for ISSF 50m (1 yard = 0.9144 m).
function getReduced50m() {
    return [
        { v: 50,    label: t("actual_size") },
        { v: 45.72, label: "50 yards (45.7 m)" },
        { v: 25,    label: "25 m" },
        { v: 22.86, label: "25 yards (22.9 m)" },
        { v: 18.29, label: "20 yards (18.3 m)" }
    ];
}

// Distances for MOA target (checkers) : absolute size of the square.
function getMoaDistances() {
    return [
        { v: 25,  label: "25 m" },
        { v: 50,  label: "50 m" },
        { v: 100, label: "100 m", sel: true },
        { v: 200, label: "200 m" },
        { v: 300, label: "300 m" }
    ];
}

// Zone numbers placed on the 4 axes, in the band of each zone.
// firstValue = score of the outermost band (default 1) ; count = how many bands to label.
function drawRingNumbers(doc, cx, cy, diams, blackDiam, fontSize, firstValue, count) {
    const start = firstValue || 1;
    const n = (count != null) ? count : 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize || 9);
    for (let k = 0; k < n; k++) {
        const value = start + k;
        const rMid = (diams[k] / 2 + diams[k + 1] / 2) / 2; // middle of the ring
        const onBlack = (2 * rMid) <= blackDiam;
        doc.setTextColor(onBlack ? 255 : 0, onBlack ? 255 : 0, onBlack ? 255 : 0);
        const s = String(value);
        const opt = { align: "center", baseline: "middle" };
        doc.text(s, cx - rMid, cy, opt);
        doc.text(s, cx + rMid, cy, opt);
        doc.text(s, cx, cy - rMid, opt);
        doc.text(s, cx, cy + rMid, opt);
    }
    doc.setTextColor(0, 0, 0);
}

// Outer diameter (mm) of an ISSF target at a given scale.
function issfOuterDiameter(spec, scale) {
    return spec.diams[0] * (scale || 1);
}

// Draws an ISSF target centered at (ox, oy).
function drawISSFAt(doc, ox, oy, spec, scale) {
    const s = scale || 1;
    const diams = spec.diams.map(d => d * s);
    const black = spec.black * s;
    const innerTen = spec.innerTen * s;
    const numFont = Math.max(4, Math.min(spec.numFont, spec.numFont * s));

    // Black aiming zone
    doc.setFillColor(0, 0, 0);
    doc.circle(ox, oy, black / 2, 'F');

    // Rings : white on black, black on white
    doc.setLineWidth(0.2);
    for (let i = 0; i < diams.length; i++) {
        if (diams[i] <= black) doc.setDrawColor(255, 255, 255);
        else doc.setDrawColor(0, 0, 0);
        doc.circle(ox, oy, diams[i] / 2, 'S');
    }

    // Inner ten (fine circle, in the black) — center remains black, ISSF compliant
    if (innerTen > 0) {
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.15);
        doc.circle(ox, oy, innerTen / 2, 'S');
    }

    drawRingNumbers(doc, ox, oy, diams, black, numFont, spec.firstRingValue, spec.labelCount);
}

// Draws a checkers target (1 MOA) centered at (ox, oy) for a given distance (m).
function drawCheckersAt(doc, ox, oy, distance) {
    const size = distance * 0.2908882; // 1 MOA ≈ 0.2908882 mm/m

    doc.setFillColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.rect(ox - size, oy - size, size, size, 'F'); // top left
    doc.rect(ox, oy - size, size, size, 'S');         // top right
    doc.rect(ox - size, oy, size, size, 'S');         // bottom left
    doc.rect(ox, oy, size, size, 'F');                // bottom right

    doc.setFillColor(255, 0, 0);
    doc.circle(ox, oy, 1.5, 'F');
}

// Generic recreational scoring target : Ø 180 mm, nine concentric rings (20 mm steps), black
// bull over the inner zones (numbers turn white there), and a red central aiming dot. Not an
// official face — fits A4 and works with the multi-target layout. Centered at (ox, oy).
function drawStandardAt(doc, ox, oy) {
    const diams = [180, 160, 140, 120, 100, 80, 60, 40, 20];
    const black = 80; // inner zones drawn black for contrast

    doc.setFillColor(0, 0, 0);
    doc.circle(ox, oy, black / 2, 'F');

    doc.setLineWidth(0.2);
    for (let i = 0; i < diams.length; i++) {
        if (diams[i] <= black) doc.setDrawColor(255, 255, 255);
        else doc.setDrawColor(0, 0, 0);
        doc.circle(ox, oy, diams[i] / 2, 'S');
    }

    drawRingNumbers(doc, ox, oy, diams, black, 9);

    doc.setFillColor(255, 0, 0);
    doc.circle(ox, oy, 1.2, 'F');
}

// Grouping practice mark : two thin red aiming circles with a black crosshair and a small red
// center, ~70 mm overall. Use several per page (4/6/9) to shoot distinct groups on one sheet.
function drawGroupingAt(doc, ox, oy) {
    const r = 30;
    doc.setDrawColor(200, 0, 0);
    doc.setLineWidth(0.6);
    doc.circle(ox, oy, r, 'S');
    doc.circle(ox, oy, r * 0.6, 'S');

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(ox - r - 5, oy, ox + r + 5, oy);
    doc.line(ox, oy - r - 5, ox, oy + r + 5);

    doc.setFillColor(255, 0, 0);
    doc.circle(ox, oy, 1.5, 'F');
}

// Field Target practice face : light faceplate disc with a central black kill zone drawn at
// true size, plus a red aiming dot. killZone = kill-zone diameter in mm.
function drawFieldTargetAt(doc, ox, oy, killZone) {
    const faceR = (killZone + 30) / 2; // 15 mm painted ring around the kill zone

    // Faceplate : light gray disc with a thin outline
    doc.setFillColor(240, 240, 240);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.circle(ox, oy, faceR, 'FD');

    // Kill zone : solid black circle at true size
    doc.setFillColor(0, 0, 0);
    doc.circle(ox, oy, killZone / 2, 'F');

    // Central aiming dot
    doc.setFillColor(255, 0, 0);
    doc.circle(ox, oy, 0.8, 'F');
}

// IBU biathlon practice face : black aiming disc with the knockdown hit zone marked by a
// white ring (prone) and a central aiming dot. cfg = { hit, aim } diameters in mm.
function drawBiathlonAt(doc, ox, oy, cfg) {
    // Black aiming disc (Ø 115 mm)
    doc.setFillColor(0, 0, 0);
    doc.circle(ox, oy, cfg.aim / 2, 'F');

    // Hit zone marked by a white ring when smaller than the aiming mark (prone)
    if (cfg.hit < cfg.aim) {
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.4);
        doc.circle(ox, oy, cfg.hit / 2, 'S');
    }

    // Central white aiming dot
    doc.setFillColor(255, 255, 255);
    doc.circle(ox, oy, 0.8, 'F');
}

// Draws a closed polygon from absolute mm points, scaled by s around center (cx, cy).
// pts = array of [x, y] in mm relative to the silhouette center. style = 'S' | 'F' | 'FD'.
function drawPolyAt(doc, cx, cy, s, pts, style) {
    const P = pts.map(p => [cx + p[0] * s, cy + p[1] * s]);
    const rel = P.slice(1).map((p, i) => [p[0] - P[i][0], p[1] - P[i][1]]);
    doc.lines(rel, P[0][0], P[0][1], [1, 1], style, true);
}

// Practical-shooting silhouette targets, reconstructed from published overall dimensions and
// scoring-zone sizes (outline is a faithful reconstruction, not the exact official vector).
// Each entry : w/h = full-scale bounding box (mm) ; draw(doc, cx, cy, s) renders at scale s.
const SILHOUETTE = {
    // IPSC Classic ("Metric") cardboard target : ~450 x 590 mm. Zones A (center + head), C, D.
    ipsc: {
        titleKey: "ipsc",
        w: 450, h: 590,
        draw: function (doc, cx, cy, s) {
            // Outline (D boundary), symmetric, y down, center at origin.
            const outline = [
                [-75, -295], [75, -295], [75, -145], [225, -75], [225, 175],
                [150, 295], [-150, 295], [-225, 175], [-225, -75], [-75, -145]
            ];
            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 0, 0);
            drawPolyAt(doc, cx, cy, s, outline, 'S');

            // C/D boundary : an inner silhouette enclosing the C zone (upper torso + head).
            const cZone = [
                [-55, -270], [55, -270], [55, -160], [170, -55], [170, 150],
                [-170, 150], [-170, -55], [-55, -160]
            ];
            doc.setLineWidth(0.4);
            drawPolyAt(doc, cx, cy, s, cZone, 'S');

            // A zone : body rectangle + head rectangle.
            doc.rect(cx - 75 * s, cy - 60 * s, 150 * s, 210 * s, 'S'); // body A
            doc.rect(cx - 45 * s, cy - 255 * s, 90 * s, 95 * s, 'S');  // head A

            // Zone labels.
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(Math.max(5, 14 * s));
            const opt = { align: "center", baseline: "middle" };
            doc.text("A", cx, cy + 45 * s, opt);
            doc.text("C", cx - 130 * s, cy + 60 * s, opt);
            doc.text("D", cx - 190 * s, cy + 60 * s, opt);
        }
    },
    // IDPA cardboard target : ~457 x 762 mm (18 x 30 in). -0 body 8" circle, -0 head 4" circle,
    // -1 zone around the chest, -3 the remainder. Head is a 6" zone.
    idpa: {
        titleKey: "idpa",
        w: 457, h: 762,
        draw: function (doc, cx, cy, s) {
            // Outline : head (6") + rounded shoulders + body, y down, center at origin.
            const outline = [
                [-60, -381], [-76, -365], [-76, -229], [-228, -150], [-228, 381],
                [228, 381], [228, -150], [76, -229], [76, -365], [60, -381]
            ];
            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 0, 0);
            drawPolyAt(doc, cx, cy, s, outline, 'S');

            // -1 body boundary : rounded rectangle around the chest -0 circle.
            const m = 25.4;
            const one = [
                [-130, -210], [130, -210], [130, 40], [-130, 40]
            ];
            doc.setLineWidth(0.4);
            drawPolyAt(doc, cx, cy, s, one, 'S');

            // -0 body circle (8 in) and -0 head circle (4 in).
            doc.setLineWidth(0.4);
            doc.circle(cx, cy - 80 * s, (8 * m / 2) * s, 'S');   // chest -0
            doc.circle(cx, cy - 305 * s, (4 * m / 2) * s, 'S');  // head -0

            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(Math.max(5, 13 * s));
            const opt = { align: "center", baseline: "middle" };
            doc.text("-0", cx, cy - 80 * s, opt);
            doc.text("-0", cx, cy - 305 * s, opt);
            doc.text("-1", cx, cy - 175 * s, opt);
            doc.text("-3", cx, cy + 250 * s, opt);
        }
    }
};

// Optical sighting cross : fills the whole page (1 per sheet).
function drawCrossFull(doc, width, height) {
    const cx = width / 2, cy = height / 2;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(t('cross_title'), 10, height - 10);

    // Add tireur.org watermark in italic at the bottom right
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("tireur.org", width - 10, height - 10, { align: "right" });

    // Centered 1 cm grid (light gray), drawn first
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    const top = 40, bottom = height - 20, left = 10, right = width - 10;
    for (let x = cx; x <= right; x += 10) doc.line(x, top, x, bottom);
    for (let x = cx - 10; x >= left; x -= 10) doc.line(x, top, x, bottom);
    for (let y = cy; y <= bottom; y += 10) doc.line(left, y, right, y);
    for (let y = cy - 10; y >= top; y -= 10) doc.line(left, y, right, y);

    // Fine precision cross (100 mm) over it
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(cx - 50, cy, cx + 50, cy);
    doc.line(cx, cy - 50, cx, cy + 50);

    // Central aiming point
    doc.setFillColor(255, 0, 0);
    doc.circle(cx, cy, 1.5, 'F');
}

// Calibration rule + printing warning (once per page).
function drawPageHeader(doc, width) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(t("scale_verif"), 10, 10);
    doc.text(t("segment_len"), 10, 14);

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 16, 60, 16); // main line
    for (let i = 0; i <= 5; i++) {
        const x = 10 + i * 10;
        doc.line(x, 14, x, 18); // tick every cm
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(t("print_warn"), width - 10, 10, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(t("no_fit"), width - 10, 14, { align: "right" });
}

// 5 cm calibration ruler drawn inside an opaque white box (legible over a black target).
function drawScaleRulerBox(doc, x, y) {
    doc.setFillColor(255, 255, 255);
    doc.rect(x - 2, y - 6, 66, 16, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(t("segment_len"), x, y - 1);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(x, y + 5, x + 50, y + 5); // main line
    for (let i = 0; i <= 5; i++) {
        const xx = x + i * 10;
        doc.line(xx, y + 3, xx, y + 7); // tick every cm
    }
}

// Corner trim marks + sheet index for a tiled (multi-sheet) page.
function drawTileMarks(doc, width, height, margin, r, c, rows, cols) {
    const x0 = margin, y0 = margin, x1 = width - margin, y1 = height - margin;
    const L = 7;
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.line(x0, y0, x0 + L, y0); doc.line(x0, y0, x0, y0 + L);       // top-left
    doc.line(x1 - L, y0, x1, y0); doc.line(x1, y0, x1, y0 + L);       // top-right
    doc.line(x0, y1 - L, x0, y1); doc.line(x0, y1, x0 + L, y1);       // bottom-left
    doc.line(x1 - L, y1, x1, y1); doc.line(x1, y1 - L, x1, y1);       // bottom-right

    const label = `L${r + 1}/${rows} · C${c + 1}/${cols}`;
    doc.setFillColor(255, 255, 255);
    doc.rect(x0, y0, 30, 7, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label, x0 + 2, y0 + 5);
}

// Draws an oversize target that does not fit on the chosen sheet, either as a multi-sheet
// mosaic at true scale ('tile') or keeping only the central portion ('crop'). extentW/extentH
// are the target's bounding box (mm). drawOne(ox, oy) renders the full target; anything outside
// the page is clipped by the viewer.
function drawISSFOversize(doc, drawOne, extentW, extentH, page, mode, pageTitle, fileType) {
    const { width, height, fmt, orientation } = page;

    if (mode === 'crop') {
        drawOne(width / 2, height / 2);
        const note = (pageTitle ? pageTitle + " — " : "") + t("crop_note");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setFillColor(255, 255, 255);
        doc.rect(8, height - 16, Math.min(width - 16, doc.getTextWidth(note) + 6), 8, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(note, 10, height - 10);
        drawScaleRulerBox(doc, 10, 22);
        doc.save(`Target_${fileType}_crop.pdf`);
        return;
    }

    // Tiling : abutting pages with an 8 mm trim margin, target centered over the whole mosaic.
    const margin = 8;
    const usableW = width - 2 * margin;
    const usableH = height - 2 * margin;
    const cols = Math.ceil(extentW / usableW);
    const rows = Math.ceil(extentH / usableH);
    const totalW = cols * usableW;
    const totalH = rows * usableH;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!(r === 0 && c === 0)) doc.addPage(fmt.slice(), orientation);
            const ox = margin + totalW / 2 - c * usableW;
            const oy = margin + totalH / 2 - r * usableH;
            drawOne(ox, oy);
            drawTileMarks(doc, width, height, margin, r, c, rows, cols);
            if (r === 0 && c === 0) {
                drawScaleRulerBox(doc, 10, 22);
                if (pageTitle) {
                    const hint = pageTitle + " — " + t("tile_hint");
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.setFillColor(255, 255, 255);
                    doc.rect(8, height - 16, Math.min(width - 16, doc.getTextWidth(hint) + 6), 8, 'F');
                    doc.setTextColor(0, 0, 0);
                    doc.text(hint, 10, height - 10);
                }
            }
        }
    }
    doc.save(`Target_${fileType}_tiles.pdf`);
}

// Available layouts : number of targets -> [columns, rows].
const LAYOUTS = { 1: [1, 1], 2: [1, 2], 4: [2, 2], 6: [2, 3], 9: [3, 3], 12: [3, 4] };

function generateTarget() {
    const { jsPDF } = window.jspdf;

    const targetType = document.getElementById('targetType').value;
    const paperFormat = document.getElementById('paperFormat').value;
    const paperOrientation = document.getElementById('paperOrientation').value === 'landscape' ? 'landscape' : 'portrait';
    const perPage = parseInt(document.getElementById('layout').value, 10) || 1;
    const oversizeMode = (document.getElementById('oversizeMode') || {}).value || 'tile';

    const fmt = (PAPER[paperFormat] || PAPER.a4).slice();
    const doc = new jsPDF({
        orientation: paperOrientation,
        unit: 'mm',
        format: fmt.slice(),
        putOnlyUsedFonts: true
    });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const page = { width, height, fmt, orientation: paperOrientation };

    // Cross always fills the page : 1 per sheet.
    if (targetType === 'cross') {
        drawPageHeader(doc, width);
        drawCrossFull(doc, width, height);
        doc.save(`Target_${targetType}.pdf`);
        return;
    }

    // Prepares the target drawing function and its bounding box (extentW x extentH, mm).
    let extentW, extentH, drawOne, pageTitle = "";
    if (ISSF[targetType]) {
        const spec = ISSF[targetType];
        let scale = 1;
        if (spec.reducible) {
            const d = getSelectedDistanceMeters() || spec.dist;
            scale = d / spec.dist;
        }
        pageTitle = t(spec.titleKey);
        if (scale !== 1) pageTitle += ` — ${Math.round(scale * 100)}% (tir à ${fmtMeters(spec.dist * scale)} m)`;

        extentW = extentH = issfOuterDiameter(spec, scale);
        drawOne = (ox, oy) => drawISSFAt(doc, ox, oy, spec, scale);
    } else if (BIATHLON[targetType]) {
        const cfg = BIATHLON[targetType];
        pageTitle = t(targetType);
        extentW = extentH = cfg.aim;
        drawOne = (ox, oy) => drawBiathlonAt(doc, ox, oy, cfg);
    } else if (SILHOUETTE[targetType]) {
        const sil = SILHOUETTE[targetType];
        const sc = getSelectedScale();
        pageTitle = t(sil.titleKey);
        if (sc !== 1) pageTitle += ` — 1:${Math.round(1 / sc)}`;
        extentW = sil.w * sc;
        extentH = sil.h * sc;
        drawOne = (ox, oy) => sil.draw(doc, ox, oy, sc);
    } else if (targetType === 'field_target') {
        const kz = getSelectedKillZone();
        pageTitle = `${t('ft_title')} ${fmtMeters(kz)} mm`;
        extentW = extentH = kz + 30; // faceplate diameter
        drawOne = (ox, oy) => drawFieldTargetAt(doc, ox, oy, kz);
    } else if (targetType === 'standard_rings') {
        pageTitle = t('standard_title');
        extentW = extentH = 180;
        drawOne = (ox, oy) => drawStandardAt(doc, ox, oy);
    } else if (targetType === 'grouping') {
        pageTitle = t('grouping_title');
        extentW = extentH = 70;
        drawOne = (ox, oy) => drawGroupingAt(doc, ox, oy);
    } else { // checkers
        const distance = getSelectedDistanceMeters() || 100;
        const size = distance * 0.2908882;
        const sizeLabel = currentLang === 'fr' ? size.toFixed(1).replace('.', ',') : size.toFixed(1);
        pageTitle = `${t('checkers_title')} ${fmtMeters(distance)} m (${sizeLabel} mm)`;

        extentW = extentH = 2 * distance * 0.2908882;
        drawOne = (ox, oy) => drawCheckersAt(doc, ox, oy, distance);
    }

    let [cols, rows] = LAYOUTS[perPage] || [1, 1];
    
    // In landscape mode, we should swap rows and columns to maintain a better aspect ratio
    // for multiple targets per page (e.g. 2 targets should be 2 cols x 1 row, not 1 col x 2 rows).
    if (paperOrientation === 'landscape' && perPage > 1 && cols !== rows) {
        const temp = cols;
        cols = rows;
        rows = temp;
    }

    // Define a "safe zone" to avoid overlapping with header (y < 25) and footer (y > height - 15)
    const minX = 10;
    const maxX = width - 10;
    const minY = 30; // Clear header rule
    const maxY = height - 20; // Clear footer text

    const safeW = maxX - minX;
    const safeH = maxY - minY;

    const cellW = safeW / cols;
    const cellH = safeH / rows;

    if (extentW + 2 > cellW || extentH + 2 > cellH) {
        // Target too big for the sheet. Oversize-capable targets (e.g. 25/50/300 m, IPSC/IDPA at
        // full scale) can still be produced at true scale across several sheets, or center-cropped.
        const oversizable = (ISSF[targetType] && ISSF[targetType].oversize) || SILHOUETTE[targetType];
        if (perPage === 1 && oversizable) {
            drawISSFOversize(doc, drawOne, extentW, extentH, page, oversizeMode, pageTitle, targetType);
            return;
        }
        alert(t("too_large").replace('{n}', perPage));
        return;
    }

    drawPageHeader(doc, width);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            drawOne(minX + cellW * (c + 0.5), minY + cellH * (r + 0.5));
        }
    }

    // Write title once at the bottom left
    if (pageTitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(pageTitle, 10, height - 10);
    }

    // Add tireur.org watermark in italic at the bottom right
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("tireur.org", width - 10, height - 10, { align: "right" });

    doc.save(`Target_${targetType}.pdf`);
}

// Formats a distance in meters (French decimal separator, without unnecessary zero).
function fmtMeters(m) {
    let s = (Math.round(m * 10) / 10).toString();
    if (currentLang === 'fr') {
        s = s.replace('.', ',');
    }
    return s;
}

// Selected shooting distance, converted to meters (handles custom option).
function getSelectedDistanceMeters() {
    const sel = document.getElementById('distance');
    if (!sel) return 50;
    if (sel.value === 'custom') {
        const v = parseFloat(document.getElementById('customDistance').value) || 0;
        const factor = parseFloat(document.getElementById('customUnit').value) || 1;
        return v * factor;
    }
    return parseFloat(sel.value) || 0;
}

// Selected Field Target kill-zone diameter, in mm (handles the custom option).
function getSelectedKillZone() {
    const sel = document.getElementById('killZone');
    if (!sel) return 40;
    if (sel.value === 'custom') {
        return parseFloat(document.getElementById('killZoneCustom').value) || 40;
    }
    return parseFloat(sel.value) || 40;
}

// Selected print scale for silhouette targets (1 = full size ; handles the custom % option).
function getSelectedScale() {
    const sel = document.getElementById('silhouetteScale');
    if (!sel) return 1;
    if (sel.value === 'custom') {
        const v = parseFloat(document.getElementById('silhouetteScaleCustom').value) || 100;
        return Math.max(0.05, v / 100);
    }
    return parseFloat(sel.value) || 1;
}

// Displays the custom scale field when the corresponding option is chosen.
function updateSilhouetteScaleCustom() {
    const sel = document.getElementById('silhouetteScale');
    const inp = document.getElementById('silhouetteScaleCustom');
    if (sel && inp) inp.style.display = (sel.value === 'custom') ? 'block' : 'none';
}

// Displays the custom kill-zone field when the corresponding option is chosen.
function updateKillZoneCustom() {
    const sel = document.getElementById('killZone');
    const inp = document.getElementById('killZoneCustom');
    if (sel && inp) inp.style.display = (sel.value === 'custom') ? 'block' : 'none';
}

// Displays the custom distance field when the corresponding option is chosen.
function updateCustomVisibility() {
    const sel = document.getElementById('distance');
    const customGroup = document.getElementById('customGroup');
    if (sel && customGroup) {
        customGroup.style.display = (sel.value === 'custom') ? 'flex' : 'none';
    }
}

// Displays and populates the distance selector according to the target type.
function updateDistanceVisibility() {
    const typeElem = document.getElementById('targetType');
    if (!typeElem) return;
    const type = typeElem.value;
    const group = document.getElementById('distanceGroup');
    const sel = document.getElementById('distance');
    const label = document.getElementById('distanceLabel');
    const note = document.getElementById('distanceNote');
    const layoutGroup = document.getElementById('layoutGroup');
    const oversizeGroup = document.getElementById('oversizeGroup');

    // The cross always fills the page : no multiple layout.
    if (layoutGroup) {
        layoutGroup.style.display = (type === 'cross') ? 'none' : 'block';
    }

    // Oversize options matter for big targets that may exceed the sheet (25/50/300 m, silhouettes).
    if (oversizeGroup) {
        const oversizable = (ISSF[type] && ISSF[type].oversize) || SILHOUETTE[type];
        oversizeGroup.style.display = oversizable ? 'block' : 'none';
    }

    // Scale selector only for silhouette targets (IPSC/IDPA).
    const scaleGroup = document.getElementById('silhouetteScaleGroup');
    if (scaleGroup) {
        scaleGroup.style.display = SILHOUETTE[type] ? 'block' : 'none';
        if (SILHOUETTE[type]) updateSilhouetteScaleCustom();
    }

    // Kill-zone selector only for Field Target.
    const killZoneGroup = document.getElementById('killZoneGroup');
    if (killZoneGroup) {
        killZoneGroup.style.display = (type === 'field_target') ? 'block' : 'none';
        if (type === 'field_target') updateKillZoneCustom();
    }

    let opts = null, labelText = '', noteText = '';
    if (type === 'checkers') {
        opts = getMoaDistances();
        labelText = t("dist_moa");
        noteText = t("moa_note");
    } else if (ISSF[type] && ISSF[type].reducible) {
        opts = getReduced50m();
        labelText = t("dist_reduced");
        noteText = t("reduced_note");
    } else {
        if (group) group.style.display = 'none';
        return;
    }

    if (sel) {
        let html = opts.map(o => `<option value="${o.v}"${o.sel ? ' selected' : ''}>${o.label}</option>`).join('');
        html += `<option value="custom">${t("custom_dist")}</option>`;
        sel.innerHTML = html;
    }
    if (label) label.textContent = labelText;
    if (note) note.textContent = noteText;
    if (group) group.style.display = 'block';
    updateCustomVisibility();
}

// Initialize when the DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        updateDistanceVisibility();
    });
}

// Export functions and constants for potential use in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        I18N,
        setTargetLanguage,
        ISSF,
        PAPER,
        drawISSFOversize,
        getReduced50m,
        getMoaDistances,
        drawRingNumbers,
        issfOuterDiameter,
        drawISSFAt,
        drawCheckersAt,
        drawStandardAt,
        drawGroupingAt,
        drawFieldTargetAt,
        drawBiathlonAt,
        BIATHLON,
        SILHOUETTE,
        drawPolyAt,
        getSelectedScale,
        getSelectedKillZone,
        drawCrossFull,
        drawPageHeader,
        generateTarget,
        fmtMeters
    };
}
