let Scroll = (function () {
	var elasticsearch = require('elasticsearch');

	var client = new elasticsearch.Client({
	  host: 'localhost:9200'
	});
	client.ping({
	  // ping usually has a 3000ms timeout
	  requestTimeout: 1000
	}, function (error) {
	  if (error) {
	    console.trace('elasticsearch cluster is down!');
	  } else {
	    console.log('elasticsearch cluster is up!');
	  }
	});

	function scroll_query_init(query,time,size,hit_alter_function){
		return new Promise((resolve, reject) => {
			console.log("scroll_query_init");
			client.search({
			  	index: 'search',
			  	type: 'semanticscholar2',
			  	size:size,
			  	scroll: time,//1h
			 	body: query
			})
			.then(response => 
				resolve(scroll_query(query,time,hit_alter_function,response,0)))
			.then(response => {
				resolve(response);
			}).catch(error =>{
				console.log(error);
				reject(error);
			})
		});
	}
	function scroll_query(query,time,hit_alter_function,response,count){
		count += response.hits.hits.length;
		console.log("scroll_query");
		console.log("progress: " + (count / response.hits.total) * 100 + "%");
		var i = 0;		
		return Promise.all(
			response.hits.hits.map(
				hit => hit_alter_function(hit,i++)))
		.then(results => {
			//console.log("iterate");
			//console.log(results);
			if(response.hits.total !== count){ //another iteration is needed
				return Promise.resolve(client.scroll({
				  scroll_id: response._scroll_id,
				  scroll: time
				})
				.then(response => {
					// console.log("response");
					// console.log(response);
					return Promise.resolve(scroll_query(query,time,hit_alter_function,response,count));
				}).catch(reject =>{
					console.log("reject scroll_query");
					return Promise.reject(reject);
				}));
			}else{
				return Promise.resolve(count);
			}
		}).catch(error =>{
				console.log(error);
				return Promise.reject(error);
			})

	}

  return {
    query: scroll_query_init
  }
})()

module.exports = Scroll
