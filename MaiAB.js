// Req MAL api
const malScraper = require('mal-scraper')

// Other MAL api for scraping Seiyuus
const Mal = require("node-myanimelist")

// Req Discord api
const Discord = require('discord.js')
const client = new Discord.Client()

// Discord stuffs
const TOKEN = '<-- Enter Your Bot Token Here! -->'
const PREFIX = '!'

client.on('ready', () => {
    console.log('Mai is ready! <3')
})

client.on('error', console.error)

client.on('message', async message => {
    if (message.author.bot) { return }
    const command = message.content.toLowerCase().split(' ')[0]
    const arguments = message.content.split(' ')
    const guildowner = message.channel.guild.ownerID
    const messageauthor = message.author.id
    arguments.shift()
    if (command == `${PREFIX}ping`) return message.reply('I\'m here!')
    if (command == `${PREFIX}mal`) handleMalQuery(arguments.join(" "), message, true, false)
    if (command == `${PREFIX}7up`) handleMalQuery(arguments.join(" "), message, true, true)
    if (command == `${PREFIX}seiyuu`) handleSeiyuuQuery(arguments.join(" "), message, true)
    if (command == `${PREFIX}purge`) {
        if (guildowner == messageauthor) {
            if (arguments.length < 1) {
                return message.channel.send('Please tell Mai-Chan how many messages you want to delete! >a<')
            }
            if (arguments[0] > 10) {
                return message.channel.send('Mai-Chan can only delete up to 10 messages at a time you know!')
            } else {
                let deletedMessages = await message.channel.bulkDelete(arguments[0], true)
                return message.channel.send(`Mai-Chan Deleted ${deletedMessages.size} messages!`)
            }
        } else {
            return message.channel.send("Only the Owner of this Guild/Server can use this command")
        }
    }

    var matches = message.content.match(/\<(.+?)\>/)
    if (matches) {
        var query = matches[1]
        var deletemessage = false
        if (query.startsWith("@") || query.startsWith(":") || query.startsWith("#")) return
        if (matches[0] == message.content) {
            deletemessage = true
        }
        handleMalQuery(query, message, deletemessage, false)
    }

    var seiyuumatches = message.content.match(/\[(.+?)\]/)
    if (seiyuumatches) {
        var query = seiyuumatches[1]
        var deletemessage = false
        if (seiyuumatches[0] == message.content) {
            deletemessage = true
        }
        handleSeiyuuQuery(query, message, deletemessage)
    }
})

client.login(TOKEN)

function handleMalQuery(query, message, deletemessage, is7up) {
    malScraper.getResultsFromSearch(query)
        .then((data) => {
            if (is7up) {
                var above7 = data.filter(show => show.payload.score >= 7)
                if (is7up && above7.length === 0) {
                    return message.channel.send("Mai couldn't find a result that has a score above 7!")
                }
            }
            var candidateShow = above7[0] || data[0]
            var name = candidateShow.name
            var url = candidateShow.url
            var year = candidateShow.payload.start_year
            var score = candidateShow.payload.score
            var status = candidateShow.payload.status
            malScraper.getInfoFromURL(url)
                .then((data) => {
                    var image = data.picture
                    var genres = "`" + data.genres.join("` `") + "`"
                    var studios = data.studios.join(", ")
                    var { rating, ranked, popularity, synopsis } = data
                    synopsis = toTweetLength(synopsis)
                    message.channel.send({
                        content: url, embed: {
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
                            fields: [
                                {
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
                    if (deletemessage) message.delete().catch((err) => { })
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
}

function handleSeiyuuQuery(query, message, deletemessage) {
    Mal.search("person", query, { limit: 1, Page: 1 }).then(j => {
        var result = j.results[0]
        var name = result.name
        var url = result.url
        var image = result.image_url
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
            fields: [

            ]
        }
        Mal.person(result.mal_id).then(j => {
            var birthday = new Date(Date.parse(j.birthday))
            var formattedbirthday
            var birthdayexists = false
            var bdaymonth = birthday.getMonth() + 1
            if (!isNaN(birthday.getFullYear())) {
                formattedbirthday = birthday.getDate() + "/" + bdaymonth + "/" + birthday.getFullYear()
                birthdayexists = true
            } else if (!isNaN(birthday.getMonth())) {
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
            message.channel.send({ content: url, embed: embedobj })
            if (deletemessage) message.delete().catch((err) => { })
        })
    })
}

function toTweetLength(input) {
    if (input.length <= 140) {
        return input
    } else {
        return input.slice(0, 140) + "..."
    }
}