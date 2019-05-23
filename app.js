const express = require('express');
const db = require('./database/db');
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cacheProvider = require('./cache-provider');
const flash = require('connect-flash');
const session = require('express-session');
const fs = require("fs");
const cmd = require('node-command-line')
// const FileStore = require('session-file-store')(session);


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_LIFETIME = TWO_HOURS,
  SESS_SECRET = 'ssh!quiet,it\'asecret!',
} = process.env


const IN_PROD = NODE_ENV === 'poduction';
// Express session
app.use(session({
  name: SESS_NAME,
  secret: SESS_SECRET,
  // store: new FileStore(),
  resave: true,
  saveUninitialized: true,
  cookies: {
    maxAge: SESS_LIFETIME,
    sameSite: true,
    secure: IN_PROD
  }
}));

app.use(flash());
//
//  global var
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.loggedIn = false;
  next();
});

cacheProvider.start(function (err) {
  if (err) console.error(err);
  console.log('cacheProvider succ')
});

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });



//use morgan
app.use(morgan('dev'));

app.use(cookieParser());

//static setting
app.use(express.static('./public'));

//body parser Middleware
app.use(bodyParser.json());


// Handlebars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//routes Start

const adminProductRoutes = require('./routes/admin/product');

app.use('/admin/product', adminProductRoutes);

const adminCampaignRoutes = require('./routes/admin/campaign');

app.use('/admin/campaign', adminCampaignRoutes);

const adminCheckoutRoutes = require('./routes/admin/checkout.js');

app.use('/admin/checkout', adminCheckoutRoutes);

const apiRoutes = require('./routes/api');
//views/api/1.0
app.use('/api/1.0/', apiRoutes)

//routes/user.js
const userRoutes = require('./routes/user');
//views/user
app.use('/user/', userRoutes)

//routes End



app.get('/checkout', (req, res) => {
  res.send('thanks');
})

app.get('/', (req, res) => {
  const msg = 'Hello';
  res.render('index', {
    msg: msg
  });
});



//Admin
app.get('/admin/product.html', (req, res) => {
  res.render('admin/product');
});

app.post('/git/post', (req, res) => {
  cmd.run('git pull');
  console.log('Executed your command :)');
  res.status(200).send('succ');
})

app.get('/git/post', (req, res) => {
  cmd.run('git --version');
  console.log('Executed your command :)');
})

// https setting

// var options = {
//   key: fs.readFileSync('../../../etc/letsencrypt/live/www.wuhsun.com/privkey.pem'),
//   cert: fs.readFileSync('../../../etc/letsencrypt/live/www.wuhsun.com/cert.pem'),
//   ca: fs.readFileSync('../../../etc/letsencrypt/live/www.wuhsun.com/chain.pem')
// };
//
// let httpsServer = https.createServer(options, app);
//
// httpsServer.listen(443);
// https setting end


app.listen(4000, () => {
  console.log('running 3000');
});
