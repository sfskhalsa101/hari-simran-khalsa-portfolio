# Hari Simran Khalsa — operations technology portfolio

[Live portfolio](https://sfskhalsa101.github.io/hari-simran-khalsa-portfolio/)

Four projects are featured on the portfolio. FlowCheck is maintained in its own repository; the other three have pages and source here:

| Project | Decision / evidence | Status |
| --- | --- | --- |
| [FlowCheck](https://sfskhalsa101.github.io/flowcheck/) · [source](https://github.com/sfskhalsa101/flowcheck) | Reconcile WMS/TMS exports, investigate differences, and verify corrected data | Working browser demo + Python/SQL backend |
| [Sort planner](projects/sort-planner/) | Staff doors and sequence arrived trailers; compare throughput and assigned labor | Working simulation |
| [Dispatch dashboard](projects/dispatch-dashboard/) | Prioritize late arrivals, scan gaps, and service risks | Working synthetic demo |
| [AIncident](projects/aincident/) | Document independent product delivery and sale | Product delivery and commercial sale case study |

## Run locally

No build or dependencies required. From this folder, run `python3 -m http.server 8000` and visit `http://localhost:8000`. Run calculation tests with `node --test tests/models.test.cjs`.

## Evidence policy

Logistics demo inputs and outputs are simulated. They are not employer data, validated operating standards, or measured cost savings. Career claims are separate and come from the existing portfolio. AIncident's original code, screenshots, customer information, and ownership rights are not inferred from its sale. Only newly written case-study page code is included.

## Portfolio rollout

See [PORTFOLIO_PLAN.md](PORTFOLIO_PLAN.md) for the staged plan, pilot measures, and interview walkthroughs. Static files are compatible with the existing GitHub Pages deployment. No API keys, tracking, or external services are required by the demos.
