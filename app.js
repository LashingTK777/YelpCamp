if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}





const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverrider = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet');

const campgroundsRoute = require('./routes/campgrounds');
const reviewsRoute = require('./routes/reviews');
const userRoute = require('./routes/users')
const MongoStore = require('connect-mongo');


//const dbUrl =process.env.DB_URL 
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connection")
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverrider('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));
app.use(helmet({ contentSecurityPolicy: false }));


// const store = new MongoStore.create({
//     mongoUrl: dbUrl,
//     secret: 'thisshouldbeabettersecret',
//     touchAfter: 24 * 60 * 60
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: dbUrl,
        secret,
        touchAfter: 24 * 60 * 60
    }),
    name: 'session',
    secret,
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

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/', userRoute);
app.use('/campgrounds', campgroundsRoute);
app.use('/campgrounds/:id/reviews', reviewsRoute);


app.get('/', (req, res) => {
    res.render('home')
});


app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: "tkjay777@gmail.com", username: "LashingTK777" })
    const newUser = await User.register(user, 'jayhawks');
    res.send(newUser);
})



app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404));
});


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!"
    res.status(statusCode).render('error', { err });
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})

// app.listen(8080, () => {
//     console.log('Serving on port 8080');
// });