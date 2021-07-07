const Discord = require('discord.js');

var { getDinoPrices } = require('./pricelist');

async function growPrompts(message) {
    var timedOut = false;
    var confirm;

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
                confirm = collected.first().content
            })
            .catch(() =>{
                message.reply(`time's up. Please try again.`);
                return timedOut = true;
            });
    if (timedOut) return false;
    if(confirm.toLowerCase().startsWith("n")) {
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
    if (confirm.toLowerCase().startsWith("y")) return [dino, price];
    message.reply(`transaction cancelled.`);
    return false;
};

module.exports = { growPrompts };