const ftp = require('basic-ftp');
const fs = require('fs');
var { getUserAmount, deductUserAmountCash, deductUserAmountBank } = require('../api/unbelievaboat');

function processFileTransfer(message, request) {
    if (!downloadFile()) return false;
    if (!editFile(request[0])) return false;
    if (!uploadFile(message, request[1])) return false;
}

const downloadFile = () => {

}

module.exports = { processFileTransfer };