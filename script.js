// ✅ Initialize Firestore
const db = firebase.firestore();

// ✅ Display Hassan's balance
function loadBalance() {
  const balanceEl = document.getElementById('balance');

  db.collection('users').doc('hassan').onSnapshot(doc => {
    if (doc.exists) {
      balanceEl.textContent = doc.data().balance + " Robux";
    } else {
      balanceEl.textContent = "No balance found.";
    }
  });
}

// ✅ Fetch and display store items
function loadStoreItems() {
  const storeDiv = document.getElementById('store');
  storeDiv.innerHTML = "Loading store items...";

  db.collection('storeItems').get()
    .then(snapshot => {
      storeDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();

        const itemDiv = document.createElement('div');
        itemDiv.className = "store-item";
        itemDiv.innerHTML = `
          <h3>${data.name}</h3>
          <p>${data.price} Robux</p>
        `;

        const buyButton = document.createElement('button');
        buyButton.textContent = `Buy for ${data.price} Robux`;
        buyButton.onclick = () => purchaseItem(data.name, data.price);

        itemDiv.appendChild(buyButton);
        storeDiv.appendChild(itemDiv);
      });
    })
    .catch(error => {
      console.error("Error loading store items:", error);
      storeDiv.innerHTML = "Failed to load store.";
    });
}

// ✅ Purchase item function
function purchaseItem(itemName, itemPrice) {
  const userRef = db.collection('users').doc('hassan');

  db.runTransaction(async (transaction) => {
    const doc = await transaction.get(userRef);
    if (!doc.exists) {
      alert("User does not exist.");
      return;
    }

    let currentBalance = doc.data().balance || 0;

    if (currentBalance < itemPrice) {
      alert("Not enough Robux!");
      return;
    }

    // ✅ Deduct balance
    transaction.update(userRef, {
      balance: currentBalance - itemPrice
    });

    // ✅ Save purchase history in purchases subcollection with proper fields
    return db.collection('users').doc('hassan').collection('purchases').add({
      itemName: itemName,
      itemPrice: itemPrice,
      purchaseDate: firebase.firestore.FieldValue.serverTimestamp()
    });
  })
  .then(() => {
    alert(`Purchase successful: ${itemName} for ${itemPrice} Robux`);
  })
  .catch(error => {
    console.error("Transaction failed: ", error);
    alert("Purchase failed. Try again.");
  });
}

// ✅ Initialize everything on page load
window.onload = () => {
  loadBalance();
  loadStoreItems();
};
