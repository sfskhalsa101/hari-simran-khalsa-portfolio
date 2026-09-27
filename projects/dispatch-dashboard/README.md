# Dispatch exception dashboard

[Working demo](https://sfskhalsa101.github.io/hari-simran-khalsa-portfolio/projects/dispatch-dashboard/)

**User:** dispatcher reviewing a shift snapshot.

**Decision:** which route needs intervention first, why it is flagged, and what to verify next.

**Inputs:** five fictional routes with planned and actual arrivals, departure, expected/scanned counts, remaining stops, pace, remaining travel, and deadline. Review time and late tolerance are adjustable. All data are synthetic.

**Success measures:** routes needing intervention, scan gaps, and estimated service risks. The initial sample contains three flagged routes, two clear routes, and 214 scan gaps. These are fixture results, not measured production outcomes.

## Rules

- Arrival delay strictly exceeds tolerance: review; unrecorded overdue arrival: critical.
- Expected packages lack scans within 15 minutes of departure: review; at or after departure: critical.
- Estimated finish exceeds deadline: critical.

Finish estimate = max(review time, departure, known arrival) + remaining stops × minutes per stop + remaining travel minutes. Actual arrivals later than the review time are treated as unobserved. Changing time re-evaluates the same snapshot; it is not an event replay. Traffic, breaks, and service-time variance are excluded. The model is deterministic and does not use AI or claim predictive accuracy.

“Mark reviewed” is a reversible session-only acknowledgement. It does not remove risk flags, send messages, modify a route, or persist after reload. Filter by severity or not-reviewed state.

## Code and checks

`model.js` contains rules and sample records, `app.js` renders the queue, and `index.html` exposes source values and assumptions. Shared CSS lives in the parent project and repository folders. Run `node --test tests/models.test.cjs` from the repository root. Tests check rule boundaries, invalid data, unobserved arrivals, and expected fixture counts.

## Pilot proposal

Replay dispatcher-labelled events. Measure precision, missed exceptions, acknowledgement time, and false alarms by rule. Tune thresholds with dispatchers and validate service impact before live use. This pilot has not been conducted.
