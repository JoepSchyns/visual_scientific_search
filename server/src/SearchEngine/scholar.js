import SearchEngine from'./SearchEngine.js'


const RESULTS_PER_PAGE = 10

const GOOGLE_SCHOLAR_URL = 'https://scholar.google.com/scholar?hl=en&q='
const GOOGLE_SCHOLAR_URL_PREFIX = 'https://scholar.google.com'

const ELLIPSIS_HTML_ENTITY = '&#x2026;'
const ET_AL_NAME = 'et al.'
const CITATION_COUNT_PREFIX = 'Cited by '
const RELATED_ARTICLES_PREFIX = 'Related articles'

const STATUS_CODE_FOR_RATE_LIMIT = 503
const STATUS_MESSAGE_FOR_RATE_LIMIT = 'Service Unavailable'
const STATUS_MESSAGE_BODY = 'This page appears when Google automatically detects this.requests coming from your computer network which appear to be in violation of the <a href="//www.google.com/policies/terms/">Terms of Service</a>. The block will expire shortly after those this.requests stop.';
// regex with thanks to http://stackoverflow.com/a/5917250/1449799
const RESULT_COUNT_RE = /\W*((\d+|\d{1,3}(,\d{3})*)(\.\d+)?) results/;
export default class Scholar extends SearchEngine {
  constructor(){
    super();
    this.cheerio = require('cheerio');
    this.striptags = require('striptags')
    let Bottleneck = require("bottleneck");
    this.limiter = new Bottleneck({
    reservoir: 100, // initial value
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 60 * 10000, // must be divisible by 250
      // also use maxConcurrent and/or minTime for safety
    maxConcurrent: 1,
    minTime: 300

    });
    // 1 per 200 ms ~= 5/s per
    // https://developers.google.com/webmaster-tools/search-console-api-original/v3/limits

    // const this.limiter.schedule = throttledQueue(100, 100000,false)

  }

  //sdfsdf

  scholarResultsCallback(resolve, reject){
    console.log("scholarResultsCallback");
    return (error, response, html) => {
      if (error) {
        reject(error)
      } else if (response.statusCode !== 200) {
        if (response.statusCode === STATUS_CODE_FOR_RATE_LIMIT && response.statusMessage === STATUS_MESSAGE_FOR_RATE_LIMIT && response.body.indexOf(STATUS_MESSAGE_BODY) > -1) {
          reject(new Error('you are being rate-limited by google. you have made too many this.requests too quickly. see: https://support.google.com/websearch/answer/86640'))
        } else {
          reject(new Error('expected statusCode 200 on http response, but got: ' + response.statusCode))
        }
      } else {
        let $ = this.cheerio.load(html)

        let results = $('.gs_r')
        let resultCount = 0
        let nextUrl = ''
        let prevUrl = ''
        if ($('.gs_ico_nav_next').parent().attr('href')) {
          nextUrl = GOOGLE_SCHOLAR_URL_PREFIX + $('.gs_ico_nav_next').parent().attr('href')
        }
        if ($('.gs_ico_nav_previous').parent().attr('href')) {
          prevUrl = GOOGLE_SCHOLAR_URL_PREFIX + $('.gs_ico_nav_previous').parent().attr('href')
        }

        let processedResults = []
        results.each((i, r) => {

          $(r).find('.gs_ri h3 span').remove()
          let title = $(r).find('.gs_ri h3').text().trim()
          let url = $(r).find('.gs_ri h3 a').attr('href')
          let authorNamesHTMLString = $(r).find('.gs_ri .gs_a').html()
          let etAl = false
          let etAlBegin = false
          let authors = []
          let description = $(r).find('.gs_ri .gs_rs').text()
          let footerLinks = $(r).find('.gs_ri .gs_fl a')
          let citedCount = 0
          let citedUrl = ''
          let relatedUrl = ''
          let pdfUrl = $($(r).find('.gs_ggsd a')[0]).attr('href')

          const text = $(footerLinks).text();
          const index = text.indexOf(CITATION_COUNT_PREFIX);
          //console.log("index " + index)
          if(index >= 0) {
            citedCount = parseInt($(footerLinks).text().substr(CITATION_COUNT_PREFIX.length).match(/\d+/g)[0]);
          }
          //console.log(citedCount);
          if ($(footerLinks[0]).attr &&
            $(footerLinks[0]).attr('href') &&
            $(footerLinks[0]).attr('href').length > 0) {
            citedUrl = GOOGLE_SCHOLAR_URL_PREFIX + $(footerLinks[0]).attr('href')
          }
          if (footerLinks &&
            footerLinks.length &&
            footerLinks.length > 0) {
           

            if ($(footerLinks[1]).text &&
              $(footerLinks[1]).text().indexOf(RELATED_ARTICLES_PREFIX) >= 0 &&
              $(footerLinks[1]).attr &&
              $(footerLinks[1]).attr('href') &&
              $(footerLinks[1]).attr('href').length > 0) {
              relatedUrl = GOOGLE_SCHOLAR_URL_PREFIX + $(footerLinks[1]).attr('href')
            }
          }
          if (authorNamesHTMLString) {
            let cleanString = authorNamesHTMLString.substr(0, authorNamesHTMLString.indexOf(' - '))
            if (cleanString.substr(cleanString.length - ELLIPSIS_HTML_ENTITY.length) === ELLIPSIS_HTML_ENTITY) {
              etAl = true
              cleanString = cleanString.substr(0, cleanString.length - ELLIPSIS_HTML_ENTITY.length)
            }
            if (cleanString.substr(0, ELLIPSIS_HTML_ENTITY.length) === ELLIPSIS_HTML_ENTITY) {
              etAlBegin = true
              cleanString = cleanString.substr(ELLIPSIS_HTML_ENTITY.length + 2)
            }
            let htmlAuthorNames = cleanString.split(', ')
            if (etAl) {
              htmlAuthorNames.push(ET_AL_NAME)
            }
            if (etAlBegin) {
              htmlAuthorNames.unshift(ET_AL_NAME)
            }
            authors = htmlAuthorNames.map(name => {
              let tmp = this.cheerio.load(name)
              let authorObj = {
                name: '',
                url: ''
              }
              if (tmp('a').length === 0) {
                authorObj.name = this.striptags(name)
              } else {
                authorObj.name = tmp('a').text()
                authorObj.url = GOOGLE_SCHOLAR_URL_PREFIX + tmp('a').attr('href')
              }
              return authorObj
            })
          }

          processedResults.push({
            title: title,
            url: url,
            authors: authors,
            description: description,
            citedCount: citedCount,
            citedUrl: citedUrl,
            relatedUrl: relatedUrl,
            pdf: pdfUrl
          })
        })
        let resultsCountString = $('#gs_ab_md').text()
        if (resultsCountString && resultsCountString.trim().length > 0) {
          let matches = RESULT_COUNT_RE.exec(resultsCountString)
          if (matches && matches.length > 0) {
            resultCount = parseInt(matches[1].replace(/,/g, ''))
          } else {
            resultCount = processedResults.length
          }
        } else {
          resultCount = processedResults.length
        }

        resolve({
          results: processedResults,
          count: resultCount,
          nextUrl: nextUrl,
          prevUrl: prevUrl,
          next: () => {
            let p = new Promise((resolve, reject) => {
              this.limiter.schedule(() => {
                  var requestOptions = {
                    jar: true,
                  }
                  requestOptions.url = nextUrl
                  this.request(requestOptions, this.scholarResultsCallback(resolve, reject))
              })
            })
            return p
          },
          previous: () => {
            let p = new Promise((resolve, reject) => {
              this.limiter.schedule(() => {
                  var requestOptions = {
                    jar: true
                  }
                  requestOptions.url = prevUrl
                  this.request(requestOptions, this.scholarResultsCallback(resolve, reject))
              })
            })
            return p
          }
        })
      }
    }
  }
  search(query) {
  	console.log("new search: " + query + " " + new Date().toUTCString());
    let p = new Promise((resolve, reject) => {
    	console.log("new promise: " + query + " " + new Date().toUTCString());
      this.limiter.schedule(() => {
      	console.log("new throttle: " + query + " " + new Date().toUTCString());
          var requestOptions = {
            jar: true
          }
          requestOptions.url = encodeURI(GOOGLE_SCHOLAR_URL + query)
          this.request(requestOptions, this.scholarResultsCallback(resolve, reject))
        })
      })
    return p
  }

  all(query){
    return this.search(query)
      .then(resultsObj => {
        //  eg n=111 but i have 10 already so 101 remain,
        let remainingResultsCount = resultsObj.count - resultsObj.results.length
        if (remainingResultsCount > 0) {
          //  pr = 10
          let pagesRemaining = remainingResultsCount / RESULTS_PER_PAGE
          let pageNumbers = []
          for (var i = 1; i <= pagesRemaining + 1; i++) {
            pageNumbers.push(i)
          }
          return Promise.all(pageNumbers.map(i => {
            return this.search(query + '&start=' + i * RESULTS_PER_PAGE)
              .then(laterPagesResultsObj => {
                return laterPagesResultsObj.results
              })
          }))
            .then(remainingResultsArr => {
              let allResults = resultsObj.results.concat(remainingResultsArr.reduce((a, b) => a.concat(b)))
              resultsObj.results = allResults
              resultsObj.nextUrl = null
              resultsObj.next = null
              resultsObj.prevUrl = null
              resultsObj.prev = null
              return resultsObj
            })
        }
      })
  }
}