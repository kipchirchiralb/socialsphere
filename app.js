const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });
const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  database: "socialspheredb",
  user: "root",
  password: "",
});
const app = express(); // creating an express server
app.set("view engine", "ejs");
app.use(express.static("public")); // set a folder to server static files
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "encryptionkeytext",
    resave: false,
    saveUninitialized: true,
  })
);
// a custom middleware--- a function tha runs on every request
app.use((req, res, next) => {
  console.log(req.session.email);
  if (req.session.email) {
    res.locals.isLoggedIn = true;
  } else {
    res.locals.isLoggedIn = false;
  }
  next();
});

app.get("/", (req, res) => {
  connection.query(
    "SELECT * FROM posts JOIN users ON posts.userID = users.userID",
    (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .render("error", { errorMessage: "Internal Server Error" });
      } else {
        console.log(data);
        res.render("home", { posts: data });
      }
    }
  );
});
app.post("/create-post", upload.single("postimage"), (req, res) => {
  let imageName = null;
  if (req.file) {
    imageName = req.file.filename;
  }
  if (req.session.email) {
    // insert new post to db
    connection.query(
      "INSERT INTO posts(userID,post,imageLink) VALUES(?,?,?)",
      [req.session.userID, req.body.newpost, imageName],
      (err) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .render("error", { errorMessage: "Internal Server Error" });
        }
        res.redirect("/");
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.get("/profile", (req, res) => {
  if (req.session.email) {
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [req.session.email],
      (error, userArr) => {
        if (error)
          return res
            .status(500)
            .render("error", { errorMessage: "Internal Server Error" });
        res.render("profile", { user: userArr[0] });
      }
    );
  } else {
    res.redirect("/login");
  }
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/login", (req, res) => {
  res.render("login", { creationSuccess: req.query.creationSuccess });
});
app.get("/logout", (req, res) => {
  // Destroy the session to log the user out
  req.session.destroy((err) => {
    if (err) {
      res
        .status(500)
        .render("error", { errorMessage: "Internal Server Error" });
    } else {
      res.redirect("/");
    }
  });
});
app.get("/post", (req, res) => {
  res.render("post");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.post("/create-account", (req, res) => {
  // recieve the data from the client
  // check if username or email are already registered/usered-- if so inform client
  // hash/encrypt the password
  // create a new user/insert new user data to the db and redirect the person to the login page
  connection.query(
    "SELECT username,email FROM users WHERE username = ? OR email = ?",
    [req.body.username, req.body.email],
    (qError1, data) => {
      if (qError1)
        return res.status(500).render("error", {
          errorMessage: "500 Error: Internal Server Error",
        });
      if (data.length > 0) {
        // either the email or username was found
        res.render("signup", {
          errorMessage: "Either email or username already in use",
        });
      } else {
        //continue to create account since username and email were not found existing in db
        connection.query(
          "INSERT INTO users(username,email,fullName,address,password) VALUES(?,?,?,?,?)",
          [
            req.body.username,
            req.body.email,
            req.body.fullname,
            req.body.address,
            bcrypt.hashSync(req.body.password, 7),
          ],
          (insertError) => {
            if (insertError)
              return res.status(500).render("error", {
                errorMessage: "500 Error: Internal Server Error",
              });
            res.redirect("/login?creationSuccess=true");
          }
        );
      }
    }
  );
});
app.post("/login", (req, res) => {
  // recieve email and password from client
  //check if email is registerd and password provided is correct, if not inform client else create a session and redirect client to home page
  connection.query(
    "SELECT email, password,userID FROM users WHERE email = ?",
    [req.body.email],
    (qError, user) => {
      if (qError) {
        return res.status(500).render("error", {
          errorMessage: "500 Error: Internal Server Error",
        });
      }
      if (user.length < 1) {
        // email is not registered
        return res.render("login", {
          loginError: "Email or Password Incorrect",
        });
      }
      if (bcrypt.compareSync(req.body.password, user[0].password)) {
        // password matched -- create a session
        // differentiate Authentication, Encryption, and Authorization
        req.session.email = user[0].email; // this will create a session for the email signed in
        req.session.userID = user[0].userID;
        res.redirect("/");
      } else {
        res.render("login", { loginError: "Email or Password Incorrect" });
      }
    }
  );
});
//404 error
app.use((req, res) => {
  res.status(404).render("error", {
    errorMessage: "404 Error: Page Requested was not found",
  });
});
app.listen(3001);
