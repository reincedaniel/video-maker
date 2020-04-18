const readline = require('readline-sync')
function start() {
    const content = {}

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

    console.log(content)
}

start()