const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'config', 'firebase-adminsdk.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://minecraftstats-f81bf.firebaseio.com"
});

const db = admin.firestore();

module.exports = {
  admin,
  db
};
