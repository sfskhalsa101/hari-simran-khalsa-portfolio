import csv,sqlite3,json,pathlib
p=pathlib.Path(__file__).parent
rows=list(csv.DictReader((p/'shift-data.csv').open()))
assert len(rows)==84 and len({(r['date'],r['area']) for r in rows})==84
sql=(p/'analysis.sql').read_text(); db=sqlite3.connect(':memory:')
db.executescript(sql.split('-- Paid PPH')[0]);db.executemany('INSERT INTO shifts VALUES(?,?,?,?,?,?,?,?)',[tuple(r.values()) for r in rows])
c=db.execute(sql[sql.index('SELECT area'):]);result=[dict(zip([x[0] for x in c.description],r)) for r in c.fetchall()]
assert result==json.loads((p/'expected-results.json').read_text())
print(json.dumps(result,indent=2));print('Validated 84 rows and SQL reference results.')
