import React, { Component } from 'react';
import { IconContext } from "react-icons";
import {MdSearch} from 'react-icons/md' //https://www.npmjs.com/package/react-icons
import {
  Button,
  Form,
  FormGroup,InputGroup,InputGroupAddon, Label, Input, FormText } from 'reactstrap';

import './QueryInput.css'
import Websocket from 'react-websocket';

class QueryInput extends Component {
    onHandleChange = (event) =>{
    console.log(event.target.value);
  }
  handleData = (data) =>{
      let result = JSON.parse(data);
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
    event.stopPropagation();
    const data = new FormData(event.target);
    const query = data.get('query');
    console.log(query);
    // fetch('/api/search')
    // .then(res => res.json())
    // .then(list => {
    //       console.log(list);
    // })
    this.props.callbackToSearchBar({query:query,new_query:true}); 
    this.sendMessage(JSON.stringify({ query: query}));
    // fetch('/api/search', {
    //   method: 'post',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     query: query,
    //     secondParam: 'yourOtherValue',
    //   }),
    // }).then((response) => {console.log(response)})
    // // .then((responseJson) => {
    // //   console.log(responseJson);
    // //   this.props.callbackToSearchBar({response:responseJson});     //passdata
    // // })
    // .catch((error) => {
    //   this.props.callbackToSearchBar({error:error}); 
    //   console.error(error);
    // });
  }
  render(){
    return(
      <div>
      <Form onSubmit={this.onFormSubmit}>
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
                <Websocket url='ws://joep.space:1818/'
                  onMessage={this.handleData}
                  onOpen={this.handleOpen} onClose={this.handleClose}
                  reconnect={true} debug={true}
                  ref={Websocket => {
                  this.refWebSocket = Websocket;
}                         }/>
      </div>
    )
  }
}

export default QueryInput;