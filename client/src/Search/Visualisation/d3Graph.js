import * as d3Base from "d3";
import {textwrap} from  "d3-textwrap";
import "./d3Graph.css"
import {SearchResultNode,TopicNode,CitationNode} from "./nodes/Node.js"
const d3 = Object.assign(d3Base, { textwrap});

var d3Graph = {};
d3Graph.create = function(el, props, data,callbackToVisualisation,query) {
  data.nodes = data.nodes[query];
  data.links = data.links[query];
  if(!data.nodes){ //empty if not defined
    data.nodes = [];
  }
  if(!data.links){
    data.links = [];
  }
  console.log("create");
  var svg = d3.select(el).append('svg')
      .attr('class', 'd3')
      .attr('width', props.width)
      .attr('height', props.height)
      
  this.zoomGroup = svg
    .append("g")
    .attr("class", "zoomGroup");
  const height = svg.node().getBoundingClientRect().height;
  const width = svg.node().getBoundingClientRect().width;

  // this.titleWrap = textwrap().bounds({width: height * (this.titleLengthPercentage / 100), height: 100});

  this.simulation = d3.forceSimulation(data.nodes) //create force simulation for all nodes and links
      .force("link", d3.forceLink(data.links).id(d => d.title).distance(100))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("center", d3.forceCenter(width / 2, height / 2));

  this.simulation.on("tick",this.simulationOnTick.bind(this));


  this.nodes = [new SearchResultNode(this.zoomGroup,width,this.drag,this.simulation,callbackToVisualisation),new TopicNode(this.zoomGroup,width,this.drag,this.simulation,callbackToVisualisation),new CitationNode(this.zoomGroup,width,this.drag,this.simulation,callbackToVisualisation)];

  this.link = this.zoomGroup.append("g") //create group with same styles
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll(".link");

  var zoomHandler = d3.zoom()
    .on("zoom", this.zoomAction.bind(this));
    zoomHandler(svg);
  

  d3Graph.update(el,data);
};
d3Graph.zoomAction = function(){
  this.zoomGroup.attr("transform", d3.event.transform);
}

d3Graph.label = function(d,context){

}
d3Graph.destroy = function(el) {
  // Any clean-up would go here
  // in this example there is nothing to do
};

d3Graph.splitNodes = function(datas,nodeClasses){ //split node into their corresponding classes
  for (const nodeClass of nodeClasses) {
    var nodes = [];
    for (const data of datas) {
      if(nodeClass.equals(data)){
          nodes.push(data);
      }
    }
    nodeClass.set(nodes);
  }
  return nodeClasses;
}

d3Graph.update = function(el,data,query){
  data.nodes = data.nodes[query];
  data.links = data.links[query];
  console.log(data);
  if(!data.nodes){ //empty if not defined
    data.nodes = [];
  }
  if(!data.links){
    data.links = [];
  }
  console.log("d3Graph UPDATE");
  this.nodes = this.splitNodes(data.nodes,this.nodes);
  //console.log(this.nodes);
  this.nodes.forEach(node => node.update());
  // const {maxCitations,minCitations} = this.getMinMaxCitations(data);
  //   console.log("minCitations" + minCitations);
  // console.log("maxCitations" + maxCitations);
    this.link = this.link.data(data.links);
    this.link.exit().remove();
    this.link = this.link.enter()
            .append('line')
            .merge(this.link);


  this.simulation.nodes(data.nodes);
  this.simulation.force("link").links(data.links);
  //this.simulation.alpha(1).restart();

  //invalidation.then(() => simulation.stop());
}

d3Graph.simulationOnTick = function(){
    this.link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      this.nodes.forEach(node => node.node.attr("transform",d => { return "translate(" + d.x + "," + d.y + ")"}));

      
    // this.text
    //   .attr("x", function(d) { return d.x; })
    //   .attr("y", function(d) { return d.y; })
  }
d3Graph.drag = function(simulation){
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    console.log(d.x);
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
   if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}
export default d3Graph