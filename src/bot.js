//Imports Discord.js library
const Discord = require('discord.js');
const discordClient = new Discord.Client();

//Loads environment variables from the .env file
require('dotenv').config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX;
//Logs a success message when log in succeeds

//Importing functions
var { growPrompts, injectPrompts } = require('./functions/embeds');
var { processFileTransfer } = require('./functions/fileTransfer');
var processing = false;

async function processingCheck(message) {
    if (processing) {
        message.reply(`please wait on other user(s) to complete their transaction.`);
    }
    while (processing){
        console.log(`${message.author.username}[${message.author.id}] is waiting in queue. . .`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

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
        var growRequest = await growPrompts(message);
        console.log(growRequest);
        
        await processingCheck(message);

        processing = true;
        //call file transfer function here
        if (await processFileTransfer(message, growRequest, "grow") ) {
            processing = false;
            message.reply(`successfully grown your dino. Please log back in to the server.`);
        } else {
            processing = false;
        }
    }

    if ( cmdName.toLowerCase() === "inject" ) {
        var injectRequest = await injectPrompts(message);
        console.log(injectRequest);

        await processingCheck(message);

        processing = true;
        if (await processFileTransfer(message, injectRequest, "inject") ) {
            processing = false;
            message.reply(`successfully injected your dino. Please log back in to the server.`);
        } else {
            processing = false;
        }
    }
});


discordClient.login(token);