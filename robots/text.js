const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json')
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json')

const fs = require('fs');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
 
const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: watsonApiKey.apikey }),
  version: '2018-04-05',
  url: watsonApiKey.url
});

const state = require('./state.js')

async function robot() {

    const content = state.load()

    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey.apiKey)
        const wikiAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300")
        const wikipediaResponse = await wikiAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBalnkLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        
        content.sourceContentSanitized = withoutDatesInParentheses
    
        function removeBalnkLinesAndMarkdown(text){
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line)=>{
                if(line.trim().length === 0 || line.trim().startsWith('=')) {
                   return false 
                }
                return true
            })
            return withoutBlankLinesAndMarkdown.join(' ')
            
        }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }

    }

    function breakContentIntoSentences(content){
        content.sentences = []
        
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence)=>{
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    function limitMaximumSentences(content) {
      content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content) {
      for(const sentence of content.sentences) {
        sentence.keywords = await fecthWatsonAndReturnKeywords(sentence.text)
      }
    }

    async function fecthWatsonAndReturnKeywords(sentence) {
      return new Promise((resolve, reject)=>{
        nlu.analyze(
        {
          text: sentence,
          features: {
            keywords: {}
          }
        }, (error, response)=>{
          if(error){
            throw error
          }

          const keywords = response.result.keywords.map((keyword)=>{
            return keyword.text
          })
          resolve(keywords)
        })
        
      })
    }


}

module.exports = robot