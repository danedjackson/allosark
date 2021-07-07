const ftp = require('basic-ftp');
const fs = require('fs');
const server = process.env.SERVER;
const ftpLocation = process.env.FTPLOCATION;
const ftpPort = process.env.PORT;
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

function processFileTransfer(message, request) {
    var steamId = request[2];
    var price = parseInt(request[1]);
    var requestedDino = request[0];

    if (!await downloadFile(steamId)) return false;
    if (!await editFile(requestedDino, steamId)) return false;
    if (!await deductMoney(message, price, steamId)) return false;
    if (!await uploadFile(steamId)) return false;

    return true;
}

async function downloadFile(steamId) {
    var ftpClient = new ftp.Client();
    console.log(`Downloading file. . .`);
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

async function editFile(requestedDino, steamId) {
    try{
        var data = fs.readFileSync(`${steamId}.json`, `utf-8`);
        var contents = JSON.parse(data);
        if(contents.getCharacterClass.toLowerCase().startsWith(requestedDino.toLowerCase())){
            for ( var x = 0; x < getDinoPrices.length; x++ ) {
                if( getDinoPrices[x].ShortName.toLowerCase() == requestedDino.toLowerCase() ) {
                    var locationParts;
                    var completed;

                    contents.CharacterClass = getDinoPrices[x].CodeName;
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
        }
    } catch ( err ) {
        console.log(`Error occurred attempting to edit json: ${err}`);
        deleteLocalFile(steamId);
        return false;
    }
}

async function deductMoney(message, price, steamId) {
    var balance = getUserAmount(message.guild.id, message.author.id);
    var bank = parseInt(balance[0]);
    var cash = parseInt(balance[1]);

    if( bank >= price ) {
        if( deductUserAmountBank(message.guild.id, message.author.id, price) ) {
            deleteLocalFile(steamId);
            return true;
        }
    } else if ( cash >= price ) {
        if( deductUserAmountCash(message.guild.id, message.author.id, price) ) {
            deleteLocalFile(steamId);
            return true;
        }
    } else if ( (price > bank) && (price > cash) ) {
        console.log(`${message.author.username} does not have enough points for this transaction.`);
        deleteLocalFile(steamId);
        return false;
    }
}

async function uploadFile(steamId) {
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
        return true;
    } catch( err ) {
        message.reply(`could not grow your dino. . . Try again please.`);
        console.log(`Error uploading file: ${err}`);
        deleteLocalFile(steamId);
        return false;
    }
}

module.exports = { processFileTransfer };