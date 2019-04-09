const config = require('./dbConfig');
const mongoose = require('mongoose');
const PaperModel = require('./PaperModel');
let db = (function () {

	mongoose.connect(config.DB, { useNewUrlParser: true }).then(() => {
		console.log('Database is connected') },
		err => { console.log('Can not connect to the database'+ err
		)}
	);

	function savePaperToDB(paper){
		return new Promise((resolve, reject) => {
			if(paper.title){
		  		PaperModel.findOneAndUpdate(
				  	{title:paper.title}, //search for paper with same title
				  	paper,
				  	{upsert:true},
				  	(error,doc) => {
				  		if(error){
				  			reject(error);
				  		}
				  		if(resolve){
				  			resolve(resolve);
				  		}
				 	}
				)
			}
		});
	}

	return {
	savePaperToDB: savePaperToDB
	}
})()

module.exports = db

