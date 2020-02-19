const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
//setting up the app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect('/urls/')
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  }
  else {
    //TODO: short url doesnt exist
  }
});

//this code is the code that is executed whenever you click on a shortened url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//json urls
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//delete url post
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(`deleted url ${req.params.shortURL} from urlDatabase`);
  res.redirect(`/urls/`)
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  const claimedUser = {
    id: '',
    email: req.body.email,
    password: req.body.password
  };
  const actualUser = getUserFromEmail(claimedUser.email);
  console.log(actualUser);
  if (claimedUser.email === actualUser.email && claimedUser.password === actualUser.password) {
    res.cookie("user_id", actualUser.id);
    res.redirect('/urls');
  }
  else {
  res.status(403).send("Status 403")
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const user = {
    id: generateRandomString(8),
    email: req.body.email,
    password: req.body.password
  };
  console.log(getUserFromEmail(user.email))
  if (user.email && user.password && !getUserFromEmail(user.email).id) {
    users[user.id] = user;
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(400).send("Status 400");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//return the user with the email associated
const getUserFromEmail = (email) => {
  return Object.values(users).filter((user) => { return user.email === email })[0] || {
    id: undefined,
    email: '',
    password: ''
  };
}

const generateRandomString = (length) => {
  const alphaNumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let rndString = ""
  for (let i = 0; i < length; i++) {
    const rng = Math.floor(Math.random() * 62);
    rndString += alphaNumeric[rng];
  }
  return rndString;
}
