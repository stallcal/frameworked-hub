---
title: "Why carbon dioxide absorbs infrared radiation"
description: "Follow CO₂'s stretching and bending vibrations to see how molecular symmetry determines its infrared and Raman activity."
format: "INTERACTIVE EXPLAINER"
draft: true
example: true
level: "Undergraduate chemistry"
objectives:
  - "Count the vibrational normal modes of a linear triatomic molecule."
  - "Distinguish symmetric and asymmetric stretching motions."
  - "Explain the IR/Raman mutual exclusion rule for centrosymmetric molecules."
---

## Four ways to vibrate, three distinct frequencies

Carbon dioxide has three atoms. Its atoms can move along three Cartesian axes, so the entire molecule has nine degrees of freedom. Three correspond to translation and two to rotation, leaving four **vibrational normal coordinates**:

\[
3N-5=3(3)-5=4
\]

There is one symmetric stretch, one asymmetric stretch, and two mutually perpendicular bending motions. The bending pair has the same frequency for an isolated, linear CO₂ molecule.

## Watch a vibration that absorbs IR

The asymmetric stretch alternately increases one C–O bond length and decreases the other. This motion changes the dipole moment along the molecular axis, allowing infrared absorption.

{{< normal-mode molecule="co2" mode="co2-asym" >}}

Switch to the symmetric stretch. Both bonds now expand and contract together; CO₂ retains its inversion symmetry and its dipole remains zero during this vibration. The symmetric stretch is therefore IR inactive but Raman active in ordinary fundamental spectroscopy.

## Why are there two bending coordinates?

Try the in-plane and perpendicular CO₂ bends separately. They belong to the same doubly degenerate Πᵤ family: two independent atomic displacement coordinates, but one fundamental frequency under ideal molecular symmetry.

{{< normal-mode molecule="co2" mode="co2-bend-z" >}}

The animations are deliberately slowed and exaggerated. They illustrate symmetry-adapted motion, not measured atom trajectories or computed numerical Hessian eigenvectors.

## Going further

The nominal symmetric stretching frequency near 1333 cm⁻¹ interacts with the bending overtone through Fermi resonance. Consequently, gas-phase Raman measurements show a characteristic pair of bands near 1285 and 1388 cm⁻¹ rather than one uncomplicated peak at 1333 cm⁻¹ ([NIST Chemistry WebBook](https://webbook.nist.gov/cgi/cbook.cgi?ID=B4000020&Mask=800)).

This article is a **draft demonstrating reusable interactive embeds**. The complete molecular library is available in the [Normal Mode Explorer](/tools/normal-modes/).
