const WillService = require('./services/WillService');
const GolosService = require('./services/GolosService');

// var creator = 'jekatigr';
// var wif = '5JufRtVnSX6daDj1RmzmHSzaKHU4vTCabKAxtfQcruj4tQqiPR1'; //jekatigr

(async () => {
    try {
        // await WillService.createAccount()
        // await WillService.createPoll(1, 'test poll', 'test poll desc', ['option1', 'option2']);
        // let polls = await WillService.getPolls();
        // await WillService.createUserAccount('jekatigr12', 'pass123');
        // console.log(polls);
        // await WillService.buyTokens('jekatigr12', 3);
        // await WillService.getAccountBalance('jekatigr12');
        await WillService.vote(1, 'option1', 'jekatigr12');
    } catch (e) {
        console.log(e)
    }

    process.exit(0)
})()
// sendGolosPower('jekatigr', '5JufRtVnSX6daDj1RmzmHSzaKHU4vTCabKAxtfQcruj4tQqiPR1', 'test1', '5.000 GOLOS')
