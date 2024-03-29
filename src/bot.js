//Imports Discord.js library
const Discord = require('discord.js');
const discordClient = new Discord.Client();

//Loads environment variables from the .env file
require('dotenv').config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX;
//Logs a success message when log in succeeds

//Importing functions
var { growPrompts } = require('./functions/embeds')

discordClient.on("ready", () => {
    console.log(`Successfully logged in.`);
});

//On message listener
discordClient.on("message", async message => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    //Assigning message contents to command name and arguments
    const [cmdName, ...args] = message.content
        .trim()
        .substring(prefix.length)
        .split(/ +/g);

    if ( cmdName.toLowerCase() === "grow" ) {

    }
});


discordClient.login(token);