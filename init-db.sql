-- Schema pour la base de données Metro
-- Tables : stations, lines, schedules

-- Table des lignes de métro
CREATE TABLE IF NOT EXISTS lines (
    id SERIAL PRIMARY KEY,
    line_code VARCHAR(10) UNIQUE NOT NULL,
    line_name VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des stations
CREATE TABLE IF NOT EXISTS stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    normalized_name VARCHAR(100) UNIQUE NOT NULL,
    line_id INTEGER REFERENCES lines(id) ON DELETE CASCADE,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des horaires (dernier métro)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES stations(id) ON DELETE CASCADE,
    day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('weekday', 'weekend', 'holiday')),
    last_metro_time TIME NOT NULL,
    direction VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(station_id, day_type, direction)
);

-- Table de configuration globale
CREATE TABLE IF NOT EXISTS config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des données initiales

-- Ligne M1
INSERT INTO lines (line_code, line_name, color) VALUES 
('M1', 'Ligne 1', 'yellow')
ON CONFLICT (line_code) DO NOTHING;

-- Stations de la ligne 1
INSERT INTO stations (name, normalized_name, line_id) VALUES 
('Châtelet', 'chatelet', (SELECT id FROM lines WHERE line_code = 'M1')),
('Concorde', 'concorde', (SELECT id FROM lines WHERE line_code = 'M1')),
('Louvre', 'louvre', (SELECT id FROM lines WHERE line_code = 'M1')),
('Palais Royal', 'palais-royal', (SELECT id FROM lines WHERE line_code = 'M1')),
('Tuileries', 'tuileries', (SELECT id FROM lines WHERE line_code = 'M1'))
ON CONFLICT (normalized_name) DO NOTHING;

-- Horaires des derniers métros (semaine)
INSERT INTO schedules (station_id, day_type, last_metro_time, direction) VALUES 
((SELECT id FROM stations WHERE normalized_name = 'chatelet'), 'weekday', '01:15', 'both'),
((SELECT id FROM stations WHERE normalized_name = 'concorde'), 'weekday', '01:10', 'both'),
((SELECT id FROM stations WHERE normalized_name = 'louvre'), 'weekday', '01:12', 'both'),
((SELECT id FROM stations WHERE normalized_name = 'palais-royal'), 'weekday', '01:08', 'both'),
((SELECT id FROM stations WHERE normalized_name = 'tuileries'), 'weekday', '01:05', 'both')
ON CONFLICT (station_id, day_type, direction) DO NOTHING;

-- Configuration globale
INSERT INTO config (key, value, description) VALUES 
('timezone', 'Europe/Paris', 'Timezone for metro schedules'),
('default_headway_min', '3', 'Default frequency between metros in minutes'),
('service_start', '05:30', 'Service start time'),
('service_end', '01:15', 'Service end time')
ON CONFLICT (key) DO NOTHING;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_stations_normalized_name ON stations(normalized_name);
CREATE INDEX IF NOT EXISTS idx_schedules_station_id ON schedules(station_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_type ON schedules(day_type);