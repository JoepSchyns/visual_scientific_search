import React, { Component } from 'react';
import SearchNavbar from './SearchNavbar/SearchNavbar';
import ResultList from './ResultList/ResultList'
import Visualisation from './Visualisation/Visualisation'

import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { withRouter } from "react-router";
import SearchDataHandler from "./SearchDataHandler"
import "./Search.css"
import {
  Container,
  Row,
  Col
  } from 'reactstrap';
import { StageSpinner } from "react-spinners-kit";

class Search extends Component{
	constructor(props){
		super(props);
		this.searchDataHandler = new SearchDataHandler(this);


		if(this.props.location.state && this.props.location.state.selected_result){ //if is redirect and item is selected
			this.setStateFromHistory(this.props.location.state);
			this.state.selected_result = {title:this.props.location.state.selected_result.title,description:this.props.location.state.selected_result.title}; //set the info field to the selected node
		}
		else if(this.props.location.state && this.props.location.state.nodes){ //if is an redirect
			this.setStateFromHistory(this.props.location.state);

		}else{ //if is new
			const { cookies } = props;
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
		

  	}
  	setStateFromHistory = (history) =>{
  		const { cookies } = this.props;
  		this.state = {
			query:this.props.location.state.query,
			search_results_lookup: this.props.location.state.search_results_lookup,
			search_results:this.props.location.state.search_results,
			nodes: this.props.location.state.nodes,
			links:this.props.location.state.links,
			loading:this.props.location.state.loading,
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


	callbackFromSearchBar = (dataFromChild) => {
	   	dataFromChild.new_query && this.searchDataHandler.handleNewQuery(dataFromChild);
	   	
	   	dataFromChild.searchEngine && this.searchDataHandler.handleNewSearchEngine(dataFromChild);

	   	dataFromChild.search_result_lookup && this.searchDataHandler.handleNewLookupData(dataFromChild); 
	   	
	   	dataFromChild.search_results && this.searchDataHandler.handleNewSearchResults(dataFromChild); //query has response
	   	console.log(this.state.nodes[this.state.query]);

	   	dataFromChild.lookupArrayOfCitation && this.searchDataHandler.handleNewlookupArrayOfCitation(dataFromChild); //add new citation lookup data	   	
  	};

  	callbackFromVisualisation = (dataFromChild) => {
  		 if(dataFromChild.event === "handleMouseClick"){
  		 	 if(!this.props.location.state){ //if state is not yet saved for this history
  		 	 	console.log("replace");
  				this.props.history.replace('/',this.state);
  			}

  			var currentState = this.state; //save current state before page refresh
  			
  			currentState['selected_result'] = dataFromChild.data;
  			this.props.history.push(
  				'selection/title=' + 
  						encodeURIComponent(
  							dataFromChild.data.title
  						)
  					+
  				'&id=' +
  				dataFromChild.data.id
  					
  				,currentState);
  		}
  	}

	render(){
		return(
			<div >
				<Container fluid className={"h-100 d-flex flex-column"} style={{padding:0,overflow:"hidden"}}>
					<SearchNavbar query={this.state.query} callbackToSearch={this.callbackFromSearchBar} cookieSearchEngine={this.state.cookieSearchEngine}/>
					<Row  className={"flex-fill"}>
						<Col xs="9">

							{this.state.nodes[this.state.query] ?
								<StageSpinner
					                size={30}
					                color="#b59bef"
					                loading={true}/> 
					            :
								<Visualisation
									callbackToSearch={this.callbackFromVisualisation}
								 	data={{nodes:this.state.nodes,links:this.state.links}}
								 	query={this.state.query}

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
export default withRouter(withCookies(Search));