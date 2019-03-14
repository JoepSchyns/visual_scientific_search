//example https://labs.semanticscholar.org/corpus/

conn = new Mongo();
db = conn.getDB("search");
printjson(db.getCollectionNames())
//index based on the id from schemantic scholar
//db.semanticscholar.createIndex( { "id": 1 }, { unique: true } )
db.semanticscholar.createIndex({ title : "text" },{ default_language: "english" })
//Alternative to mental hospital treatment: I. Conceptual model, treatment program, and clinical evaluation
	
db.semanticscholar.find({$text: {$search: "Alternative to mental hospital treatment: I. Conceptual model, treatment program, and clinical evaluation"}}, {score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}})use