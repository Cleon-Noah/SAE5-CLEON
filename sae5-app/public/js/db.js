/**
 * SAE5 - Jardins de Cocagne
 * Couche de données simulée sur localStorage (remplace une API backend)
 */

const STORAGE_PREFIX = 'sae5_';

const DB = {
  // Données de seed initiales
  seed: {
    structures: [
      {
        id: 1,
        nom_commercial: 'Jardin de Cocagne Demo',
        raison_sociale: 'Association Jardin de Cocagne',
        adresse: '12 rue des Jardins',
        code_postal: '88100',
        ville: 'Saint-Dié-des-Vosges',
        telephone: '03 29 55 12 34',
        email: 'contact@cocagne-demo.fr',
        siret: '12345678901234'
      }
    ],
    saisons: [
      { id: 1, libelle: 'Saison 2026', date_debut: '2026-01-01', date_fin: '2026-12-31', active: 1 }
    ],
    semaines_fermeture: [
      { id: 1, saison_id: 1, semaine: '2026-W52' },
      { id: 2, saison_id: 1, semaine: '2026-W53' },
      { id: 3, saison_id: 1, semaine: '2026-W32' }
    ],
    jours_feries: [
      { id: 1, saison_id: 1, date_ferie: '2026-01-01', libelle: "Jour de l'an" },
      { id: 2, saison_id: 1, date_ferie: '2026-04-06', libelle: 'Lundi de Pâques' },
      { id: 3, saison_id: 1, date_ferie: '2026-05-01', libelle: 'Fête du Travail' },
      { id: 4, saison_id: 1, date_ferie: '2026-05-14', libelle: 'Jeudi de l\'Ascension' },
      { id: 5, saison_id: 1, date_ferie: '2026-05-25', libelle: 'Lundi de Pentecôte' },
      { id: 6, saison_id: 1, date_ferie: '2026-07-14', libelle: 'Fête nationale' },
      { id: 7, saison_id: 1, date_ferie: '2026-08-15', libelle: 'Assomption' },
      { id: 8, saison_id: 1, date_ferie: '2026-11-01', libelle: 'Toussaint' },
      { id: 9, saison_id: 1, date_ferie: '2026-12-25', libelle: 'Noël' }
    ],
    tournees: [
      { id: 1, identifiant: 'M1', libelle: 'Tournée Mardi 1', jour_preparation: 'Lundi', jour_livraison: 'Mardi', couleur: '#ef4444' },
      { id: 2, identifiant: 'Me1', libelle: 'Tournée Mercredi 1', jour_preparation: 'Mardi', jour_livraison: 'Mercredi', couleur: '#10b981' },
      { id: 3, identifiant: 'V1', libelle: 'Tournée Vendredi 1', jour_preparation: 'Jeudi', jour_livraison: 'Vendredi', couleur: '#f59e0b' }
    ],
    depots: [
      { id: 1, nom: 'Boulangerie du Centre', adresse: '8 rue de la République', code_postal: '88100', ville: 'Saint-Dié-des-Vosges', telephone: '03 29 55 00 01', categorie: 'ouvert', capacite: 30, jour_livraison: 'Mardi', creneau_livraison: '08:00-12:00', creneau_recuperation: '16:00-19:00', tournee_id: 1, ordre_livraison: 1 },
      { id: 2, nom: 'Épicerie Bio La Feuille', adresse: '15 avenue des Vosges', code_postal: '88100', ville: 'Saint-Dié-des-Vosges', telephone: '03 29 55 00 02', categorie: 'ouvert', capacite: 25, jour_livraison: 'Mercredi', creneau_livraison: '09:00-13:00', creneau_recuperation: '15:00-18:30', tournee_id: 2, ordre_livraison: 1 },
      { id: 3, nom: 'Mairie de Sainte-Marguerite', adresse: 'Place de la Mairie', code_postal: '88250', ville: 'Sainte-Marguerite', telephone: '03 29 55 00 03', categorie: 'reserve', texte_reserve: 'réservé aux salariés de la mairie', capacite: 20, jour_livraison: 'Mercredi', creneau_livraison: '08:30-12:30', creneau_recuperation: '14:00-17:00', tournee_id: 2, ordre_livraison: 2 },
      { id: 4, nom: 'Supermarché Cocagne', adresse: 'Zone commerciale Nord', code_postal: '88100', ville: 'Saint-Dié-des-Vosges', telephone: '03 29 55 00 04', categorie: 'ouvert', capacite: 40, jour_livraison: 'Vendredi', creneau_livraison: '08:00-12:00', creneau_recuperation: '16:00-19:00', tournee_id: 3, ordre_livraison: 1 },
      { id: 5, nom: 'AMAP des Hautes-Vosges', adresse: 'Ferme du Champ', code_postal: '88400', ville: 'Gérardmer', telephone: '03 29 55 00 05', categorie: 'reserve', texte_reserve: 'réservé aux adhérents AMAP', capacite: 15, jour_livraison: 'Vendredi', creneau_livraison: '09:00-12:00', creneau_recuperation: '15:00-18:00', tournee_id: 3, ordre_livraison: 2 },
      { id: 6, nom: 'École Primaire Les Tilleuls', adresse: '5 rue des Écoles', code_postal: '88100', ville: 'Saint-Dié-des-Vosges', telephone: '03 29 55 00 06', categorie: 'professionnel', capacite: 10, jour_livraison: 'Mardi', creneau_livraison: '11:30-13:00', creneau_recuperation: '11:30-13:00', tournee_id: 1, ordre_livraison: 3 }
    ],
    produits: [
      { id: 1, nom: 'Panier simple', unite: 'pièce', prix: 13.80, marge: 40, description: 'Panier de légumes de saison pour 1-2 personnes' },
      { id: 2, nom: 'Panier familial', unite: 'pièce', prix: 23.70, marge: 40, description: 'Panier de légumes de saison pour 4-6 personnes' },
      { id: 3, nom: 'Panier fruité', unite: 'pièce', prix: 14.00, marge: 70, description: 'Panier de fruits de saison' }
    ],
    types_abonnements: [
      { id: 1, nom: 'Panier simple', produit_id: 1, prix: 13.80 },
      { id: 2, nom: 'Panier familial', produit_id: 2, prix: 23.70 },
      { id: 3, nom: 'Panier fruité', produit_id: 3, prix: 14.00 }
    ],
    frequences: [
      { id: 1, nom: 'Hebdomadaire', code: 'HEBDO', semaines_par_periode: 1 },
      { id: 2, nom: 'Tous les 15 jours', code: 'QUINZ', semaines_par_periode: 2 },
      { id: 3, nom: 'Mensuel', code: 'MENS', semaines_par_periode: 4 }
    ],
    clients: [],
    abonnements: [],
    calendrier_livraison: [],
    commandes: []
  },

  _store: {},

  init() {
    const tables = Object.keys(this.seed);
    tables.forEach(t => {
      const key = STORAGE_PREFIX + t;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(this.seed[t]));
      }
      this._store[t] = JSON.parse(localStorage.getItem(key));
    });
  },

  _save(table) {
    localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(this._store[table]));
  },

  // --- Générateurs d'ID ---
  _nextId(table) {
    const rows = this._store[table] || [];
    return rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
  },

  // --- Lectures ---
  get(table) {
    return this._store[table] || [];
  },
  getById(table, id) {
    return (this._store[table] || []).find(r => r.id == id);
  },

  // --- Écritures génériques ---
  insert(table, obj) {
    const rows = this._store[table] || [];
    const newObj = { ...obj, id: this._nextId(table) };
    rows.push(newObj);
    this._store[table] = rows;
    this._save(table);
    return newObj;
  },

  update(table, id, changes) {
    const rows = this._store[table] || [];
    const idx = rows.findIndex(r => r.id == id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...changes };
    this._store[table] = rows;
    this._save(table);
    return rows[idx];
  },

  delete(table, id) {
    const rows = this._store[table] || [];
    const filtered = rows.filter(r => r.id != id);
    this._store[table] = filtered;
    this._save(table);
    return true;
  },

  // --- Requêtes spécifiques ---
  getDepotsDisponibles() {
    return this.get('depots').filter(d => d.categorie !== 'professionnel');
  },

  getDepotsAvecPlaces() {
    const depots = this.get('depots');
    const abonnements = this.get('abonnements');
    return depots.map(d => {
      const nbActifs = abonnements.filter(a => a.depot_id == d.id && a.active).length;
      return { ...d, places_restantes: Math.max(0, d.capacite - nbActifs) };
    });
  },

  getStats() {
    const abonnements = this.get('abonnements').filter(a => a.active);
    const depots = this.get('depots');
    const tournées = this.get('tournees');
    const commandes = this.get('commandes');
    return {
      nbAbonnements: abonnements.length,
      nbDepots: depots.length,
      nbTournées: tournées.length,
      nbCommandes: commandes.length,
      paniersParDepot: depots.map(d => {
        const nb = abonnements.filter(a => a.depot_id == d.id).length;
        return { nom: d.nom, nb, capacite: d.capacite };
      })
    };
  },

  reset() {
    Object.keys(this.seed).forEach(t => {
      localStorage.removeItem(STORAGE_PREFIX + t);
    });
    this.init();
  }
};

// Initialisation au chargement
DB.init();
