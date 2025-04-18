const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail } = require("./helpers");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['f6d8a74b17e9c602', 'gtdg6458hfgh547q']
}));

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

//helper function to get URLs for specific user
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID" },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID"}
};

//stores and access users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//index page route
app.get("/", (req, res) => {
  res.send("Welcome to TinyApp!");
});

//creates new shrt URL
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    return res.status(403).send('<h1>You must be logged in to view short URLs</h1><p></p>');
  }
  const newLongURL = req.body.longURL;
  const id = generateRandomString();

  urlDatabase[id] = { longURL: newLongURL, userId: userId };
  res.redirect(`/urls/${id}`);
});

//delete url
app.post("/urls/delete/:id", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

//edit url
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  const urlEntry = urlDatabase[shortURL];

  if (!userId) {
    return res.status(401).send("You must be logged in to edit URL.");
  }

  if (!urlEntry) {
    return res.status(404).send("URL not found.");
  }

  if (urlEntry.userId !== userId) {
    return res.status(403).send("You don't own this URL.");
  }

  urlEntry.longURL = req.body.newLongURL;
  res.redirect("/urls");
});

//user login form submission
app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  

  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("User not found with this email address.");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password.");
  }
  req.session.user_id = user.id; //sets user session
  res.redirect("/urls"); // redirects to urls
});

//login template
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//get register page
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register");
  }
});

//post register form
app.post("/register", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password || email.trim() === '' || password.trim() === '') {
    return res.status(400).send('Email or password cannot be empty.');
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send(`<h2>Already registered with this email</h2> <p><a href="/login">Login here</a></p>`);
  }

  const hashedPassword = bcrypt.hashSync(password,10);

  const id = generateRandomString();
  const user = {id, email, password: hashedPassword};
  users[id] = user;
  req.session.user_id = user.id;
  
  res.redirect("/urls");
});

//renders urls list for logged in user
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  
  if (!user) {
    return res.status(401).send(`<h2>You must be logged in to view URLs.</h2><p><a href="/register">Register</a></p>`);
  }

  const userUrls = urlsForUser(userId, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: user
  };
  res.render("urls_index", templateVars);
});

//shows page to create new url
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  
  if (!user) {
    return res.redirect("/login");
    
  }
  
  const templateVars = { user };
  res.render("urls_new", templateVars);
      
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const shortURL = req.params.id;

  if (!user) {
    return res.status(401).send(`<h2>You must be logged in to view the URL.</h2><p><a href="/login">Login</a></p>`);
  }
  
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("<h2>URL not found.</h2>");
  }

  if (urlDatabase[shortURL].userId !== userId) {
    return res.status(403).send(`<h2> You do not have permission to view this URL. </h2>`);
  }  

  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL].longURL, user};
  res.render("urls_show", templateVars);
});

//redirects from short to long URL page
app.get("/u/:id", (req,res) => {
  const id = req.params.id;
  const urlEntry = urlDatabase[id];
  const longURL = urlEntry.longURL;
  if (!longURL) {
    return res.status(404).send("Short URL not found or does not exist");
  }
  
  res.redirect(longURL);
});

//starts the server
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

module.exports = { urlsForUser };