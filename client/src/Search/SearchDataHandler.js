export default class SearchDataHandler{
	constructor(parent){
		this.parent = parent;//enable to set state of parent component
	}
	handleNewLookupData = (dataFromChild) =>{
			const indexNodes = this.parent.state.nodes[dataFromChild.query].findIndex(x => x.title === dataFromChild.search_result_lookup.source_title); //get element added for search_result list by 
		if(indexNodes === -1){
			console.error("title of node not found");
			return false;
		}

		var nodes = this.parent.state.nodes[dataFromChild.query]; //update nodes with new lookup
		nodes[indexNodes]['lookup'] = dataFromChild.search_result_lookup;

		this.parent.setState(prevState => ({
				nodes: {
					...prevState.nodes,
					[dataFromChild.query]:nodes //add nodes and store the query that requested them
				}
		}));
		this.handleNewTopics(nodes[indexNodes],dataFromChild.search_result_lookup.entities,dataFromChild.query);
	}
	handleNewTopics = (source,topics,query) => {
		topics = topics.map(topic => {return{title:topic,topic:true}});
		const links = topics.map(topic => {return {source:source,target:topic}});
		this.parent.setState(prevState => ({
			nodes: {
				...prevState.nodes,
				[query]: [...prevState.nodes[query], ...topics]
			},
			links: {
				...prevState.links,
				[query]:[...prevState.links[query], ...links]	
			}
		}));
	}
	handleNewQuery(dataFromChild){//new query is send reset
		this.parent.setState({
			search_results_lookup: null,
			search_results:null,
			query:dataFromChild.query
		});
	}
	handleNewSearchEngine = (dataFromChild) =>{//new query is send reset
		this.parent.setCookie("searchEngine",dataFromChild.searchEngine)
		this.parent.setState({ cookieSearchEngine:dataFromChild.searchEngine });
	}
	handleNewSearchResults = (dataFromChild) => {	
		var links = [];
		var nodes = [];
		var prevNode = null;
		for (var i = 1; i < dataFromChild.search_results.length; i++) {
			if(dataFromChild.search_results[i].title){
				var node = dataFromChild.search_results[i];
				node['searchResult'] = true;
				if(prevNode){ //link search results
					links.push({source:prevNode,target:node});
				}
				nodes.push(node);
				prevNode = node;
			}
		}
		this.parent.setState(prevState => ({
			search_results:dataFromChild.search_results,
			nodes:{
				...prevState.nodes,
				[dataFromChild.query]:nodes
			},
			links:{
				...prevState.links,
				[dataFromChild.query]:links
			}
			})); // search_results
	}
	handleNewlookupArrayOfCitation = (dataFromChild) => {
		console.log("lookupArrayOfCitation");
		const sourceNodeIndex = this.parent.state.nodes.findIndex(x => x.lookup && x.lookup.id === dataFromChild.source_id); //get element based on id of lookedup element
		if(sourceNodeIndex === -1){
			console.error("handleNewlookupArrayOfCitation NOTFOUND");
			return;
		}
		dataFromChild.lookupArrayOfCitation['citation'] = true; //annotate
		this.parent.setState(prevState => ({
			nodes: {
				...prevState.nodes,
				[dataFromChild.query]:[...prevState.nodes, dataFromChild.lookupArrayOfCitation]
			},
			links: {
				...prevState.links,
				[dataFromChild.query]:[...prevState.links, {source:this.parent.state.nodes[sourceNodeIndex] , target:dataFromChild.lookupArrayOfCitation}]
			}
		}));
	}
}