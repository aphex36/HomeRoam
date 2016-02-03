var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/house_listing_database';
var client = new pg.Client(connectionString);

client.connect();
var query = client.query('CREATE TABLE users(email VARCHAR(50) UNIQUE, password TEXT, user_name VARCHAR(20) PRIMARY KEY); CREATE TABLE posts(postid VARCHAR(10) PRIMARY KEY, source TEXT,  name VARCHAR(50), action VARCHAR(20), description VARCHAR(1000), type VARCHAR(20), location VARCHAR(20), square_feet REAL, poster VARCHAR(20) REFERENCES users(user_name)); CREATE TABLE reviews(userreviewed VARCHAR(20) REFERENCES users(user_name), byuser VARCHAR(20) REFERENCES users(user_name),  review VARCHAR(3000), summary VARCHAR(50), stars INTEGER)');
query.on('end', function() {
    client.end();
 });
