const WebSocket = require('ws');
import {getSearchEngine} from './SearchEngine/SearchHandler'
var elasticsearch = require('elasticsearch');
export default class MyWebSocket{
	constructor(){
		this.client = new elasticsearch.Client({
		  host: 'localhost:9200'
		});
		this.client.ping({
		  // ping usually has a 3000ms timeout
		  requestTimeout: 3000
		}, function (error) {
		  if (error) {
		    console.log('elasticsearch cluster is down!');
		  } else {
		    console.log('elasticsearch cluster is up!');
		  }
		});
		const wss = new WebSocket.Server({ port: 1818 });
		wss.on('connection', ws => {
			console.log("connection WebSocket");
		  	ws.on('message', message => {
			  	var message = JSON.parse(message);
			    if(message.query){
			    	this.onMessage(ws,message);
			    	//handleQuery(ws,message);
			    	// console.log("engine " + message.searchEngine);
			    	// this.assignments(ws,message.query,"search",[[message.query,message.searchEngine]])
			    	// .then(results => this."lookupAll",(results))
			    	// .then(results => {ws.send(JSON.stringify({"query":message.query, "search_result_lookup": results})); return results;}) //update client with results
			    	// .then(results => this.getCitations(results))
			    	// .then(results => {ws.send(JSON.stringify({"query":message.query,"lookupArrayOfCitation": results})); return results;}) //update client with results
			    	// .then(results => {ws.send(JSON.stringify({"query":message.query, "complete":true})); return results;}) //update client query complete
			    	// .catch(error => ws.send(JSON.stringify({"query":message.query,"error":error.toString()}))); //update client query error)

			    }
			    if(message.selected_result){
			    	handleSelected_result(ws,message);
			    }
		  });
		 
		  //
	});
	}
	onMessage(ws,messageTEMP){
		const message = {assignmentID:0,functionNames:["search","get_search_result_lookup","getCitations"],params:{query:"query",searchEngine:"scholar"}};
		this.doAssignment(ws,message.assignmentID,message.functionNames.shift(),message.params)
			.then(results => this.onMessageChain(ws,message.assignmentID,message.functionNames,results))
			.then(results => {ws.send(JSON.stringify({"assignmentID":message.assignmentID, "complete":true})); return results;}) //update client query complete
			.catch(error => ws.send(JSON.stringify({"assignmentID":message.assignmentID,"error":error.toString()}))); //update client query error)

	}
	onMessageChain(ws,assignmentID,functionNames,prevResult){
		if(functionNames.length === 0){ //no functions to be executed
			return prevResult;//return final result
		}
		return this.doAssignment(ws,assignmentID,functionNames.shift(),prevResult)
		.then(results => this.onMessageChain(ws,assignmentID,functionNames,results))

	}
	doAssignment(ws,assignmentID,functionName,params){
		if(params.constructor === Array){ //if is multidimentional execute  multiple
			return this.assignments(ws,assignmentID,functionName,params);
		}
		return this.assignment(ws,assignmentID,functionName,params);
	}
	assignment(ws,assignmentID,functionName,params){
		return this[functionName](params)
		.then(results => {ws.send(JSON.stringify({"assignmentID":assignmentID, [functionName]: results})); return results;}) //update client with results
	}
	assignments(ws,assignmentID,functionName,params){
		return Promise.all(
			params.map(
				params => this.assignment(ws,assignmentID,functionName,params)
				)
			)
			.then(results => {return results.filter(x => x)});//remove all that cannot be lookedup
	}
	clientCallback(connection,messageOb){
		connection.send(JSON.stringify(messageOb));
	}
	search(params){
		return new Promise((resolve, reject) => {
			const searchEngine =  getSearchEngine(params.searchEngine);
			resolve(searchEngine.search(params.query));
		}).then(results => results.results);
	}
	lookupAll(papers){
		return Promise.all(
			papers.map(
				paper => this.get_search_result_lookup(paper)
				)
			)
			.then(results => {return results.filter(x => x)});//remove all that cannot be lookedup
	}
	getInCitations(paper){
		return getCitations(paper.getInCitations);
	}
	getOutCitations(paper){
		return getCitations(paper.getOutCitations);
	}
	getCitations(citationList){
		console.log("getCitations");
		return  Promise.all(
					citationList
						.slice(0,2) //shorten list for speed
						.map(
						citation => this.getPaperBySemanticScholarId(citation)
						)
			).then(results => {return results.filter(x => x)});//remove all that cannot be lookedup;
	}


	getPaperBySemanticScholarId(id){
		//console.log("getPaperBySemanticScholarId");
		//console.log(id);
		return this.elasticsearch_query({
		  	"terminate_after":1,
		    query: {
		      term: {
		        id: id
		      }
		    }
		})
		.then(result =>{ //cleanup
			//console.log("result");
			//console.log(result.hits.hits[0]._source.title);
			if(result.hits.total === 0){
				return Promise.resolve(null);
			}
			var result = result.hits.hits[0]._source;
			result["source_id"] = id;
			return result;
		})
	}
	get_search_result_lookup(paper){
		var promise;

		if(paper.title){
			return this.elasticsearch_query({
			  	"terminate_after":1, //stop after first is found
			    query: {
			      match_phrase: {
			        title: {
			        	query: paper.title
			        }
			      }
			    }
			}).then(search_result_lookup => { //seach result lookup is done clean
				if(search_result_lookup.hits.total == 0){
					return Promise.resolve(null);//no results remove further up the chain
				}
				search_result_lookup = search_result_lookup.hits.hits[0]._source;
				search_result_lookup["source_title"] = paper.title;
				return search_result_lookup;
			}).catch(error => error)
		}
		//paper cannot be recognized
			return Promise.resolve(null);
		
		 
	}
	elasticsearch_query(query){
		return this.client.search({
			  index: 'search',
			  type: 'semanticscholar2',
			  body: query
			})
	}
}