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
        default: return state
    }
}