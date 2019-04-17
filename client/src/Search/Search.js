import React, { Component } from 'react';
import SearchNavbar from './SearchNavbar/SearchNavbar';
import ResultList from './ResultList/ResultList'
import Visualisation from './Visualisation/Visualisation'
import Websocket from 'react-websocket';
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
		console.log("constructor");
		super(props);
		this.searchDataHandler = new SearchDataHandler(this);

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
  	componentDidUpdate(prevProps,prevState) {
  		if(prevProps.location.pathname !== this.props.location.pathname){ //redirect
  			this.setState({
			query:this.props.location.state.query,
			search_results_lookup: this.props.location.state.search_results_lookup,
			search_results:this.props.location.state.search_results,
			nodes: this.props.location.state.nodes,
			links:this.props.location.state.links,
			loading:this.props.location.state.loading,
			selected_result:this.props.location.state.selected_result
			});
			this.sendMessage(JSON.stringify({selected_result:this.state.selected_result}));
  		}
	
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
	   	console.log(this.state["nodes_" + this.state.query]);

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
  			currentState['query'] = dataFromChild.data.title;
  			this.props.history.push(
  				'/selection/title=' + 
  						encodeURIComponent(
  							dataFromChild.data.title
  						)
  				,currentState);
  		}
  	}
	handleData = (data) =>{
	  let result = JSON.parse(data);
	  console.log(result);
	  this.callbackFromSearchBar(result);     //passdata
	}
	handleOpen = ()  =>{
	console.log("connected:)");
	}
	handleClose = () =>{
	console.log("disconnected:(");
	}

	sendMessage = (message) =>{
	this.refWebSocket.sendMessage(message);
	}

	render(){
		return(
			<div >
				<Container fluid className={"h-100 d-flex flex-column"} style={{padding:0,overflow:"hidden"}}>
					<SearchNavbar query={this.state.query} callbackToSearch={this.callbackFromSearchBar} cookieSearchEngine={this.state.cookieSearchEngine}/>
					<Row  className={"flex-fill"}>
						<Col xs="9">

							{!this.state["nodes_" + this.state.query] ?
								<StageSpinner
					                size={30}
					                color="#b59bef"
					                loading={true}/> 
					            :
								<Visualisation
									callbackToSearch={this.callbackFromVisualisation}
								 	nodes={this.state["nodes_" + this.state.query]}
								 	links={this.state["links_" + this.state.query]}

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
				<Websocket url='ws://joep.space:1818/'
		          onMessage={this.handleData}
		          onOpen={this.handleOpen} onClose={this.handleClose}
		          reconnect={true} debug={true}
		          ref={
		            Websocket => {
		              this.refWebSocket = Websocket;
		            }                         
		          }
		          />
	      	</div>
		);
	}
}
export default withRouter(withCookies(Search));