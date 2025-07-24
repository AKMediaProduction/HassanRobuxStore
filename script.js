// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBKg-MhwzbFMjFw3lAzZRSa4G0sJrKuCEc",
  authDomain: "hassan-robux-store.firebaseapp.com",
  projectId: "hassan-robux-store",
  storageBucket: "hassan-robux-store.firebasestorage.app",
  messagingSenderId: "611842301968",
  appId: "1:611842301968:web:a23f9df4b04083a1aaaa95",
  measurementId: "G-1R12W3V8P8"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("Firebase initialized:", firebase);

// ✅ Fetch Hassan's balance in real time
db.collection('users').doc('hassan').onSnapshot(doc => {
  if (doc.exists) {
    document.getElementById('balance').innerText = doc.data().balance + " Robux";
  } else {
    document.getElementById('balance').innerText = "No balance found.";
  }
});

console.log("Fetching store items...");
db.collection('storeItems').onSnapshot(snapshot => {
  let storeList = document.getElementById('store');
  storeList.innerHTML = "";
  snapshot.forEach(doc => {
    let data = doc.data();
    let li = document.createElement('li');
    li.innerHTML = `${data.name} - ${data.price} Robux <button onclick="buyItem('${doc.id}', ${data.price})">Buy</button>`;
    storeList.appendChild(li);
  });
});


// ✅ Purchase function
function buyItem(itemId, price) {
  let userRef = db.collection('users').doc('hassan');

  db.runTransaction(async (transaction) => {
    const doc = await transaction.get(userRef);
    if (!doc.exists) {
      alert("User does not exist.");
      return;
    }

    let currentBalance = doc.data().balance;

    if (currentBalance >= price) {
      transaction.update(userRef, { balance: currentBalance - price });
      alert("Purchase successful!");
    } else {
      alert("Not enough Robux.");
    }
  }).catch(error => {
    console.log("Transaction failed: ", error);
  });
}
