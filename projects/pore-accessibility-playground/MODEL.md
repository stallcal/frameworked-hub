# Scientific model

Domain: [0,120] × [0,80] in arbitrary model units. Left/right boundaries are open;
top/bottom are solid. Obstacles are fixed closed rectangles. A probe is a rigid disk.
No periodic boundary conditions are applied. Contact with an obstacle is treated as excluded.

At a point, clearance is the minimum distance to all rectangles and to the two solid boundaries.
The grid admits a cell only if clearance at its center is greater than probe radius plus half
the cell diagonal. Since distance is 1-Lipschitz, this conservative test ensures the whole cell
has sufficient clearance. Four-neighbor flood fill starts at admitted cells in the leftmost column.
This prevents corner-cutting routes through obstacle boundaries. A valid left-to-right route
is demonstrated when the fill reaches the rightmost column. Its absence can reflect conservative
discretization, so the interface says 'Not resolved' and provides resolution control.

Mask: 0 excluded/unresolved, 1 fitting but not inlet-connected, 2 inlet-connected.
Areas = number of admitted cells × cell area, reported as a percentage of the entire model area.
These are conservative grid estimates of probe-center area. They are NOT experimental void
fraction, pore volume, surface area, adsorption capacity, or transport coefficients.

There are no atomistic structures, adsorbate interactions, flexible molecules/frameworks,
thermal motion, diffusion rates, or named-material claims. All presets are original toy geometries.
The inspected center can fit geometrically while its cell fails the conservative margin;
the interface explicitly distinguishes those cases. The green probe is an inspected position,
not a simulated trajectory or a molecule that has traveled into an isolated pocket.

Tests cover free space, a blocking wall, closed pockets, increasing-probe monotonicity,
resolution-dependent narrow passages, the clearance guarantee, and numerical/allocation limits.
No external topology or CIF data are used.
