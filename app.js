const express = require("express");

const app = express(); // creting an express server
app.set("view engine", "ejs");
app.use(express.static("public")); // set a folder to server static files

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/profile", (req, res) => {
  res.render("profile");
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/post", (req, res) => {
  res.render("post");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
//404 error
app.use((req, res) => {
  res.status(404).render("error", {
    errorMessage: "404 Error: Page Requested was not found",
  });
});
app.listen(3001);
