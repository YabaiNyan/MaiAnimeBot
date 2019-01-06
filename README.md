# MaiAnimeBot
MyAnimeList link finding Discord Bot

Commands
=====

* ```!ping```: Pings bot<br>
* ```!mal (query)```: Searches for ```(query)``` and replys with embed, along with deleting the command. Use this instead of angle bracket method if you need to lookup anything __starting__ with `@`,`#`, or `:`<br>
* ```<query>```: Querys text that is between angled brackets (<>). Will work within a message or standalone. command will not be deleted if it is within a message, but will be if it is standalone.

Installation
=====

1) Clone this repository
2) Replace ```<-- Enter Your Bot Token Here! -->``` in MaiAB.js with a bot token generated on discord developer website.
3) Open a console in the yabai-chan folder and run ```npm install```
4) To start, run ```node yabai-chan.js``` or ```npm test```