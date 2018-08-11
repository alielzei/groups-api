var express = require('express');
var router = express.Router();

var db = require('./db');

function authorize(req, res, next){
	if(req.signedCookies['id']){
		next();
	}else{
		res.status(401).end();
	};
};

router.get('/links', (req, res) => {
	db.links.getAll()
		.then(result => {
			res.json(result.rows);
		})
		.catch(err => {
			console.error(err);
			res.status(500).end();
		});
});

router.get('/search', (req, res) => {
	const input = req.query['input'];
	if(input){
		db.links.search(input)
		.then(result => {
			res.json(result.rows);
		})
		.catch( err => {
			console.error(err);
			res.status(500).end();
		});
	}else{
		res.status(400).end();
	}
});

function getLinkId(link){
	let base = /^(?:https?:\/\/)*chat\.whatsapp\.com\/(?:invite\/)*(\w+)#?$/;
	if(link.match(base)){
		return link.match(base)[1];
	}
	return null;
};

router.post('/add', authorize, (req,res) => {

	const linkId = getLinkId(req.body['link']);

	if(!req.body['title'] ){
		res.status(400).json({msg: 'title cannot be empty' });
	}else if(linkId === null){
		res.status(400).json({ msg: 'invalid link' });
	}else{
		var link = [
			req.body['title'], 			// title
			linkId, 								// link
			req.signedCookies['id'] // user
		];
		db.links.insert(link)
			.then( () => {
				res.json({ msg: 'success' });
			})
			.catch( err => {
				console.error(err);
				res.status(500).end();
			});
	}
});

router.post('/delete', authorize, (req,res) => {
	if (!isNaN(req.body['id'])){ 
		let id = parseInt(req.body['id']);
		db.links.getById(id)
			.then(result => {
				var link = result.rows[0];
				if(!link){
					res.status(404).json({msg: "link not found"});
				}else if(parseInt(link['user']) === parseInt(req.signedCookies['id'])){
					db.links.delete(id)
						.then( () => {
							res.json({ msg: "delete success"});
						})
						.catch( err => {
							console.error(err);
							res.status(500).end();
						});
				}else{
					res.status(401).end();
				}
			})
			.catch( err => {
				console.error(err);
				res.status(500).end();
			});
	}else{
		res.status(400).end({ msg: 'invalid id' });
	}
});

module.exports = router;