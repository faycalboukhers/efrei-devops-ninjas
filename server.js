"use strict";
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { nextTimeFromNow } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialisation de la DB
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

// Création et seed de la table config si nécessaire
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  // Seed des données par défaut
  const defaults = JSON.stringify({
    line: "M1",
    tz: "Europe/Paris"
  });

  const lastMetroTimes = JSON.stringify({
    "chatelet": "01:15",
    "concorde": "01:10",
    "louvre": "01:12",
    "palais-royal": "01:08",
    "tuileries": "01:05"
  });

  db.run(`INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`, 
    ['metro.defaults', defaults]);
  db.run(`INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`, 
    ['metro.last', lastMetroTimes]);
});

// Logger minimal: méthode, chemin, status, durée
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    const dt = Date.now() - t0;
    console.log(`${req.method} ${req.path} -> ${res.statusCode} ${dt}ms`);
  });
  next();
});

// Santé
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'dernier-metro-api' });
});

// Endpoint métier minimal (ne lit pas la DB)
app.get('/next-metro', (req, res) => {
  const station = (req.query.station || '').toString().trim();
  if (!station) {
    return res.status(400).json({ error: "missing station" });
  }
  
  try {
    return res.status(200).json({ 
      station, 
      line: 'M1', 
      headwayMin: 3, 
      nextArrival: nextTimeFromNow(3) 
    });
  } catch (error) {
    console.error('Error calculating next time:', error);
    return res.status(500).json({ error: "internal server error" });
  }
});

// Endpoint qui lit la DB pour les derniers métros
app.get('/last-metro', (req, res) => {
  const station = (req.query.station || '').toString().trim().toLowerCase();
  
  if (!station) {
    return res.status(400).json({ error: "missing station" });
  }

  // Récupération des configs depuis la DB
  db.get(`SELECT value FROM config WHERE key = ?`, ['metro.defaults'], (err, defaultsRow) => {
    if (err) {
      console.error('DB error (defaults):', err);
      return res.status(500).json({ error: "internal server error" });
    }

    db.get(`SELECT value FROM config WHERE key = ?`, ['metro.last'], (err, lastRow) => {
      if (err) {
        console.error('DB error (last):', err);
        return res.status(500).json({ error: "internal server error" });
      }

      try {
        const defaults = JSON.parse(defaultsRow?.value || '{}');
        const lastTimes = JSON.parse(lastRow?.value || '{}');

        // Vérifier si la station existe (insensible à la casse)
        const lastMetro = lastTimes[station];
        if (!lastMetro) {
          return res.status(404).json({ error: "station not found" });
        }

        return res.status(200).json({
          station: req.query.station, // Garder la casse originale
          lastMetro,
          line: defaults.line || "M1",
          tz: defaults.tz || "Europe/Paris"
        });

      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        return res.status(500).json({ error: "internal server error" });
      }
    });
  });
});

// 404 JSON
app.use((_req, res) => {
  res.status(404).json({ error: 'not found' });
});

app.listen(PORT, () => {
  console.log(`API ready on http://localhost:${PORT}`);
});

module.exports = app; // Pour les tests