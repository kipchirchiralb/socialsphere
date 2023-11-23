const mysql = require("mysql");

const mysqlconn = mysql.createConnection({
  host: "127.0.0.1",
  database: "socialspheredb",
  user: "root",
  password: "",
});

// test the db connection
mysqlconn.connect((err) => {
  if (err) {
    console.log("Db Connection Error: " + err.message);
  } else {
    console.log("Db Connected Successfully ");
  }
});

mysqlconn.query(
  "CREATE TABLE users(userID INT AUTO_INCREMENT, username VARCHAR(50), email VARCHAR(200), password VARCHAR(255), dateJoined DATE DEFAULT CURRENT_DATE, fullName VARCHAR(100), address VARCHAR(100), PRIMARY KEY(userID))",
  (err) => {
    if (err) console.log("SQL Error: " + err.message);
  }
);

mysqlconn.query(
    "CREATE TABLE posts(postID INT AUTO_INCREMENT, userID INT(11), post TEXT, imageLink VARCHAR(255), timeCreated DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(postID), FOREIGN KEY(userID) REFERENCES users(userID) )",
    (err) => {
      if (err) console.log("SQL Error: " + err.message);
    }
  );
  mysqlconn.query(
    "CREATE TABLE comments(commentID INT AUTO_INCREMENT, postID INT(11), userID INT(11), comment TEXT, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(commentID), FOREIGN KEY(userID) REFERENCES users(userID), FOREIGN KEY(postID) REFERENCES posts(postID))",
    (err) => {
      if (err) console.log("SQL Error: " + err.message);
    }
  );