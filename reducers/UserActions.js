import * as c from "../constants/UserActions";

const initialState = {
    user: null
}

export default (state = initialState, action) => {
    switch (action.type) {
        case c.USER_LOAD:
            return { ...state, user: action.user }
        case c.USER_LOGIN:
            return { ...state, user: action.user }
        case c.USER_LOGOUT:
            return { ...state, user: null }
        default: return state
    }
}