const { getApps, initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const product = {
  name: "Magic Chess: Go Go",
  banner: "/images/mcggbanner.jpg",
  categories: {
    Diamonds: [
      { name: "55 Diamonds", bonus: "50 + 5 Bonus", price: "₹89", image: "/images/86 diamonds.png" },
      { name: "86 Diamonds", bonus: "78 + 8 Bonus", price: "₹129", image: "/images/86 diamonds.png" },
      { name: "165 Diamonds", bonus: "150 + 15 Bonus", price: "₹259", image: "/images/86 diamonds.png" },
      { name: "172 Diamonds", bonus: "156 + 16 Bonus", price: "₹269", image: "/images/86 diamonds.png" },
      { name: "257 Diamonds", bonus: "234 + 23 Bonus", price: "₹389", image: "/images/514 diamonds.png" },
      { name: "275 Diamonds", bonus: "250 + 25 Bonus", price: "₹429", image: "/images/514 diamonds.png" },
      { name: "344 Diamonds", bonus: "310 + 34 Bonus", price: "₹539", image: "/images/514 diamonds.png" },
      { name: "516 Diamonds", bonus: "465 + 51 Bonus", price: "₹779", image: "/images/514 diamonds.png" },
      { name: "565 Diamonds", bonus: "500 + 65 Bonus", price: "₹849", image: "/images/2195-3688 diamonds.png" },
      { name: "706 Diamonds", bonus: "625 + 81 Bonus", price: "₹1029", image: "/images/2195-3688 diamonds.png" },
      { name: "1346 Diamonds", bonus: "1160 + 186 Bonus", price: "₹1899", image: "/images/2195-3688 diamonds.png" },
      { name: "1825 Diamonds", bonus: "1547 + 278 Bonus", price: "₹2499", image: "/images/2195-3688 diamonds.png" },
      { name: "2195 Diamonds", bonus: "1860 + 335 Bonus", price: "₹2999", image: "/images/5532-9288 diamonds.png" },
      { name: "3688 Diamonds", bonus: "3099 + 589 Bonus", price: "₹4999", image: "/images/5532-9288 diamonds.png" },
      { name: "5532 Diamonds", bonus: "4649 + 883 Bonus", price: "₹7499", image: "/images/5532-9288 diamonds.png" },
      { name: "9288 Diamonds", bonus: "7740 + 1548 Bonus", price: "₹12499", image: "/images/5532-9288 diamonds.png" },
    ],
    "Special Bundle": [
      { name: "Lukas Battle Reward", bonus: "Limited", price: "₹99", image: "/images/bundle tabs.png" },
      { name: "Discount Battle Reward", bonus: "Limited", price: "₹99", image: "/images/bundle tabs.png" },
    ],
    "Double Diamonds": [
      { name: "100 Diamonds", bonus: "50 + 50 Bonus", price: "₹90", image: "/images/special.png" },
      { name: "300 Diamonds", bonus: "150 + 150 Bonus", price: "₹259", image: "/images/special.png" },
      { name: "500 Diamonds", bonus: "250 + 250 Bonus", price: "₹399", image: "/images/special.png" },
      { name: "1000 Diamonds", bonus: "500 + 500 Bonus", price: "₹799", image: "/images/special.png" },
    ],
    Passes: [
      { name: "Weekly Pass", bonus: "7 Days", price: "₹210", image: "/images/weekly pass.png" },
    ],
  },
};

db.collection("products")
  .doc("magic-chess")
  .set(product)
  .then(() => {
    console.log("Magic Chess product saved.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
