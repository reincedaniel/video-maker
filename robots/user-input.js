const readline = require('readline-sync')

function userInput(content) {

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()


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

module.exports = userInput