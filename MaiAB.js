require('dotenv').config()

// Import Mai Functions
const mai = require("./maiFunctions")

// Req Discord api
const Discord = require('discord.js')
const client = new Discord.Client()

// Discord stuffs
const TOKEN = process.env.TOKEN
const ADMINID = process.env.ADMINID
const NHENTAIENABLE = process.env.NHENTAIENABLE
const NHCHANNEL = process.env.NHCHANNEL
const PREFIX = '!'

const showRegex = /\<(.+?)\>/
const seiyuuRegex = /\[(.+?)\]/
const mangaRegex = /\{(.+?)\}/
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
                    mai.handleDebug(arguments, message)
                }
            }
            return

        case `${PREFIX}mal`:
            mai.handleMalQuery(arguments.join(" "), message, true, false)
            return

        case `${PREFIX}7up`:
            mai.handleMalQuery(arguments.join(" "), message, true, true)
            return

        case `${PREFIX}seiyuu`:
            mai.handleSeiyuuQuery(arguments.join(" "), message, true)
            return

        case `${PREFIX}manga`:
            mai.handleMangaQuery(arguments.join(" "), message, true)
            return

        case `${PREFIX}purge`:
            mai.handlePurge(arguments, message, guildowner, messageauthor, ADMINID)
            return

        case `${PREFIX}movechat`:
            mai.handleMoveChat(arguments, message, guildowner, messageauthor, ADMINID)
            return

        case `${PREFIX}delete`:
            mai.handleDeleteMessage(arguments, message, guildowner, messageauthor, ADMINID)
            return

        case `${PREFIX}pin`:
            mai.handlePinMessage(arguments, message, guildowner, messageauthor, true, ADMINID)
            return

        case `${PREFIX}unpin`:
            mai.handlePinMessage(arguments, message, guildowner, messageauthor, false, ADMINID)
            return

        case `${PREFIX}nh`:
            var query = arguments.join(" ")
            if (query.length < 0) {
                mai.temporaryMessage('Please give me somthing to search', message)
                return
            } else {
                switch (query.length) {
                    case 6:
                        mai.handlenhentai(query, message, NHCHANNEL)
                        break
                    case 5:
                        mai.handlenhentai(query, message, NHCHANNEL)
                        break
                    default:
                        mai.temporaryMessage('I need five or six digits if you want me to look it up for you!', message)
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
        mai.handleMalQuery(query, message, deletemessage, false)
    }

    var seiyuumatches = message.content.match(seiyuuRegex)
    if (seiyuumatches) {
        var query = seiyuumatches[1]
        var deletemessage = seiyuumatches[0] == message.content
        mai.handleSeiyuuQuery(query, message, deletemessage)
    }

    var mangamatches = message.content.match(mangaRegex)
    if (mangamatches) {
        var query = mangamatches[1]
        var deletemessage = mangamatches[0] == message.content
        mai.handleMangaQuery(query, message, deletemessage)
    }

    if (NHENTAIENABLE != undefined) {
        var nhentaimatches = message.content.match(nhentaiNumbersRegex)
        if (nhentaimatches) {
            var query = nhentaimatches
            mai.handlenhentai(query[0], message, NHCHANNEL)
        }
    }
})

client.login(TOKEN)

function escapeMarkdown(string) {
    var replacements = [
        [/\`\`\`/g, '`​`​`​']
    ]
    return replacements.reduce(
        function (string, replacement) {
            return string.replace(replacement[0], replacement[1])
        }, string)
}