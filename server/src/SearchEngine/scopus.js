import SearchEngine from'./SearchEngine.js'

export default class Scopus extends SearchEngine{
  constructor(){
    super();
	}
	search(query){
		return new Promise((resolve, reject) => {
			const options = {
			  url: "https://api.elsevier.com/content/search/scopus",
			  headers: {
			    Accept: 'application/json',
			    'X-ELS-APIKey': '6435d22442c0af3c7c804dc041e92622'
			  },
			  qs:{
			  	query:query,
			  	view:"COMPLETE",
			  	count:5,
			  	sort:'relevancy'
			  }
			};
			this.request(options, this.resultsCallback(resolve, reject))
		});
	}
	resultsCallback(resolve,reject){
		console.log("scholarResultsCallback");
    	return (error, response, html) => {
    		console.log("werwerw")
    		if(error){
    			console.log(error);
    			reject(error);
    		}

    		if(response){
    			html = JSON.parse(html.toString());
    			var results = html['search-results'].entry;
    			console.log(results.length);
    			results = this.scopusToScholar(results);
    			this.cleanKeys(results)
    			.then(results =>{
    				resolve({results:results});
    			});
    			
    		}else{
    			console.log("error empty response");
    			reject();
    		}
    	}
	}

	cleanKeys(json){ //clean key to look like scholar keys //TODO nested array
		return new Promise((resolve, reject) => {
			if(Array.isArray(json)){
				json.forEach((element,i) => {
				  json[i] = this.cleanKeys(element);
				});
				return resolve(Promise.all(json));
			}
			var cleanedOb = {};
			for(const key in json){
				var value = json[key];
				if((typeof value === "object") && (value !== null)){
					//value = this.cleanKeys(value); //TODO
					value = value;
				}
				var splitKey = key.split(':');
				if(splitKey.length > 1){
					cleanedOb[splitKey[splitKey.length -1]] = value;//rename original key
				 	continue;
				}

				cleanedOb[key] = value;

			}
			resolve(cleanedOb);
		});

	}
	scopusToScholar(json){
		console.log(Array.isArray(json));
		return json.map((element,i) => {
		  element = this.changePropertyName(element,"author","authors");
		  if(element.authors && element.authors.length > 0){
		  	element.authors = element.authors.map(author => this.changePropertyName(author,"authname","name"));
		  }
		  return element;
		});
		
	}
	changePropertyName(object,oldName,newName){
		const value = object[oldName];
		object[newName] = value;
		delete object[oldName];
		console.log(object);
		return object;

	}
}