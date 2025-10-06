const { Pool } = require('pg');

// Configuration du pool de connexions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://metro_user:metro_password@localhost:5432/metro_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Gestion des erreurs globales du pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test de connexion au démarrage
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Fermer le pool proprement lors de l'arrêt
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

module.exports = pool;