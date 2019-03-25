import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import d3Graph from './d3Graph';



class Visualisation extends Component {
	constructor(props){
		super(props);
  	}

	componentDidMount = () => {
		console.log("componentDidMount");
		var el = ReactDOM.findDOMNode(this);
		console.log(d3Graph);
		d3Graph.create(el, {
		  width: '100%',
		  height: '100%'
		}, this.props.data);
	};

	componentDidUpdate = () => {
		console.log("componentDidUpdate");
		console.log(this.props.data);
		var el = ReactDOM.findDOMNode(this);
		d3Graph.update(el, this.props.data);
	};

	// getChartState = () => {
	// 	return {
	// 	  	data: this.props.data
	// 	}
	// };

	componentWillUnmount = () => {
		var el = ReactDOM.findDOMNode(this);
		d3Graph.destroy(el);
	};

	render(){
    	return (
    		<div className="graph h-100"></div>
    	);
  	};

}

export default Visualisation;