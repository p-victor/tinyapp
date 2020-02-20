const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const normalizeUrl = require("normalize-url");
const { getUrlsByUser, getUserByEmail, generateUID, isValidUrl } = require('./helper')
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {} /* format -> { 
"shortURL": { longURL: "https://www.longURL.ca", userID: "aJ48lW" },
"i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" },
"lololo": { longURL: "https://www.tsn.com", userID: "bJ48lW" }} */

const users = {} /* format -> {
"userId": { id: "aJ48lW", email: "user@example.com", password: "someHashedPassword" },
"bJ48lW": { id: "bJ48lW", email: "user2@example.com", password: "someOtherHashedPassword" }} */

//setting the body-parser and cookie-session modules to be used by express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys: ["user_id"], maxAge: 24 * 60 * 60 * 1000 /*24 hours*/ }));
//setting view engine to ejs
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect('/urls/')
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.session.user_id], urls: getUrlsByUser(req.session.user_id, urlDatabase) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id] }
    res.render("urls_new", templateVars);
  }
  else {
    //TODO refactor this
    res.send("not authenticated");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (getUrlsByUser(req.session.user_id, urlDatabase).includes(req.params.shortURL)) {
    let templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  }
  else {
    res.send("not authenticated");
  }
});

//redirect shortened url to long url
app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase);
  console.log(req.params.shortURL)

  if (urlDatabase[req.params.shortURL]) {
    const { longURL } = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  }
});

//delete url post
app.post("/urls/:shortURL/delete", (req, res) => {
  if (getUrlsByUser(req.session.user_id, urlDatabase).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    console.log(`deleted url ${req.params.shortURL} from urlDatabase`);
    res.redirect(`/urls/`)
  }
  else {
    res.send("not authenticated");
  }
});
app.post("/urls/new", (req, res) => {
  const url = normalizeUrl(req.body.longURL);
  if (users[req.session.user_id]) {
    if (isValidUrl(url)){
      urlDatabase[generateUID(Object.keys(urlDatabase), 8)] = { longURL: url, userID: req.session.user_id };
      res.redirect("/urls");
    }
    else {
      res.send("not a valid url");
    }
  }
  else {
    res.send("not authenticated");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (getUrlsByUser(req.session.user_id, urlDatabase).includes(req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls/");
  }
  else {
    res.send("not authenticated");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const newUser = {
    id: generateUID(Object.keys(users), 6),
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  if (newUser.email && newUser.password && !getUserByEmail(newUser.email, users)) {
    users[newUser.id] = newUser;
    req.session.user_id = newUser.id;
    res.redirect("/urls");
  } else {
    res.status(400).send("Status 400");
  }
});

app.post("/login", (req, res) => {
  const claimedUser = { id: '', email: req.body.email, password: req.body.password };
  const actualUser = getUserByEmail(claimedUser.email, users);
  //checks if there is an actual user with the email adress from the claimed user and check if the hashed passwords match for the claimed user and the actual user
  if (actualUser && bcrypt.compareSync(claimedUser.password, actualUser.password)) {
    req.session.user_id = actualUser.id;
    res.redirect('/urls');
  }
  else {
    res.status(403).send("Status 403")
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});