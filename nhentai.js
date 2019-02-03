const request = require('superagent')
const cheerio = require('cheerio')

class nHentai {
    static getTags(id) {
        return new Promise((resolve, reject) => {
            request
                .get('https://nhentai.net/g/' + id)
                .then(res => {
                    const $ = cheerio.load(res.text)
                    const tags = $("a[href^='/tag/']")
                    var tagArr = []
                    for (var key in tags){
                        if(!isNaN(key)){
                            var children = tags[key].children
                            if(typeof children == 'object'){
                                var tag = children[0].data.trim()
                                var count = children[1].children[0].data.trim()
                                var tagobj = {tag, count}
                                tagArr.push(tagobj)
                            }
                        }
                    }
                    resolve(tagArr)
                })
                .catch(reject)
        })
    }

    static exists(id) {
        return new Promise((resolve, reject) => {
            request
                .head('https://nhentai.net/g/' + id)
                .then(res => resolve(true))
                .catch(err => {
                    resolve(false)
                    return
                })
        })
    }
}

module.exports = nHentai
