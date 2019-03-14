const express = require('express');
const path = require('path');
const scholar = require('./scholar')
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200'
});
client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 1000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('elasticsearch cluster is up!');
  }
});
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
	return scholar.search(query)
	.then(result => {
		search_results = result.results;
		ws.send(JSON.stringify({"query":query, "search_results": search_results})); //update client with results

		look_up_promises = search_results.map( //execute lookup for all search results
			paper => search_result_lookup(paper)
			.then(search_result_lookup => {
				search_result_lookup = search_result_lookup.hits.hits[0]._source;
				search_result_lookup["paper_title"] = paper.title;
				ws.send(JSON.stringify({"query":query, "search_result_lookup":search_result_lookup})); //update client with lookup
				return search_result_lookup;
			})
			.catch(error => {
				return error;
			}));

		return Promise.all(look_up_promises);
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
function search_result_lookup(paper){
	console.log("search_result_lookup");
	console.log(paper);
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
	})
}
function elasticsearch_query(query){
	console.log("elasticsearch_query");
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