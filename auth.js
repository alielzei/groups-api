var express = require('express'),
	bcrypt = require('bcrypt'),
	router = express.Router();

var db = require('./db');

router.get('/loadUser', (req, res) => {
	if(req.signedCookies['id']){
		res.json({ loggedIn: true });
	}else{
		res.json({ loggedIn: false });
	}
});

router.post('/signup', (req, res) => {
	db.user.getByUsername(req.body['username']).then(result => {
		var user = result.rows[0];
		if(!user){
			bcrypt.hash(req.body['password'], 10, (err, hash) => {
				db.user.add(req.body['username'], hash)	
				.then( () => {
					res.json({ msg: 'success' });
				})
				.catch( (err) => {
					console.error(err);
					res.status(500).json();
				});
			});
		}else{	
			res.status(400).json({ msg: 'username exists' });
		}
	});
});

router.post('/login', (req, res) => {
	db.user.getByUsername(req.body['username']).then(result => {
		var user = result.rows[0];
		if(user){
			bcrypt.compare(req.body['password'], user['password'], (err, equal) => {
				if(equal){
					res.cookie('id', user['id'], {
						httpOnly: true,
						signed: true, 
						//make secure after https
					});
					res.status(200).json({ msg: 'logged in' });
				}else{	
					res.status(400).json({ msg: 'incorrect credentials' });
				}
			});
		}else{
			res.status(400).json({ msg: 'username not found' });
		}
	})
	.catch( (err) => {
		console.error(err);
		res.status(500).json();
	});
});

router.get('/logout', (req, res) => {
	res.clearCookie('id');
	res.json({msg: 'logged out'});
});

module.exports = router;