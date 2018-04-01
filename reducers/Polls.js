import * as c from "../constants/Polls";

const initialState = {
    polls: [],
    pollsLoaded: false,
    pollsLoadingError: false
}

export default (state = initialState, action) => {
    switch (action.type) {
        case c.REQUEST_POLLS:
            return { ...state, pollsLoaded: false, pollsLoadingError: false }
        case c.RECEIVE_POLLS:
            return { ...state, polls: action.polls, pollsLoaded: true }
        case c.RECEIVE_POLLS_ERROR:
            return { ...state, pollsLoaded: false, pollsLoadingError: true }
        case c.ADD_CREATED_POLL: {
            let polls = [...state.polls, action.poll]

            return {
                ...state,
                pollsLoaded: true,
                pollsLoadingError: false,
                polls: polls
            }
        }
        default: return state
    }
}