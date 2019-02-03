require('dotenv').config()

// Req MAL api
const malScraper = require('mal-scraper')

// Other MAL api for scraping Seiyuus
const Mal = require("node-myanimelist")

// nhentai api for checking 6 digit numbers
const nhentai = require("./nhentai.js")

// Req Discord api
const Discord = require('discord.js')
const client = new Discord.Client()

// Discord stuffs
const TOKEN = process.env.TOKEN
const ADMINID = process.env.ADMINID
const NHENTAIENABLE = process.env.NHENTAIENABLE
const PREFIX = '!'

const showRegex = /\<(.+?)\>/
const seiyuuRegex = /\[(.+?)\]/
const mangaRegex = /\{(.+?)\}/
const channelRegex = /\<\#(.+?)\>/
const imageLinkRegex = /(https?:\/\/.*\.(?:png|jpg|gif|jpeg)\??.*)/i
const nhentaiNumbersRegex = /\b([0-9]){5,6}\b/

var verboseReverb = false;

client.on('ready', () => console.log('Mai is ready! <3'))

client.on('error', console.error)

client.on('message', async message => {
    if (message.author.bot) {
        return
    }
    const command = message.content.toLowerCase().split(' ')[0]
    const arguments = message.content.split(' ')
    const guildowner = message.channel.guild.ownerID
    const messageauthor = message.author.id
    arguments.shift()

    if (verboseReverb) {
        console.log("VERBOSE: " + message.content)
        message.channel.send("VERBOSE: " + "```\n" + escapeMarkdown(message.content) + "\n```")
    }

    switch (command) {

        case `${PREFIX}ping`:
            message.reply('I\'m here!')
            return

        case `${PREFIX}whatsmyid`:
            message.reply('Your discord author id is ' + messageauthor)
            return

        case `${PREFIX}debug`:
            if (ADMINID != undefined) {
                if (messageauthor == ADMINID) {
                    handleDebug(arguments, message)
                }
            }
            return

        case `${PREFIX}mal`:
            handleMalQuery(arguments.join(" "), message, true, false)
            return

        case `${PREFIX}7up`:
            handleMalQuery(arguments.join(" "), message, true, true)
            return

        case `${PREFIX}seiyuu`:
            handleSeiyuuQuery(arguments.join(" "), message, true)
            return

        case `${PREFIX}manga`:
            handleMangaQuery(arguments.join(" "), message, true)
            return

        case `${PREFIX}purge`:
            handlePurge(arguments, message, guildowner, messageauthor)
            return

        case `${PREFIX}movechat`:
            handleMoveChat(arguments, message, guildowner, messageauthor)
            return

        case `${PREFIX}delete`:
            handleDeleteMessage(arguments, message, guildowner, messageauthor)
            return

        case `${PREFIX}pin`:
            handlePinMessage(arguments, message, guildowner, messageauthor, true)
            return

        case `${PREFIX}unpin`:
            handlePinMessage(arguments, message, guildowner, messageauthor, false)
            return
        
        case `${PREFIX}nh`:
            var query = arguments.join(" ")
            if(query.length < 0){
                temporaryMessage('Please give me somthing to search', message)
                return
            }else{
                switch(query.length){
                    case 6:
                        handlenhentai(query, message, true)
                        break
                    case 5:
                        handlenhentai(query, message, true)
                        break
                    default:
                        temporaryMessage('I need five or six digits if you want me to look it up for you!', message)
                }
            }
            return
    }

    var matches = message.content.match(showRegex)
    if (matches) {
        var query = matches[1]
        var deletemessage = matches[0] == message.content
        if (query.startsWith("@") || query.startsWith(":") || query.startsWith("#") || query.startsWith("a:")) {
            return
        }
        handleMalQuery(query, message, deletemessage, false)
    }

    var seiyuumatches = message.content.match(seiyuuRegex)
    if (seiyuumatches) {
        var query = seiyuumatches[1]
        var deletemessage = seiyuumatches[0] == message.content
        handleSeiyuuQuery(query, message, deletemessage)
    }

    var mangamatches = message.content.match(mangaRegex)
    if (mangamatches) {
        var query = mangamatches[1]
        var deletemessage = mangamatches[0] == message.content
        handleMangaQuery(query, message, deletemessage)
    }

    if(NHENTAIENABLE != undefined){
        var nhentaimatches = message.content.match(nhentaiNumbersRegex)
        if (nhentaimatches) {
            var query = nhentaimatches
            handlenhentai(query[0], message, false)
        }
    }
})

client.login(TOKEN)

function handleMalQuery(query, message, deletemessage, is7up) {
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

function handlenhentai(query, message, deletemessage){
    nhentai.exists(query).then((exists)=>{
        if(exists){
            nhentai.getTags(query).then((arr)=>{
                var jointagArr = []
                var loliexist = false
                for (var i in arr){
                    jointagArr.push(arr[i].tag + " " + arr[i].count)
                    if(arr[i].tag == 'lolicon'){
                        loliexist = true;
                    }
                }
                message.channel.send('`'+jointagArr.join("` `")+'`')
                if(loliexist){
                    message.channel.send('>>' + query + '\n>>Tags: lolicon\n' + 'FBI OPEN UP!')
                }
                if(deletemessage){
                    message.delete()
                }
            })
        }else{
            message.channel.send('This book does not exist!')
        }
    })
}

function handleSeiyuuQuery(query, message, deletemessage) {
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


function handleMangaQuery(query, message, deletemessage) {
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
            var score = data.score.toString()
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

async function handlePurge(arguments, message, guildowner, messageauthor) {
    if (guildowner == messageauthor || ADMINID == messageauthor) {
        if (arguments.length < 1) {
            temporaryMessage('Please tell Mai-Chan how many messages you want to delete! >a<', message)
            return
        }
        if (!arguments[0]) {
            temporaryMessage('I need numbers!!!', message)
            return
        }
        if (arguments[0] > 10) {
            temporaryMessage('Mai-Chan can only delete up to 10 messages at a time you know!', message)
            return
        }
        if (arguments[0] < 1) {
            temporaryMessage('Mai-Chan deleted 0 messages! None! (maybe have an integer greater than 0 next time?)', message)
            return
        } else {
            let deletedMessages = await message.channel.bulkDelete(parseInt(arguments[0]) + 1, true)
            temporaryMessage(`Mai-Chan deleted ${deletedMessages.size - 1} messages!`, message)
            return
        }
    } else {
        temporaryMessage("Only the Owner of this Guild/Server can use this command", message)
        return
    }
}

async function handleMoveChat(arguments, message, guildowner, messageauthor) {
    if (guildowner == messageauthor || ADMINID == messageauthor) {
        if (arguments.length < 1) {
            temporaryMessage('Please tell Mai-Chan how many messages you want to move! >a<', message)
            return
        }
        if (!arguments[0]) {
            temporaryMessage('I need numbers!!!', message)
            return
        }
        if (arguments[0] > 50) {
            temporaryMessage('Mai-Chan can only move up to 50 messages at a time you know!', message)
            return
        }
        if (arguments[0] < 1) {
            temporaryMessage('Mai-Chan moved 0 messages! None! (maybe have an integer greater than 0 next time?)', message)
            return
        }
        if (arguments[1] == undefined) {
            temporaryMessage('I need to know what channel you want me to move the chat to!', message)
            return
        } else {
            var matches = arguments[1].match(channelRegex)
            if (matches) {
                var specifiedchannel = matches[1]
                if (message.guild.channels.has(specifiedchannel)) {
                    if (message.channel.id == specifiedchannel) {
                        temporaryMessage('The channel you specified is this channel. Please specify a different channel.', message)
                        return
                    }
                    var targetchannel = message.guild.channels.get(specifiedchannel)
                    message.delete()
                        .then(() => {
                            message.channel.fetchMessages({
                                    limit: arguments[0]
                                })
                                .then(async messages => {
                                    var messagearr = [];
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
                                            messagearr.push(itemobj);
                                        } else {
                                            var itemobj = {
                                                embed: true,
                                                embedcontent: item[1].embeds[0]
                                            }
                                            messagearr.push(itemobj);
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
                                    let deletedMessages = await message.channel.bulkDelete(parseInt(arguments[0]), true)
                                    message.channel.send(`Mai-Chan moved ${deletedMessages.size} messages to <#${specifiedchannel}>!`)
                                        .then(msg => {
                                            msg.delete(5000)
                                        })
                                })
                                .catch(console.error);
                        })
                        .catch((err) => {})
                    return
                } else {
                    temporaryMessage('The channel that you sent does not exist on this server.', message)
                    return
                }
            } else {
                temporaryMessage('The channel that you sent seems to be malformed. Please replace the second argument of the command with #`channel`', message)
                return
            }
        }
    } else {
        temporaryMessage("Only the Owner of this Guild/Server can use this command", message)
        return
    }
}

function handleDeleteMessage(arguments, message, guildowner, messageauthor) {
    if (guildowner == messageauthor || ADMINID == messageauthor) {
        message.channel.fetchMessage(arguments[0])
            .then((msg) => {
                msg.delete()
                temporaryMessage("Message has been deleted", message)
            })
            .catch(() => {
                temporaryMessage("That message doesnt seem to exist in this channel. Try again I guess?", message)
            });
    }
}

function handlePinMessage(arguments, message, guildowner, messageauthor, pin) {
    if (guildowner == messageauthor || ADMINID == messageauthor) {
        message.channel.fetchMessage(arguments[0])
            .then((msg) => {
                if (pin) {
                    msg.pin()
                        .then(() => {
                            temporaryMessage("Message has been pinned", message)
                        })
                        .catch(() => {
                            temporaryMessage("I cant seem to pin that message type", message)
                        })
                } else {
                    msg.unpin()
                        .then(() => {
                            temporaryMessage("Message has been unpinned", message)
                        })
                        .catch(() => {
                            temporaryMessage("I cant seem to unpin that message type", message)
                        })

                }
            })
            .catch(() => {
                temporaryMessage("That message doesnt seem to be in this channel. Try again I guess?", message)
            });
    }
}

function handleDebug(arguments, message) {
    if (arguments[0].toLowerCase() == "verbose") {
        verboseReverb = !verboseReverb
        if (verboseReverb) {
            temporaryMessage("Verbose has been turned on", message)
        } else {
            temporaryMessage("Verbose has been turned off", message)
        }
    }
}

function toTweetLength(input) {
    if (input.length <= 280) {
        return input
    }
    return input.slice(0, 280) + "..."
}

function processMangaGenres(input) {
    var genrearr = input.map(m => m.name)
    return "`" + genrearr.join("` `") + "`"
}

function escapeMarkdown(string) {
    var replacements = [
        [/\`\`\`/g, '`​`​`​']
    ]
    return replacements.reduce(
        function (string, replacement) {
            return string.replace(replacement[0], replacement[1])
        }, string)
}

function temporaryMessage(sendstr, message) {
    message.channel.send(sendstr)
        .then(msg => {
            msg.delete(3000)
        })
    message.delete().catch((err) => {})
}