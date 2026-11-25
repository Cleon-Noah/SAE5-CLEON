const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion SQLite
const db = new Database(path.join(__dirname, 'database', 'sae5.db'));
db.pragma('journal_mode = WAL');

// ---------------------------------------------------------------------------
// Initialisation de la base de données
// ---------------------------------------------------------------------------
function initDB() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS structures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom_commercial TEXT NOT NULL,
      raison_sociale TEXT,
      adresse TEXT,
      code_postal TEXT,
      ville TEXT,
      telephone TEXT,
      email TEXT,
      site_web TEXT,
      siret TEXT,
      bic TEXT,
      iban TEXT,
      ics TEXT,
      assujetti_tva INTEGER DEFAULT 0,
      logo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saisons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      libelle TEXT NOT NULL,
      date_debut DATE NOT NULL,
      date_fin DATE NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS semaines_fermeture (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saison_id INTEGER NOT NULL,
      semaine TEXT NOT NULL, -- format AAAA-WXX (ex: 2026-W22)
      FOREIGN KEY (saison_id) REFERENCES saisons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jours_feries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saison_id INTEGER NOT NULL,
      date_ferie DATE NOT NULL UNIQUE,
      libelle TEXT,
      FOREIGN KEY (saison_id) REFERENCES saisons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tournees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifiant TEXT NOT NULL UNIQUE, -- ex: 1, 2, 3 ou "Ma", "V"
      libelle TEXT,
      jour_preparation TEXT NOT NULL, -- ex: "Mardi"
      jour_livraison TEXT NOT NULL,   -- ex: "Mercredi"
      couleur TEXT DEFAULT '#3b82f6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS depots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      adresse TEXT,
      code_postal TEXT,
      ville TEXT,
      telephone TEXT NOT NULL,
      email TEXT,
      site_web TEXT,
      personne_referente TEXT,
      mail_referente TEXT,
      tel_referente TEXT,
      categorie TEXT DEFAULT 'ouvert', -- ouvert, reserve, professionnel
      texte_reserve TEXT,
      mdp_reserve TEXT,
      capacite INTEGER DEFAULT 50, -- nb max d'abonnements paniers
      jour_livraison TEXT,
      creneau_livraison TEXT,
      creneau_recuperation TEXT,
      presentation TEXT,
      photo TEXT,
      commentaire TEXT,
      latitude REAL,
      longitude REAL,
      tournee_id INTEGER,
      ordre_livraison INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournee_id) REFERENCES tournees(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS produits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      unite TEXT NOT NULL, -- piece, kg, botte, filet, boite, bouteille, colis
      prix REAL NOT NULL,
      marge REAL DEFAULT 40,
      description TEXT,
      photo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS types_abonnements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL, -- ex: Panier simple, Panier familial
      produit_id INTEGER,
      prix REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS frequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL, -- hebdomadaire, 15 jours, mensuel
      code TEXT NOT NULL, -- HEBDO, QUINZ, MENS
      semaines_par_periode INTEGER DEFAULT 1, -- 1 = chaque semaine, 2 = une semaine sur deux
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      civilite TEXT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      adresse TEXT,
      code_postal TEXT,
      ville TEXT,
      telephone TEXT,
      email TEXT,
      mot_de_passe TEXT,
      date_naissance DATE,
      profession TEXT,
      adherent_asso INTEGER DEFAULT 1,
      date_premiere_adhesion DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS abonnements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      type_abonnement_id INTEGER NOT NULL,
      frequence_id INTEGER NOT NULL,
      depot_id INTEGER NOT NULL,
      date_debut DATE NOT NULL,
      date_fin DATE,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (type_abonnement_id) REFERENCES types_abonnements(id),
      FOREIGN KEY (frequence_id) REFERENCES frequences(id),
      FOREIGN KEY (depot_id) REFERENCES depots(id)
    );

    CREATE TABLE IF NOT EXISTS calendrier_livraison (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournee_id INTEGER NOT NULL,
      saison_id INTEGER NOT NULL,
      date_livraison DATE NOT NULL,
      semaine_parite TEXT, -- 'paire' ou 'impare'
      nb_paniers INTEGER DEFAULT 1,
      deplace_manuellement INTEGER DEFAULT 0,
      date_originale DATE,
      FOREIGN KEY (tournee_id) REFERENCES tournees(id) ON DELETE CASCADE,
      FOREIGN KEY (saison_id) REFERENCES saisons(id) ON DELETE CASCADE,
      UNIQUE(tournee_id, date_livraison)
    );

    CREATE TABLE IF NOT EXISTS commandes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      type_abonnement_id INTEGER,
      depot_id INTEGER,
      frequence_id INTEGER,
      date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
      statut TEXT DEFAULT 'en_attente', -- en_attente, validee, annulee
      total REAL DEFAULT 0,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (type_abonnement_id) REFERENCES types_abonnements(id),
      FOREIGN KEY (depot_id) REFERENCES depots(id),
      FOREIGN KEY (frequence_id) REFERENCES frequences(id)
    );
  `);

  // Données de démonstration si tables vides
  if (db.prepare('SELECT COUNT(*) as c FROM structures').get().c === 0) {
    db.prepare('INSERT INTO structures (nom_commercial, raison_sociale, adresse, code_postal, ville, telephone, email, siret) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      'Jardin de Cocagne Demo', 'Association Jardin de Cocagne', '12 rue des Jardins', '88100', 'Saint-Dié-des-Vosges', '03 29 55 12 34', 'contact@cocagne-demo.fr', '12345678901234'
    );
  }

  if (db.prepare('SELECT COUNT(*) as c FROM saisons').get().c === 0) {
    const saisonId = db.prepare('INSERT INTO saisons (libelle, date_debut, date_fin, active) VALUES (?, ?, ?, ?)').run('Saison 2026', '2026-01-01', '2026-12-31', 1).lastInsertRowid;

    // Quelques semaines de fermeture (ex: Noël, août)
    db.prepare('INSERT INTO semaines_fermeture (saison_id, semaine) VALUES (?, ?), (?, ?), (?, ?)').run(
      saisonId, '2026-W52', saisonId, '2026-W53', saisonId, '2026-W32'
    );

    // Quelques jours fériés 2026
    const feries = [
      ['2026-01-01', "Jour de l'an"],
      ['2026-04-06', 'Lundi de Paques'],
      ['2026-05-01', 'Fete du Travail'],
      ['2026-05-14', 'Jeudi de l Ascension'],
      ['2026-05-25', 'Lundi de Pentecôte'],
      ['2026-07-14', 'Fête nationale'],
      ['2026-08-15', 'Assomption'],
      ['2026-11-01', 'Toussaint'],
      ['2026-12-25', 'Noël'],
    ];
    feries.forEach(([d, l]) => {
      db.prepare('INSERT OR IGNORE INTO jours_feries (saison_id, date_ferie, libelle) VALUES (?, ?, ?)').run(saisonId, d, l);
    });
  }

  if (db.prepare('SELECT COUNT(*) as c FROM tournees').get().c === 0) {
    const t1 = db.prepare("INSERT INTO tournees (identifiant, libelle, jour_preparation, jour_livraison, couleur) VALUES ('M1', 'Tournée Mardi 1', 'Lundi', 'Mardi', '#ef4444')").run().lastInsertRowid;
    const t2 = db.prepare("INSERT INTO tournees (identifiant, libelle, jour_preparation, jour_livraison, couleur) VALUES ('Me1', 'Tournée Mercredi 1', 'Mardi', 'Mercredi', '#10b981')").run().lastInsertRowid;
    const t3 = db.prepare("INSERT INTO tournees (identifiant, libelle, jour_preparation, jour_livraison, couleur) VALUES ('V1', 'Tournée Vendredi 1', 'Jeudi', 'Vendredi', '#f59e0b')").run().lastInsertRowid;

    // Dépôts de démo
    const depotsDemo = [
      ['Boulangerie du Centre', '8 rue de la République', '88100', 'Saint-Dié-des-Vosges', '03 29 55 00 01', 'ouvert', 30, 'Mardi', '08:00-12:00', '16:00-19:00', t1, 1],
      ['Épicerie Bio La Feuille', '15 avenue des Vosges', '88100', 'Saint-Dié-des-Vosges', '03 29 55 00 02', 'ouvert', 25, 'Mercredi', '09:00-13:00', '15:00-18:30', t2, 1],
      ['Mairie de Sainte-Marguerite', 'Place de la Mairie', '88250', 'Sainte-Marguerite', '03 29 55 00 03', 'reserve', 20, 'Mercredi', '08:30-12:30', '14:00-17:00', t2, 2],
      ['Supermarché Cocagne', 'Zone commerciale Nord', '88100', 'Saint-Dié-des-Vosges', '03 29 55 00 04', 'ouvert', 40, 'Vendredi', '08:00-12:00', '16:00-19:00', t3, 1],
      ['AMAP des Hautes-Vosges', 'Ferme du Champ', '88400', 'Gérardmer', '03 29 55 00 05', 'reserve', 15, 'Vendredi', '09:00-12:00', '15:00-18:00', t3, 2],
      ['École Primaire Les Tilleuls', '5 rue des Écoles', '88100', 'Saint-Dié-des-Vosges', '03 29 55 00 06', 'professionnel', 10, 'Mardi', '11:30-13:00', '11:30-13:00', t1, 3],
    ];
    depotsDemo.forEach(d => {
      db.prepare('INSERT INTO depots (nom, adresse, code_postal, ville, telephone, categorie, capacite, jour_livraison, creneau_livraison, creneau_recuperation, tournee_id, ordre_livraison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(...d);
    });
  }

  if (db.prepare('SELECT COUNT(*) as c FROM produits').get().c === 0) {
    const p1 = db.prepare('INSERT INTO produits (nom, unite, prix, marge, description) VALUES (?, ?, ?, ?, ?)').run('Panier simple', 'pièce', 13.80, 40, 'Panier de légumes de saison pour 1-2 personnes').lastInsertRowid;
    const p2 = db.prepare('INSERT INTO produits (nom, unite, prix, marge, description) VALUES (?, ?, ?, ?, ?)').run('Panier familial', 'pièce', 23.70, 40, 'Panier de légumes de saison pour 4-6 personnes').lastInsertRowid;
    const p3 = db.prepare('INSERT INTO produits (nom, unite, prix, marge, description) VALUES (?, ?, ?, ?, ?)').run('Panier fruité', 'pièce', 14.00, 70, 'Panier de fruits de saison').lastInsertRowid;
    db.prepare('INSERT INTO types_abonnements (nom, produit_id, prix) VALUES (?, ?, ?)').run('Panier simple', p1, 13.80);
    db.prepare('INSERT INTO types_abonnements (nom, produit_id, prix) VALUES (?, ?, ?)').run('Panier familial', p2, 23.70);
    db.prepare('INSERT INTO types_abonnements (nom, produit_id, prix) VALUES (?, ?, ?)').run('Panier fruité', p3, 14.00);
  }

  if (db.prepare('SELECT COUNT(*) as c FROM frequences').get().c === 0) {
    db.prepare("INSERT INTO frequences (nom, code, semaines_par_periode) VALUES ('Hebdomadaire', 'HEBDO', 1)").run();
    db.prepare("INSERT INTO frequences (nom, code, semaines_par_periode) VALUES ('Tous les 15 jours', 'QUINZ', 2)").run();
    db.prepare("INSERT INTO frequences (nom, code, semaines_par_periode) VALUES ('Mensuel', 'MENS', 4)").run();
  }
}

initDB();

// ---------------------------------------------------------------------------
// API : Structures
// ---------------------------------------------------------------------------
app.get('/api/structures', (req, res) => {
  const rows = db.prepare('SELECT * FROM structures').all();
  res.json(rows);
});

// ---------------------------------------------------------------------------
// API : Saisons
// ---------------------------------------------------------------------------
app.get('/api/saisons', (req, res) => {
  const rows = db.prepare('SELECT * FROM saisons ORDER BY date_debut DESC').all();
  res.json(rows);
});

app.post('/api/saisons', (req, res) => {
  const { libelle, date_debut, date_fin, active } = req.body;
  const info = db.prepare('INSERT INTO saisons (libelle, date_debut, date_fin, active) VALUES (?, ?, ?, ?)').run(libelle, date_debut, date_fin, active ? 1 : 0);
  res.json({ id: info.lastInsertRowid });
});

// ---------------------------------------------------------------------------
// API : Semaines de fermeture
// ---------------------------------------------------------------------------
app.get('/api/semaines-fermeture/:saisonId', (req, res) => {
  const rows = db.prepare('SELECT * FROM semaines_fermeture WHERE saison_id = ?').all(req.params.saisonId);
  res.json(rows);
});

app.post('/api/semaines-fermeture', (req, res) => {
  const { saison_id, semaine } = req.body;
  const info = db.prepare('INSERT INTO semaines_fermeture (saison_id, semaine) VALUES (?, ?)').run(saison_id, semaine);
  res.json({ id: info.lastInsertRowid });
});

app.delete('/api/semaines-fermeture/:id', (req, res) => {
  db.prepare('DELETE FROM semaines_fermeture WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// API : Jours fériés
// ---------------------------------------------------------------------------
app.get('/api/jours-feries/:saisonId', (req, res) => {
  const rows = db.prepare('SELECT * FROM jours_feries WHERE saison_id = ? ORDER BY date_ferie').all(req.params.saisonId);
  res.json(rows);
});

app.post('/api/jours-feries', (req, res) => {
  const { saison_id, date_ferie, libelle } = req.body;
  try {
    const info = db.prepare('INSERT INTO jours_feries (saison_id, date_ferie, libelle) VALUES (?, ?, ?)').run(saison_id, date_ferie, libelle || null);
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Jour férié déjà existant' });
  }
});

app.delete('/api/jours-feries/:id', (req, res) => {
  db.prepare('DELETE FROM jours_feries WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// API : Tournées
// ---------------------------------------------------------------------------
app.get('/api/tournees', (req, res) => {
  const rows = db.prepare('SELECT * FROM tournees ORDER BY identifiant').all();
  res.json(rows);
});

app.post('/api/tournees', (req, res) => {
  const { identifiant, libelle, jour_preparation, jour_livraison, couleur } = req.body;
  const info = db.prepare('INSERT INTO tournees (identifiant, libelle, jour_preparation, jour_livraison, couleur) VALUES (?, ?, ?, ?, ?)').run(identifiant, libelle, jour_preparation, jour_livraison, couleur || '#3b82f6');
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/tournees/:id', (req, res) => {
  const { libelle, jour_preparation, jour_livraison, couleur } = req.body;
  db.prepare('UPDATE tournees SET libelle = ?, jour_preparation = ?, jour_livraison = ?, couleur = ? WHERE id = ?').run(libelle, jour_preparation, jour_livraison, couleur, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/tournees/:id', (req, res) => {
  db.prepare('DELETE FROM tournees WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// API : Dépôts
// ---------------------------------------------------------------------------
app.get('/api/depots', (req, res) => {
  const rows = db.prepare(`SELECT d.*, t.identifiant as tournee_identifiant FROM depots d LEFT JOIN tournees t ON d.tournee_id = t.id ORDER BY d.nom`).all();
  res.json(rows);
});

app.get('/api/depots/disponibles', (req, res) => {
  // Dépôts ouverts à tous ou réservés (affichés en front office)
  const rows = db.prepare(`SELECT d.*, t.identifiant as tournee_identifiant FROM depots d LEFT JOIN tournees t ON d.tournee_id = t.id WHERE d.categorie IN ('ouvert', 'reserve') ORDER BY d.nom`).all();
  res.json(rows);
});

app.post('/api/depots', (req, res) => {
  const {
    nom, adresse, code_postal, ville, telephone, email, site_web,
    personne_referente, mail_referente, tel_referente, categorie,
    texte_reserve, mdp_reserve, capacite, jour_livraison,
    creneau_livraison, creneau_recuperation, presentation, commentaire,
    tournee_id, ordre_livraison
  } = req.body;
  const info = db.prepare(`INSERT INTO depots
    (nom, adresse, code_postal, ville, telephone, email, site_web,
     personne_referente, mail_referente, tel_referente, categorie,
     texte_reserve, mdp_reserve, capacite, jour_livraison,
     creneau_livraison, creneau_recuperation, presentation, commentaire,
     tournee_id, ordre_livraison)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    nom, adresse, code_postal, ville, telephone, email, site_web,
    personne_referente, mail_referente, tel_referente, categorie,
    texte_reserve, mdp_reserve, capacite, jour_livraison,
    creneau_livraison, creneau_recuperation, presentation, commentaire,
    tournee_id || null, ordre_livraison || null
  );
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/depots/:id', (req, res) => {
  const {
    nom, adresse, code_postal, ville, telephone, email, site_web,
    personne_referente, mail_referente, tel_referente, categorie,
    texte_reserve, mdp_reserve, capacite, jour_livraison,
    creneau_livraison, creneau_recuperation, presentation, commentaire,
    tournee_id, ordre_livraison
  } = req.body;
  db.prepare(`UPDATE depots SET
    nom = ?, adresse = ?, code_postal = ?, ville = ?, telephone = ?, email = ?, site_web = ?,
    personne_referente = ?, mail_referente = ?, tel_referente = ?, categorie = ?,
    texte_reserve = ?, mdp_reserve = ?, capacite = ?, jour_livraison = ?,
    creneau_livraison = ?, creneau_recuperation = ?, presentation = ?, commentaire = ?,
    tournee_id = ?, ordre_livraison = ?
    WHERE id = ?`).run(
    nom, adresse, code_postal, ville, telephone, email, site_web,
    personne_referente, mail_referente, tel_referente, categorie,
    texte_reserve, mdp_reserve, capacite, jour_livraison,
    creneau_livraison, creneau_recuperation, presentation, commentaire,
    tournee_id || null, ordre_livraison || null, req.params.id
  );
  res.json({ ok: true });
});

app.delete('/api/depots/:id', (req, res) => {
  db.prepare('DELETE FROM depots WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// API : Produits / Types abonnements / Fréquences
// ---------------------------------------------------------------------------
app.get('/api/produits', (req, res) => {
  res.json(db.prepare('SELECT * FROM produits ORDER BY nom').all());
});

app.get('/api/types-abonnements', (req, res) => {
  const rows = db.prepare(`SELECT ta.*, p.nom as produit_nom FROM types_abonnements ta LEFT JOIN produits p ON ta.produit_id = p.id ORDER BY ta.nom`).all();
  res.json(rows);
});

app.get('/api/frequences', (req, res) => {
  res.json(db.prepare('SELECT * FROM frequences ORDER BY nom').all());
});

// ---------------------------------------------------------------------------
// API : Clients
// ---------------------------------------------------------------------------
app.get('/api/clients', (req, res) => {
  res.json(db.prepare('SELECT * FROM clients ORDER BY nom, prenom').all());
});

app.post('/api/clients', (req, res) => {
  const { civilite, nom, prenom, adresse, code_postal, ville, telephone, email, mot_de_passe } = req.body;
  const info = db.prepare('INSERT INTO clients (civilite, nom, prenom, adresse, code_postal, ville, telephone, email, mot_de_passe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    civilite, nom, prenom, adresse, code_postal, ville, telephone, email, mot_de_passe
  );
  res.json({ id: info.lastInsertRowid });
});

// ---------------------------------------------------------------------------
// RENDU 15 - OPTIMISATION : Organisation des tournées (sujet B)
// ---------------------------------------------------------------------------
// Algorithme : First-Fit Decreasing (bin packing) pour affecter les dépôts
// aux camionnettes selon leur capacité, puis ordonnancement dans chaque tournée.
app.post('/api/optimisation/tournees', (req, res) => {
  const { nb_paniers_total, nb_camionnettes, capacite_camionnette, semaine } = req.body;

  // Récupération des dépôts avec leur nombre de paniers (on simule la demande par dépôt)
  // Pour la démo, on utilise la capacité comme proxy de la demande, ou on génère une demande réaliste.
  const depots = db.prepare(`SELECT d.id, d.nom, d.capacite, d.tournee_id, d.ordre_livraison, t.identifiant as tournee_identifiant FROM depots d LEFT JOIN tournees t ON d.tournee_id = t.id WHERE d.categorie != 'professionnel' ORDER BY d.nom`).all();

  if (depots.length === 0) {
    return res.json({ tournées: [], message: 'Aucun dépôt disponible' });
  }

  // Demande simulée par dépôt (entre 1 et capacité)
  const demandes = depots.map(d => ({
    id: d.id,
    nom: d.nom,
    demande: Math.max(1, Math.floor(d.capacite * 0.6)), // 60% de la capacité en moyenne
    capacite: d.capacite,
    tournee_id: d.tournee_id,
    ordre_livraison: d.ordre_livraison,
    tournee_identifiant: d.tournee_identifiant
  }));

  // Tri par demande décroissante (First-Fit Decreasing)
  demandes.sort((a, b) => b.demande - a.demande);

  // Affectation aux camionnettes
  const camionnettes = Array.from({ length: nb_camionnettes }, (_, i) => ({
    id: i + 1,
    capacite_restante: capacite_camionnette,
    depots: [],
    total: 0
  }));

  const nonAffectes = [];

  for (const depot of demandes) {
    // Première camionnette qui peut le recevoir (First-Fit)
    let place = camionnettes.find(c => c.capacite_restante >= depot.demande);
    if (place) {
      place.depots.push(depot);
      place.capacite_restante -= depot.demande;
      place.total += depot.demande;
    } else {
      nonAffectes.push(depot);
    }
  }

  // Ordonnancement dans chaque tournée : par ordre de livraison existant, sinon alphabétique
  const resultats = camionnettes.map(c => ({
    camionnette: c.id,
    capacite: capacite_camionnette,
    chargement: c.total,
    taux_remplissage: Math.round((c.total / capacite_camionnette) * 100),
    depots: c.depots.sort((a, b) => {
      if (a.ordre_livraison !== null && b.ordre_livraison !== null) return a.ordre_livraison - b.ordre_livraison;
      if (a.ordre_livraison !== null) return -1;
      if (b.ordre_livraison !== null) return 1;
      return a.nom.localeCompare(b.nom);
    }).map(d => ({
      id: d.id,
      nom: d.nom,
      demande: d.demande,
      capacite: d.capacite,
      ordre: d.ordre_livraison
    }))
  }));

  res.json({
    nb_paniers_total: nb_paniers_total || demandes.reduce((s, d) => s + d.demande, 0),
    nb_camionnettes,
    capacite_camionnette,
    tournées: resultats,
    non_affectes: nonAffectes.map(d => ({ id: d.id, nom: d.nom, demande: d.demande })),
    algorithme: 'First-Fit Decreasing (bin packing)',
    message: nonAffectes.length > 0
      ? `${nonAffectes.length} dépôt(s) n'a(ont) pas pu être affecté(s) : capacité des camionnettes insuffisante.`
      : 'Tous les dépôts ont été affectés aux tournées.'
  });
});

// ---------------------------------------------------------------------------
// RENDU 16 - BACK OFFICE : Calendrier de livraison (sujet A)
// ---------------------------------------------------------------------------

// Jours de la semaine index (0 = dimanche ... 6 = samedi)
const JOURS_INDEX = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 };
const JOURS_NOM = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekParity(date) {
  const week = getISOWeek(date);
  return week % 2 === 0 ? 'paire' : 'impaire';
}

// Génération du calendrier de livraison
app.post('/api/calendrier/generer', (req, res) => {
  const { saison_id, tournee_id, annee, nb_paniers, jour_livraison, parite_depart } = req.body;

  if (!saison_id || !tournee_id || !annee || !nb_paniers || !jour_livraison) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  const jourIndex = JOURS_INDEX[jour_livraison.toLowerCase()];
  if (jourIndex === undefined) {
    return res.status(400).json({ error: 'Jour de livraison invalide' });
  }

  // Récupération des contraintes de la saison
  const semainesFermeture = db.prepare('SELECT semaine FROM semaines_fermeture WHERE saison_id = ?').all(saison_id).map(r => r.semaine);
  const joursFeries = db.prepare('SELECT date_ferie FROM jours_feries WHERE saison_id = ?').all(saison_id).map(r => r.date_ferie);
  const feriesSet = new Set(joursFeries);

  // Déterminer la parité de départ
  // Si parite_depart non spécifié, on prend la première semaine de l'année
  let pariteRecherchee = parite_depart; // 'paire' ou 'impaire'

  const calendrier = [];
  const dateDebut = new Date(annee, 0, 1);
  const dateFin = new Date(annee, 11, 31);

  // Itérer sur chaque jour de l'année qui correspond au jour de livraison
  let dateCourante = new Date(dateDebut);
  // Avancer jusqu'au premier jour de livraison
  while (dateCourante.getDay() !== jourIndex) {
    dateCourante.setDate(dateCourante.getDate() + 1);
  }

  while (dateCourante <= dateFin && calendrier.length < nb_paniers) {
    const dateStr = dateCourante.toISOString().split('T')[0];
    const weekStr = `${dateCourante.getFullYear()}-W${String(getISOWeek(dateCourante)).padStart(2, '0')}`;
    const parite = getWeekParity(dateCourante);

    let valide = true;
    let deplace = false;
    let dateOriginale = null;
    let dateFinale = new Date(dateCourante);

    // 1. Vérifier semaine de fermeture
    if (semainesFermeture.includes(weekStr)) {
      valide = false;
    }

    // 2. Vérifier jour férié avec règles de décalage
    if (feriesSet.has(dateStr)) {
      // Règle : vendredi ne peut pas décaler au samedi (jour avant obligatoire)
      //          lundi ne peut pas décaler au dimanche (jour après obligatoire)
      // On cherche un jour ouvrable dans la même semaine
      let jourDecale = null;
      if (jourIndex === 5) { // vendredi -> jeudi (jour avant)
        jourDecale = new Date(dateCourante);
        jourDecale.setDate(dateCourante.getDate() - 1);
      } else if (jourIndex === 1) { // lundi -> mardi (jour après)
        jourDecale = new Date(dateCourante);
        jourDecale.setDate(dateCourante.getDate() + 1);
      } else {
        // Autres jours : essayer jour avant puis jour après
        const avant = new Date(dateCourante);
        avant.setDate(dateCourante.getDate() - 1);
        const apres = new Date(dateCourante);
        apres.setDate(dateCourante.getDate() + 1);
        if (!feriesSet.has(avant.toISOString().split('T')[0])) {
          jourDecale = avant;
        } else {
          jourDecale = apres;
        }
      }

      if (jourDecale) {
        const decaleStr = jourDecale.toISOString().split('T')[0];
        const decaleWeek = `${jourDecale.getFullYear()}-W${String(getISOWeek(jourDecale)).padStart(2, '0')}`;
        if (!feriesSet.has(decaleStr) && !semainesFermeture.includes(decaleWeek)) {
          dateFinale = jourDecale;
          deplace = true;
          dateOriginale = dateStr;
        } else {
          valide = false;
        }
      } else {
        valide = false;
      }
    }

    // 3. Vérifier parité (semaine paire/impaire) pour livraison 15 jours
    if (valide && pariteRecherchee) {
      if (parite !== pariteRecherchee) {
        valide = false;
      }
    }

    if (valide) {
      calendrier.push({
        date: dateFinale.toISOString().split('T')[0],
        jour_semaine: JOURS_NOM[dateFinale.getDay()],
        semaine: weekStr,
        parite,
        deplace_manuellement: deplace ? 1 : 0,
        date_originale: dateOriginale || null,
        nb_paniers: 1
      });
    }

    // Avancer d'une semaine (ou deux si parité forcée pour 15 jours)
    dateCourante.setDate(dateCourante.getDate() + (pariteRecherchee ? 14 : 7));
  }

  // Vérification : nombre de paniers placés
  const totalPlaces = calendrier.length;
  const ok = totalPlaces >= nb_paniers;

  // Sauvegarde en base (on écrase le calendrier existant pour cette tournée/saison)
  db.prepare('DELETE FROM calendrier_livraison WHERE saison_id = ? AND tournee_id = ?').run(saison_id, tournee_id);
  const insert = db.prepare('INSERT INTO calendrier_livraison (tournee_id, saison_id, date_livraison, semaine_parite, nb_paniers, deplace_manuellement, date_originale) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const transaction = db.transaction((rows) => {
    for (const r of rows) insert.run(tournee_id, saison_id, r.date, r.parite, r.nb_paniers, r.deplace_manuellement, r.date_originale);
  });
  transaction(calendrier);

  res.json({
    saison_id,
    tournee_id,
    annee,
    nb_paniers_demandes: nb_paniers,
    nb_paniers_places: totalPlaces,
    verification: ok ? 'OK - tous les paniers sont placés' : `ATTENTION - il manque ${nb_paniers - totalPlaces} panier(s)`,
    jour_livraison,
    parite_depart: pariteRecherchee,
    calendrier,
    message: ok
      ? `Calendrier généré avec succès : ${totalPlaces} date(s) de livraison pour ${nb_paniers} panier(s).`
      : `Calendrier incomplet : seulement ${totalPlaces} date(s) sur ${nb_paniers} demandées.`
  });
});

// Récupérer un calendrier existant
app.get('/api/calendrier/:saisonId/:tourneeId', (req, res) => {
  const rows = db.prepare('SELECT * FROM calendrier_livraison WHERE saison_id = ? AND tournee_id = ? ORDER BY date_livraison').all(req.params.saisonId, req.params.tourneeId);
  res.json(rows);
});

// Déplacer manuellement une date de livraison (Rendu 16, point 2)
app.put('/api/calendrier/:id/deplacer', (req, res) => {
  const { nouvelle_date } = req.body;
  const row = db.prepare('SELECT * FROM calendrier_livraison WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Entrée introuvable' });

  // Vérifier que la nouvelle date n'est pas déjà prise pour cette tournée
  const existe = db.prepare('SELECT id FROM calendrier_livraison WHERE tournee_id = ? AND date_livraison = ? AND id != ?').get(row.tournee_id, nouvelle_date, req.params.id);
  if (existe) {
    return res.status(400).json({ error: 'Cette date est déjà utilisée pour cette tournée' });
  }

  db.prepare('UPDATE calendrier_livraison SET date_livraison = ?, deplace_manuellement = 1, date_originale = COALESCE(date_originale, ?) WHERE id = ?').run(
    nouvelle_date, row.date_livraison, req.params.id
  );
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// RENDU 17 - INTERFACE : Formulaire de commande (sujet A)
// ---------------------------------------------------------------------------

// Récupérer les données pour le formulaire (types abonnement, fréquences, dépôts dispo)
app.get('/api/commande/options', (req, res) => {
  const types = db.prepare(`SELECT ta.id, ta.nom, ta.prix, p.nom as produit_nom FROM types_abonnements ta LEFT JOIN produits p ON ta.produit_id = p.id ORDER BY ta.nom`).all();
  const frequences = db.prepare('SELECT * FROM frequences ORDER BY nom').all();
  const depots = db.prepare(`SELECT d.id, d.nom, d.adresse, d.ville, d.code_postal, d.categorie, d.texte_reserve, d.capacite,
    (SELECT COUNT(*) FROM abonnements a WHERE a.depot_id = d.id AND a.active = 1) as nb_actifs
    FROM depots d WHERE d.categorie IN ('ouvert', 'reserve') ORDER BY d.nom`).all();

  // Calculer places restantes
  depots.forEach(d => {
    d.places_restantes = Math.max(0, d.capacite - (d.nb_actifs || 0));
    d.complet = d.places_restantes <= 0;
  });

  res.json({ types, frequences, depots });
});

// Passer une commande (formulaire de commande)
app.post('/api/commandes', (req, res) => {
  const { client_id, type_abonnement_id, frequence_id, depot_id } = req.body;
  if (!type_abonnement_id || !frequence_id || !depot_id) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const type = db.prepare('SELECT prix FROM types_abonnements WHERE id = ?').get(type_abonnement_id);
  const depot = db.prepare('SELECT capacite, categorie FROM depots WHERE id = ?').get(depot_id);

  // Vérifier capacité du dépôt
  const nbActifs = db.prepare('SELECT COUNT(*) as c FROM abonnements WHERE depot_id = ? AND active = 1').get(depot_id).c;
  if (nbActifs >= depot.capacite) {
    return res.status(400).json({ error: 'Ce point de dépôt est complet' });
  }

  const info = db.prepare(`INSERT INTO commandes (client_id, type_abonnement_id, frequence_id, depot_id, total) VALUES (?, ?, ?, ?, ?)`).run(
    client_id || null, type_abonnement_id, frequence_id, depot_id, type.prix
  );

  // Créer l'abonnement si client connu
  if (client_id) {
    db.prepare(`INSERT INTO abonnements (client_id, type_abonnement_id, frequence_id, depot_id, date_debut, active) VALUES (?, ?, ?, ?, date('now'), 1)`).run(
      client_id, type_abonnement_id, frequence_id, depot_id
    );
  }

  res.json({ id: info.lastInsertRowid, total: type.prix, message: 'Commande enregistrée avec succès' });
});

app.get('/api/commandes', (req, res) => {
  const rows = db.prepare(`SELECT c.*, ta.nom as type_nom, f.nom as frequence_nom, d.nom as depot_nom FROM commandes c
    LEFT JOIN types_abonnements ta ON c.type_abonnement_id = ta.id
    LEFT JOIN frequences f ON c.frequence_id = f.id
    LEFT JOIN depots d ON c.depot_id = d.id
    ORDER BY c.date_commande DESC`).all();
  res.json(rows);
});

// ---------------------------------------------------------------------------
// Route principale : servir l'index.html
// ---------------------------------------------------------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur SAE5 démarré sur http://localhost:${PORT}`);
});
