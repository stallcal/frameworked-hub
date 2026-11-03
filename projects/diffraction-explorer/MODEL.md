# Scientific model

Bragg's law is nλ = 2d sin θ. The diffraction angle displayed is 2θ, in degrees.
Wavelength and plane spacing are in Å; q = 4π sin θ / λ = 2πn/d is in Å⁻¹.
When order > 1, d still denotes the selected plane spacing, not d/n. The angle and q
input modes invert these same relations. Positive finite inputs and positive integer
order are required. Combinations beyond backscattering are rejected (with a 1e-12
floating-point tolerance on sin θ at the boundary).

The plane/ray drawing is schematic. Ray directions reflect the calculated angle;
plane spacing is rescaled to fit the display and is not an atomistic model.
No structure factors, intensities, systematic absences, crystallographic phase identification,
refraction, instrumental resolution, or measurement uncertainty are predicted.

Cu Kα1 (1.5406 Å) and Mo Kα1 (0.7093 Å) are rounded presets, not an assertion about
instrument optics. Higher orders are commonly represented using different Miller indices
with n=1. Display precision is not experimental certainty.

Reference: https://dictionary.iucr.org/Bragg%27s_law
Tests cover an analytic 60° example, limiting backscattering, inversion of all input modes,
orders/wavelengths, monotonicity, and invalid inputs. This is mathematical verification of
the implemented model, not calibration of an instrument.
