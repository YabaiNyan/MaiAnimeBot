# MaiAnimeBot
MyAnimeList link finding Discord Bot

General Commands
=====
* ```!ping```: Pings bot<br>
* ```!purge (number)```: Purges a number of messages from the chat. Only available to the server owner. Currently set with a maximum of 10 messages to prevent accidental deleting of whole text channel's history.<br>
* ```!movechat (number) #(channel)```: Much like purge, but will also send all the deleted messages to another channel. The maximum amount for messages is 50. Note that any attachments will disappear, and attachment links wont work anymore, as discord doesnt allow attachments to be accessable after the message is deleted.<br>
* ```!delete (message id)```: Deletes a message<br>
* ```!pin (message id)```: Pins a message<br>
* ```!unpin (message id)```: Unpins a message<br>

MyAnimeList Search Commands
=====
* ```!mal (query)```: Searches for ```(query)``` and replys with embed, along with deleting the command. Use this instead of angle bracket method if you need to lookup anything __starting__ with `@`,`#`, or `:`<br>
* ```!7up (query)```: Same as `!mal`, but only responds with shows with a score of 7 or above<br>
* ```!manga (query)```: Same as `!mal`, but looks for manga instead<br>
* ```!seiyuu (query)```: Same as `!mal`, but looks for voice actors instead<br>
* ```<query>```: Querys text that is between angled brackets (<>). Will work within a message or standalone. Command will not be deleted if it is within a message, but will be if it is standalone.<br>
* ```{query}```: same as `<query>`, but looks for manga instead<br>
* ```[query]```: same as `<query>`, but looks for voice actors instead


## Note before installation
For auto command deletion, make sure that the bot is Authorised to Manage Messages, either when you generate the bot invite link or add it to the bot role later. You may skip this or disable its ability to manage messages if you would not like this feature enabled.

Installation
=====
1) Clone this repository
2) Open a console in the MaiAnimeBot-master folder and run ```npm install```
3) Create a ```.env``` file inside the folder with ```TOKEN=(token)``` inside, replacing (token) your discord bot token.
4) To start, run ```node MaiAB.js``` or ```npm test```

## Credits
* [__cthuluhoop123__](https://github.com/cthuluhoop123) for [code cleanup and refactoring](https://github.com/YabaiNyan/MaiAnimeBot/pull/1) and [even more cleanup](https://github.com/YabaiNyan/MaiAnimeBot/pull/2)
