# Shootlog - Digital Shooting Logbook

This repository contains the source code for the **Digital Shooting Logbook** (Carnet de Tir Numérique) from [tireur.org](https://www.tireur.org/carnet-de-tir.php).

It is designed as a client-side, offline-first web application enabling sport shooters to log, analyze, and keep track of their firearms, shooting sessions, and maintenance activities.

## Features
- **Bilingual Interface:** Fully supports French and English language switching, synchronizing seamlessly with the main site's language configuration.
- **Firearm Management:** Track round counts (active tracking) and specifications (barrel length, twist rate, zero distance, optics, and notes) for each firearm.
- **Interactive Shot Plotter:** Point-and-click to place impacts on digital targets to automatically calculate group sizing (Extreme Spread in mm, MOA, MRAD) and Mean Point of Impact (MPI).
- **Target Customization:** High-quality vector SVG targets generated client-side for various official disciplines (ISSF, Biathlon, silhouettes, grids, MOA/inch scales, standard leisure targets).
- **100% Offline & Local:** No server connectivity required. All data is kept securely on your device inside browser LocalStorage.
- **Data Portability:** Easily export and import your entire database as a standard JSON backup file (supporting merging or overwriting existing data).
- **Printable Session Sheets:** Generate professional print layouts for blank shooting sheets (Generic, ISSF Match, or Long Range TLD formats) or pre-filled session logs.

## Setup & Integration
To run the logbook on a web server:
1. Ensure the core HTML template or PHP wrapper loads the main styling `/css/carnet.css`.
2. Include the target generator script `/js/targets/target_generator.js` and the logbook logic `/js/carnet.js`.
3. Provide the caliber completion database under `/calibers/calibers.json` or as a globally defined `CALIBERS_DB` array.

## License
Distributed under the MIT License. See `LICENSE` for more information.
