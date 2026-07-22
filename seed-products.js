const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  await db.collection("products").doc("mobile-legends").set({
    name: "Mobile Legends",
    slug: "mobile-legends",
    image: "/images/MLBB.jpg",
    banner: "/images/moba legends banner.jpg",
    href: "/product/mobile-legends",
    enabled: true,
    homepage: true,
    categories: {
      Diamonds: [
        { name: "86 Diamonds", bonus: "78 + 8 Bonus", price: 129, image: "/images/86 diamonds.png" },
        { name: "172 Diamonds", bonus: "156 + 16 Bonus", price: 270, image: "/images/86 diamonds.png" },
        { name: "257 Diamonds", bonus: "234 + 23 Bonus", price: 380, image: "/images/86 diamonds.png" },
        { name: "706 Diamonds", bonus: "625 + 81 Bonus", price: 1019, image: "/images/514 diamonds.png" },
        { name: "1412 Diamonds", bonus: "1250 + 162 Bonus", price: 1999, image: "/images/2195-3688 diamonds.png" },
        { name: "2195 Diamonds", bonus: "1860 + 335 Bonus", price: 3100, image: "/images/2195-3688 diamonds.png" },
        { name: "3688 Diamonds", bonus: "3099 + 589 Bonus", price: 5100, image: "/images/2195-3688 diamonds.png" },
        { name: "5532 Diamonds", bonus: "4640 + 892 Bonus", price: 7499, image: "/images/5532-9288 diamonds.png" },
        { name: "7720 Diamonds", bonus: "6483 + 1237 Bonus", price: 10499, image: "/images/5532-9288 diamonds.png" },
        { name: "9288 Diamonds", bonus: "7740 + 1548 Bonus", price: 12499, image: "/images/5532-9288 diamonds.png" }
      ],
      "Special Bundle": [
        { name: "Weekly Bundle", bonus: "Popular", price: 99, image: "/images/bundle tabs.png" },
        { name: "Monthly Bundle", bonus: "Best Value", price: 399, image: "/images/bundle tabs.png" }
      ],
      "Double Diamonds": [
        { name: "55 Diamonds", bonus: "50+50 Bonus", price: 90, image: "/images/special.png" },
        { name: "165 Diamonds", bonus: "150+150 Bonus", price: 259, image: "/images/special.png" },
        { name: "275 Diamonds", bonus: "250+250 Bonus", price: 399, image: "/images/special.png" },
        { name: "565 Diamonds", bonus: "500+500 Bonus", price: 799, image: "/images/special.png" }
      ],
      Passes: [
        { name: "Weekly Pass", bonus: "7 Days", price: 159, image: "/images/weekly pass.png" },
        { name: "Twilight Pass", bonus: "Premium", price: 899, image: "/images/ml gifting.png" }
      ]
    }
  });

  console.log("Mobile Legends product saved.");
}

seed().catch(console.error);
