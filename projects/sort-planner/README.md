# Sort staffing and door-assignment tool

[Working demo](https://sfskhalsa101.github.io/hari-simran-khalsa-portfolio/projects/sort-planner/)

**User:** sort supervisor planning an inbound shift.

**Decision:** assign productive crew across three doors and choose the next arrived trailer while respecting a shared belt limit.

**Inputs:** editable sample trailer arrivals and volumes, total crew, support staffing, individual rate, belt capacity, and target minutes. All data and outcomes are synthetic.

**Success measures:** packages completed by target, elapsed time to finish, and assigned crew-hours. Compare the baseline and recommendation on identical inputs; no real-world gains are claimed.

## Method

Baseline: distribute productive crew evenly, with fixed round-robin trailer queues. Recommendation: enumerate up to six workers per door within available crew; each free door takes the largest arrived trailer. Rank candidates by packages at target, then assigned crew-hours. Retain the baseline if no candidate improves it. This is a heuristic over fixed staffing, not a global scheduling optimizer.

Simulate one-minute steps for up to 24 hours. Active door rates share the belt proportionally. Unused within-minute capacity is not reassigned. A trailer cannot start before arrival or overlap another trailer at its door. Unfinished plans report no finish or labor estimate.

Assigned hours = (assigned productive crew + support) × elapsed hours, including waiting. Unassigned people are assumed redeployed; this is not a payroll savings calculation. Breaks, safety requirements, trailer swaps, mixed freight, congestion, and equipment failure are excluded.

## Code and checks

`model.js` contains pure calculations; `app.js` renders controls and comparisons; `index.html` explains assumptions. Shared styling is in `../projects.css` and `../../styles.css`. From the repository root run `node --test tests/models.test.cjs`. Tests cover conservation, belt/crew limits, arrival timing, non-overlap, a hand-calculated case, zero capacity, invalid inputs, and empty work.

## Pilot proposal

Collect observed arrivals, package counts, sustained rates, staffing and completion times. Compare prediction error, service misses, quality, and labor against the current planning process. Review recommendations with supervisors before operational use. This pilot has not been conducted.

## Reproducible default simulation

With 12 available people, 2 support, 350 packages/person/hour, a 3,000 package/hour belt, and a 480-minute target, the balanced baseline processes about 19,202.5 packages by target, finishes in 548.4 minutes, and assigns 109.7 crew-hours. The recommendation uses 0/4/4 unloaders plus 2 support, processes all 20,400 packages by target, finishes in 438.6 minutes, and assigns 73.1 crew-hours. Two available people are assumed redeployed. Fractional package output reflects a fluid-rate simulation. These results are simulated, not employer results or payroll savings.
