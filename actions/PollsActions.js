import * as c from '../constants/Polls';
import { get } from '../utils/fetch';
import { showNotificationError } from '../utils/UIkitWrapper';
import Router from 'next/router'

const functions = {
    loadPolls: (isServer, user) => {
        return async (dispatch, getState) => {
            if (!isServer) {
                let state = getState();
                if (!state.Polls.pollsLoaded) {
                    dispatch(functions.requestPolls())
                    let res = await get('api/v1/polls');
                    if (res && res.success && res.polls) {
                        dispatch(functions.receivePolls(res.polls))
                    } else {
                        showNotificationError("Ошибка при загрузке списка голосований, попробуйте позже.")
                        dispatch(functions.receivePollsError())
                    }
                }
            }
        }
    },

    requestPolls: () => ({
        type: c.REQUEST_POLLS
    }),

    receivePolls: (polls) => ({
        type: c.RECEIVE_POLLS,
        polls: polls
    }),

    receivePollsError: () => ({
        type: c.RECEIVE_POLLS_ERROR
    }),

    handlePollAdded: (poll) => ({
        type: c.ADD_CREATED_POLL,
        poll: poll
    }),

    handleVoteAdded: (pollId, optionIndex) => ({
        type: c.ADD_VOTE,
        pollId: pollId,
        optionIndex: optionIndex
    })
}

export default functions
