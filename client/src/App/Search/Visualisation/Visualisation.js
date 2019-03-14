import React, {Component} from 'react';
import { Graph } from 'react-d3-graph';
//const d3 = Object.assign(d3Base, { forceLink})
import {Container,Col,Row, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText } from 'reactstrap';


class Visualisation extends Component {
	constructor(props){
		super(props);
		this.state = {
			waiting: false,
			search_results_lookup:[]
		};
  	}
	componentDidMount = () => { 
    	//this.drawChart();
	}
	// graph payload (with minimalist structure)

	 
	// the graph configuration, you only need to pass down properties
	// that you want to override, otherwise default ones will be used
	myConfig = {
	    nodeHighlightBehavior: true,
	    node: {
	        color: 'lightgreen',
	        size: 500,
	        minZoom:20,
	        maxZoom:20,
	        focusZoom:20,
	        highlightStrokeColor: 'blue',
	        renderLabel :true,
	    },
	    link: {
	        highlightColor: 'lightblue',
	        renderLabel :true,
	        labelProperty:true, 
	        search_results: {
	        	highlightColor: 'black'
	    	}
	    }	
	};
	// graph event callbacks
	onClickGraph = () => {
	    console.log("Clicked the graph background");
	};
	 
	onClickNode = (nodeId) => {
	    console.log("Clicked node " + nodeId);
	};
	 
	onRightClickNode = (event,nodeId) => {
	    console.log("Right clicked node " + nodeId);
	};
	 
	onMouseOverNode = (nodeId) => {
	    console.log("Mouse over node " + nodeId);
	};
	 
	onMouseOutNode = (nodeId) => {
	    console.log("Mouse out node " + nodeId);
	};
	 
	onClickLink = (source,target) => {
	    console.log("Clicked link between " + source + " and " + target);
	};
	 
	onRightClickLink = (event, source, target) => {
	    console.log("Right clicked link between " + source + " and " + target);
	};
	 
	onMouseOverLink = (source, target) => {
	    console.log("Mouse over in link between " + source + " and " + target);
	};
	 
	onMouseOutLink = (source, target) => {
	    console.log("Mouse out link between " + source + " and " + target);
	};
	render(){
    return (
    	<div>
	    	<Graph
			    id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
			    data={this.props.data}
			    config={this.myConfig}
			    onClickNode={this.onClickNode}
			    onRightClickNode={this.onRightClickNode}
			    onClickGraph={this.onClickGraph}
			    onClickLink={this.onClickLink}
			    onRightClickLink={this.onRightClickLink}
			    onMouseOverNode={this.onMouseOverNode}
			    onMouseOutNode={this.onMouseOutNode}
			    onMouseOverLink={this.onMouseOverLink}
			    onMouseOutLink={this.onMouseOutLink}
			/>;
    	</div>

    );
  }

}

export default Visualisation;