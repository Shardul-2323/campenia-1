const express = require('express');
var bodyParser = require("body-parser");
const path = require('path');
var logger = require("morgan");
const mongoose = require('mongoose');
var favicon = require('serve-favicon');
var expressValidator = require("express-validator");
const ejsMate = require('ejs-mate');
var passport = require("passport");
var localStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
var publicRoute = require("./routes/index");
var adminRoute = require("./routes/admin");
var usersRoute = require("./routes/users");
var enforceAuthentication = require('./controls/auth').enforceAuthentication;
const port=process.env.PORT||3000;



const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb+srv://Achilles5330:Goku%405330@cluster0.vqaub.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "30MB", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30MB", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.engine("html", require("ejs").renderFile);
app.use(methodOverride('_method'));
app.use(favicon(__dirname + '/public/photos/favicon.png'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

// Express-validator-middleware
/*app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));*/

app.use(passport.initialize());
app.use(passport.session());

var user = require('./models/users');
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

/**GET: Setting global variable for the logged in user */
app.get("*", (req, res, next) => {
    res.locals.user = req.user || null;
    console.log("User: " + res.locals.user);
    next();
});

/**POST: Setting global variable for the logged in user */
app.post("*", (req, res, next) => {
    res.locals.user = req.user || null;
    console.log("User: " + res.locals.user);
    next();
});

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

// app.get('/', (req, res) => {
//     res.render('home')
// });

app.use("/", publicRoute);
app.use("/user", usersRoute);

app.use("/admin", enforceAuthentication(true, true), adminRoute);


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(port, () => {
    console.log('Serving on port 3000')
})

exports = module.exports = app;


