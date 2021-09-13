const Discord = require('discord.js');
const prefix = process.env.PREFIX;

var { getDinoPrices } = require('./pricelist');
var { getSteamID } = require('../api/steamManager');
var { getUserDinos } = require('./buyDinos')

const cancelCheck = (msg) => {
    if(msg.toLowerCase().startsWith("cancel")) {
        return true;
    } else {
        return false;
    }
}

async function growPrompts(message) {
    var timedOut = false;
    var safelogged;

    const filter = m => m.author.id === message.author.id;
    const options = {
        max: 1,
        time: 200000
    };
    const prompt = new Discord.MessageEmbed()
        .setTitle(`Grow Menu`)
        .setColor(`#f4fc03`)
        .addFields(
            {
                name: `Are you safelogged?`,
                value:`Please respond with:\nyes\nno`
            }
        )
        .setFooter(`User transaction: ${message.author.username}`);
    
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
            .then( collected => {
                safelogged = collected.first().content
            })
            .catch(() =>{
                message.reply(`time's up. Please try again.`);
                return timedOut = true;
            });
    if (timedOut) return false;
    if(safelogged.toLowerCase().startsWith("n")) {
        message.reply(`request cancelled.`);
        return false;
    }

    prompt.fields = [];
    var dinoPriceList = await getDinoPrices();
    var prices = "";
    for (var x = 0; x < dinoPriceList.length; x++) {
        prices += `${dinoPriceList[x].ShortName}\t:\t$${dinoPriceList[x].Price.toLocaleString()}\n`;
    }
    prompt.addFields(
        {
            name: `🦎 Type the name of the dino you want to grow 🦎`, 
            value: prices
        }
    );

    var dino;
    var price;
    var dinoFound = false;
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
        .then( collected => {
            dino = collected.first().content
        } )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        });
    if (timedOut) return false;
    if (cancelCheck(dino)) {
        message.reply(`you canceled the request.`);
        return false;
    }
    for (var x = 0; x < dinoPriceList.length; x++) {
        if( dino.toLowerCase() == dinoPriceList[x].ShortName.toLowerCase() ) {
            price = dinoPriceList[x].Price;
            dinoFound = true;
            break;
        }
    }
    if (!dinoFound) {
        message.reply(`invalid dino, please try again.`);
        return false;
    }
    prompt.fields = [];
    var steamId;
    prompt.addFields( {
        name: `Please enter your steam ID`,
        value: `[17 digit code starting with 7656].`
    } );
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
        .then( collected => 
            steamId = collected.first().content
        )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        } );
    if(timedOut) return false;
    if (cancelCheck(steamId)) {
        message.reply(`you canceled the request.`);
        return false;
    }
    if(!steamId.startsWith('7656')) {
        message.reply(`that is an invalid steam ID, please try again.`);
        return false;
    }

    prompt.fields = [];
    var confirm;
    prompt.addFields( {
        name: `Confirm your order of a ${dino}.`,
        value: `Please type either:\nyes\nno`
    });
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
        .then( collected => {
            confirm = collected.first().content
        } )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        } );
    if(timedOut) return false;

    if (confirm.toLowerCase().startsWith("y")) {
        prompt.fields = [];
        prompt.setTitle(`Please wait for the transaction to be completed.`);
        message.reply(prompt);
        return [dino, price, steamId];
    }
    message.reply(`transaction cancelled.`);
    return false;
};

async function injectPrompts(message) {
    var timedOut = false;
    var safelogged;

    if ( !await getSteamID(message.author.id) ) {
        message.reply(`you have to link your steam ID using ${prefix}link [your steam ID]`);
        return false;
    }

    const filter = m => m.author.id === message.author.id;
    const options = {
        max: 1,
        time: 200000
    };

    const prompt = new Discord.MessageEmbed()
        .setTitle(`Inject Menu`)
        .setColor(`#f4fc03`)
        .addFields(
            {
                name: `Are you safelogged?`,
                value:`Please respond with:\nyes\nno`
            }
        )
        .setFooter(`User transaction: ${message.author.username}`);
    
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
            .then( collected => {
                safelogged = collected.first().content
            })
            .catch(() =>{
                message.reply(`time's up. Please try again.`);
                return timedOut = true;
            });
    if (timedOut) return false;
    if(safelogged.toLowerCase().startsWith("n")) {
        message.reply(`request cancelled.`);
        return false;
    }

    prompt.fields = [];
    var dinoPriceList = await getDinoPrices();
    var prices = "";
    for (var x = 0; x < dinoPriceList.length; x++) {
        prices += `${dinoPriceList[x].ShortName}\t:\t$${dinoPriceList[x].Price.toLocaleString()}\n`;
    }
    prompt.addFields(
        {
            name: `🦎 Type the name of the dino you want to inject 🦎`, 
            value: prices
        }
    );

    var dino;
    var price;
    var dinoFound = false;
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
        .then( collected => {
            dino = collected.first().content
        } )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        });
    if (timedOut) return false;
    if (cancelCheck(dino)) {
        message.reply(`you canceled the request.`);
        return false;
    }
    for (var x = 0; x < dinoPriceList.length; x++) {
        if( dino.toLowerCase() == dinoPriceList[x].ShortName.toLowerCase() ) {
            price = dinoPriceList[x].Price;
            dinoFound = true;
            break;
        }
    }
    if (!dinoFound) {
        message.reply(`invalid dino, please try again.`);
        return false;
    }

    prompt.fields = [];
    var confirm;
    prompt.addFields( {
        name: `Confirm your order of a ${dino}.`,
        value: `Please type either:\nyes\nno`
    });
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
        .then( collected => {
            confirm = collected.first().content
        } )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        } );
    if(timedOut) return false;
    
    prompt.fields = [];
    prompt.setTitle(`Please wait for the transaction to be completed.`);
    message.reply(prompt);

    var steamId = await getSteamID(message.author.id);
    if (confirm.toLowerCase().startsWith("y")) return [dino, price, steamId];
    message.reply(`transaction cancelled.`);
    return false;
};

async function slayPrompts(message) {
    var timedOut = false;
    var safelogged;

    if ( !await getSteamID(message.author.id) ) {
        return message.reply(`you have to link your steam ID using ${prefix}link [your steam ID]`);
    }

    const filter = m => m.author.id === message.author.id;
    const options = {
        max: 1,
        time: 200000
    };

    const prompt = new Discord.MessageEmbed()
        .setTitle(`Slay Menu`)
        .setColor(`#fc0f03`)
        .addFields(
            {
                name: `Are you safelogged?`,
                value:`Please respond with:\nyes\nno`
            }
        )
        .setFooter(`User transaction: ${message.author.username}`);
    
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
            .then( collected => {
                safelogged = collected.first().content
            })
            .catch(() =>{
                message.reply(`time's up. Please try again.`);
                return timedOut = true;
            });
    if (timedOut) return false;
    if(safelogged.toLowerCase().startsWith("n")) {
        message.reply(`request cancelled.`);
        return false;
    }

    prompt.fields = [];
    var confirm;
    prompt.addFields( {
        name: `Confirm slay.`,
        value: `Please type either:\nyes\nno`
    });
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
        .then( collected => {
            confirm = collected.first().content
        } )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        } );
    if(timedOut) return false;

    if (confirm.toLowerCase().startsWith("y")) {
        prompt.fields = [];
        prompt.setTitle(`Please wait for the transaction to be completed.`);
        message.reply(prompt);
        
        var steamId = await getSteamID(message.author.id);
        return steamId;
    }else {
        message.reply(`transaction cancelled.`);
    } 
    return false;
}

async function buyPrompts(message) {
    var timedOut = false;
    var dinoFound = false;
    var confirm;
    var dino;
    var price;
    var prices = "";

    if ( !await getSteamID(message.author.id) ) {
        message.reply(`you have to link your steam ID using ${prefix}link [your steam ID]`);
        return false;
    }

    var dinoPriceList = await getDinoPrices();

    for (var x = 0; x < dinoPriceList.length; x++) {
        prices += `${dinoPriceList[x].ShortName}\t:\t$${dinoPriceList[x].Price.toLocaleString()}\n`;
    }
    
    const filter = m => m.author.id === message.author.id;
    const options = {
        max: 1,
        time: 200000
    };
    const prompt = new Discord.MessageEmbed()
        .setTitle(`Buy Dinos Menu`)
        .setColor(`#ffff00`)
        .addFields(
            {
                name: `🦎 Type the name of the dino you want to purchase 🦎\nThese can be used later to inject a dino.`, 
                value: prices
            }
        )
        .setFooter(`User transaction: ${message.author.username}`);
    message.reply(prompt);

    await message.channel.awaitMessages(filter, options)
        .then( collected => {
            dino = collected.first().content
        } )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        } );
    if (timedOut) return false;
    if (cancelCheck(dino)) {
        message.reply(`you canceled the request.`);
        return false;
    }
    for (var x = 0; x < dinoPriceList.length; x++) {
        if( dino.toLowerCase() == dinoPriceList[x].ShortName.toLowerCase() ) {
            price = dinoPriceList[x].Price;
            dinoFound = true;
            break;
        }
    }
    if (!dinoFound) {
        message.reply(`invalid dino, please try again.`);
        return false;
    }

    prompt.fields = [];
    prompt.addFields( {
        name: `Confirm your order of a ${dino}.`,
        value: `Please type either:\nyes\nno`
    });
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
        .then( collected => {
            confirm = collected.first().content
        } )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        } );
    if(timedOut) return false;

    if (confirm.toLowerCase().startsWith("y")) {
        prompt.fields = [];
        prompt.setTitle(`Please wait for the transaction to be completed.`);
        message.reply(prompt);

        var steamId = await getSteamID(message.author.id);
        return [dino, price, steamId];
    }
    message.reply(`transaction cancelled.`);
    return false;
}

async function showDinos (message) {
    var dinosInStorage = "";
    var names = [];
    var amounts = [];
    var count = 0
    var dinosInStorageSize = Object.keys(await getUserDinos(message.author.id)).length;

    //Traverse a 1D JSON
    for (var [dino, amount] of Object.entries(await getUserDinos(message.author.id))) {
        names[count] = `${dino}`;
        amounts[count] = `${amount}`;
        count++;
    }

    const prompt = new Discord.MessageEmbed()
        .setTitle(`Dino Storage`)
        .setDescription(`This is a collection of dinos you have purchased.\nThese can be redeemed for adult dinos in game.`)
        .setColor(`#34eb4f`)
        .setAuthor(message.author.username, message.author.displayAvatarURL())

    for (var x = 0; x < dinosInStorageSize; x++) {
        prompt.addField(names[x],`x${amounts[x]}`,true);
    }
    message.reply(prompt);
}
module.exports = { growPrompts, injectPrompts, slayPrompts, buyPrompts, showDinos};