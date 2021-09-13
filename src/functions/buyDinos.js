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

module.exports = { getUserDinos, addDino };