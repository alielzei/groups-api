var express = require('express'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	auth = require('./auth'),
	crud = require('./crud');

const port = process.env.PORT || 3001;
var app = express();

app.use(bodyParser.json());
app.use(cookieParser('keyboard cat')); //cookie secret
app.use(cors({
	origin: process.env.CORS_ORIGIN || 'http://localhost:3000', //origin
	credentials: true
}));

app.use('/', [auth, crud]);

app.listen(port, () => { //port
	console.log('application online');
});