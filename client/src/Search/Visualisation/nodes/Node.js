import {textwrap} from  "d3-textwrap";
export class Node{
	datas = [];
	constructor(svg,width,drag,simulation,callbackToD3){
		this.callbackToD3 = callbackToD3;
		this.node = svg.append("g") //create group with same styles
	      	.attr("font-family", "sans-serif")
	      	.attr("font-size", "10px")
	    	.selectAll(".node"); //TODO dont understand
  		this.visualisationWidth = width;
		this.drag = drag;
		this.simulation = simulation;
		
	}

	equals(data){ //data is node off this class
		 throw new Error("equals not implemented!");
	}
	circleSize(d,context){
		throw new Error("circleSize not implemented!");
	}
	createSearchNodeWithSettings(d,context){ //set default node
		throw new Error("createSearchNodeWithSettings not implemented!");
	}

	createNode(d,context,labelText,cssClassName,lengthPercentage){
		d.classed(cssClassName,true)
			.append('circle')
	      	.attr("r", d => context.circleSize(d,context));

	    const titleWrap = textwrap().bounds({width: context.visualisationWidth * (lengthPercentage / 100), height: 100});
	    var textField = d.append('g')
	      			.on("click", context.handleMouseClick); 
	      textField.attr("class","nodeText")
	      .style("transform","translateX( -" + lengthPercentage / 2 + "% )")
	      .append('text')
	      .attr("width",lengthPercentage + "%")
	      .text( function (d) { return d.title; })
	      .call(titleWrap);

	      textField.call(context.labels,context,labelText);
	    };
	handleMouseClick = (d,i) =>{
		this.callbackToD3({event:"handleMouseClick",data:d});
	}

	labels(d,context,labelText){
		const height= 1;
		var labelGroup = d.append('g')
		.attr("class","nodeLabel")
		.style("transform","translateY( -" + height + "% )");
		labelGroup.append('text')
		.attr("y",height + "%")
		.text( labelText);
		labelGroup.append("rect")
		.attr("width",function(d){
		  return this.previousElementSibling.getBBox().width + "px";
		})
		.attr("height",function(d){
		  return this.previousElementSibling.getBBox().height + "px";
		}).lower();
	}

	update(){
		//console.log(this.constructor.name);
		//console.log(this.node);

		this.node = this.node.data(this.datas); //set new data
	    this.node.exit().remove(); //remove data that is not present anymore

	    var newNodes = this.node.enter() //do for new data
	      .append('g')
	      .attr("class","node")
	      .call(this.drag(this.simulation) //can onlt drag non search results
	      );
	    newNodes.call(this.createSearchNodeWithSettings,this);

	    this.node = this.node.merge(newNodes); //merge newdata with older items

	    this.node //do for all
	      .classed("lookup",d =>d.lookup);
	}
	set(data){
		this.datas = data;
	}
}

export class SearchResultNode extends Node{
	circleSize(d,context){
		if(!d.citedCount){
			return 10;
		}
		return ((d.citedCount - context.minCitations + 1) / (context.maxCitations - context.minCitations)) * 90 + 10;
	}
	setMinMaxCitations(data){
	  var maxCitations = 0;
	  var minCitations = Infinity;
	  data.forEach(d =>{
	    if(d.searchResult){
	      if(d.citedCount > maxCitations){
	        maxCitations = d.citedCount;
	      }
	      if(d.citedCount < minCitations){
	        minCitations = d.citedCount;
	      }
	    }
	  });
	  this.maxCitations = maxCitations;
	  this.minCitations = minCitations;
	}
	createSearchNodeWithSettings(d,context){ //set default node
		//console.log(context);
		context.setMinMaxCitations(context.datas);
	  	d.call(context.createNode,context,'Search Result','searchResult',15);
	}

	 equals(data){
		return data.searchResult;
	}
}
export class TopicNode extends Node{
	circleSize(d,context){
		return 5;
	}
	createSearchNodeWithSettings(d,context){ //set default node
	  	d.call(context.createNode,context,'topic','topic',7.5);
	}
	equals(data){
		return data.topic;
	}
}
export class CitationNode extends Node{
	circleSize(d,context){
		return 10;
	}
	createSearchNodeWithSettings(d,context){ //set default node
	  	d.call(context.createNode,context,'citation','citation',15);
	}
	 equals(data){
		return data.citation;
	}
}