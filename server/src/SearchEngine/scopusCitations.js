import Scopus from './scopus';


export default class ScopusCitations extends Scopus{
	constructor(){
		super();
	}

	search(){
		searchPromise = super.search();
		searchPromise.then(results =>{
			return Promise.all(results.map(paper => lookupCitations(paper)));
		});
	}

	lookupCitations(paper){
		return new Promise((resolve, reject) => {
			const options = {
			  url: "https://api.elsevier.com/content/abstract/citations",
			  headers: {
			    Accept: 'application/json',
			    'X-ELS-APIKey': '6435d22442c0af3c7c804dc041e92622'
			  },
			  qs:{
			  	doi:paper.dio,
			  	sort:'relevancy'
			  }
			};
			this.request(options, this.lookupCitationsCallback(resolve, reject))
		}
	}
	lookupCitationsCallback(resolve,reject){
		return (error, response, html) => {
    		console.log("lookupCitationsCallback")
    		if(error){
    			console.log(error);
    			reject(error);
    		}

    		if(response){
    			html = JSON.parse(html.toString());
    			var results = html['abstract-citations-response'].entry;
    			console.log(results.length);
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
}