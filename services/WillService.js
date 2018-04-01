const DatabaseService = require('./DatabaseService')
const GolosService = require('./GolosService')

let aesjs = require('aes-js');
let pbkdf2 = require('pbkdf2');

const SECRET_PASSWORD_KEY = 'SECRET_PASSWORD_KEY'
const SECRET_SALT = 'SECRET_SALT'

let key_128 = pbkdf2.pbkdf2Sync(SECRET_PASSWORD_KEY, SECRET_SALT, 1, 128 / 8, 'sha512');

module.exports = class WillService {
    static async createGolosAccount(loginPrefix, password, fee, jsonMetadata) {
        console.log(`creating new golos account with params: loginPrefix prefix: ${loginPrefix}, password: ${password}, fee: ${fee}, jsonMetadata: ${jsonMetadata}`)
        try {
            let baseAccount = await DatabaseService.getBaseAccount();
            let numberOfTries = 10;
            while(numberOfTries >= 0) {
                console.log(`try to create new account from base: ${baseAccount}`)
                try {
                    let timestamp = ""+new Date().getTime();
                    let login = loginPrefix + timestamp.substr(3, timestamp.length - 3);
                    let activeKey = await GolosService.createAccount(login, password, baseAccount.login, baseAccount.active_key, fee, jsonMetadata)
                    console.log('account created')
                    return {
                        login: login,
                        activeKey: activeKey
                    };
                } catch (ex) {
                    console.log('failed to create new account, ex: ' + ex)
                }
                numberOfTries--;
            }
        } catch (ex) {
            console.log(`Error, ex: ${ex}`)
        }
        return false;
    }

    /**
     * Method creates a poll. Poll params and vote options will be stored in new golos account.
     * @param title poll title
     * @param description poll desc
     * @param options poll vote options (array of strings)
     */
    static async createPoll(title, description, options) {
        try {
            let loginPrefix = "poll-";

            let pass = "1234556";
            let json = {
                t: title,
                d: description,
                o: options
            }
            let res1 = await WillService.createGolosAccount(loginPrefix, pass, '0.000 GOLOS', json)
            if (res1) {
                let res2 = await DatabaseService.savePollAccount(res1.login);
                if (res1 && res2) {
                    return {
                        id: res2.insertId,
                        title: title,
                        description: description,
                        options: options.map((o)=> ({
                            title: o,
                            votesCount: 0
                        }))
                    };
                }
            }
        } catch (ex) {
            console.log(`error in createPoll, params: title: ${title}, description: ${description}, options: ${options}, ex: ${ex}`)
        }
        return false;
    }

    /**
     * Return all polls in format: [{
     *      id,
     *      title,
     *      description,
     *      options: [{
     *          title,
     *          votesCount
     *      },...]
     * },...]
     * @returns {Promise<*>}
     */
    static async getPolls(login) {
        try {
            let userAccount = await DatabaseService.getGolosUserAccount(login);
            let pollAccounts = await DatabaseService.getPollAccounts() || [];
            let logins = pollAccounts.map((p) => p.login);
            if (logins.length > 0) {
                let accounts = await GolosService.getPollAccounts(logins);
                let pollsRaw = accounts.map((a) => JSON.parse(a.json_metadata));

                let requests = logins.map((l) => GolosService.getAccountTransactions(l));
                let transactions = await Promise.all(requests);

                let res = []
                for (let i = 0; i < pollsRaw.length; i++) {
                    let pollRaw = pollsRaw[i];
                    let poll = {
                        id: pollAccounts[i].id,
                        title: pollRaw.t,
                        description: pollRaw.d,
                        options: pollRaw.o.map((o) => ({
                            title: o,
                            votesCount: 0,
                            selected: false
                        }))
                    }

                    let tArr = transactions[i] //транзакции в одном голосовании, считаем по одному голосу от каждого клиента
                    if (tArr && tArr.length > 0) {//проверяем входящие транзакции и считаем голоса для каждого из вариантов
                        let alreadyVoted = []
                        for (let t of tArr) {
                            if (!alreadyVoted.includes(t.sender)) {
                                let memoRaw = t.op[1].memo;
                                let memo = WillService.decodeMemo(memoRaw);
                                if (memo) {
                                    alreadyVoted.push(t.sender)
                                    let optionIndex = memo.optionIndex;
                                    poll.options[optionIndex].votesCount++
                                    if(t.op[1].from === userAccount.remote_login) {
                                        poll.options[optionIndex].selected = true;
                                    }
                                }
                            }
                        }
                    }

                    res.push(poll);
                }

                return res;
            }
            return []
        } catch (ex) {
            console.log(`error in getPolls, ex: ${ex}`)
        }
        return false;
    }

    /**
     * Method creates local user account and golos account representation.
     * @param login local login
     * @param password local password
     */
    static async createUserAccount(login, password) {
        try {
            let loginPrefix = "user-";
            let pass = "1234556";

            let res1 = await WillService.createGolosAccount(loginPrefix, pass, '0.000 GOLOS')
            if (res1) {
                let res2 = await DatabaseService.saveUserAccount(login, password, res1.login, pass, res1.activeKey);
                if (res1 && res2) {
                    return true;
                }
            }
        } catch (ex) {
            console.log(`error in createUserAccount, params: login: ${login}, password: ${password}, ex: ${ex}`)
        }
        return false;
    }

    /**
     * Method sends golos tokens from base account to user.
     * @param login local user login
     * @param amount amount ot tokens
     */
    static async buyTokens(login, amount) {
        try {
            let baseAccount = await DatabaseService.getBaseAccount();
            let receiverAccount = await DatabaseService.getGolosUserAccount(login);
            let numberOfTries = 10;
            while(numberOfTries >= 0) {
                console.log(`try to send tokens to ${receiverAccount.remote_login} account from base: ${baseAccount}`)
                try {
                    let golos_amount = amount.toFixed(3) + " GOLOS"
                    await GolosService.transferTokens(baseAccount.login, baseAccount.active_key, receiverAccount.remote_login, golos_amount, '')
                    console.log('tokens sent')
                    return true;
                } catch (ex) {
                    console.log('failed to send tokens, ex: ' + ex)
                }
                numberOfTries--;
            }
        } catch (ex) {
            console.log(`Error, ex: ${ex}`)
        }
        return false;
    }

    static async getAccountBalance(login) {
        try {
            let baseAccount = await DatabaseService.getBaseAccount();
            let account = await DatabaseService.getGolosUserAccount(login);
            let numberOfTries = 10;
            while(numberOfTries >= 0) {
                console.log(`try to get transactions of ${account.remote_login}`)
                try {
                    let transactions = await GolosService.getAccountTransactions(account.remote_login) || []
                    console.log('got transactions')
                    let balance = 0;

                    let pollIdsVoted = []
                    for (let t of transactions) {
                        let memoEncoded = t.op[1].memo;
                        let sender = t.op[1].from;
                        let amount = +(t.op[1].amount.replace('GOLOS', ''))
                        if (sender === account.remote_login && memoEncoded) {
                            let memo = WillService.decodeMemo(memoEncoded)
                            if (memo) {
                                let pollId = memo.pollId;
                                if (pollId && !pollIdsVoted.includes(pollId)) {
                                    pollIdsVoted.push(pollId)
                                    balance -= amount;
                                }
                            }
                        } else if(sender === baseAccount.login) {
                            balance += amount;
                        }
                    }
                    console.log(`account balance for ${login}: ${balance} GOLOS`)
                    return balance;
                } catch (ex) {
                    console.log('failed to load balance, ex: ' + ex)
                }
                numberOfTries--;
            }
        } catch (ex) {
            console.log(`Error, ex: ${ex}`)
        }
        return false;
    }

    /*
     * Возвращает undefined в случае некорректной подписи, либо расшифрованное memo в случае корректной
    * */
    static decodeMemo(memoEncoded) {
        try {
            // When ready to decrypt the hex string, convert it back to bytes
            let encryptedBytes = aesjs.utils.hex.toBytes(memoEncoded);

            // The counter mode of operation maintains internal state, so to
            // decrypt a new instance must be instantiated.
            let aesCtr = new aesjs.ModeOfOperation.ctr(key_128);
            let decryptedBytes = aesCtr.decrypt(encryptedBytes);

            // Convert our bytes back into text
            let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

            let res = JSON.parse(decryptedText);
            return {
                pollId: res.id,
                optionIndex: res.o
            }
        } catch (ex) {
            console.log(`error while decoding memo, ex: ${ex}`)
        }
        return undefined;
    }

    /**
     * Uses {@link https://github.com/ricmoo/aes-js#ctr---counter-recommended}
     * @param pollId
     * @param optionIndex
     * @returns {string} encrypted hash
     */
    static encodeMemo(pollId, optionIndex) {
        // Convert text to bytes
        let text = JSON.stringify({id: pollId, o: optionIndex});
        let textBytes = aesjs.utils.utf8.toBytes(text);

        // The counter is optional, and if omitted will begin at 1
        let aesCtr = new aesjs.ModeOfOperation.ctr(key_128);
        let encryptedBytes = aesCtr.encrypt(textBytes);

        // To print or store the binary data, you may convert it to hex
        let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        return encryptedHex;
    }

    static async vote(pollId, optionIndex, login) {
        let balance = await WillService.getAccountBalance(login);
        if (balance && balance > 1) {
            try {
                let pollAccount = await DatabaseService.getPollAccount(pollId);
                let senderAccount = await DatabaseService.getGolosUserAccount(login);
                if (pollAccount && senderAccount) {
                    if (optionIndex > -1) {
                        let numberOfTries = 10;
                        while (numberOfTries >= 0) {
                            console.log(`try to vote, poll id: ${pollId}, poll account: ${JSON.stringify(pollAccount)} account from base: ${JSON.stringify(senderAccount)}`)
                            try {
                                let golos_amount = "1.000 GOLOS"
                                let memo = WillService.encodeMemo(pollId, optionIndex);
                                await GolosService.transferTokens(senderAccount.remote_login, senderAccount.active_key, pollAccount.login, golos_amount, memo)
                                console.log('vote sent')
                                return true;
                            } catch (ex) {
                                console.log('failed to vote, ex: ' + ex)
                            }
                            numberOfTries--;
                        }

                    }
                }
            } catch (ex) {
                console.log(`Error, ex: ${ex}`)
            }
        }
        return false;
    }
}