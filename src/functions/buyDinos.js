const fs = require('fs');
const path = require('path');
const userDinos = path.resolve(__dirname, "../json/user-dinos.json");

async function getUserDinos (userID) {
    try{
        var userDinoList = JSON.parse(fs.readFileSync(userDinos));
    
        for (var x = 0; x < userDinoList.length; x++) {
            if (userID == userDinoList[x].User) {
                return userDinoList[x].Dinos;
            }
        }
    } catch ( err ) {
        console.log(err);
        return false;
    }
    
}
async function removeDino(message, dinoName) {
    userID = message.author.id;
    dinoName = dinoName.charAt(0).toUpperCase() + dinoName.slice(1).toLowerCase();
    var userFound = false;

    try {
        var userDinoList = JSON.parse(fs.readFileSync(userDinos));
        for (var x = 0; x < userDinoList.length; x++) {
            //Searches for user
            if (userID == userDinoList[x].User) {
                userFound = true;
                //if dino does not exist, return. If it does exist, decrement dino count, if count is 0, delete it.
                if (!userDinoList[x].Dinos[dinoName]) {
                    message.reply(`you do not have a ${dinoName}.`);
                    return false;
                } else {
                    userDinoList[x].Dinos[`${dinoName}`] -= 1;
                    if(userDinoList[x].Dinos[`${dinoName}`] == 0) {
                        delete userDinoList[x].Dinos[`${dinoName}`];
                        break;
                    }
                }
            }
        } 
        if (!userFound) {
            message.reply(`could not find any dinos.`);
            return false;
        }
        fs.writeFileSync(path.resolve(__dirname, "../json/user-dinos.json"), JSON.stringify(userDinoList, null, 4));
        return true;
    } catch ( err ) {
        console.log(err);
        message.reply(`something went wrong, please try again.`);
        return false;
    }
}

async function addDino (userID, dinoName) {
    dinoName = dinoName.charAt(0).toUpperCase() + dinoName.slice(1).toLowerCase();
    var userFound = false;
    try {
        var userDinoList = JSON.parse(fs.readFileSync(userDinos));
        for (var x = 0; x < userDinoList.length; x++) {
            //Searches for user
            if (userID == userDinoList[x].User) {
                userFound = true;
                //if dino does not exist, add the dino. If it does exist, increment dino count.
                if (!userDinoList[x].Dinos[dinoName]) {
                    userDinoList[x]["Dinos"][`${dinoName}`] = 1
                    break;
                } else {
                    userDinoList[x].Dinos[`${dinoName}`] += 1;
                    break;
                }
            }
        }
        if (!userFound) {
            userDinoList.push({
                "User": userID,
                "Dinos": {
                    [`${dinoName}`]: 1
                }
            });
        }
        fs.writeFileSync(path.resolve(__dirname, "../json/user-dinos.json"), JSON.stringify(userDinoList, null, 4));
        return true;
    }catch( err ) {
        console.log(err);
        return false;
    }
}


async function purchaseDino(message, request, type) {
    var steamId = request[2];
    var price = parseInt(request[1]);

    if (type == "buydino"){ 
        if(!await deductMoney(message, price, steamId)){
            return false;
        } else {
            return true;
        }
    }
}

async function giveDino(message, dino, isAdmin) {
    if(!isAdmin){
        if (!await removeDino(message, dino)) { return false; }
    }

    if (!await addDino(message.mentions.members.first().id, dino)) { message.reply(`something went wrong giving your dino away, let an admin know if you lost your dino`); return false; }

    return true;
}

module.exports = { getUserDinos, addDino, removeDino, purchaseDino, giveDino};