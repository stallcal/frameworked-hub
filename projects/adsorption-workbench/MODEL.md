# Scientific model

Canonical uptake is mmol per gram of dry adsorbent, numerically equal to mol/kg.
For molar mass M in g/mol, multiply canonical uptake by M to obtain mg/g, or M/1000
to obtain g/g. The latter is adsorbate mass / adsorbent mass, not loaded-sample mass fraction.

For reference gas volume, use the ideal-gas molar volume RT/P with
R = 8.31446261815324 kPa L mol−1 K−1. Multiplying mmol/g by RT/P gives cm³ gas/g.
The default convention is 273.15 K and 101.325 kPa. The second preset is 273.15 K and
100 kPa. All pressures entering this equation must be absolute. These reporting conditions
are separate from experimental adsorption conditions. Z=1 is assumed; no phase-stability
claim is made about a hypothetical reporting gas volume.

Excess/absolute/unspecified basis is preserved in the calculation record; there is no conversion
between them. Dry/wet mass normalization, mixtures, real-gas effects, isotherm fitting, and
measurement-uncertainty propagation are out of scope. Molar masses are rounded presets;
users can enter the appropriate value. Display uses seven significant digits, not uncertainty bounds.

Pressure conversion uses Pa as the canonical unit: kPa=1000 Pa, MPa=1e6 Pa, bar=100000 Pa,
atm=101325 Pa, Torr=101325/760 Pa. Torr is not silently relabeled mmHg. Gauge pressure
remains gauge pressure after a unit conversion; no ambient-pressure offset is supplied.

References:
- https://goldbook.iupac.org/terms/view/S05921
- https://physics.nist.gov/cgi-bin/cuu/Value?r

Tests cover analytic conversions, the two reference conventions, all unit-pair round trips,
basis preservation, pressure identities, zero uptake, and invalid inputs. Research users
must still check their source dataset's definitions before comparing results.
