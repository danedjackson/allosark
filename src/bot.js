//Imports Discord.js library
const Discord = require('discord.js');
const discordClient = new Discord.Client();
const fs = require('fs');
const path = require('path');
const adminUsers = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./json/admin-roles.json")));
const channelIds = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./json/channels.json")));

//Loads environment variables from the .env file
require('dotenv').config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX;
//Logs a success message when log in succeeds

//Importing functions
var { growPrompts, injectPrompts, slayPrompts, buyPrompts, showDinos, redeemPrompts } = require('./functions/embeds');
var { processFileTransfer, deleteFile } = require('./functions/fileTransfer');
var { getSteamID, updateSteamID, addSteamID } = require('./api/steamManager');
var { getUserDinos, addDino } = require('./functions/buyDinos');


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

function adminRoleCheck(message) {
    for (var x = 0; x < adminUsers.length; x++) {
        if (message.member.roles.cache.has(adminUsers[x].id)){
            return true;
        } 
    }
    return false;
}

function channelIdCheck(channel, cmd) {
    if ( cmd.toLowerCase() == "grow" || cmd.toLowerCase() == "inject") {
        if ( channel == channelIds.growChannel ) return true;
    }
    if ( cmd.toLowerCase() == "slay" ) {
        if ( channel == channelIds.slayChannel ) return true;
    }
    if ( cmd.toLowerCase() == "link" || cmd.toLowerCase() == "updateid" ) {
        if ( channel == channelIds.steamidChannel ) return true;
    }
    return false;
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

    if ( cmdName.toLowerCase() === 'buydino' ) {
        if ( !channelIdCheck(message.channel.id, "inject") ) return message.reply(`please use <#${channelIds.growChannel}>`);
        var buyRequest = await buyPrompts(message);
        console.log(`buy request: ${buyRequest}`);

        if(!buyRequest) return;
        if(await addDino(message.author.id, buyRequest[0])) {
            message.reply(`successfully purchased and stored your dino`);
        }
        console.log(await getUserDinos(message.author.id));
    }

    if ( cmdName.toLowerCase() === 'dinos' ) {
        if ( !channelIdCheck(message.channel.id, "inject") ) return message.reply(`please use <#${channelIds.growChannel}>`);
        await showDinos(message);
    }

    if ( cmdName.toLowerCase() === "grow" ) {

        if ( !channelIdCheck(message.channel.id, "grow") ) return message.reply(`please use <#${channelIds.growChannel}>`);

        var growRequest = await growPrompts(message);
        console.log(`grow request: ${growRequest}`);
        
        if(!growRequest) return;

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
        if ( !channelIdCheck(message.channel.id, "inject") ) return message.reply(`please use <#${channelIds.growChannel}>`);

        var injectRequest = await injectPrompts(message);
        console.log(`inject request: ${injectRequest}`);

        if (!injectRequest) return;

        await processingCheck(message);

        processing = true;
        if (await processFileTransfer(message, injectRequest, "inject") ) {
            processing = false;
            message.reply(`successfully injected your dino. Please log back in to the server.`);
        } else {
            processing = false;
        }
    }

    if (cmdName.toLowerCase() === "redeem") {
        if ( !channelIdCheck(message.channel.id, "inject") ) return message.reply(`please use <#${channelIds.growChannel}>`);

        var redeemRequest = await redeemPrompts(message);
        console.log(`redeem request: ${redeemRequest}`);

        if (!redeemRequest) return;

        await processingCheck(message);

        processing = true;
        if (await processFileTransfer(message, redeemRequest, "inject") ) {
            processing = false;
            message.reply(`successfully injected your dino. Please log back in to the server.`);
        } else {
            processing = false;
        }
    }

    if ( cmdName.toLowerCase() === "slay" ) {
        
        if ( !channelIdCheck(message.channel.id, "slay") ) return message.reply(`please use <#${channelIds.slayChannel}>`);

        var slayRequest = await slayPrompts(message);
        console.log(`slay request: ${slayRequest}`);
        if(!slayRequest) return;

        console.log(`slay request: ${slayRequest}`);

        await processingCheck(message);

        processing = true;
        if( await deleteFile(message, slayRequest) ) {
            processing = false;
            message.reply(`your dino is dead.`);
        } else {
            processing = false;
        }
    }

    if ( cmdName.toLowerCase() ===  "link") {
        
        if ( !channelIdCheck(message.channel.id, "link") ) return message.reply(`please use <#${channelIds.steamidChannel}>`);

        if( args.length != 1 ) return message.reply(`please use the following format:\n${prefix}link [steam ID here]`);

        if( !await addSteamID(message.author.id, args[0]) ) return message.reply(`steam ID may already be in use, or it is invalid, please try again`);

        return message.reply(`successfully linked your steam ID`);
    }

    if ( cmdName.toLowerCase() === "updateid" ) {
        
        if ( !channelIdCheck(message.channel.id, "link") ) return message.reply(`please use <#880990510527950848>`);
        
        if (!adminRoleCheck(message)) return message.reply(`you do not have the rights to use this command.`);
        
        if( args.length != 2 ) return message.reply(`please use the followeing format\n${prefix}updateid [@user] [updated steam ID]`);

        if( !await updateSteamID(args[0], args[1]) ) return message.reply(`something went wrong updating this ID.`);

        return message.reply(`${args[0]}'s steam id successfully updated.`);

    }

});


discordClient.login(token);