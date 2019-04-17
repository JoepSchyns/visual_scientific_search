
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Switch } from 'react-router-dom';
import history from './history';
import Search from './Search/Search';

render((
    <Router history={history}>
    	<Switch>
      		<Route component={Search}/>
		</Switch>
    </Router>
), document.getElementById('root'));