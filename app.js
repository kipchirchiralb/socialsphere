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

//404 error
app.use((req, res) => {
  res.status(404).render("error", {
    errorMessage: "404 Error: Page Requested was not found",
  });
});
app.listen(3001);
