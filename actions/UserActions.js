import * as c from '../constants/UserActions';
import { get } from '../utils/fetch';
import { showNotificationError } from '../utils/UIkitWrapper';
import Router from 'next/router'

const functions = {
    loadUser: (user) => ({
        type: c.USER_LOAD,
        user: user
    }),

    handleUserLogin: (user) => ({
        type: c.USER_LOGIN,
        user: user
    }),

    handleBalanceChanged: (balance) => ({
        type: c.BALANCE_CHANGED,
        balance: balance
    }),

    logout: () => {
        return async (dispatch) => {
            try {
                const res = await get('api/v1/logout');

                if (res && res.success) {
                    dispatch(functions.handleUserLogout())

                    Router.push('/login')
                } else {
                    showNotificationError()
                }
            } catch (ex) {
                console.log(`login request failed, exception: ${ex}`);
                showNotificationError();
            }
        }
    },

    handleUserLogout: () => ({
        type: c.USER_LOGOUT
    }),

    loadBalance: (exchangeId) => {
        return async (dispatch, getState) => {
            let state = getState();
            let balanceLoaded = state.User.balanceLoaded;
            if (!balanceLoaded) {
                let data = await get('api/v1/balance')
                if (data && data.success) {
                    dispatch(functions.handleBalanceChanged(data.balance))
                } else {
                    showNotificationError("Ошибка при загрузке баланса.");
                }
            }
        }
    },
}

export default functions
