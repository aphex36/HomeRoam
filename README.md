# HomeRoam

This project is a Node.js/AngularJS/PostgreSQL application that helps users post to try and buy/sell houses. I made this to learn about how to use Node.js with SQL and how to add a working user system.
Unlike my other projects this features a fully working application (with user authentication). I will probably add third party verification with PassportJS later.

To run the application:

- Make sure you have PostgreSQL downloaded and start a port on 5432 and create a database called "house_listing_database"
- Have Node.js installed and run "node database.js" in the project (will create the schema and tables)
- Now run "node server.js" in the directory and open up localhost:3000 on your browser, and it should be working
