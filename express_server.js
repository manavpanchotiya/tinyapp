const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

//delete url
app.post("/urls/delete/:id", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// edit url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls/");
});

//username login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

//get register page route
app.get("/register", (req, res) => {
  res.render("register");
})

app.get("/urls", (req, res) => {
  const username = req.cookies.username; // Assume cookie stores username
  const templateVars = {
    urls: urlDatabase,
    username: username
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req,res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});