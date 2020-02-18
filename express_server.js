const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//setting up the app
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect('/urls/')
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  if(urlDatabase[req.params.shortURL]){
  res.render("urls_show", templateVars);
  }
  else{
    res.emit()
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
  res.cookie("username", req.body.username);
    res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
    res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const alphaNumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const rng = Math.floor(Math.random() * 62);
  let rndString = ""
  for( let i = 0; i < 6; i++) { 
    rndString += alphaNumeric[rng];
  }
  return rndString;
}
