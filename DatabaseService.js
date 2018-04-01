const mysql = require('mysql2/promise');

let connectionPool = undefined;

module.exports = class DatabaseService {
    static async getConnection() {
        if (!connectionPool) {
            connectionPool = await mysql.createPool({
                host: 'localhost',
                port: 3306,
                database: 'willdb',
                user: 'willdbuser',
                password: 'pass',
                connectionLimit: 10
            });
        }

        return await connectionPool.getConnection();
    }

    static async selectQuery(query, params) {
        try {
            const connection = await DatabaseService.getConnection();
            const [rows] = await connection.execute(query, params);
            connection.release();

            if (rows && rows.length > 0) {
                return rows;
            }
            return null;
        } catch (ex) {
            console.error(`DatabaseService exception, query: '${query}', params: '${params}' ex: ${ex}`);
            throw new Error(`DatabaseService exception, query: '${query}', params: '${params}' ex: ${ex}`);
        }
    }

    static async query(query, params) {
        try {
            const connection = await DatabaseService.getConnection();
            let res = await connection.query(query, params);
            connection.release();

            if (res && res[0]) {
                return {
                    affectedRows: res[0].affectedRows,
                    changedRows: res[0].changedRows,
                    insertId: res[0].insertId
                };
            }
        } catch (ex) {
            console.error(`DatabaseService exception, query: '${query}', params: '${params}' ex: ${ex}`);
            throw new Error(`DatabaseService exception, query: '${query}', params: '${params}' ex: ${ex}`);
        }
    }

    static async getBaseAccount() {
        let res = await DatabaseService.selectQuery('SELECT * FROM base_account');
        if (res && res[0]) {
            return res[0]
        }
        return null;
    }

    static async savePollAccount(login) {
        return await DatabaseService.query('INSERT INTO poll_accounts (login) VALUES ?', [[[login]]]);
    }

    static async getPollAccount(pollId) {
        let res = await DatabaseService.selectQuery('SELECT * FROM poll_accounts WHERE id = ?', [pollId]);
        if (res && res[0]) {
            return res[0]
        }
        return null;
    }

    static async getPollAccounts() {
        return await DatabaseService.selectQuery('SELECT * FROM poll_accounts');
    }

    static async saveUserAccount(login, password, remoteLogin, remotePassword, activeKey) {
        return await DatabaseService.query('INSERT INTO accounts (login, password, remote_login, remote_password, active_key) VALUES ?', [[[login, password, remoteLogin, remotePassword, activeKey]]]);
    }

    static async getGolosUserAccount(login) {
        let res = await DatabaseService.selectQuery('SELECT * FROM accounts WHERE login = ?', [login]);
        if (res && res[0]) {
            return res[0]
        }
        return null;
    }
}