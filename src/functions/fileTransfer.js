const ftp = require('basic-ftp');
const fs = require('fs');
const server = process.env.SERVER;
const ftpLocation = process.env.FTPLOCATION;
const ftpPort = process.env.FTPPORT;
const ftpusername = process.env.FTPUSERNAME;
const ftppassword = process.env.FTPPASSWORD;

var { getUserAmount, deductUserAmountCash, deductUserAmountBank } = require('../api/unbelievaboat');
var { getDinoPrices } = require('./pricelist');

async function deleteLocalFile(fileId) {
    console.log("Deleting local files . . .");
    fs.unlink("./" + fileId + ".json", (err) => {
        if (err) console.error(err);
    });
}

async function processFileTransfer(message, request, type) {
    var steamId = request[2];
    var price = parseInt(request[1]);
    var requestedDino = request[0];

    // if (!await downloadFile(steamId)) return false;
    if (!await downloadFile(steamId)) return false;
    if (!await editFile(message,requestedDino, steamId, type)) return false;
    if (!await deductMoney(message, price, steamId)) return false;
    if (!await uploadFile(message, steamId)) return false;

    return true;
}

async function downloadFile(steamId) {
    var ftpClient = new ftp.Client();
    console.log(`Downloading file. . . ${server}${steamId}.json`);
    ftpClient.ftp.ipFamily = 4;
    try {
        await ftpClient.access({
            host: ftpLocation,
            port: ftpPort,
            user: ftpusername,
            password: ftppassword
        });
        await ftpClient.downloadTo(steamId + ".json", `${server}${steamId}.json`);
    } catch ( err ) {
        console.log(`Error while downloading file: ${err}`);
        deleteLocalFile(steamId);
        return false;
    }
    return true;
}

async function editFile(message, requestedDino, steamId, type) {
    console.log(`Editing file. . .`);
    try{
        var data = fs.readFileSync(`${steamId}.json`, `utf-8`);
        var contents = JSON.parse(data);
        if (type == "grow"){
            if(contents.CharacterClass.toLowerCase().startsWith(requestedDino.toLowerCase())){
                
                var dinoPriceList = await getDinoPrices();
                for ( var x = 0; x < dinoPriceList.length; x++ ) {
                    if( dinoPriceList[x].ShortName.toLowerCase() == requestedDino.toLowerCase() ) {
                        var locationParts;
                        var completed;

                        contents.CharacterClass = dinoPriceList[x].CodeName;
                        contents.Growth = "1.0";
                        contents.Hunger = "9999";
                        contents.Thirst = "9999";
                        contents.Stamina = "9999";
                        contents.Health = "15000";
                        locationParts = contents.Location_Thenyaw_Island.split("Z=", 2);
                        locationParts[1] = parseFloat(locationParts[1]);
                        locationParts[1] += 1.5;
                        locationParts[0] += "Z=";
                        locationParts[1] = locationParts[1].toString();
                        completed = locationParts[0] + locationParts[1];
                        contents.Location_Thenyaw_Island = completed;
                        break;
                    }
                }
                fs.writeFileSync(`${steamId}.json`, JSON.stringify(contents, null, 4));
                return true;
            } else {
                message.reply(`you do not have this ${requestedDino} in game. Please create a ${requestedDino} and try again.`);
                return false;
            }
        } else if(type == "inject") {
            var dinoPriceList = await getDinoPrices();
            for ( var x = 0; x < dinoPriceList.length; x++ ) {
                if( dinoPriceList[x].ShortName.toLowerCase() == requestedDino.toLowerCase() ) {
                    var locationParts;
                    var completed;

                    contents.CharacterClass = dinoPriceList[x].CodeName;
                    contents.Growth = "1.0";
                    contents.Hunger = "9999";
                    contents.Thirst = "9999";
                    contents.Stamina = "9999";
                    contents.Health = "15000";
                    locationParts = contents.Location_Thenyaw_Island.split("Z=", 2);
                    locationParts[1] = parseFloat(locationParts[1]);
                    locationParts[1] += 1.5;
                    locationParts[0] += "Z=";
                    locationParts[1] = locationParts[1].toString();
                    completed = locationParts[0] + locationParts[1];
                    contents.Location_Thenyaw_Island = completed;
                    break;
                }
            }
            fs.writeFileSync(`${steamId}.json`, JSON.stringify(contents, null, 4));
            return true; 
        }
        
    } catch ( err ) {
        console.log(`Error occurred attempting to edit json: ${err}`);
        message.reply(`something went wrong growing your dino.`);
        deleteLocalFile(steamId);
        return false;
    }
}

async function deductMoney(message, price, steamId) {
    console.log(`Deducting points. . .`);
    var balance = await getUserAmount(message.guild.id, message.author.id);
    var bank = parseInt(balance[0]);
    var cash = parseInt(balance[1]);

    if( bank >= price ) {
        if( deductUserAmountBank(message.guild.id, message.author.id, price) ) {
            return true;
        }
    } else if ( cash >= price ) {
        if( deductUserAmountCash(message.guild.id, message.author.id, price) ) {
            return true;
        }
    } else if ( (price > bank) && (price > cash) ) {
        console.log(`${message.author.username} does not have enough points for this transaction.`);
        deleteLocalFile(steamId);
        console.log(`here 3`);
        return false;
    }
}

async function uploadFile(message, steamId) {
    var ftpClient = new ftp.Client();
    console.log(`Uploading file. . .`);
    ftpClient.ftp.ipFamily = 4;
    try {
        await ftpClient.access({
            host: ftpLocation,
            port: ftpPort,
            user: ftpusername,
            password: ftppassword
        });
        var status = await ftpClient.uploadFrom(`${steamId}.json`, `${server}${steamId}.json`);
        var retryCount = 0;
        while (status.code != 226 && retryCount < 2) {
            status = await ftpClient.uploadFrom(`${steamId}.json`, `${server}${steamId}.json`);
            retryCount++;
        }
        if (status.code != 226) {
            message.reply(`could not grow your dino. . . Try again please.`);
            console.log(`Status code from uploading attempt: ${status.code}`);
            deleteLocalFile(steamId);
            return false;
        }
        deleteLocalFile(steamId);
        return true;
    } catch( err ) {
        message.reply(`could not grow your dino. . . Try again please.`);
        console.log(`Error uploading file: ${err}`);
        deleteLocalFile(steamId);
        return false;
    }
}

module.exports = { processFileTransfer };