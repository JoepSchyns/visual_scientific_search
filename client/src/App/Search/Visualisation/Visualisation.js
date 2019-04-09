import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import d3Graph from './d3Graph';



class Visualisation extends Component {

	componentDidMount = () => {
		console.log("componentDidMount");
		this.domElement = ReactDOM.findDOMNode(this);
		this.addD3();
		window.addEventListener("resize", this.componentDidUpdate);//update on resize
	};
	addD3 = () => {
		console.log("render");
		d3Graph.create(this.domElement, {
		  width: '100%',
		  height: '100%'
		}, this.props.data,this.callbackFromD3);
	}
	callbackFromD3 = (dataFromChild) => {
			this.props.callbackToSearch(dataFromChild);
	}
	componentDidUpdate = () => {
		var el = ReactDOM.findDOMNode(this);

		if(!this.updateTimeout){
			d3Graph.update(el, this.props.data);
			setTimeout(this.updateTimeoutCallback, 500);
			this.updateTimeout = true;
		}

		
	};
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