const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@127.0.0.1:5432/groups'
});

module.exports.links = {
	getAll: function(){
		return pool.query('SELECT id, title, group_id FROM links');
	},
	getById: function(id){
		return pool.query('SELECT * FROM links WHERE "id" = $1', [id]);
	},
	insert: function(link){
		return pool.query('INSERT INTO links (title, group_id, "user", tokens) VALUES ($1, $2, $3, to_tsvector($1))', link);
	},
	delete: function(id){
		return pool.query('DELETE FROM links WHERE "id" = $1', [id]);
	},
	update: function(id, title){
		console.log(title);
		return pool.query('UPDATE links SET title = $1 WHERE "id" = $2', [title, id]);
	},
	search: function(input){
		let values = input.replace(/\s+/g, ' ').trim().split(' ').join(' & ');
		return pool.query("SELECT * FROM links WHERE tokens @@ to_tsquery($1)", [values]);
	}
};

module.exports.user = {
	getById: function(id){
		return pool.query('SELECT * FROM users WHERE id = $1', [id]);
	},
	getByUsername: function(username){
		return pool.query('SELECT * FROM users WHERE username = $1', [username]);
	},
	add: function(username, password){
		return pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
	},
	getGroups: function(id){;
		return pool.query('SELECT id, title, group_id FROM links WHERE "user" = $1', [parseInt(id)]);
	}
}