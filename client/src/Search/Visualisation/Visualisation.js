import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import d3Graph from './d3Graph';



class Visualisation extends Component {

	componentDidMount = () => {
		console.log("componentDidMount");
		this.domElement = ReactDOM.findDOMNode(this);
		this.addD3();
		window.addEventListener("resize", this.resizeCallback);//update on resize
	};
	addD3 = () => {
		console.log("render");
		d3Graph.create(this.domElement, {
		  width: '100%',
		  height: '100%'
		}, {nodes:this.props.nodes,links:this.props.links},this.callbackFromD3);
	}
	callbackFromD3 = (dataFromChild) => {
		console.log("callbackFromD3");
			this.props.callbackToSearch(dataFromChild);
	}

	componentDidUpdate = (prevprops) => {
		var el = ReactDOM.findDOMNode(this);
		d3Graph.update(el, {nodes:this.props.nodes,links:this.props.links});
	};
	resizeCallback = (event) =>{
		if(!this.updateTimeout){
			this.componentDidUpdate();
			setTimeout(this.updateTimeoutCallback, 250);
			this.updateTimeout = true;
		}
	}
	updateTimeoutCallback = () =>  {
		this.updateTimeout = false;
	}

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