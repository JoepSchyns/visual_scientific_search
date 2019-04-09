import React, { Component } from 'react';
import SearchNavbar from './SearchNavbar/SearchNavbar';
import ResultList from './ResultList/ResultList'
import Visualisation from './Visualisation/Visualisation'
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import "./Search.css"
import {
  Container,
  Row,
  Col
  } from 'reactstrap';
import { StageSpinner } from "react-spinners-kit";


class Search extends Component{
	 static propTypes = {
    		cookies: instanceOf(Cookies).isRequired
   	};
	constructor(props){
		super(props);
		const { cookies } = props;
		console.log(cookies.get('searchEngine'));
		this.state = {
			query:null,
			search_results_lookup: null,
			search_results:null,
			nodes: [],
			links:[],
			loading:true,
			cookieSearchEngine:cookies.get('searchEngine'),
			selected_result:{title:'select a item',description:""}

		};
  	}
  	setCookie = (name,value) =>{
  		const { cookies } = this.props;
  		if(cookies.get('searchEngine') !== value){
  			console.log("try set cookie " + value);
  			cookies.set('searchEngine', value, { path: '/' });
  			return setTimeout(this.setCookie(name,value),1000); //check if cookie is set otherwise try again
  		}
  		console.log("cookie set done");
  	}
  	handleNewLookupData = (dataFromChild) =>{
  		const indexNodes = this.state.nodes.findIndex(x => x.title === dataFromChild.search_result_lookup.source_title); //get element added for search_result list by 
		if(indexNodes === -1){
			console.error("title of node not found");
			return false;
		}
		
		var nodes = this.state.nodes; //update nodes with new lookup
		nodes[indexNodes]['lookup'] = dataFromChild.search_result_lookup;

		this.setState(prevState => ({
  			nodes: nodes
		}));
		this.handleNewTopics(nodes[indexNodes],dataFromChild.search_result_lookup.entities);
  	}
  	handleNewTopics = (source,topics) => {
  		topics = topics.map(topic => {return{title:topic,topic:true}});
  		const links = topics.map(topic => {return {source:source,target:topic}});
  		console.log(topics);
  		this.setState(prevState => ({
  			nodes: [...prevState.nodes, ...topics],
  			links: [...prevState.links, ...links]
		}));
  	}
  	handleNewQuery = (dataFromChild) =>{//new query is send reset
		this.setState({
			search_results_lookup: null,
			search_results:null,
			links:[],
			nodes:[]
		});
  	}
  	handleNewSearchEngine = (dataFromChild) =>{//new query is send reset
		this.setCookie("searchEngine",dataFromChild.searchEngine)
		this.setState({ cookieSearchEngine:dataFromChild.searchEngine });
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
		this.setState({
			search_results:dataFromChild.search_results,
			nodes:nodes,
			links:links
			}); // search_results
  	}
  	handleNewlookupArrayOfCitation = (dataFromChild) => {
		console.log("lookupArrayOfCitation");
  		const sourceNodeIndex = this.state.nodes.findIndex(x => x.lookup && x.lookup.id === dataFromChild.source_id); //get element based on id of lookedup element
  		if(sourceNodeIndex === -1){
  			console.error("handleNewlookupArrayOfCitation NOTFOUND");
  			return;
  		}
  		dataFromChild.lookupArrayOfCitation['citation'] = true; //annotate
   		this.setState(prevState => ({
  			nodes: [...prevState.nodes, dataFromChild.lookupArrayOfCitation],
  			links: [...prevState.links, {source:this.state.nodes[sourceNodeIndex] , target:dataFromChild.lookupArrayOfCitation}]
		}));
  	}
	callbackFromSearchBar = (dataFromChild) => {
	   	if(dataFromChild.error){ //query returned error

	   	}
	   	
	   	dataFromChild.new_query && this.handleNewQuery(dataFromChild);
	   	
	   	dataFromChild.searchEngine && this.handleNewSearchEngine(dataFromChild);

	   	dataFromChild.search_result_lookup && this.handleNewLookupData(dataFromChild); 
	   	
	   	dataFromChild.search_results && this.handleNewSearchResults(dataFromChild); //query has response

	   	dataFromChild.lookupArrayOfCitation && this.handleNewlookupArrayOfCitation(dataFromChild); //add new citation lookup data	   	
  	};
  	callbackFromVisualisation = (dataFromChild) => {
  		console.log(dataFromChild);
  		if(dataFromChild.event){
  			this.setState({selected_result:dataFromChild.data});
  		}
  	}

	render(){
		return(
			<div >
			<Container fluid className={"h-100 d-flex flex-column"} style={{padding:0,overflow:"hidden"}}>
				<SearchNavbar callbackToSearch={this.callbackFromSearchBar} cookieSearchEngine={this.state.cookieSearchEngine}/>
			<Row  className={"flex-fill"}>
				<Col xs="9">

					{this.state.nodes.length === 0 ?
						<StageSpinner
			                size={30}
			                color="#b59bef"
			                loading={true}/> 
			            :
						<Visualisation
							callbackToSearch={this.callbackFromVisualisation}
						 	data={{nodes:this.state.nodes,links:this.state.links}}

	 					/> 
	 				}
				</Col>
				<Col xs="3">
					{ !this.state.search_results ? <StageSpinner
			                size={30}
			                color="#b59bef"
			                loading={true}/> 
			                 : <ResultList selected_result={this.state.selected_result} search_results={this.state.search_results}/> }
				</Col>						
			</Row>
			</Container>
	      	</div>
		);
	}
}
export default withCookies(Search);