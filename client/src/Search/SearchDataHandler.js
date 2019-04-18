export default class SearchDataHandler{
	constructor(parent){
		this.parent = parent;//enable to set state of parent component
	}
	handleNewLookupData = (dataFromChild) =>{
		Promise.all(
			dataFromChild.search_result_lookup.map(lookup =>{
				new Promise((resolve,reject) =>{
					const indexNodes = this.parent.state["nodes_" + dataFromChild.query].findIndex(x => x.title === lookup.source_title); //get element added for search_result list by 
					if(indexNodes === -1){
						console.error("title of node not found");
						return false;
					}

					var nodes = this.parent.state["nodes_" + dataFromChild.query]; //update nodes with new lookup
					nodes[indexNodes]['lookup'] = lookup;

					this.parent.setState(prevState => ({
							["nodes_" +  dataFromChild.query]:nodes
					}));
					resolve(this.handleNewTopics(nodes[indexNodes],lookup.entities,dataFromChild.query));
				})
			})

		)
	}
	handleNewTopics = (source,topics,query) => {
		topics = topics.map(topic => {return{title:topic,topic:true}});
		const links = topics.map(topic => {return {source:source,target:topic}});
		this.parent.setState(prevState => ({
			["nodes_" +  query]:[...prevState["nodes_" +  query], ...topics]	,
			["links_" +  query]:[...prevState["links_" +  query], ...links]	
			
		}));
		return;
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
			this.parent.setState({
			search_results:dataFromChild.search_results,
			["nodes_" +  dataFromChild.query] :nodes
			,
			["links_" +  dataFromChild.query] :links
		
			}); // search_results
	}
	handleNewlookupArrayOfCitation = (dataFromChild) => {
		const sourceNodeIndex = this.parent.state.nodes.findIndex(x => x.lookup && x.lookup.id === dataFromChild.source_id); //get element based on id of lookedup element
		if(sourceNodeIndex === -1){
			console.error("handleNewlookupArrayOfCitation NOTFOUND");
			return;
		}
		dataFromChild.lookupArrayOfCitation['citation'] = true; //annotate
		this.parent.setState(prevState => ({
			["nodes_" +  dataFromChild.query]:[...prevState["nodes_" +  dataFromChild.query], dataFromChild.lookupArrayOfCitation]
			,
			["links_" +  dataFromChild.query]: [...prevState["links_" +  dataFromChild.query], {source:this.parent.state.nodes[sourceNodeIndex] , target:dataFromChild.lookupArrayOfCitation}]
			}
		));
	}
}