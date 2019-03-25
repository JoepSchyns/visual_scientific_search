import * as d3 from "d3";

var d3Graph = {};
d3Graph.prevData ={nodes:[],links:[]};
d3Graph.create = function(el, props, data) {

  var svg = d3.select(el).append('svg')
      .attr('class', 'd3')
      .attr('width', props.width)
      .attr('height', props.height);
  /**data = {
  "nodes": [
    {
      "id": "Alternative to mental hospital treatment. II. Economic benefit-cost analysis.",
      "index": 0,
      "x": 355.4456168380194,
      "y": 540.9172396888002,
      "vy": -0.08276031119971376,
      "vx": -0.05438316198058825,
      "fx": null,
      "fy": null
    },
    {
      "id": "Models and helping: naturalistic studies in aiding behavior."
    },
    {
      "id": "Methods for detecting carcinogens and mutagens with the Salmonella/mammalian-microsome mutagenicity test."
    },
    {
      "id": "Alternative to mental hospital treatment. I. Conceptual model, treatment program, and clinical evaluation."
    }
  ],
  "links": [
    {
      "source": "Alternative to mental hospital treatment. II. Economic benefit-cost analysis.",
      "target": "Models and helping: naturalistic studies in aiding behavior.",
      "labelProperty": "search_results"
    },
    {
      "source": "Models and helping: naturalistic studies in aiding behavior.",
      "target": "Methods for detecting carcinogens and mutagens with the Salmonella/mammalian-microsome mutagenicity test.",
      "labelProperty": "search_results"
    },
    {
      "source": "Methods for detecting carcinogens and mutagens with the Salmonella/mammalian-microsome mutagenicity test.",
      "target": "Alternative to mental hospital treatment. I. Conceptual model, treatment program, and clinical evaluation.",
      "labelProperty": "search_results"
    }
  ]
}
*/
  
  const height = svg.node().getBoundingClientRect().height;
  const width = svg.node().getBoundingClientRect().width;

  this.simulation = d3.forceSimulation(data.nodes) //create force simulation for all nodes and links
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("center", d3.forceCenter(width / 2, height / 2));

  this.node = svg.append("g") //create group with same styles
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
    .selectAll(".node"); //TODO dont understand

  this.link = svg.append("g") //create group with same styles
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      
    .selectAll(".link");

  d3Graph.update(el,data);
};


d3Graph.destroy = function(el) {
  // Any clean-up would go here
  // in this example there is nothing to do
};
d3Graph.update = function(el,data){


    this.link = this.link.data(data.links);
    this.link.exit().remove();
    this.link = this.link.enter()
            .append('line')
            .merge(this.link);

    this.node = this.node.data(data.nodes); //set new data
    this.node.exit().remove(); //remove data that is not present anymore

    var newNodes = this.node.enter() //do for new data
      .append('g')
      .attr("class","node")
      .call(this.drag(this.simulation));;

    newNodes.append('circle')
      .attr("r", function(d){
        if(d.type_node == "citation"){
          return 5;
        }

        return 10;
      })
      .attr("fill", "#345340");
      
    newNodes.append('text')
      .attr("text-anchor","middle")
      .text( function (d) { return d.title; });

    this.node = this.node.merge(newNodes); //merge newdata with older items

  this.simulation.on("tick", this.simulationOnTick.bind(this));
  this.simulation.nodes(data.nodes);
  this.simulation.force("link").links(data.links);
  this.simulation.alpha(1).restart();

  //invalidation.then(() => simulation.stop());
}

d3Graph.simulationOnTick = function(){
    this.link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    this.node
        .attr("transform",function(d){ return "translate(" + d.x + "," + d.y + ")";});
    // this.text
    //   .attr("x", function(d) { return d.x; })
    //   .attr("y", function(d) { return d.y; })
  }
d3Graph.drag = function(simulation){
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
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