import React, { Component } from 'react';
import { IconContext } from "react-icons";
import { MdSchool,MdFolder,MdInsertChart } from 'react-icons/md' //https://www.npmjs.com/package/react-icons
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  Container,
  Row,
  Col,
  } from 'reactstrap';

import './SearchNavbar.css'

import QueryInput from './QueryInput/QueryInput.js';

class SearchNavbar extends Component{
  constructor(props){
    super(props);

    this.state = {
      isOpen: false,
      largeHeader: true
    };
  }

  toggle= () =>{
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  callbackFromQueryInput = (dataFromChild) => {
    if(dataFromChild.query && this.state.largeHeader){ //first query has been send
      this.setState({
        largeHeader: false
      });
    }
    if(dataFromChild.query){
      this.setState({
        query:dataFromChild.query
        })      
    }

    this.props.callbackToSearch(dataFromChild); //passdata
  }


  render(){
    return (
      
      <div>
        <Navbar color="light" light expand="md">
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav fill className="ml-auto" navbar>
              <NavItem className="searchInput">
                { this.state.largeHeader ? null : <QueryInput callbackToSearchBar={this.callbackFromQueryInput} query={this.state.query}/> }
              </NavItem>
              <IconContext.Provider value={{ className: 'navbar-icons' }}>
              <NavItem>
                <NavLink href="https://github.com/reactstrap/reactstrap"><MdSchool  color={"white"}/></NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://github.com/reactstrap/reactstrap"><MdFolder color={"white"}/></NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://github.com/reactstrap/reactstrap"><MdInsertChart  color={"white"}/></NavLink>
              </NavItem>
              </IconContext.Provider>
            </Nav>
          </Collapse>  
        </Navbar>
      <Collapse isOpen={this.state.largeHeader}>
        <Row className="init justify-content-center">
          <Col sm="6" className="align-self-center">
            <h1 className="text-center">Science Space</h1>
            <QueryInput callbackToSearchBar={this.callbackFromQueryInput}/>
          </Col>
        </Row>
      </Collapse>
      </div>
    )
  }
}

export default SearchNavbar;