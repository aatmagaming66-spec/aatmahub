const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function run() {
  await db.collection("settings").doc("general").set({
    websiteName: "AatmaHub",
    logo: "/images/logo.png",
  }, { merge: true });

  await db.collection("settings").doc("whatsapp").set({
    number: "918566936666",
    channel: "https://whatsapp.com/channel/0029VbB4dcm23n3fVHpH0r45",
    message: "Hi, I want to recharge my game.",
  }, { merge: true });

  await db.collection("admins").doc("shivatetz@gmail.com").set({
    email: "shivatetz@gmail.com",
    active: true,
    role: "super_admin",
  }, { merge: true });

  console.log("✅ General, WhatsApp and Admin seeded.");
}

run().catch(console.error);
