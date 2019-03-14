import React, { Component } from 'react';
import {Container,Col,Row, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText } from 'reactstrap';
import './ResultList.css'
class ResultList extends Component {
  render() {
    if(!this.props.search_results){
      return <div></div>;
    }
    const listGroupItems = [];
    this.props.search_results.map((result, index) => {
      if(result.title){
        listGroupItems.push(
          <ListGroupItem key={index}>
            <ListGroupItemHeading>{result.title}</ListGroupItemHeading>
            <ListGroupItemText>
              {result.description}
            </ListGroupItemText>
          </ListGroupItem>
          )
      }
    });
    return (
      <div>
      <ListGroup flush>
        <ListGroupItem active>
          <ListGroupItemHeading>Selected iten</ListGroupItemHeading>
          <ListGroupItemText>
            explain item
          </ListGroupItemText>
        </ListGroupItem>
      </ListGroup>
        <ListGroup className="ResultList">
          {listGroupItems}
      </ListGroup>
      </div>
    );
  }
}
export default ResultList;