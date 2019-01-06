// Req MAL api
const malScraper = require('mal-scraper')

// Req Discord api
const Discord = require('discord.js')
const client = new Discord.Client()

// Discord stuffs
const TOKEN = '<-- Put your discord bot api key here -->'
const PREFIX = '!'

// Check if in testing
var debug
if (process.argv[2].toLowerCase() == "verbose"){
    debug = true;
}else{
    debug = false;
}


client.on('ready', () => {
    console.log('Mai is ready! <3')
})

client.on('error', console.error);

client.on('message', async message => {
    const command = message.content.toLowerCase().split(' ')[0]
    const arguments = message.content.split(' ')
    arguments.shift()
    if (command == `${PREFIX}ping`) {
        return message.reply('I\'m here!')
    }
    if (command == `${PREFIX}purge`) {
        if (arguments.length < 1) {
            return message.channel.send('Please tell Mai-Chan how many messages you want to delete! >a<')
        }
        if (arguments[0] > 100){
            return message.channel.send('Mai-Chan can only delete up to 100 messages at a time you know!')
        }else{
            let deletedMessages = await message.channel.bulkDelete(arguments[0], true)
            return message.channel.send(`Mai-Chan Deleted ${deletedMessages.size} messages!`)
        }
    }
    var matches = command.match(/\<(.*?)\>/);
    if (matches) {
        var query = matches[1];
        console.log(query)
        malScraper.getResultsFromSearch(query)
          .then((data) => {
              var name = data[0].name;
              var url = data[0].url;
              var image = data[0].image_url;
              var year = data[0].payload.start_year;
              var score = data[0].payload.score;
              var status = data[0].payload.status;

              console.log(name, url, image, year, score, status)
              return message.channel.send(name)
          })
          .catch((err) => console.log(err))
    }
})

client.login(TOKEN)