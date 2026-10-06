-- Synthetic data only. SQLite-compatible. Ratios use sums, not averages of daily ratios.
CREATE TABLE IF NOT EXISTS shifts (
 date TEXT NOT NULL, area TEXT NOT NULL, packages INTEGER NOT NULL CHECK(packages>=0),
 paid_hours REAL NOT NULL CHECK(paid_hours>0), productive_hours REAL NOT NULL CHECK(productive_hours>=0 AND productive_hours<=paid_hours),
 target_pph REAL NOT NULL CHECK(target_pph>0), quality_errors INTEGER NOT NULL CHECK(quality_errors>=0 AND quality_errors<=packages),
 downtime_minutes REAL NOT NULL CHECK(downtime_minutes>=0), PRIMARY KEY(date,area));
-- Paid PPH counts all paid time; productive PPH excludes recorded interruption time.
SELECT area, SUM(packages) AS packages,
 ROUND(SUM(packages)/SUM(paid_hours),1) AS paid_pph,
 ROUND(SUM(packages)/SUM(productive_hours),1) AS productive_pph,
 ROUND(100.0*SUM(productive_hours)/SUM(paid_hours),1) AS utilization_pct,
 ROUND(100.0*SUM(packages)/SUM(target_pph*productive_hours),1) AS target_attainment_pct,
 ROUND(10000.0*SUM(quality_errors)/SUM(packages),2) AS errors_per_10k,
 ROUND(SUM(paid_hours-productive_hours),1) AS interrupted_labor_hours
FROM shifts GROUP BY area ORDER BY utilization_pct;
