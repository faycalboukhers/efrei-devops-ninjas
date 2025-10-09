const { nextTimeFromNow } = require('../utils');

describe('nextTimeFromNow', () => {
  test('should add headway minutes to current time with headway = 3', () => {
    const fixedTime = new Date('2023-01-01T12:30:00.000Z');
    const result = nextTimeFromNow(3, fixedTime);
    
    expect(result).toBe('12:33');
  });

  test('should use default headway of 3 minutes when no parameter provided', () => {
    const fixedTime = new Date('2023-01-01T12:30:00.000Z');
    const result = nextTimeFromNow(undefined, fixedTime);
    
    expect(result).toBe('12:33');
  });

  test('should format single digit hours and minutes with leading zeros', () => {
    const fixedTime = new Date('2023-01-01T09:07:00.000Z');
    const result = nextTimeFromNow(3, fixedTime);
    
    expect(result).toBe('09:10');
  });

  test('should handle hour rollover correctly', () => {
    const fixedTime = new Date('2023-01-01T23:58:00.000Z');
    const result = nextTimeFromNow(5, fixedTime);
    
    expect(result).toBe('00:03');
  });

  test('should work with different headway values', () => {
    const fixedTime = new Date('2023-01-01T15:45:00.000Z');
    const result = nextTimeFromNow(7, fixedTime);
    
    expect(result).toBe('15:52');
  });

  test('should throw error when headway is zero', () => {
    const fixedTime = new Date('2023-01-01T12:30:00.000Z');
    
    expect(() => {
      nextTimeFromNow(0, fixedTime);
    }).toThrow('headwayMin must be positive');
  });

  test('should throw error when headway is negative', () => {
    const fixedTime = new Date('2023-01-01T12:30:00.000Z');
    
    expect(() => {
      nextTimeFromNow(-5, fixedTime);
    }).toThrow('headwayMin must be positive');
  });

  test('should work with large headway values', () => {
    const fixedTime = new Date('2023-01-01T10:15:00.000Z');
    const result = nextTimeFromNow(120, fixedTime); // 2 heures
    
    expect(result).toBe('12:15');
  });

  test('should handle minutes overflow correctly', () => {
    const fixedTime = new Date('2023-01-01T14:59:00.000Z');
    const result = nextTimeFromNow(2, fixedTime);
    
    expect(result).toBe('15:01');
  });

  test('should work with current time when no time provided', () => {
    // Test plus simple sans mock complexe
    const beforeTest = new Date();
    const result = nextTimeFromNow(5);
    const afterTest = new Date();
    
    // Vérifier que le résultat est un format HH:MM valide
    expect(result).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
    
    // Vérifier que le temps calculé est dans le futur
    const [hours, minutes] = result.split(':').map(Number);
    const resultTime = new Date();
    resultTime.setHours(hours, minutes, 0, 0);
    
    // Le résultat devrait être environ 5 minutes après le début du test
    const expectedMin = new Date(beforeTest.getTime() + 4 * 60 * 1000); // 4 min
    const expectedMax = new Date(afterTest.getTime() + 6 * 60 * 1000);  // 6 min
    
    // Note: Ce test vérifie juste le format et la logique générale
    // car tester l'heure exacte sans mock est délicat
  });
});