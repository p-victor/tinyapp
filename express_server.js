const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {}
// }  
//   "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
//   "i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" },
//   "lololo": { longURL: "https://www.tsn.com", userID: "bJ48lW" },
// };
const users = {}
// }
//   "aJ48lW": {
//     id: "aJ48lW",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//   "bJ48lW": {
//     id: "bJ48lW",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
// }
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
  let userId = req.cookies["user_id"];
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlsForUser(userId) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = { user: users[req.cookies["user_id"]] }
    res.render("urls_new", templateVars);
  }
  else {
    //TODO refactor this
    res.send("not authenticated");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  }
  else {
    res.send("not authenticated");
  }
});

//redirect shortened url to long url
app.get("/u/:shortURL", (req, res) => {
  const { longURL } = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//delete url post
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    delete urlDatabase[req.params.shortURL];
    console.log(`deleted url ${req.params.shortURL} from urlDatabase`);
    res.redirect(`/urls/`)
  }
  else {
    res.send("not authenticated");
  }
});
app.post("/urls/new", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    urlDatabase[generateRandomString(6)] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
    res.redirect("/urls");
  }
  else {
    res.send("not authenticated");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls/");
  }
  else {
    res.send("not authenticated");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const newUser = {
    id: generateRandomString(6),
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  if (newUser.email && newUser.password && !getUserFromEmail(newUser.email)) {
    users[newUser.id] = newUser;
    res.cookie("user_id", newUser.id);
    res.redirect("/urls");
  } else {
    res.status(400).send("Status 400");
  }
});

app.post("/login", (req, res) => {
  const claimedUser = {
    id: '',
    email: req.body.email,
    password: req.body.password
  };
  const actualUser = getUserFromEmail(claimedUser.email);
  if (actualUser) {
    if (claimedUser.email === actualUser.email && bcrypt.compareSync(claimedUser.password, actualUser.password)) {
      res.cookie("user_id", actualUser.id);
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send("Status 403")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//return urls in an object of format {shortURL: shortURL, longURL: longURL} for a given user
const urlsForUser = (id) => {
  return Object.entries(urlDatabase).filter(url => url[1].userID === id).map(urlEntry => { return { shortURL: urlEntry[0], longURL: urlEntry[1].longURL } });
};
//return the user for a given email
const getUserFromEmail = (email) => {
  return Object.values(users).filter(user => user.email === email)[0];
};
//generate a random alphanumerical string of length x
const generateRandomString = (length) => {
  const alphaNumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let rndString = ""
  for (let i = 0; i < length; i++) {
    const rng = Math.floor(Math.random() * 62);
    rndString += alphaNumeric[rng];
  }
  return rndString;
};
