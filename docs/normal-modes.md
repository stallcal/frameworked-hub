# Molecular Normal Mode Explorer

## Implementation

- Standalone: /tools/normal-modes/
- Shared widget: layouts/partials/normal-mode-widget.html
- Assets: assets/normal-modes/{modes.js,app.js,style.css}
- Hugo article shortcode: {{< normal-mode molecule="co2" mode="co2-asym" >}}
- Published article may embed several instances; each widget maintains independent local state.

## Scientific model

Ammonia equilibrium model uses gas-phase N–H = 1.012 Å and H–N–H = 106.7° (see NIST JANAF), with 120° azimuthal separation among the three H atoms around the C3 axis. Screen-space angles vary with the 3D camera perspective.

Initial library: CO2 (4), H2O (3), NH3 (6), CH4 (9) = 22 vibrational coordinates. Degenerate partners are individually selectable. These are *schematic, symmetry-adapted displacements*, constructed from approximate molecular geometry and trial stretching/bending deformations. Each is mass-orthogonalized against translational and rotational motions and earlier vibrational basis vectors. They are not verified numerical Hessian eigenvectors; for a rigorous quantitative visualization, substitute mass-weighted eigenvectors from a specified calculation / measured normal-coordinate analysis.

Approximate gas-phase fundamentals displayed in cm^-1; no frequency is calculated from animation speed. Mode symmetry activity is based on point-group first-order electric-dipole / polarizability selection rules, not an empirical peak-detection classifier.

### Reference checks

- CO2: 3(3)-5=4; Sigma_g^+ IR forbidden Raman allowed; Sigma_u^+ and two Pi_u bends IR allowed Raman forbidden.
- H2O: 3(3)-6=3; all three fundamentals IR and Raman active.
- NH3: 3(4)-6=6; 2 A1 + 2 E (E doublets); all fundamentals IR and Raman allowed.
- CH4: 3(5)-6=9; A1(1)+E(2)+2F2(3+3). A1 and E IR inactive Raman active; F2 IR and Raman active.
- Every produced vector is projected free of rigid translation/rotation. This is necessary but *not sufficient* to establish a physical normal-mode eigenvector.

Sources:
- https://srd.nist.gov/JPCRD/jpcrd146.pdf
- https://web.mit.edu/course/6/6.734j/www/group-full.pdf
- https://lweb.cfa.harvard.edu/hitran/vibrational.html
- https://www.physchem.no/physchem_book/chapters-13-vibrational-spectroscopy.html

### Browser acceptance

1. Load standalone page; choose all four molecules and every mode, including degenerate components.
2. Play/pause, amplitude/speed, equilibrium overlay, displacement arrows, two visualization styles and combined view all operate independently.
3. Drag to rotate on desktop and mobile. Verify page scroll works when gestures are outside the model.
4. Confirm IR/Raman labels, mode counting and units.
5. Check an inline article shortcode instance and independent multiple instances.
6. Verify reduced-motion preference starts paused and tab/document offscreen drawing stops.
7. Validate rendered Hugo build and responsive layout before merging.

**Status:** implementation requires deployment preview and real-device visual QA before production. Scientific numerical eigenvectors are not included.
