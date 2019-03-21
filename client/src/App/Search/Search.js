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
	   		dataFromChild.search_result_lookup.inCitations.forEach(function(citation_id) {
	   // 			this.setState(prevState => ({
	  	// 			links: [...prevState.links, { source: citation_id, target: dataFromChild.search_result_lookup.id }]
				// }));
			},this);
			//connect all current items

			this.setState(prevState => ({
	  			nodes: [...prevState.nodes, { id: dataFromChild.search_result_lookup.title}],
	  			

			}));
	   			
	   		
	   		if(!this.state.search_results_lookup){ //if it does not excist yet add the first one manually
	   			this.setState({
	   				search_results_lookup: [dataFromChild.search_result_lookup]
	   				});
	   		}else{
	   // 			var newLinks = [];
	   // 			this.state.search_results_lookup[-1]
				// this.state.search_results_lookup.forEach(function(lookup) {
				// 	console.log(lookup);
				// 	newLinks.push({ source: lookup.title, target: dataFromChild.search_result_lookup.title,labelProperty:"search_results" })
				// },this);
		   		this.setState(prevState => ({
	  				search_results_lookup: [...prevState.search_results_lookup, dataFromChild.search_result_lookup],
	  				links: [...prevState.links, { source: this.state.search_results_lookup[this.state.search_results_lookup.length - 1].title, target:dataFromChild.search_result_lookup.title,labelProperty:"search_results"}]
				}))
	   		}
	   	}
	   	if(dataFromChild.search_results){ //query has response
	   		this.setState({search_results:dataFromChild.search_results}); // search_results
	   	}
	   	
  	};

	render(){
		return(
			<div>
			<SearchNavbar callbackToSearch={this.callbackFromSearchBar}/>
			<Container fluid style={{padding:0}}>
			<Row>
				<Col xs="9">

					{this.state.nodes.length != 0 ?
						<StageSpinner
			                size={30}
			                color="#b59bef"
			                loading={true}/> 
			            :
						<Visualisation 
						 	data =  {[
								{id: '5fbmzmtc', x: 7, y: 41, z: 6},
								{id: 's4f8phwm', x: 11, y: 45, z: 9}]}
							domain= {{x: [0, 30], y: [0, 100]}}

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