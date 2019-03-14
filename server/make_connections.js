const scroll = require('./Scroll.js');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  requestTimeout:120000,
});



function make_connections(document,count){
	console.log("make_connections " + document._source.id + " " + count);
	//console.log(document);

	
		return addSelfToCitationListOfOther(document._source.id,document._source.inCitations,'outCitations')
		.then(next => addSelfToCitationListOfOther(document._source.id,document._source.outCitations,'inCitations'));
}

function addSelfToCitationListOfOther(documentId,listOfDocumentsToAddID,listName){
	//console.log("addSelfToCitationListOfOther");
	//console.log(listOfDocumentsToAddID);
	return new Promise((resolve, reject) => {
			if(listOfDocumentsToAddID.length == 0){
				//console.log("listOfDocumentsToAddID.length == 0");
				resolve({id:documentId,resolved:"no incitations"});
			}
			//console.log("listOfDocumentsToAddID.length != 0");
			resolve(Promise.all(listOfDocumentsToAddID.map(citation => updateCitation(citation,documentId,listName))));
		});
	//add id of self to every document in incitation list
}
function updateCitation(documentId,citation,listName){
	//console.log("updateCitation");
	return waitOnQueueSize(750,10000,documentId) //1000 is the maximum queue
		.then(next => client.updateByQuery({
		waitForCompletion:true,
		index: 'search',
		type: 'semanticscholar2',
		_source: ["id", "outCitations","inCitations"],
		size:1,
		refresh:true,
		conflicts:"proceed",
		body: {
			query: {
		        "term": {id:documentId}
		     },
		    script: {
			   	id:'addCitations', //add only if the document does not excist
		    	params: { listName: listName,citation: citation }
		  	}
	    }
	}));
}
function addScript(idString,scriptString){
	return new Promise((resolve, reject) => {
		client.getScript({id:idString})
		.then(resolved => {//script is found
				resolve(resolved);
			},
			rejected => { //script is not found
				var params = {
			        id : idString,
			        body : 	{
			        	script:{
			        		lang : 'painless',
			        		source : scriptString
			        	}
			        }
			    }
				resolve(client.putScript(params));//add script
			})
		.catch(rejectOb => {
		 	reject(rejectOb);
		 });
	});
}

addScript(
	'addCitations',
	"if(ctx._source[params.listName].contains(params.citation)){ctx._source[params.listName].add(params.citation)}"
	)
.then(resolved =>{
	console.log("resolved")
	console.log(resolved)
}).catch(rejected => {
	console.log("rejected")
	console.log(rejected)
}).then( next =>
	scroll.query(
		{
			"_source": ["id", "outCitations","inCitations"], //only return the used fields
			query: {
	            "match_all": {}
	        }
	    },
	    "1h",
	    30,
	    make_connections))
.then(output => {
	console.log("COMPLETE");
	console.log(output);
}).catch(rejected => {
	console.log("REJECTED");
	console.log(rejected);
});
function printInLine(progress){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("queue " + progress);
}
function waitOnQueueSize(onSize,waitMillis,documentId){
	return new Promise((resolve, reject) => { 
	getQueue().then(size =>{
			if(size > onSize){
				printInLine(documentId + "sets timeOut size is: " + size);
				setTimeout(
					function(){ resolve(waitOnQueueSize(onSize,waitMillis,documentId)) } //check again after
					, waitMillis);
			}else{ //que is small enough
				printInLine("queue " + size); //print queue
				resolve(size);
			}
		})
	});
}
function getQueue(){
	return client.nodes.stats({})
		.then(response => {return Promise.resolve(response.nodes.Sme_1GHRSoyvwbTR6UI0hQ.thread_pool.search.queue)});
}