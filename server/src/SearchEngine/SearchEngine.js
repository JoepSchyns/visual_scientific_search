export default class SearchEngine{
	 constructor(){
	 	var r = require('request')
	    this.request = require('cached-request')(r);
	    this.request.setCacheDirectory("/var/www/joepschyns.me/public_html/search/server/tmp/cache/");
	    this.request.setValue('ttl', 1000 * 60 * 48);
	}
	search(query) {
		throw new Error('Search not implemented');
	}
}