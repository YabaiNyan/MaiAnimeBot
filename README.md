# MaiAnimeBot
MyAnimeList link finding Discord Bot

Commands
=====

* ```!ping```: Pings bot<br>
* ```!mal (query)```: Searches for ```(query)``` and replys with embed, along with deleting the command. Use this instead of angle bracket method if you need to lookup anything __starting__ with `@`,`#`, or `:`<br>
* ```<query>```: Querys text that is between angled brackets (<>). Will work within a message or standalone. command will not be deleted if it is within a message, but will be if it is standalone.

## Note before installation
For auto command deletion, make sure that the bot is Authorised to Manage Messages, either when you generate the bot invite link or add it to the bot role later. You may skip this or disable its ability to manage messages if you would not like this feature enabled.

Installation
=====

1) Clone this repository
2) Replace ```<-- Enter Your Bot Token Here! -->``` in MaiAB.js with a bot token generated on discord developer website.
3) Open a console in the yabai-chan folder and run ```npm install```
4) To start, run ```node yabai-chan.js``` or ```npm test```
