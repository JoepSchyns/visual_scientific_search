import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Search from './Search/Search';


class App extends Component {//for some reason with cookies this is an object not an function
  render() {
    const App = () => (
      <div>
          <Search/> 
      </div>
    )
    return (
      <Switch>
        
          <Route default path='/' component={App}/>

        
      </Switch>

    );
  }
}

export default App;
