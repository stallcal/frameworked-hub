# Future topology library: proposed structure

This is a design note, not a populated topology database or an available explorer.
No geometry-to-product prediction is implemented in this sprint.

Use separate records for an abstract net and a real material:

```text
data/topologies/pcu.yaml
data/structures/mof-5.yaml
schemas/topology.schema.json
assets/topology/pcu/          # original editable conceptual geometry
assets/structures/mof-5/     # authorized CIF and derived assets, when verified
```

Topology records should include a stable symbol, periodic dimensionality, vertex types and
connectivities, the chosen simplification/deconstruction convention, references, original
asset paths, and review status. A material record should separately capture its source
identifier, crystal variant, CIF source and checksum, reuse terms, experimental or
hypothetical status, topology source, and representation used for the assignment.

Only reviewed records would be exposed to a future explorer. Match building-unit geometry
to curated possible nets, with a visible explanation that geometry and connectivity do
not guarantee a synthesis outcome. Begin with single connected nets; do not silently
flatten interpenetrated or composite cases into that scope.

Before creating records, review:

- Glasby et al. (2024), https://doi.org/10.1021/acs.chemmater.4c00762
- O’Keeffe et al. (2008), https://doi.org/10.1021/ar800124u
- Kalmutzki et al. (2018), https://doi.org/10.1126/sciadv.aat9180
- Li et al. (1999), https://doi.org/10.1038/46248

Publication figures are references for scientific understanding, not assets to copy without
checking rights. Create original visuals, and record the sources that justify each assignment.
