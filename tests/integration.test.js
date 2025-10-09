const request = require('supertest');
const app = require('../server');

describe('Integration Tests - API Endpoints', () => {
  
  describe('GET /health', () => {
    test('should return 200 with status ok', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'dernier-metro-api',
        database: 'connected'
      });
    });
  });

  describe('GET /next-metro', () => {
    test('should return 200 with valid station and nextArrival in HH:MM format', async () => {
      const response = await request(app)
        .get('/next-metro?station=Chatelet')
        .expect(200);

      expect(response.body).toMatchObject({
        station: 'Chatelet',
        line: 'M1',
        headwayMin: 3
      });

      expect(response.body.nextArrival).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
    });

    test('should return 400 when station parameter is missing', async () => {
      const response = await request(app)
        .get('/next-metro')
        .expect(400);

      expect(response.body).toEqual({
        error: 'missing station'
      });
    });

    test('should return 400 when station parameter is empty', async () => {
      const response = await request(app)
        .get('/next-metro?station=')
        .expect(400);

      expect(response.body).toEqual({
        error: 'missing station'
      });
    });
  });

  describe('GET /last-metro', () => {
    test('should return 200 with known station (lowercase)', async () => {
      const response = await request(app)
        .get('/last-metro?station=chatelet')
        .expect(200);

      expect(response.body).toMatchObject({
        station: 'chatelet',
        lastMetro: '01:15',
        line: 'M1',
        tz: 'Europe/Paris'
      });
    });

    test('should return 200 with known station (uppercase) - case insensitive', async () => {
      const response = await request(app)
        .get('/last-metro?station=CONCORDE')
        .expect(200);

      expect(response.body).toMatchObject({
        station: 'CONCORDE',
        lastMetro: '01:10',
        line: 'M1',
        tz: 'Europe/Paris'
      });
    });

    test('should return 200 with known station (mixed case)', async () => {
      const response = await request(app)
        .get('/last-metro?station=Louvre')
        .expect(200);

      expect(response.body).toMatchObject({
        station: 'Louvre',
        lastMetro: '01:12',
        line: 'M1',
        tz: 'Europe/Paris'
      });
    });

    test('should return 404 with unknown station', async () => {
      const response = await request(app)
        .get('/last-metro?station=inexistante')
        .expect(404);

      expect(response.body).toEqual({
        error: 'station not found'
      });
    });

    test('should return 400 when station parameter is missing', async () => {
      const response = await request(app)
        .get('/last-metro')
        .expect(400);

      expect(response.body).toEqual({
        error: 'missing station'
      });
    });

    test('should return 400 when station parameter is empty', async () => {
      const response = await request(app)
        .get('/last-metro?station=')
        .expect(400);

      expect(response.body).toEqual({
        error: 'missing station'
      });
    });

    test('should verify all seeded stations exist', async () => {
      const stations = ['chatelet', 'concorde', 'louvre', 'palais-royal', 'tuileries'];
      
      for (const station of stations) {
        const response = await request(app)
          .get(`/last-metro?station=${station}`)
          .expect(200);

        expect(response.body).toMatchObject({
          station: station,
          line: 'M1',
          tz: 'Europe/Paris'
        });
        
        expect(response.body.lastMetro).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
      }
    });
  });

  describe('GET /invalid-endpoint', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/invalid-endpoint')
        .expect(404);

      expect(response.body).toEqual({
        error: 'not found'
      });
    });
  });

  describe('Database Integration', () => {
    test('should have seeded data in database', async () => {
      const response = await request(app)
        .get('/last-metro?station=chatelet')
        .expect(200);

      expect(response.body.lastMetro).toBe('01:15');
    });
  });

  afterAll(() => {
    // Fermer les connexions pour éviter que Jest ne reste ouvert
    if (global.pool) {
      global.pool.end();
    }
  });
});