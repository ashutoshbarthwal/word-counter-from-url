const wordService =  require('./word-calculator')
const DOCUMENT_URL = 'http://norvig.com/big.txt'
const DOCUMENT_FILE_NAME = 'big.txt'
const OUTPUT_FILE = 'big.json'
const TOP_WORDS = 10
const fs = require('fs');
// Download the file
console.log('Document Fetching...')

wordService.fetchDocument(DOCUMENT_URL,DOCUMENT_FILE_NAME).then((result)=>{
    console.log('Document Fetched')
    wordService.processDocument(DOCUMENT_FILE_NAME,TOP_WORDS).then((result)=>{
        //  console.log('Processing Documents',result)
        topwords = result
        promises = []
        for(var i=0;i<topwords.length;i++){
            console.log(topwords[i])
            promises[i]  = wordService.collectDetails(topwords[i])
        }
        Promise.all(promises).then(values => { 
            console.log(JSON.stringify(values))
            fs.writeFile(OUTPUT_FILE, JSON.stringify(values),function(err, result) {
                if(err) console.log('error', err);
              });
        });
    })
})