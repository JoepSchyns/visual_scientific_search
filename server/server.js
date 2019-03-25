const express = require('express');
const path = require('path');
const scholar = require('./scholar')
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200'
});
client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 3000
}, function (error) {
  if (error) {
    console.log('elasticsearch cluster is down!');
  } else {
    console.log('elasticsearch cluster is up!');
  }
});
//this is an test
const app = express();
const bodyParser  =  require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const db = require('./db/db');

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ port: 1818 });
 
wss.on('connection', function connection(ws) {
	console.log("connection WebSocket");
  ws.on('message', function incoming(message) {
  	var message = JSON.parse(message);
  	console.log(message);
    if(message.query){
    	handleQuery(ws,message.query);
    }
  });
 
  //
});
function handleQuery(ws,query){
	return scholar.search(query) //get results from google scholar

	.then(result => {
		search_results = result.results;
		ws.send(JSON.stringify({"query":query, "search_results": search_results})); //update client with results
		search_result_promises = search_results.map(paper => doForSearchResult(ws,query,paper));

		return Promise.all(search_result_promises);
	})

	.then(search_results_lookup => {
		ws.send(JSON.stringify({"query":query, "complete":true})); //update client query complete
		return search_results_lookup;
	})

	.catch(error =>{
		console.log("error search_results_lookup" + error);
		return error;
	});
}
function doForSearchResult(ws,query,paper){
	return get_search_result_lookup(paper)
	.then(search_result_lookup => {
		ws.send(JSON.stringify({"query":query, "search_result_lookup":search_result_lookup}))//update client lookup
		return lookupArrayOfCitations(ws,query,search_result_lookup.inCitations,search_result_lookup);
	}) 
	.catch(error => {
		return error;
	});
}

function lookupArrayOfCitations(ws,query,arrayOfCitations,search_result_lookup){ //TODO make batch operation
	console.log("lookupArrayOfCitation");

	if(arrayOfCitations.length > 2){ //TEMP test faster
		arrayOfCitations = arrayOfCitations.slice(0,2);
	}
	console.log(arrayOfCitations);
	return Promise.all(arrayOfCitations.map(citation => 
		getPaperBySemanticScholarId(citation)
		.then(result => {
			ws.send(JSON.stringify({"query":query,source:search_result_lookup.id, "lookupArrayOfCitation":result}))//update client lookup
			return result;
		})
	))
}
function getPaperBySemanticScholarId(id){
	console.log("getPaperBySemanticScholarId");
	console.log(id);
	return elasticsearch_query({
	  	"size": 1,
	    query: {
	      term: {
	        id: id
	      }
	    }
	})
	.then(result =>{ //cleanup
		console.log("result");
		console.log(result.hits.hits[0]._source.title);
		var result = result.hits.hits[0]._source;
		result["type_node"] = "citation";
		return result;
	})
}
function get_search_result_lookup(paper){
	console.log("search_result_lookup");
	//console.log(paper);
	if(!paper.title){ //paper cannot be recognized
		return Promise.resolve(paper.title);
	}
	return elasticsearch_query({
	  	"size": 1,
	    query: {
	      match_phrase: {
	        title: {
	        	query: paper.title
	        }
	      }
	    }
	}).then(search_result_lookup => { //seach result lookup is done clean
		search_result_lookup = search_result_lookup.hits.hits[0]._source;
		search_result_lookup["paper_title"] = paper.title;
		return search_result_lookup;
	}) 
}
function elasticsearch_query(query){
	return client.search({
		  index: 'search',
		  type: 'semanticscholar2',
		  body: query
		})
}
// An api endpoint that returns a short list of items
app.post('/api/search', (req,res) => {
	res.setHeader('Content-Type', 'application/json');
	const content = req.body;
	const query = content.query;
	console.log(query);

	
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);