//returns a list of all the urls in a db for a given user (format of return is {shortURL: shortURL, longURL: longURL});
const getUrlsByUser = (id, urlDb) => {
  return Object.entries(urlDb).filter(url => url[1].userID === id).map(urlEntry => {
    return { shortURL: urlEntry[0], longURL: urlEntry[1].longURL};
  });
};

//return the (first) user with a given email in a db
const getUserByEmail = (email, db) => {
  return Object.values(db).filter(user => user.email === email)[0];
};

//generate an id that isnt in the list of id provided (id will take length of first item in the list if no length provided)
const generateUID = (IDList, idlength) => {
  let id;
  idlength = Number(idlength) ? idlength : (IDList[0] || '').length;
  do {
    id = generateRandomString(idlength);
  } while (IDList.includes(id));
  return id;
};

//generate a random alphanumerical string of a given length
const generateRandomString = (length) => {
  const alphaNumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rndString = '';
  for (let i = 0; i < length; i++) {
    const rng = Math.floor(Math.random() * 62);
    rndString += alphaNumeric[rng];
  }
  return rndString;
};

const isValidUrl = (url) => {
  //url regex taken from https://urlregex.com/
  const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
  return url.match(urlRegex);
};

module.exports = {
  getUrlsByUser,
  getUserByEmail,
  generateUID,
  isValidUrl,
};