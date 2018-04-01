const LocalStrategy  = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const DatabaseService = require('./DatabaseService');

const localStrategy = new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password'
}, async function(username, password, done) {
    console.debug('in strategy');
    return await DatabaseService.getUserAccountByLogin(username.trim())
        .then((user) => {
            console.debug('got response from db');
            if (user !== null) {
                return bcrypt.compare(password, user.password)
                    .then((res) => {
                        console.debug("password compare res: " + res);
                        if (res) {
                            return done(null, user)
                        } else {
                            return done(null, false, { error: 'INVALID_CREDENTIALS' })
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        return done({ error: 'INTERNAL_SERVER_ERROR' })
                    });
            }
            return done(null, false, { error: 'INVALID_CREDENTIALS' })
        })
        .catch((err)=>{
            console.error(err);
            return done({ error: 'INTERNAL_SERVER_ERROR' })
        });
})

const serializeUser = function(user, done) {
    console.debug(`in serializeUser, user: ${user}`);
    done(null, user.id);
};

const deserializeUser = async function(id, done) {
    console.debug(`in deserializeUser, id: ${id}`);
    await DatabaseService.getUserAccountById(id)
        .then((user) => {
            if (user != null) {
                return done(null, user);
            } else {
                throw new Error(`user not found, userId: ${id}`)
            }
        })
        .catch((err) => {
            console.error(`Error in deserializeUser, err: ${err}`);
            return done(null, false, {error: err})
        })
};

const isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        console.debug('in isAuthenticated: true');
        return next();
    }
    console.debug('in isAuthenticated: false');
    req.logout();
    res.sendStatus(401);
}

module.exports = {
    localStrategy,
    serializeUser,
    deserializeUser,
    isAuthenticated
}