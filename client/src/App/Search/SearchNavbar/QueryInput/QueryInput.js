import React, { Component } from 'react';
import {ELSEVIER_SCOPUS,GOOGLE_SCHOLAR} from 'App/constants.js'
import {MdSearch} from 'react-icons/md' //https://www.npmjs.com/package/react-icons
import {
  Row,
  Button,
  Form,
  FormGroup,InputGroup,InputGroupAddon, Input, 
  DropdownToggle,
  Dropdown,
  DropdownItem,
  DropdownMenu} from 'reactstrap';
import ReactDOM from 'react-dom';
import './QueryInput.css'
import Websocket from 'react-websocket';

class QueryInput extends Component {
    constructor(props){
      super(props);
      console.log(props);
    this.state = {
      searchEngine:props.searchEngine || GOOGLE_SCHOLAR,//set default search engine
      dropdownOpen:false 
    };
  }
  componentDidMount = () => { //select input field on mount
    // console.log("componentDidMount");
    const domElement = ReactDOM.findDOMNode(this);
    const input = domElement.querySelector("#query")
    input.focus();
    input.select();
  }

  toggleDropdown= () =>{
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }
  selectSearchEngine = (event) => {
    this.setState({searchEngine:event.currentTarget.dataset.search_engine});
    this.props.callbackToSearchBar({searchEngine:this.state.searchEngine}); 
    console.log(event.currentTarget.dataset);
    console.log(event.currentTarget.dataset.search_engine);
  } 

  onHandleChange = (event) =>{
    console.log(event.target.value);
  }
  handleData = (data) =>{
      let result = JSON.parse(data);
      console.log(result);
      this.props.callbackToSearchBar(result);     //passdata
  }
  handleOpen = ()  =>{
    console.log("connected:)");
  }
  handleClose = () =>{
    console.log("disconnected:(");
  }

  sendMessage = (message) =>{
    this.refWebSocket.sendMessage(message);
  }
  onFormSubmit= (event) =>{ ///https://googlechrome.github.io/samples/fetch-api/fetch-post.html
    event.preventDefault();
    event.stopPropagation();//prevent page for reloading after submit not needed
    const data = new FormData(event.target);
    const query = data.get('query') || this.props.query;

    this.props.callbackToSearchBar({query:query,new_query:true}); 
    this.sendMessage(JSON.stringify({ query: query,searchEngine:this.state.searchEngine}));
  }
  render(){
    return(
      <div className="w-100">
      <Row>
        <Form className="w-100" onSubmit={this.onFormSubmit}>
          <FormGroup >
            <InputGroup>
              <Input 
                id="query"
                name="query"
                onChange={this.onHandleChange}
                placeholder={this.props.query}
                type="text"
              />
              <InputGroupAddon addonType="prepend"><Button type="submit"><MdSearch  color={"white"}/></Button></InputGroupAddon>   
            </InputGroup>
          </FormGroup>   
        </Form>
      </Row>
      <Row>
        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
          <DropdownToggle caret>
            Search engine
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem data-search_engine={GOOGLE_SCHOLAR} onClick={this.selectSearchEngine} active={this.state.searchEngine === GOOGLE_SCHOLAR}>Google Scholar</DropdownItem>
            <DropdownItem data-search_engine={ELSEVIER_SCOPUS} onClick={this.selectSearchEngine} active={this.state.searchEngine === ELSEVIER_SCOPUS}>Elsevier Scopus</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Row>
        <Websocket url='ws://joep.space:1818/'
          onMessage={this.handleData}
          onOpen={this.handleOpen} onClose={this.handleClose}
          reconnect={true} debug={true}
          ref={
            Websocket => {
              this.refWebSocket = Websocket;
            }                         
          }
          />

      </div>
    )
  }
}

export default QueryInput;