import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Search from './Search/Search';

class App extends Component {
  render() {
    const App = () => (
      <div>
        <Switch>
          <Route exact path='/' component={Search}/>
        </Switch>
      </div>
    )
    return (
      <Switch>
        <App/>
      </Switch>
    );
  }
}

export default App;
