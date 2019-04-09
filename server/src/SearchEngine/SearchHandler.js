import {ELSEVIER_SCOPUS,GOOGLE_SCHOLAR} from '../constants.js' //TODO share with client babel does not compile it at the moment
import Scopus from './scopus';
import Scholar from './scholar';


export const getSearchEngine = (searchEngine) => {
	console.log(Scholar);
	switch(searchEngine){
		case ELSEVIER_SCOPUS:
			return new Scopus();
			break;
		case GOOGLE_SCHOLAR:
			return new Scholar();
			break;
		default:
			throw new Error('SearchEngine ' + searchEngine + 'not implemented');

	}
}
