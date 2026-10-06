# ShiftLens — operations analytics / SQL and Power BI

A fictional 28-day, three-area warehouse case study. No employer data or measured savings.

## Business decision
Should the manager add load-area headcount, or first address interruption time and quality? Compare paid productivity with productive-time productivity before choosing.

## Reproduce SQL
Run `python3 reproduce.py` (standard library only). It loads the CSV, validates the row grain, executes analysis.sql and checks expected-results.json. Grain: one date × area; 84 rows. Targets are fictional area-specific rates. Productive hours are paid hours excluding the modeled area interruption. Downtime minutes are elapsed area time; interrupted labor hours account for crew size.

## Power BI
Import shift-data.csv with PowerQuery.m; name the query Shifts. Add measures.dax measures. Format Labor Utilization and Target Attainment as percentages. Report: area and date slicers; four cards (Packages, Paid PPH, Labor Utilization, Errors per 10K); area matrix with all measures; daily line chart of paid versus productive PPH; utilization column chart by area. The browser page implements those metrics and filters for immediate review. It is not a Power BI embed.

The power-bi-project.zip includes a PBIP project, embedded-data semantic model, nine DAX measures, and eight report visuals. Desktop rendering and refresh must be checked on Windows; do not represent browser screenshots as Power BI screenshots.

## Interpretation
The load area has lower utilization and higher quality-error frequency. Its productive-time rate is much closer to its target than its paid-time rate suggests. First investigate interruption causes and quality with the team. Trial a change against a comparison shift and track utilization, errors, service completion and throughput. The dataset supports a diagnostic hypothesis, not causation or a real staffing reduction.

## Data discipline
Ratios are calculated from summed numerators and denominators. Area-specific targets are weighted by productive hours. Quality counts are independent sample counts; they are not FedEx or UPS misload numbers. No dollar savings are projected.
