const golos = require('golos-js')

golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');


module.exports = class GolosService {
    /**
     * Method returns active key of the new user.
     * @param newLogin
     * @param password
     * @param creatorLogin
     * @param creatorActiveKey
     * @param fee
     * @param jsonMetadata
     */
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

            golos.broadcast.accountCreate(creatorActiveKey, fee, creatorLogin, newLogin, owner, active, posting, memoKey, JSON.stringify(jsonMetadata), async function(err, result) {
                if (err) {
                    reject(`error in accountCreate, err: ${err}, params: newLogin: ${newLogin}, password: ${password}, creatorLogin: ${creatorLogin}, creatorActiveKey: ${creatorActiveKey}, fee: ${fee}, jsonMetadata: ${jsonMetadata}, result: ${result}`);
                }
                await GolosService.sendGolosPower(creatorLogin, creatorActiveKey, newLogin, '1.000 GOLOS')
                let keys = golos.auth.getPrivateKeys(newLogin, password);
                if (keys) {
                    resolve(keys.active);
                } else {
                    reject(`error in accountCreate, missing private keys`);
                }
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

    static async getAccountTransactions(login) {
        return new Promise((resolve, reject) => {
            golos.api.getAccountHistory(login, 10000, 2000, function(err, result) {//TODO: make full transactions list download
                if (err) {
                    reject(`error in getAccountTransactions, err: ${err}, params: login: ${login}`);
                }
                let res = result.filter((e)=> e[1].op[0] === 'transfer').map((e) => e[1])
                resolve(res);
            });
        })
    }

    /**
     * Method loads accounts with polls
     * @param pollAccountsLogins string array with logins
     */
    static async getPollAccounts(pollAccountsLogins) {
        return new Promise((resolve, reject) => {
            golos.api.getAccounts(pollAccountsLogins, function (err, result) {
                if (err) {
                    reject(`error in getPollAccounts, err: ${err}, params: pollAccountsLogins: ${pollAccountsLogins}`);
                }
                resolve(result)
            });
        });
    }

    static async transferTokens(sender, senderActiveKey, receiver, amount, memo) {
        return new Promise((resolve, reject) => {
        golos.broadcast.transfer(senderActiveKey, sender, receiver, amount, memo, function(err, result) {
            if (err) {
                reject(`error in transferTokens, err: ${err}, params: sender: ${sender}, senderActiveKey: ${senderActiveKey}, receiver: ${receiver}, amount: ${amount}, memo: ${memo}`);
            }
            resolve(result)
        });
        });
    }
}