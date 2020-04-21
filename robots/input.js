const readline = require('readline-sync')
const state = require('./state.js')


function robot() {
    const content = {
        maximumSentences: 7
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    state.save(content)

    function askAndReturnSearchTerm() {
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of ']
        const selectedPrefixeIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixeText = prefixes[selectedPrefixeIndex]

        return selectedPrefixeText
    }

}

module.exports = robot