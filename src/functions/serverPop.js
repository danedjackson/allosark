module.exports = async function (client, count) {

    async function updateCount () {
        if(count){
            client.user.setActivity(`${count}`, { type: 'WATCHING' });
        }
    }
    return await updateCount();
}
