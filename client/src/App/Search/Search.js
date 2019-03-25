import React, { Component } from 'react';
import SearchNavbar from './SearchNavbar/SearchNavbar';
import ResultList from './ResultList/ResultList'
import Visualisation from './Visualisation/Visualisation'
import "./Search.css"
import {
  Container,
  Row,
  Col,
  Spinner
  } from 'reactstrap';
import { StageSpinner } from "react-spinners-kit";


class Search extends Component{
	constructor(props){
		super(props);
		this.state = {
			query:null,
			search_results_lookup: null,
			search_results:null,
			nodes: [],
			links:[],
			loading:true

		};
  	}
	callbackFromSearchBar = (dataFromChild) => {
	   	if(dataFromChild.error){ //query returned error

	   	}
	   	

	   	if(dataFromChild.new_query){ //new query is send reset
	   		this.setState({search_results_lookup: null,
							search_results:null,
							links:[],
							nodes:[]});
	   	}


	   	if(dataFromChild.search_result_lookup){ //add new lookup data
			this.setState(prevState => ({
	  			nodes: [...prevState.nodes, dataFromChild.search_result_lookup]
			}));
			if(this.state.nodes.length > 1){
				this.setState(prevState => ({
	  				links: [...prevState.links, { source: this.state.nodes[this.state.nodes.length - 2].id, target:this.state.nodes[this.state.nodes.length - 1].id,labelProperty:"search_results"}]
				}));
			}
	   	}


	   	if(dataFromChild.search_results){ //query has response
	   		this.setState({search_results:dataFromChild.search_results}); // search_results
	   	}

	   if(dataFromChild.lookupArrayOfCitation){ //add new citation lookup data	
	   	console.log("lookupArrayOfCitation");
	   	console.log(dataFromChild.lookupArrayOfCitation);
	   		this.setState(prevState => ({
	  			nodes: [...prevState.nodes, dataFromChild.lookupArrayOfCitation],
	  			links: [...prevState.links, {source:dataFromChild.source , target:dataFromChild.lookupArrayOfCitation.id}]
			}));
	   }
	   	
  	};

	render(){
		return(
			<div >
			<Container fluid className={"h-100 d-flex flex-column"} style={{padding:0,overflow:"hidden"}}>
				<SearchNavbar callbackToSearch={this.callbackFromSearchBar}/>
			<Row  className={"flex-fill"}>
				<Col xs="9">

					{this.state.nodes.length == 0 ?
						<StageSpinner
			                size={30}
			                color="#b59bef"
			                loading={true}/> 
			            :
						<Visualisation 
						 	data={{nodes:this.state.nodes,links:this.state.links}}

	 					/> 
	 				}
				</Col>
				<Col xs="3">
					{ !this.state.search_results ? <StageSpinner
			                size={30}
			                color="#b59bef"
			                loading={true}/> 
			                 : <ResultList search_results={this.state.search_results}/> }
				</Col>						
			</Row>
			</Container>
	      	</div>
		);
	}
}
export default Search;