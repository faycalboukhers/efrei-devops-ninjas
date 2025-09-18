/**
 * Utilitaire pour calculer l'horaire du prochain passage
 * @param {number} headwayMin - Fréquence en minutes (défaut: 3)
 * @param {Date} currentTime - Heure actuelle (défaut: maintenant)
 * @returns {string} Heure au format HH:MM
 * @throws {Error} Si headwayMin <= 0
 */
function nextTimeFromNow(headwayMin = 3, currentTime = new Date()) {
  if (headwayMin <= 0) {
    throw new Error('headwayMin must be positive');
  }

  const next = new Date(currentTime.getTime() + headwayMin * 60 * 1000);
  
  // Utiliser UTC pour éviter les problèmes de fuseau horaire dans les tests
  const hh = String(next.getUTCHours()).padStart(2, '0');
  const mm = String(next.getUTCMinutes()).padStart(2, '0');
  
  return `${hh}:${mm}`;
}

module.exports = {
  nextTimeFromNow
};