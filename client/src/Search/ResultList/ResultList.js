import React, { Component } from 'react';
import {ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText} from 'reactstrap';
import './ResultList.css'
const MAX_LENGTH_DESCRIPTION = 280;
class ResultList extends Component {
  render() {
    if(!this.props.search_results){
      return <div></div>;
    }
    const Authors = ({authors}) => {
      var ar = "";
      authors.forEach((author, index) => {
        if(author.name){
          ar += cleanText(author.name) + ((index !== authors.length -1) ? ", ": "");
        }
      });
      return <div className={"authors"}>{ar}</div>
    }
    function shortenText(input,maxLength){
      return(input.length > maxLength) ? input.substr(0, maxLength-1) + '...' : input;
    }
    function cleanText(input){
      return htmlDecode(input).replace(/[\u{0080}-\u{FFFF}]/gu,"");
    }
    function htmlDecode(input){
      var e = document.createElement('div');
      e.innerHTML = input;
      return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }
    const ListItem = ({key, title,url,description,authors}) => {
      return(
          <ListGroupItem index={key}>
            <ListGroupItemHeading>
                <a href={url}>{title}</a>
            </ListGroupItemHeading>
            <Authors authors={authors}/>
            <ListGroupItemText>
              {description}
            </ListGroupItemText>
          </ListGroupItem>
      )};
    const ListItems = () => {
      var ar = [];
      this.props.search_results.forEach((result, index) => {
        if(result.title){
          ar.push((<ListItem authors={result.authors} key={result.title} title={result.title} url={result.url} description={shortenText(cleanText(result.description),MAX_LENGTH_DESCRIPTION)}/>));
        }
      });
      return ar;
    }

    return (
      <div>
      <ListGroup flush>
        <ListGroupItem active>
          <ListGroupItemHeading>{this.props.selected_result.title}</ListGroupItemHeading>
          <ListGroupItemText>
            {this.props.selected_result.description}
          </ListGroupItemText>
        </ListGroupItem>
      </ListGroup>
        <ListGroup className="ResultList">
          <ListItems/>
      </ListGroup>
      </div>
    );
  }
}
export default ResultList;