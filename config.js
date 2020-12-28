import firebase from 'firebase';
require('@firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyBbxyJAIQHFfDQr3QogU8kto-Gv1-SM2Dw",
  authDomain: "booksanta-1.firebaseapp.com",
  databaseURL: "https://booksanta-1.firebaseio.com",
  projectId: "booksanta-1",
  storageBucket: "booksanta-1.appspot.com",
  messagingSenderId: "964382214964",
  appId: "1:964382214964:web:2a90c01b772f2eac2fb361",
  measurementId: "G-696ZXMGSGC"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var storage = firebase.storage();

export default firebase.firestore();
