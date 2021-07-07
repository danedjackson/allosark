const fs = require('fs');
const path = require('path');
const dinoPrices = path.resolve(__dirname, "../json/price-list.json");

function getDinoPrices  () {
    try {
        var dinoPriceList = JSON.parse(fs.readFileSync(dinoPrices));
        return dinoPriceList;
    } catch ( err ) {
        return null;
    }
}

module.exports = { getDinoPrices };