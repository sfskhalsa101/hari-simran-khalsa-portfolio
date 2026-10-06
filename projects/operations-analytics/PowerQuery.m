// Set CsvPath to the downloaded shift-data.csv. Name the resulting query Shifts.
let
 CsvPath = "C:\Portfolio\shift-data.csv",
 Source = Csv.Document(File.Contents(CsvPath), [Delimiter=",", Columns=8, Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
 Headers = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
 Typed = Table.TransformColumnTypes(Headers, {{"date", type date},{"area", type text},{"packages", Int64.Type},{"paid_hours", type number},{"productive_hours", type number},{"target_pph", type number},{"quality_errors", Int64.Type},{"downtime_minutes", type number}})
in Typed
