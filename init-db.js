const { Pool } = require('pg');

const initDB = async () => {
  console.log('🔧 Initializing database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lines (
        id SERIAL PRIMARY KEY,
        line_code VARCHAR(10) UNIQUE NOT NULL,
        line_name VARCHAR(100) NOT NULL,
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        normalized_name VARCHAR(100) UNIQUE NOT NULL,
        line_id INTEGER REFERENCES lines(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        station_id INTEGER REFERENCES stations(id) ON DELETE CASCADE,
        day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('weekday', 'weekend', 'holiday')),
        last_metro_time TIME NOT NULL,
        direction VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(station_id, day_type, direction)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS config (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Données
    await pool.query(`INSERT INTO lines (line_code, line_name, color) VALUES ('M1', 'Ligne 1', 'yellow') ON CONFLICT (line_code) DO NOTHING`);

    const stations = [
      ['Châtelet', 'chatelet'],
      ['Concorde', 'concorde'],
      ['Louvre', 'louvre'],
      ['Palais Royal', 'palais-royal'],
      ['Tuileries', 'tuileries']
    ];

    for (const [name, normalized] of stations) {
      await pool.query(
        `INSERT INTO stations (name, normalized_name, line_id) VALUES ($1, $2, (SELECT id FROM lines WHERE line_code = 'M1')) ON CONFLICT (normalized_name) DO NOTHING`,
        [name, normalized]
      );
    }

    const schedules = [
      ['chatelet', '01:15'],
      ['concorde', '01:10'],
      ['louvre', '01:12'],
      ['palais-royal', '01:08'],
      ['tuileries', '01:05']
    ];

    for (const [station, time] of schedules) {
      await pool.query(
        `INSERT INTO schedules (station_id, day_type, last_metro_time, direction) 
         VALUES ((SELECT id FROM stations WHERE normalized_name = $1), 'weekday', $2, 'both') 
         ON CONFLICT (station_id, day_type, direction) DO NOTHING`,
        [station, time]
      );
    }

    await pool.query(`INSERT INTO config (key, value, description) VALUES ('timezone', 'Europe/Paris', 'Timezone') ON CONFLICT (key) DO NOTHING`);
    await pool.query(`INSERT INTO config (key, value, description) VALUES ('default_headway_min', '3', 'Frequency') ON CONFLICT (key) DO NOTHING`);
    await pool.query(`INSERT INTO config (key, value, description) VALUES ('service_start', '05:30', 'Start time') ON CONFLICT (key) DO NOTHING`);
    await pool.query(`INSERT INTO config (key, value, description) VALUES ('service_end', '01:15', 'End time') ON CONFLICT (key) DO NOTHING`);

    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Exécuter si lancé directement
if (require.main === module) {
  initDB()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initDB };