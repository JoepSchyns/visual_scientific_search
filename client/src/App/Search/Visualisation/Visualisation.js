import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import d3Graph from './d3Graph';



class Visualisation extends Component {
	constructor(props){
		super(props);
  	}

	componentDidMount = () => {
		var el = ReactDOM.findDOMNode(this);
		console.log(d3Graph);
		d3Graph.create(el, {
		  width: '100%',
		  height: '300px'
		}, this.getChartState());
	};

	componentDidUpdate = () => {
		var el = ReactDOM.findDOMNode(this);
		console.log(el);
		d3Graph.update(el, this.getChartState());
	};

	getChartState = () => {
		return {
		  	data: this.props.data,
		  	domain: this.props.domain
		}
	};

	componentWillUnmount = () => {
		var el = this.getDOMNode();
		d3Graph.destroy(el);
	};

	render(){
    	return (
    		<div className="graph"></div>
    	);
  	};

}

export default Visualisation;