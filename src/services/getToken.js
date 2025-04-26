const firebaseConfig = {
  apiKey: "AIzaSyB5nmScbjw_5a8ZqQ78aGLkfmRK2e9Br3U",
  authDomain: "finnhub-stock.firebaseapp.com",
  projectId: "finnhub-stock",
};

// storageBucket: "finnhub-stock.firebasestorage.app",
// messagingSenderId: "589534605302",
// appId: "1:589534605302:web:c18984f00e7b9dfd59e1d7",
// measurementId: "G-YWFC7HC8ME"

const axios = require("axios");

async function loginAndGetToken() {
  const apiKey = "AIzaSyB5nmScbjw_5a8ZqQ78aGLkfmRK2e9Br3U"; // (from firebaseConfig)

  const email = "zubair.techtimize@gmail.com";
  const password = "Test12345";

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    console.log("ID Token:", response.data.idToken);
  } catch (error) {
    console.error(error.response.data.error);
  }
}

loginAndGetToken();
