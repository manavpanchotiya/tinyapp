const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['f6d8a74b17e9c602']
}));

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function getUserByEmail(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
}

function urlsForUser(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}

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
//Fetch info/view info => app.get request
//Modify/Create new info => app.post

//get index page //
app.get("/", (req, res) => {
  res.send("Hello!");
});

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

// edit url
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  const urlEntry = urlDatabase[shortURL];

  if (!userId) {
    return res.status(401).send("You must be logged in to edit URL.");
  }

  if (!urlEntry) {
    return res.status(401).send("URL not found");
  }

  if (urlEntry.userId !== userId) {
    return res.status(403).send("You don't own this URL");
  }

  urlEntry.longURL = req.body.newLongURL;
  res.redirect("/urls/");
});

//username login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).send("User not found with this email address.");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password.");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//new login template
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

//get register page route
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register");
  }
});

//post register
app.post("/register", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password || email.trim() === '' || password.trim() === '') {
    return res.status(400).send('Email or password cannot be empty');
  }

  if (getUserByEmail(email)) {
    return res.status(400).send("Already registered with this email");
  }

  const hashedPassword = bcrypt.hashSync(password,10);

  const id = generateRandomString();
  const user = {id, email, password: hashedPassword};
  users[id] = user;
  req.session.user_id = user.id;
  
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  
  if (!user) {
    return res.status(401).send(`<h2>You must be logged in to view URLs.</h2><p><a href="/register">Register</a></p>`);
  }

  const userUrls = urlsForUser(userId);
  const templateVars = {
    urls: userUrls,
    user: user
  };
  res.render("urls_index", templateVars);
});

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
  
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("<h2>URL not found</h2>");
  }

  if (urlDatabase[shortURL].userId !== userId) {
    return res.status(403).send(`<h2> You do not have permission to view this URL. </h2>`);
  }

  if (!user) {
    return res.status(401).send(`<h2>You must be logged in to view the URL</h2><p><a href="/login">Login</a></p>`);
  }

  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL].longURL, user};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req,res) => {
  const id = req.params.id;
  const urlEntry = urlDatabase[id];
  const longURL = urlEntry.longURL;
  if (!longURL) {
    return res.status(404).send("Short URL not found or does not exist");
  }
  
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});