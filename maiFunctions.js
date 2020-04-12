// Req MAL api
const malScraper = require('mal-scraper')

// Other MAL api for scraping Seiyuus
const Mal = require("node-myanimelist")

// nhentai api for checking 6 digit numbers
const nhentai = require("./nhentai.js")

// regex
const channelRegex = /\<\#(.+?)\>/
const imageLinkRegex = /(https?:\/\/.*\.(?:png|jpg|gif|jpeg)\??.*)/i

class MaiAnimeList {
    static handleMalQuery(query, message, deletemessage, is7up) {
        malScraper.getResultsFromSearch(query)
            .then(data => {
                if (is7up) {
                    var above7 = data.filter(show => show.payload.score >= 7)
                    if (is7up && above7.length === 0) {
                        message.channel.send("Mai couldn't find a result that has a score above 7!")
                        return
                    }
                }
                var candidateShow = above7 ? above7[0] : data[0]
                var {
                    name,
                    url
                } = candidateShow
                var {
                    start_year: year,
                    score,
                    status
                } = candidateShow.payload
                malScraper.getInfoFromURL(url)
                    .then(data => {
                        var image = data.picture
                        var genres = "`" + data.genres.join("` `") + "`"
                        var studios = data.studios.join(", ")
                        var {
                            rating,
                            ranked,
                            popularity,
                            synopsis
                        } = data
                        synopsis = toTweetLength(synopsis)
                        message.channel.send({
                            content: url,
                            embed: {
                                title: name,
                                url: url,
                                color: 65508,
                                footer: {
                                    icon_url: message.author.avatarURL,
                                    text: message.author.username + "#" + message.author.discriminator
                                },
                                image: {
                                    url: image
                                },
                                timestamp: new Date(),
                                fields: [{
                                        name: "Synopsis",
                                        value: synopsis,
                                    },
                                    {
                                        name: "Genres",
                                        value: genres,
                                    },
                                    {
                                        name: "Studios",
                                        value: studios,
                                    },
                                    {
                                        name: "Score",
                                        value: score,
                                        inline: true
                                    },
                                    {
                                        name: "Ranked",
                                        value: ranked,
                                        inline: true
                                    },
                                    {
                                        name: "Popularity",
                                        value: popularity,
                                        inline: true
                                    },
                                    {
                                        name: "Rating",
                                        value: rating,
                                    },
                                    {
                                        name: "Year",
                                        value: year,
                                        inline: true
                                    },
                                    {
                                        name: "Status",
                                        value: status,
                                        inline: true
                                    }
                                ]
                            }
                        })
                        if (deletemessage) message.delete().catch((err) => {})
                    })
                    .catch((err) => console.error(err))
            })
            .catch((err) => console.error(err))
    }

    static handlenhentai(query, message, NHCHANNEL) {
        if (NHCHANNEL != undefined) {
            if (NHCHANNEL == message.channel.id) {
                nhquery(query, message)
            }
        } else {
            nhquery(query, message)
        }

        function nhquery() {
            nhentai.exists(query).then((exists) => {
                if (exists) {
                    nhentai.getTags(query).then((arr) => {
                        var jointagArr = []
                        var loliexist = false
                        for (var i in arr) {
                            jointagArr.push(arr[i].tag + " " + arr[i].count)
                            if (arr[i].tag == 'lolicon') {
                                loliexist = true
                            }
                        }
                        message.channel.send('`' + jointagArr.join("` `") + '`')
                        if (loliexist) {
                            message.channel.send('>>' + query + '\n>>Tags: lolicon\n' + 'FBI OPEN UP!')
                        }
                    })
                } else {
                    message.channel.send('This book does not exist!')
                }
            })
        }
    }

    static handleSeiyuuQuery(query, message, deletemessage) {
        Mal.search("person", query, {
            limit: 1,
            Page: 1
        }).then(j => {
            var seiyuuarray = []
            var seiyuuarraylength = j.results.length
            j.results.forEach(person => {
                Mal.person(person.mal_id).then(function (j) {
                    person.popularity = j.member_favorites
                    seiyuuarray.push(person)
                    handlejump()
                })
            })

            function handlejump() {
                if (seiyuuarraylength == seiyuuarray.length) {
                    seiyuuarray.sort(function (a, b) {
                        return b.popularity - a.popularity
                    })
                    var result = seiyuuarray[0]
                    var {
                        name,
                        url,
                        image_url: image
                    } = result
                    var embedobj = {
                        title: name,
                        url: url,
                        color: 16728193,
                        footer: {
                            icon_url: message.author.avatarURL,
                            text: message.author.username + "#" + message.author.discriminator
                        },
                        image: {
                            url: image
                        },
                        timestamp: new Date(),
                        fields: []
                    }

                    Mal.person(result.mal_id).then(j => {
                        var birthday = new Date(Date.parse(j.birthday))
                        var formattedbirthday
                        var birthdayexists = false
                        var bdaymonth = birthday.getMonth() + 1

                        if (birthday.getFullYear()) {

                            formattedbirthday = birthday.getDate() + "/" + bdaymonth + "/" + birthday.getFullYear()
                            birthdayexists = true

                        } else if (birthday.getMonth()) {

                            formattedbirthday = birthday.getDate() + "/" + bdaymonth
                            birthdayexists = true

                        }

                        if (birthdayexists) {
                            embedobj.fields.unshift({
                                name: "Birthday",
                                value: formattedbirthday,
                            })
                        }

                        var about = j.about
                        if (typeof (about) == "string") {
                            about = about.split("\n")
                            for (var element of about) {
                                var clean = element.replace(/(\r\n|\n|\r|\\n)/gm, "").split(/:(.+)/)
                                if (clean.length >= 2) {
                                    embedobj.fields.unshift({
                                        name: clean[0],
                                        value: clean[1]
                                    })
                                }
                            }
                        }
                        message.channel.send({
                            content: url,
                            embed: embedobj
                        })
                        if (deletemessage) message.delete().catch((err) => {})
                    })
                }
            }
        })
    }

    static handleMangaQuery(query, message, deletemessage) {
        Mal.search("manga", query, {
            limit: 1,
            Page: 1
        }).then(j => {
            var {
                title,
                url,
                image_url: image
            } = j.results[0]
            Mal.manga(j.results[0].mal_id).then(data => {
                image = data.image_url
                var genres = processMangaGenres(data.genres)
                var {
                    rank: ranked,
                    popularity,
                    status
                } = data
                if (ranked == null) {
                    ranked = "N/A"
                }
                if (score != null) {
                    var score = data.score.toString()
                } else {
                    score = "N/A"
                }
                
                var synopsis = toTweetLength(data.synopsis)
                message.channel.send({
                    content: url,
                    embed: {
                        title: title,
                        url: url,
                        color: 2817854,
                        footer: {
                            icon_url: message.author.avatarURL,
                            text: message.author.username + "#" + message.author.discriminator
                        },
                        image: {
                            url: image
                        },
                        timestamp: new Date(),
                        fields: [{
                                name: "Synopsis",
                                value: synopsis,
                            },
                            {
                                name: "Genres",
                                value: genres,
                            },
                            {
                                name: "Score",
                                value: score,
                                inline: true
                            },
                            {
                                name: "Ranked",
                                value: ranked,
                                inline: true
                            },
                            {
                                name: "Popularity",
                                value: popularity,
                                inline: true
                            },
                            {
                                name: "Status",
                                value: status,
                                inline: true
                            }
                        ]
                    }
                })
                if (deletemessage) message.delete().catch((err) => {})
            })
        })
    }

    static async handlePurge(args, message, guildowner, messageauthor, ADMINID) {
        if (guildowner == messageauthor || ADMINID == messageauthor) {
            if (args.length < 1) {
                this.temporaryMessage('Please tell Mai-Chan how many messages you want to delete! >a<', message)
                return
            }
            if (!parseInt(args[0])) {
                this.temporaryMessage('I need numbers!!!', message)
                return
            }
            if (args[0] > 10) {
                this.temporaryMessage('Mai-Chan can only delete up to 10 messages at a time you know!', message)
                return
            }
            if (args[0] < 1) {
                this.temporaryMessage('Mai-Chan deleted 0 messages! None! (maybe have an integer greater than 0 next time?)', message)
                return
            } else {
                let deletedMessages = await message.channel.bulkDelete(parseInt(args[0]) + 1, true)
                this.temporaryMessage(`Mai-Chan deleted ${deletedMessages.size - 1} messages!`, message)
                return
            }
        } else {
            this.temporaryMessage("Only the Owner of this Guild/Server can use this command", message)
            return
        }
    }

    static async handleMoveChat(args, message, guildowner, messageauthor, ADMINID) {
        if (guildowner == messageauthor || ADMINID == messageauthor) {
            if (args.length < 1) {
                this.temporaryMessage('Please tell Mai-Chan how many messages you want to move! >a<', message)
                return
            }
            if (!args[0]) {
                this.temporaryMessage('I need numbers!!!', message)
                return
            }
            if (args[0] > 50) {
                this.temporaryMessage('Mai-Chan can only move up to 50 messages at a time you know!', message)
                return
            }
            if (args[0] < 1) {
                this.temporaryMessage('Mai-Chan moved 0 messages! None! (maybe have an integer greater than 0 next time?)', message)
                return
            }
            if (args[1] == undefined) {
                this.temporaryMessage('I need to know what channel you want me to move the chat to!', message)
                return
            } else {
                var matches = args[1].match(channelRegex)
                if (matches) {
                    var specifiedchannel = matches[1]
                    if (message.guild.channels.has(specifiedchannel)) {
                        if (message.channel.id == specifiedchannel) {
                            this.temporaryMessage('The channel you specified is this channel. Please specify a different channel.', message)
                            return
                        }
                        var targetchannel = message.guild.channels.get(specifiedchannel)
                        message.delete()
                            .then(() => {
                                message.channel.fetchMessages({
                                        limit: args[0]
                                    })
                                    .then(async messages => {
                                        var messagearr = []
                                        for (var item of messages) {
                                            var imageLinkMatches = item[1].content.match(imageLinkRegex)
                                            if (item[1].embeds.length == 0 || imageLinkMatches) {
                                                var itemobj = {
                                                    embed: false,
                                                    username: item[1].author.username + "#" + item[1].author.discriminator,
                                                    avatarURL: item[1].author.avatarURL,
                                                    content: item[1].content,
                                                    timestamp: item[1].createdTimestamp,
                                                }
                                                if (imageLinkMatches) {
                                                    itemobj.image = imageLinkMatches[0].split(" ")[0]
                                                }
                                                messagearr.push(itemobj)
                                            } else {
                                                var itemobj = {
                                                    embed: true,
                                                    embedcontent: item[1].embeds[0]
                                                }
                                                messagearr.push(itemobj)
                                            }
                                        }
                                        for (var itemobj of messagearr.reverse()) {
                                            if (!itemobj.embed) {
                                                var embedobj = {
                                                    author: {
                                                        name: itemobj.username,
                                                        icon_url: itemobj.avatarURL
                                                    },
                                                    description: itemobj.content,
                                                    color: 14935344,
                                                    timestamp: new Date(itemobj.timestamp),
                                                }
                                                if (itemobj.image) {
                                                    embedobj.image = {
                                                        url: itemobj.image
                                                    }
                                                }
                                            } else {
                                                embedobj = itemobj.embedcontent
                                            }
                                            targetchannel.send({
                                                content: "",
                                                embed: embedobj
                                            })
                                        }
                                        let deletedMessages = await message.channel.bulkDelete(parseInt(args[0]), true)
                                        message.channel.send(`Mai-Chan moved ${deletedMessages.size} messages to <#${specifiedchannel}>!`)
                                            .then(msg => {
                                                msg.delete(5000)
                                            })
                                    })
                                    .catch(console.error)
                            })
                            .catch((err) => {})
                        return
                    } else {
                        this.temporaryMessage('The channel that you sent does not exist on this server.', message)
                        return
                    }
                } else {
                    this.temporaryMessage('The channel that you sent seems to be malformed. Please replace the second argument of the command with #`channel`', message)
                    return
                }
            }
        } else {
            this.temporaryMessage("Only the Owner of this Guild/Server can use this command", message)
            return
        }
    }

    static handleDeleteMessage(args, message, guildowner, messageauthor, ADMINID) {
        if (guildowner == messageauthor || ADMINID == messageauthor) {
            message.channel.fetchMessage(args[0])
                .then((msg) => {
                    msg.delete()
                    this.temporaryMessage("Message has been deleted", message)
                })
                .catch(() => {
                    this.temporaryMessage("That message doesnt seem to exist in this channel. Try again I guess?", message)
                })
        }
    }

    static handlePinMessage(args, message, guildowner, messageauthor, pin, ADMINID) {
        if (guildowner == messageauthor || ADMINID == messageauthor) {
            message.channel.fetchMessage(args[0])
                .then((msg) => {
                    if (pin) {
                        msg.pin()
                            .then(() => {
                                this.temporaryMessage("Message has been pinned", message)
                            })
                            .catch(() => {
                                this.temporaryMessage("I cant seem to pin that message type", message)
                            })
                    } else {
                        msg.unpin()
                            .then(() => {
                                this.temporaryMessage("Message has been unpinned", message)
                            })
                            .catch(() => {
                                this.temporaryMessage("I cant seem to unpin that message type", message)
                            })

                    }
                })
                .catch(() => {
                    this.temporaryMessage("That message doesnt seem to be in this channel. Try again I guess?", message)
                })
        }
    }

    static handleDebug(args, message) {
        if (args[0].toLowerCase() == "verbose") {
            verboseReverb = !verboseReverb
            if (verboseReverb) {
                this.temporaryMessage("Verbose has been turned on", message)
            } else {
                this.temporaryMessage("Verbose has been turned off", message)
            }
        }
    }

    static temporaryMessage(sendstr, message) {
        message.channel.send(sendstr)
            .then(msg => {
                msg.delete(3000)
            })
        message.delete().catch((err) => {})
    }

}

module.exports = MaiAnimeList

function processMangaGenres(input) {
    var genrearr = input.map(m => m.name)
    return "`" + genrearr.join("` `") + "`"
}

function toTweetLength(input) {
    if (input.length <= 280) {
        return input
    }
    return input.slice(0, 280) + "..."
}