const express = require('express');
const path = require('path');


import MyWebSocket from './MyWebSocket'
const myWebSocket = new MyWebSocket();


console.log(require("os").userInfo());

//this is an test
const app = express();
const bodyParser  =  require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const db = require('./db/db');

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));


// const WebSocket = require('ws');
 
// const wss = new WebSocket.Server({ port: 1818 });
 

// An api endpoint that returns a short list of items
app.post('/api/search', (req,res) => {
	res.setHeader('Content-Type', 'application/json');
	const content = req.body;
	const query = content.query;
	//console.log(query);

	
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);