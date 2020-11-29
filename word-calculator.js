const axios = require('axios');
const API_KEY = 'dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf'
const LOOKUP_URL = `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${API_KEY}&lang=en-en`

const fs = require('fs');

module.exports = {
    collectDetails : async(word) => new Promise((resolve,reject)=>{
        axios.get(LOOKUP_URL,{params:{text:word.word}})
        .then(function (response) {
            if((response.data.def).length > 0){
                synonyms = []
                if(response.data.def[0]['tr'] != undefined){
                    translation  = response.data.def[0]['tr']
                    synonyms = translation.map(element => {
                        if (element.syn != undefined){
                            return element.syn
                        }else{
                            return []
                        }
                    });
                }
                
                wordData = {
                    word:word.word,
                    output:{
                        count : word.output.count,
                        pos : response.data.def[0].pos,
                        synonyms : synonyms
                        }
                    }
            }else{
                wordData = {
                    word:word.word,
                            output:{
                                count : word.output.count,
                                pos : null,
                                synonyms : null
                                }
                }
            }
            
            // console.log( wordData)
            resolve(wordData)
            done()
        })
        .catch(function (error) {
            wordData = {
                word:word.word,
                        output:{
                            count : word.output.count,
                            pos : null,
                            synonyms : null
                            }
            }
            reject(wordData)
        })
    }),

    fetchDocument :  async (url,filename) => new Promise((resolve,reject)=>{
        fs.exists(filename, function(exists) { 
            if (!exists) { 
                axios({
                    method: 'get',
                    url: url,
                    responseType: 'stream'
                  })
                    .then(function (response) {
                      response.data.pipe(fs.createWriteStream(filename))
                    });
            }else{
                console.log(`${filename} already exists`)
            }
          });
        
        resolve(1)
    }),

    processDocument : async (filename,topWord=10,format='UTF-8') => new Promise((resolve,reject)=>{
        const data = fs.readFileSync(filename, format);
        const wordArray = data.split(/\s+/g);
        const wordStats = []
        for (var i = 0; i < wordArray.length; i++) {
            const word = wordArray[i].toLowerCase().replace(/[,.?!]+/, '');
            if (!word.length) {
                continue;
            }
            if (wordStats[word] === undefined) {
                wordStats[word] = 1;
            }
            else {
                wordStats[word]++;
            }
        }
        const sortedWordStatsKeys = Object.keys(wordStats).sort(function (a, b) {
            return wordStats[b] - wordStats[a];
        });
        const topWords = [];
            for (var i = 0; i < sortedWordStatsKeys.length; i++) {
                const key = sortedWordStatsKeys[i];
                topWords[i] = {word:key,output:{count:wordStats[key]}}
            }
        resolve(topWords.slice(0,topWord))
    })

}
