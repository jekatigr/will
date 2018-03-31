const golos = require('golos-js')

golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');


module.exports = class GolosService {
    static async createAccount(newLogin, password, creatorLogin, creatorActiveKey, fee, jsonMetadata = {}) {
        return new Promise((resolve, reject) => {
            let newKeys = golos.auth.generateKeys(newLogin, password, ['owner', 'active', 'posting', 'memo']);
            console.log('auth keys created, newKeys: ', newKeys);

            if (!newKeys) reject(`error while creating auth keys, params: newLogin: ${newLogin}, password: ${password}, creatorLogin: ${creatorLogin}, creatorActiveKey: ${creatorActiveKey}, fee: ${fee}, jsonMetadata: ${jsonMetadata}`)

            let owner = {
                weight_threshold: 1,
                account_auths: [],
                key_auths: [[newKeys.owner, 1]]
            };
            let active = {
                weight_threshold: 1,
                account_auths: [],
                key_auths: [[newKeys.active, 1]]
            };
            let posting = {
                weight_threshold: 1,
                account_auths: [],
                key_auths: [[newKeys.posting, 1]]
            };
            let memoKey = newKeys.memo;

            golos.broadcast.accountCreate(creatorActiveKey, fee, creatorLogin, newLogin, owner, active, posting, memoKey, JSON.stringify(jsonMetadata), function(err, result) {
                if (err) {
                    reject(`error in accountCreate, err: ${err}, params: newLogin: ${newLogin}, password: ${password}, creatorLogin: ${creatorLogin}, creatorActiveKey: ${creatorActiveKey}, fee: ${fee}, jsonMetadata: ${jsonMetadata}, result: ${result}`);
                }
                resolve(result);
            });
        })
    }

    static async sendGolosPower(sender, senderActiveKey, receiver, amount) {
        return new Promise((resolve, reject) => {
            golos.broadcast.transferToVesting(senderActiveKey, sender, receiver, amount, function(err, result) {
                if (err) {
                    reject(`error in sendGolosPower, err: ${err}, params: sender: ${sender}, senderActiveKey: ${senderActiveKey}, receiver: ${receiver}, amount: ${amount}`);
                }
                resolve(result);
            });
        })
    }
}