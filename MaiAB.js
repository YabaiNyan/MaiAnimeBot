// Req MAL api
const malScraper = require('mal-scraper')

// Req Discord api
const Discord = require('discord.js')
const client = new Discord.Client()

// Discord stuffs
const TOKEN = '<-- Put your discord bot api key here -->'
const PREFIX = '!'

client.on('ready', () => {
    console.log('Mai is ready! <3')
})

client.on('error', console.error);

client.on('message', async message => {
    if (message.author.bot) return;
    const command = message.content.toLowerCase().split(' ')[0]
    const arguments = message.content.split(' ')
    arguments.shift()
    if (command == `${PREFIX}ping`) {
        return message.reply('I\'m here!')
    }
    if (command == `${PREFIX}mal`) {
        handleMalQuery(arguments.join(" "), message, true);
    }
    var matches = message.content.match(/\<(.+?)\>/);
    if (matches) {
        var query = matches[1];
        var deletemessage = false;
        if(matches[1].startsWith("@")||matches[1].startsWith(":")||matches[1].startsWith("#")) return
        if(matches[0] == message.content){
            deletemessage = true;
        }
        handleMalQuery(query, message, deletemessage);
    }
})

client.login(TOKEN)

function handleMalQuery(query, message, deletemessage){
    malScraper.getResultsFromSearch(query)
    .then((data) => {
        var name = data[0].name;
        var url = data[0].url;
        var image = data[0].image_url;
        var year = data[0].payload.start_year;
        var score = data[0].payload.score;
        var status = data[0].payload.status;

        message.channel.send({content: url, embed:{
              title: name,
              url: url,
              color: 65508,
              footer: {
                  icon_url: message.author.avatarURL,
                  text: message.author.username+"#"+message.author.discriminator
              },
              image: {
                  url: image
              },
              timestamp: new Date(),
              fields: [
                  {
                    name: "Score",
                    value: score,
                    inline: true
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
        }})
        if (deletemessage) message.delete().catch((err)=>{}); 
    })
    .catch((err) => console.log(err))
}