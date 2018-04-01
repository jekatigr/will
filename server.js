const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const passport = require('passport');

const { localStrategy, serializeUser, deserializeUser, isAuthenticated } = require('./services/AuthenticationService');
const DatabaseService = require('./services/DatabaseService');
const WillService = require('./services/WillService');

const { NODE_ENV } = process.env

const dev = (NODE_ENV) ? NODE_ENV.trim() !== 'production' : true;
console.log(`Development mode: '${dev}'`);

const app = next({ dev });
const handler = app.getRequestHandler();

const PORT = 3001;

app
    .prepare()
    .then(() => {
        const server = express();
        server.use(compression());

        server.use(bodyParser.urlencoded({ extended: true }));
        server.use(bodyParser.json());

        server.use(cookieParser('SECRET'));
        server.use(session({
            name: 'sid',
            keys: ['SECRET'],
            maxAge: 7 * 24 * 60 * 60 * 1000 // week
        }));
        server.use(passport.initialize());
        server.use(passport.session());
        passport.use(localStrategy);
        passport.serializeUser(serializeUser);
        passport.deserializeUser(deserializeUser);

        const router = express.Router();

        if (dev) {
            router.use((req, res, next) => { //api delay
                setTimeout(next, 500);
            })
        }

        router.post('/login', function handleLocalAuthentication(req, res, next) {
            passport.authenticate('local', function(err, user, info) {
                if (err) return next(err);
                if (!user) {
                    if (info && info.message === "Missing credentials") {
                        return res.status(401).json({ error: 'INVALID_CREDENTIALS'});
                    } else {
                        return res.status(401).json(info);
                    }
                }

                req.login(user, async function(err) {
                    if (err) return next(err);

                    let resultUser = await DatabaseService.getUserAccountById(user.id);

                    return res.json({
                        success: true,
                        user: resultUser
                    });
                });

            })(req, res, next);
        });

        router.get('/logout', function(req, res) {
            req.logout();
            res.json({success: true});
        });

        router.get('/balance', isAuthenticated, async function(req, res) {
            try {
                let login = req.user.login;
                let balance = await WillService.getAccountBalance(login);
                let data;
                if (balance !== false) {
                    data = {
                        success: true,
                        balance: balance
                    }
                } else {
                    data = {success: false}
                }
                res.json(data);
            } catch (ex) {
                console.error(`Request exception on "${req.originalUrl}", ex: ${ex}`);
                res.json({success: false, error: "Internal error. Please, try again later."})
            }
        });

        router.post('/buy', isAuthenticated, async function(req, res) {
            try {
                let login = req.user.login;
                let amount = +req.body.amount;
                let result = await WillService.buyTokens(req.user.login, amount);
                let data;
                if (result) {
                    let balance = await WillService.getAccountBalance(login)
                    data = {
                        success: true,
                        balance: balance
                    }
                } else {
                    data = {success: false}
                }
                res.json(data);
            } catch (ex) {
                console.error(`Request exception on "${req.originalUrl}", ex: ${ex}`);
                res.json({success: false, error: "Internal error. Please, try again later."})
            }
        });

        server.use('/api/v1', router);

        server.get('*', (req, res) => {
            return handler(req, res)
        });

        server.listen(PORT, (err) => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${PORT}`)
        })
    })