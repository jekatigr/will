const DatabaseService = require('./DatabaseService')
const GolosService = require('./GolosService')

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
     * @param ownerId poll owner id
     * @param title poll title
     * @param description poll desc
     * @param options poll vote options (array of strings)
     */
    static async createPoll(ownerId, title, description, options) {
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
                    return true;
                }
            }
        } catch (ex) {
            console.log(`error in createPoll, params: ownerId: ${ownerId}, title: ${title}, description: ${description}, options: ${options}, ex: ${ex}`)
        }
        return false;
    }

    static async getPolls() {
        try {
            let pollAccounts = await DatabaseService.getPollAccounts() || [];
            let logins = pollAccounts.map((p) => p.login);
            if (logins.length > 0) {
                let accounts = await GolosService.getPollAccounts(logins);
                let polls = accounts.map((a) => JSON.parse(a.json_metadata));
                return polls;
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
                    let memo = "123"
                    await GolosService.transferTokens(baseAccount.login, baseAccount.active_key, receiverAccount.remote_login, golos_amount, memo)
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
                        let memo;
                        try {
                            memo = JSON.parse(t.op[1].memo);
                        } catch (ex) {
                            console.log(`Error while parsing memo, memo: ${t.op[1].memo}`)
                        }
                        let sender = t.op[1].from;
                        let amount = +(t.op[1].amount.replace('GOLOS', ''))
                        if (memo && memo.spent) {
                            let pollId = WillService.checkMemoSignature(account.remote_login, memo)
                            if (pollId && !pollIdsVoted.includes(pollId)) {
                                pollIdsVoted.push(pollId)
                                balance -= amount;
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
    * Транзакции за голосования подписывать хэшем, при подсчете голосов учитывать только первый подписанный хэш для голосования с аккаунта.
    * Остальные переводы с данного аккаунта не учитывать.
    *
    * memo id аккаунта голосования, индекс выбранного варианта и хэш, подписывающий логин и этот id
    *
    * Возвращает undefined в случае некорректной подписи, либо id аккаунта голосования в случае корректной
    * */
    static async checkMemoSignature(login, memo) {
        let id = memo.id;
        let sign = memo.s;
        let option = memo.o;

        if (sign && option) {
            return id;
        } else {
            return undefined;
        }
    }

    static async vote(pollId, option, login) {
        let balance = await WillService.getAccountBalance(login);
        if (balance && balance > 1) {
            try {
                let pollAccount = await DatabaseService.getPollAccount(pollId);
                let senderAccount = await DatabaseService.getGolosUserAccount(login);
                if (pollAccount && senderAccount) {
                    let pollGolosAccount = await GolosService.getPollAccounts([pollAccount.login]);
                    if (pollGolosAccount) {
                        pollGolosAccount = pollGolosAccount[0];
                        let pollInfo = JSON.parse(pollGolosAccount.json_metadata);
                        let optionIndex = pollInfo.o.indexOf(option);
                        if (optionIndex > -1) {
                            let numberOfTries = 10;
                            while (numberOfTries >= 0) {
                                console.log(`try to vote, poll id: ${pollId}, poll account: ${JSON.stringify(pollAccount)} account from base: ${JSON.stringify(senderAccount)}`)
                                try {
                                    let golos_amount = "1.000 GOLOS"
                                    let memo = JSON.stringify({
                                        id: pollId,
                                        o: optionIndex,
                                        s: "sign"
                                    })
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
                }
            } catch (ex) {
                console.log(`Error, ex: ${ex}`)
            }
        }
        return false;
    }
}