"use strict";
const express = require("express");
const pool = require('./db');
const { nextTimeFromNow } = require('./utils');
const { initDB } = require('./init-db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialiser la DB au démarrage (uniquement en production)
if (process.env.NODE_ENV === 'production') {
  initDB().catch(console.error);
}

// Logger minimal
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    const dt = Date.now() - t0;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${req.method} ${req.path} -> ${res.statusCode} ${dt}ms`);
    }
  });
  next();
});

// Health check
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'ok', 
      service: 'dernier-metro-api',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      service: 'dernier-metro-api',
      database: 'disconnected'
    });
  }
});

// Endpoint next-metro (ne lit pas la DB, simulation simple)
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

// Endpoint last-metro (lit la vraie DB PostgreSQL)
app.get('/last-metro', async (req, res) => {
  const stationName = (req.query.station || '').toString().trim();
  
  if (!stationName) {
    return res.status(400).json({ error: "missing station" });
  }

  try {
    // Normaliser le nom de la station (minuscules, tirets)
    const normalizedName = stationName.toLowerCase()
      .replace(/\s+/g, '-')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Enlever accents

    // Requête pour récupérer les infos de la station et son dernier métro
    const query = `
      SELECT 
        s.name,
        s.normalized_name,
        l.line_code,
        l.line_name,
        sch.last_metro_time,
        c.value as timezone
      FROM stations s
      JOIN lines l ON s.line_id = l.id
      JOIN schedules sch ON s.id = sch.station_id
      JOIN config c ON c.key = 'timezone'
      WHERE s.normalized_name = $1 AND sch.day_type = 'weekday'
      LIMIT 1
    `;

    const result = await pool.query(query, [normalizedName]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "station not found" });
    }

    const station = result.rows[0];
    return res.status(200).json({
      station: stationName, // Conserver la casse originale
      lastMetro: station.last_metro_time.substring(0, 5), // Format HH:MM
      line: station.line_code,
      tz: station.timezone
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: "internal server error" });
  }
});

// 404 JSON
app.use((_req, res) => {
  res.status(404).json({ error: 'not found' });
});

// Ne démarrer le serveur que si ce n'est pas un test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API ready on http://localhost:${PORT}`);
  });
}

module.exports = app;