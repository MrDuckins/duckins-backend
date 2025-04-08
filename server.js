require('dotenv').config();
const fs = require('fs');
const path = require('path'); // Dodaj ten import
const admin = require('firebase-admin');
const axios = require('axios');

// Sprawdzenie czy plik z kluczem istnieje
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
if (!fs.existsSync(keyPath)) {
  console.error('BŁĄD: Brak pliku z kluczem w:', keyPath);
  process.exit(1);
}

// Inicjalizacja Firebase
try {
  const serviceAccount = require(keyPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  console.log('Połączono z Firebase');
} catch (error) {
  console.error('BŁĄD inicjalizacji Firebase:', error.message);
  process.exit(1);
}

async function updatePlayers() {
  try {
    console.log('[%s] Pobieranie listy graczy...', new Date().toISOString());
    const response = await axios.get(process.env.API_URL);
    const players = response.data.players?.list || [];
    
    if (players.length === 0) {
      console.log('Brak graczy online');
      return;
    }

    console.log(`Aktualizacja ${players.length} graczy...`);
    
    for (const player of players) {
      try {
        await admin.firestore().collection('players').doc(player.name).set({
          name: player.name,
          totalSeconds: admin.firestore.FieldValue.increment(60),
          lastSeen: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`Zaktualizowano gracza: ${player.name}`);
      } catch (error) {
        console.error(`Błąd dla gracza ${player.name}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Krytyczny błąd:', error.message);
  }
}

// Ustawienie interwału
const interval = parseInt(process.env.UPDATE_INTERVAL_MINUTES || '1') * 60 * 1000;
setInterval(updatePlayers, interval);

// Pierwsze uruchomienie
updatePlayers();

console.log(`Tracker uruchomiony. Aktualizacja co ${interval/60000} minut.`);
