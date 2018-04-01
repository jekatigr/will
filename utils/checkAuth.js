import userActions from "../actions/UserActions";

export function getAuthenticatedUser(isServer, req, store) {
    let user = null;
    if (isServer) {
        if (req.user) {
            user = req.user;
            store.dispatch(userActions.loadUser(user));
        }
    } else { // get user from state
        let state = store.getState();
        user = state.User ? state.User.user : null;
    }
    return user;
}

export function checkIsUser(user) {
    return (user && user.role === "user");
}
