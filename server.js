var express = require('express')
var bodyParser = require('body-parser')
var _ = require('underscore');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/house_listing_database';
var pg = require('pg');
var bcrypt   = require('bcrypt-nodejs');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var app = express();
var session = require('express-session');

app.use(bodyParser.json())
app.use(express.static('views'));
app.use(cookieParser());
app.use(express.static('js'));
app.use('/css', express.static(__dirname + '/css'));
app.use(session({ secret: 'sessionistotallysecret' }));

app.get('/api/explore/:section',function(req, res)
{
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      var queryStr = "SELECT * FROM posts WHERE type="
      if(req.params.section.indexOf("home") != -1)
      {
        queryStr += "'Home'"
      }
      else {
        queryStr += "'Apartment'"
      }
      var query = client.query(queryStr);
      var results = [];
      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json({'results': results});
      });
  });
});

app.get('/posts/:postId', function(req, res){
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      var query = client.query("SELECT * FROM posts INNER JOIN users ON poster = user_name WHERE postId = $1", [req.params.postId]);
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json(results[0]);
      });
  });
});

app.get('/api/users/:userName/posts', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      var query = client.query("SELECT * FROM posts WHERE poster = $1",[req.params.userName]);
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json({'results': results});
      });
  });
});

app.get('/check_signup_constraints', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      var query = client.query("SELECT * FROM users WHERE user_name = $1 OR email = $2",[req.query.userName, req.query.email ]);
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json(results);
      });
  });
});
app.get('/api/search', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      searchQueryStr = "SELECT * FROM posts WHERE ";
      var counter = 1;
      var arrOfParams = [];
      if(req.query.min_sq_ft)
      {
        searchQueryStr += "square_feet >= $" + counter + " AND ";
        counter++;
        arrOfParams.push(parseInt(req.query.min_sq_ft));
      }
      if(req.query.max_sq_ft)
      {
        searchQueryStr += "square_feet <= $" + counter + " AND ";
        counter++;
        arrOfParams.push(parseInt(req.query.max_sq_ft));
      }
      searchQueryStr += "location = $" + counter + " AND ";
      counter++;
      arrOfParams.push(req.query.location)

      searchQueryStr += "action = $" + counter + " AND ";
      counter++;
      arrOfParams.push(req.query.action)

      searchQueryStr += "(type=";
      var arrOfTypes = req.query.type.split(",");
      for(var i = 0; i < arrOfTypes.length; i++)
      {
        if(i != arrOfTypes.length -  1)
        {
          searchQueryStr += "$" + counter + " OR type=";
        }
        else {
          searchQueryStr += "$" + counter + ")";
        }
        counter++;
        arrOfParams.push(arrOfTypes[i])
      }
      var query = client.query(searchQueryStr, arrOfParams);
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json({'results': results});
      });
  });
});

app.post('/addReview', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      var query = client.query("INSERT INTO FROM users WHERE user_name = $1",[req.params.userName]);
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json(results[0]);
      });
  });
});

app.post('/new_review', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      client.query("INSERT INTO reviews VALUES($1, $2, $3, $4, $5)",[req.body.userreviewed, req.body.byuser, req.body.review, req.body.summary, req.body.stars]);
      var query = client.query("SELECT * FROM users INNER JOIN reviews ON user_name = userreviewed WHERE user_name = $1",[req.body.userreviewed]);
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          res.json(results);
      });
  });
})

app.get('/users/:userName', function(req, res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      var query = client.query("SELECT * FROM users INNER JOIN reviews ON user_name = userreviewed WHERE user_name = $1",[req.params.userName]);
      var results = [];
      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });
      console.log(query);
      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          if(results.length != 0)
          {
            return res.json(results);
          }
          else {
            var regularResults = []
            var query2 = client.query("SELECT * FROM users WHERE user_name = $1",[req.params.userName]);
            query2.on('row', function(row) {
                regularResults.push(row);
            });
            query2.on('end', function() {
              done();
              return res.json(regularResults);
            });
          }
      });
  });
})
app.get('/isLoggedIn', function(req,res)
{
  res.json([req.session.userLoggedIn]);
})

app.post('/login', function(req, res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      var query = client.query("SELECT * FROM users WHERE user_name = $1", [req.body.user_name]);
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          if(results.length == 0)
          {
            return res.json([]);
          }
          if(bcrypt.compareSync(req.body.password, results[0].password))
          {
            req.session.userLoggedIn = req.body.user_name;
            return res.json(results);
          }
          else {
            return res.json([]);
          }
      });
  });
})

app.get('/logout', function(req,res)
{
  req.session.userLoggedIn = null;
  res.json([req.session.userLoggedIn]);
})
app.get('/updatePasswordForUser', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }
      var updateQueryStr = "UPDATE users SET "
      arrOfParams = []
      if(req.query.password)
      {
        updateQueryStr += "password=$1 WHERE";
        arrOfParams.push(bcrypt.hashSync(req.query.password));
      }
      updateQueryStr += " user_name=$2";
      arrOfParams.push(req.query.user_name);
      client.query(updateQueryStr, arrOfParams);
      var query = client.query("SELECT * FROM users WHERE user_name = $1", [req.query.user_name])
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json(results[0]);
      });
  });
});

app.get('/check_email_availability', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }
      var query = client.query("SELECT * FROM users WHERE email = $1", [req.query.email])
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json(results);
      });
  });
});
app.post('/upload', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }
      client.query("INSERT INTO posts VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)", [req.body.postid, req.body.source, req.body.name, req.body.action, req.body.description, req.body.type, req.body.location, req.body.square_feet, req.body.poster])
      var query = client.query("SELECT * FROM posts WHERE postid = $1", [req.body.postid])
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json(results[0]);
      });
  });
});

app.delete('/api/posts/:postId', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }
      var query = client.query("DELETE FROM posts WHERE postid=$1", [req.params.postId])
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json([]);
      });
  });
});
app.post('/update_credentials', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }
      var updateQueryStr = "UPDATE users SET "
      arrOfParams = []
      if(req.body.password)
      {
        updateQueryStr += "password=$1 WHERE";
        arrOfParams.push(bcrypt.hashSync(req.body.password));
      }
      else {
        updateQueryStr += "email=$1 WHERE";
        arrOfParams.push(req.body.email);
      }
      updateQueryStr += " user_name=$2";
      arrOfParams.push(req.body.user_name);
      client.query(updateQueryStr, arrOfParams);
      var query = client.query("SELECT * FROM users WHERE user_name = $1", [req.body.user_name])
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          return res.json(results[0]);
      });
  });
})
app.post('/create_user', function(req,res)
{
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      client.query("INSERT INTO users VALUES($1,$2,$3)", [req.body.email, bcrypt.hashSync(req.body.password), req.body.user_name]);
      var query = client.query("SELECT * FROM users WHERE user_name = $1", [req.body.user_name])
      var results = [];

      // Stream results back one row at a time
      query.on('row', function(row) {
          results.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          req.session.userLoggedIn = results[0].user_name;
          return res.json(results);
      });
  });
})

app.listen(3000, function () {
  console.log('Server listening on', 3000)
})
