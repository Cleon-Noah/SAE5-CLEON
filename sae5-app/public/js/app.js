/**
 * SAE5 - Jardins de Cocagne
 * Application principale : les 3 rendus choisis
 *   Rendu 15 (Optimisation, sujet B) : Organisation des tournées
 *   Rendu 16 (Back office, sujet A) : Calendrier de livraison
 *   Rendu 17 (Interface, sujet A)   : Formulaire de commande
 */

const app = {
  currentSection: 'accueil',
  charts: {},

  // ------------------------------------------------------------------
  // Initialisation
  // ------------------------------------------------------------------
  init() {
    this.setupNavigation();
    this.render();
    this.updateBadge();
  },

  setupNavigation() {
    // Clic hors menu sur mobile : fermer (géré par CSS simple)
  },

  // ------------------------------------------------------------------
  // Navigation entre sections
  // ------------------------------------------------------------------
  showSection(name) {
    this.currentSection = name;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active', 'bg-green-800'));
    const btn = event ? event.currentTarget : null;
    if (btn) btn.classList.add('active', 'bg-green-800');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById('section-' + name);
    if (section) section.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
    this.updateBadge();
  },

  updateBadge() {
    const stats = DB.getStats();
    const badge = document.getElementById('badge-stats');
    if (badge) {
      badge.textContent = `${stats.nbAbonnements} abonnements actifs`;
      badge.classList.remove('hidden');
    }
  },

  // ------------------------------------------------------------------
  // Rendu principal
  // ------------------------------------------------------------------
  render() {
    const container = document.getElementById('app-container');
    container.innerHTML = '';

    if (this.currentSection === 'accueil') {
      container.appendChild(this.buildAccueil());
    } else if (this.currentSection === 'tournées') {
      container.appendChild(this.buildTournées());
    } else if (this.currentSection === 'calendrier') {
      container.appendChild(this.buildCalendrier());
    } else if (this.currentSection === 'commande') {
      container.appendChild(this.buildCommande());
    } else if (this.currentSection === 'donnees') {
      container.appendChild(this.buildDonnées());
    }
  },

  // ==================================================================
  // ACCUEIL / TABLEAU DE BORD
  // ==================================================================
  buildAccueil() {
    const stats = DB.getStats();
    const section = document.createElement('div');
    section.id = 'section-accueil';
    section.className = 'section active';
    section.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-green-900 mb-2">Tableau de bord</h1>
        <p class="text-slate-600">Jardin de Cocagne — Gestion des paniers, tournées et livraisons</p>
      </div>

      <!-- Cartes stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Abonnements actifs</div>
          <div class="text-4xl font-bold text-green-900">${stats.nbAbonnements}</div>
        </div>
        <div class="card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Points de dépôt</div>
          <div class="text-4xl font-bold text-green-900">${stats.nbDepots}</div>
        </div>
        <div class="card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Tournées</div>
          <div class="text-4xl font-bold text-green-900">${stats.nbTournées}</div>
        </div>
        <div class="card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Commandes en attente</div>
          <div class="text-4xl font-bold text-green-900">${stats.nbCommandes}</div>
        </div>
      </div>

      <!-- Récap rapide des 3 modules -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl mb-4">🚚</div>
          <h3 class="text-lg font-bold text-green-900 mb-2">Rendu 15 — Optimisation</h3>
          <p class="text-slate-600 text-sm mb-4">Organisation des tournées : répartition des paniers dans les camionnettes selon la capacité des dépôts et des véhicules.</p>
          <button onclick="app.showSection('tournées')" class="w-full bg-green-900 text-white py-2 rounded-md hover:bg-green-800 transition text-sm font-medium">Accéder à l'optimisation</button>
        </div>
        <div class="card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xl mb-4">📅</div>
          <h3 class="text-lg font-bold text-green-900 mb-2">Rendu 16 — Back office</h3>
          <p class="text-slate-600 text-sm mb-4">Calendrier de livraison : génération des dates en évitant fermetures et jours fériés, avec report manuel.</p>
          <button onclick="app.showSection('calendrier')" class="w-full bg-green-900 text-white py-2 rounded-md hover:bg-green-800 transition text-sm font-medium">Accéder au calendrier</button>
        </div>
        <div class="card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center text-xl mb-4">🛒</div>
          <h3 class="text-lg font-bold text-green-900 mb-2">Rendu 17 — Interface</h3>
          <p class="text-slate-600 text-sm mb-4">Formulaire de commande : l'adhérent choisit son abonnement et son point de dépôt, mise à jour en temps réel.</p>
          <button onclick="app.showSection('commande')" class="w-full bg-green-900 text-white py-2 rounded-md hover:bg-green-800 transition text-sm font-medium">Accéder au formulaire</button>
        </div>
      </div>
    `;
    return section;
  },

  // ==================================================================
  // RENDU 15 - OPTIMISATION : Organisation des tournées (sujet B)
  // ==================================================================
  buildTournées() {
    const section = document.createElement('div');
    section.id = 'section-tournées';
    section.className = 'section active';
    const depots = DB.getDepotsDisponibles();
    const tournées = DB.get('tournees');

    section.innerHTML = `
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-green-900 mb-1">Rendu 15 — Organisation des tournées</h1>
        <p class="text-slate-600 text-sm">Sujet B : Optimisation de la répartition des paniers dans les camionnettes selon la capacité des dépôts et des véhicules.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Paramètres -->
        <div class="lg:col-span-1">
          <div class="card bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h3 class="font-bold text-green-900 mb-4 text-sm uppercase tracking-wider">Paramètres d'optimisation</h3>
            <div class="space-y-3">
              <div class="form-group">
                <label class="form-label">Nombre de camionnettes</label>
                <input type="number" id="opt-nb-camionnettes" value="3" min="1" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Capacité par camionnette (paniers)</label>
                <input type="number" id="opt-capacite" value="50" min="1" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Nb total de paniers à livrer (optionnel)</label>
                <input type="number" id="opt-nb-paniers" value="" min="1" placeholder="Laissé vide = somme des dépôts" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Dépôts à organiser</label>
                <select id="opt-depots-filter" class="form-select">
                  <option value="tous">Tous les dépôts (sauf professionnels)</option>
                  <option value="ouverts">Dépôts ouverts à tous</option>
                </select>
              </div>
              <button id="btn-optimiser" class="w-full bg-green-900 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition shadow-md shadow-green-900/20">
                Calculer l'organisation
              </button>
              <p class="text-xs text-slate-500 mt-3">Algorithme : First-Fit Decreasing (bin packing)</p>
            </div>
          </div>
        </div>

        <!-- Résultat -->
        <div class="lg:col-span-2">
          <div id="opt-alerte" class="hidden mb-4"></div>
          <div id="opt-resultat" class="hidden">
            <div class="flex justify-between items-end mb-4">
              <div>
                <h3 class="font-bold text-green-900 text-lg">Résultat de l'organisation</h3>
                <p class="text-sm text-slate-500" id="opt-resume"></p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="opt-camionnettes-grid"></div>
          </div>
          <div class="mt-8">
            <canvas id="opt-chart" height="120"></canvas>
          </div>
        </div>
      </div>

      <!-- Détails des dépôts -->
      <div class="mt-8">
        <h3 class="font-bold text-green-900 mb-3 text-sm uppercase tracking-wider">Dépôts disponibles</h3>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nom</th><th>Ville</th><th>Catégorie</th><th>Capacité</th><th>Tournée</th><th>Ordre</th>
              </tr>
            </thead>
            <tbody id="opt-depots-table">
              ${depots.map(d => `
                <tr>
                  <td class="font-medium">${this.escapeHtml(d.nom)}</td>
                  <td>${this.escapeHtml(d.ville)}</td>
                  <td><span class="badge ${d.categorie === 'ouvert' ? 'badge-ok' : d.categorie === 'reserve' ? 'badge-warn' : 'badge-err'}">${d.categorie}</span></td>
                  <td>${d.capacite}</td>
                  <td>${d.tournee_id ? tournées.find(t => t.id == d.tournee_id)?.identifiant || '-' : '-'}</td>
                  <td>${d.ordre_livraison || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Écouteurs
    setTimeout(() => {
      document.getElementById('btn-optimiser').addEventListener('click', () => this.executerOptimisation());
    }, 0);

    return section;
  },

  executerOptimisation() {
    const nbCamionnettes = parseInt(document.getElementById('opt-nb-camionnettes').value) || 1;
    const capacite = parseInt(document.getElementById('opt-capacite').value) || 50;
    const nbPaniersInput = document.getElementById('opt-nb-paniers').value;
    const nbPaniersTotal = nbPaniersInput ? parseInt(nbPaniersInput) : null;

    let depots = DB.getDepotsDisponibles();
    const filter = document.getElementById('opt-depots-filter').value;
    if (filter === 'ouverts') {
      depots = depots.filter(d => d.categorie === 'ouvert');
    }

    if (depots.length === 0) {
      this.showAlert('opt-alerte', 'Aucun dépôt disponible pour l\'optimisation.', 'error');
      return;
    }

    // Demande simulée par dépôt (60% de la capacité, minimum 1)
    const demandes = depots.map(d => ({
      id: d.id,
      nom: d.nom,
      demande: Math.max(1, Math.round(d.capacite * 0.6)),
      capacite: d.capacite,
      tournee_id: d.tournee_id,
      ordre_livraison: d.ordre_livraison
    }));

    // Tri décroissant par demande (First-Fit Decreasing)
    demandes.sort((a, b) => b.demande - a.demande);

    // Affectation aux camionnettes
    const camionnettes = Array.from({ length: nbCamionnettes }, (_, i) => ({
      id: i + 1,
      capacite_restante: capacite,
      depots: [],
      total: 0
    }));

    const nonAffectes = [];

    for (const depot of demandes) {
      let place = camionnettes.find(c => c.capacite_restante >= depot.demande);
      if (place) {
        place.depots.push(depot);
        place.capacite_restante -= depot.demande;
        place.total += depot.demande;
      } else {
        nonAffectes.push(depot);
      }
    }

    const totalDemande = demandes.reduce((s, d) => s + d.demande, 0);
    const totalPlace = camionnettes.reduce((s, c) => s + c.total, 0);

    // Affichage
    const resultat = document.getElementById('opt-resultat');
    const alerte = document.getElementById('opt-alerte');
    const grid = document.getElementById('opt-camionnettes-grid');
    const resume = document.getElementById('opt-resume');

    resultat.classList.remove('hidden');
    alerte.classList.add('hidden');

    resume.textContent = `${totalDemande} panier(s) demandé(s) • ${totalPlace} placé(s) dans ${nbCamionnettes} camionnette(s)${nonAffectes.length > 0 ? ` • ${nonAffectes.length} non affecté(s)` : ''}`;

    grid.innerHTML = camionnettes.map(c => {
      const taux = Math.round((c.total / capacite) * 100);
      return `
        <div class="card bg-white p-4 rounded-xl border border-slate-200">
          <div class="flex justify-between items-start mb-3">
            <div>
              <div class="font-bold text-green-900">Camionnette ${c.id}</div>
              <div class="text-xs text-slate-500">Capacité : ${capacite} paniers</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold ${taux >= 90 ? 'text-green-600' : taux >= 70 ? 'text-amber-600' : 'text-slate-600'}">${taux}%</div>
              <div class="text-xs text-slate-500">remplissage</div>
            </div>
          </div>
          <div class="progress-bar mb-2"><div class="progress-fill" style="width: ${taux}%"></div></div>
          <div class="text-xs text-slate-500 mb-2">${c.total} / ${capacite} paniers</div>
          <ul class="text-xs space-y-1">
            ${c.depots.map(d => `<li class="flex justify-between"><span>${d.nom}</span><span class="font-medium text-slate-700">${d.demande}</span></li>`).join('') || '<li class="text-slate-400 italic">Aucun dépôt</li>'}
          </ul>
        </div>
      `;
    }).join('');

    if (nonAffectes.length > 0) {
      this.showAlert('opt-alerte',
        `${nonAffectes.length} dépôt(s) n'a(ont) pas pu être affecté(s) : capacité insuffisante. ${nonAffectes.map(d => d.nom).join(', ')}.`,
        'warning');
    }

    // Graphique
    this.renderOptChart(camionnettes, capacite);
  },

  renderOptChart(camionnettes, capacite) {
    const ctx = document.getElementById('opt-chart');
    if (!ctx) return;
    if (this.charts.opt) this.charts.opt.destroy();
    this.charts.opt = new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: camionnettes.map(c => `Camionnette ${c.id}`),
        datasets: [{
          label: 'Paniers chargés',
          data: camionnettes.map(c => c.total),
          backgroundColor: ['#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
          borderRadius: 4
        }, {
          label: 'Capacité restante',
          data: camionnettes.map(c => capacite - c.total),
          backgroundColor: '#e5e7eb',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Répartition de la charge par camionnette' } },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, suggestedMax: capacite } }
      }
    });
  },

  // ==================================================================
  // RENDU 16 - BACK OFFICE : Calendrier de livraison (sujet A)
  // ==================================================================
  buildCalendrier() {
    const section = document.createElement('div');
    section.id = 'section-calendrier';
    section.className = 'section active';
    const saisons = DB.get('saisons');
    const tournées = DB.get('tournees');
    const anneeCourante = new Date().getFullYear();

    section.innerHTML = `
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-green-900 mb-1">Rendu 16 — Calendrier de livraison</h1>
        <p class="text-slate-600 text-sm">Sujet A : Génération des plannings de livraison selon la tournée et le nombre de paniers.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Formulaire de génération -->
        <div class="lg:col-span-1">
          <div class="card bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h3 class="font-bold text-indigo-900 mb-4 text-sm uppercase tracking-wider">Générer le calendrier</h3>
            <div class="space-y-3">
              <div class="form-group">
                <label class="form-label">Saison</label>
                <select id="cal-saison" class="form-select">
                  ${saisons.map(s => `<option value="${s.id}" ${s.active ? 'selected' : ''}>${s.libelle}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tournée</label>
                <select id="cal-tournee" class="form-select">
                  ${tournées.map(t => `<option value="${t.id}">${t.identifiant} — ${t.libelle} (${t.jour_livraison})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Année</label>
                <input type="number" id="cal-annee" value="${anneeCourante}" min="2020" max="2100" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Nombre de paniers à distribuer</label>
                <input type="number" id="cal-nb-paniers" value="25" min="1" class="form-input" />
                <p class="text-xs text-slate-400">25 paniers ≈ livraison tous les 15 jours</p>
              </div>
              <div class="form-group">
                <label class="form-label">Parité de départ (semaine)</label>
                <select id="cal-parite" class="form-select">
                  <option value="">Aucune (chaque semaine)</option>
                  <option value="paire">Semaine paire</option>
                  <option value="impaire">Semaine impaire</option>
                </select>
                <p class="text-xs text-slate-400">Nécessaire pour fréquence 15 jours</p>
              </div>
              <button id="btn-generer-calendrier" class="w-full bg-indigo-900 text-white py-3 rounded-lg font-semibold hover:bg-indigo-800 transition shadow-md shadow-indigo-900/20">
                Générer le calendrier
              </button>
            </div>
          </div>
        </div>

        <!-- Résultat -->
        <div class="lg:col-span-3">
          <div id="cal-alerte" class="hidden mb-4"></div>
          <div id="cal-resultat" class="hidden">
            <div class="flex justify-between items-end mb-4">
              <div>
                <h3 class="font-bold text-indigo-900 text-lg">Calendrier généré</h3>
                <p class="text-sm text-slate-500" id="cal-resume"></p>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Jour</th><th>Semaine</th><th>Parité</th><th>Paniers</th><th>Statut</th><th>Action</th>
                  </tr>
                </thead>
                <tbody id="cal-lignes"></tbody>
              </table>
            </div>
            <div class="mt-4 flex gap-2">
              <button onclick="app.exporterCalendrier()" class="bg-slate-100 text-slate-700 px-4 py-2 rounded-md text-sm hover:bg-slate-200 transition">Exporter (CSV)</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendrier existant -->
      <div class="mt-8">
        <h3 class="font-bold text-indigo-900 mb-3 text-sm uppercase tracking-wider">Calendriers enregistrés</h3>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Tournée</th><th>Saison</th><th>Nb dates</th><th>Nb paniers</th><th>Dernière mise à jour</th><th>Action</th></tr>
            </thead>
            <tbody id="cal-historique"></tbody>
          </table>
        </div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById('btn-generer-calendrier').addEventListener('click', () => this.genererCalendrier());
      this.chargerHistoriqueCalendrier();
    }, 0);

    return section;
  },

  // --- Algorithme de génération du calendrier ---
  genererCalendrier() {
    const saisonId = parseInt(document.getElementById('cal-saison').value);
    const tourneeId = parseInt(document.getElementById('cal-tournee').value);
    const annee = parseInt(document.getElementById('cal-annee').value);
    const nbPaniers = parseInt(document.getElementById('cal-nb-paniers').value);
    const pariteDepart = document.getElementById('cal-parite').value || null;

    const tournee = DB.getById('tournees', tourneeId);
    const saison = DB.getById('saisons', saisonId);
    if (!tournee || !saison) return;

    const jourIndex = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'].indexOf(tournee.jour_livraison.toLowerCase());
    if (jourIndex === -1) return;

    // Contraintes de la saison
    const semainesFermeture = DB.get('semaines_fermeture').filter(s => s.saison_id == saisonId).map(s => s.semaine);
    const joursFeriesSet = new Set(DB.get('jours_feries').filter(j => j.saison_id == saisonId).map(j => j.date_ferie));

    // Helpers
    const getISOWeek = (d) => {
      const t = new Date(d);
      t.setHours(0,0,0,0);
      t.setDate(t.getDate() + 3 - (t.getDay() + 6) % 7);
      const yearStart = new Date(t.getFullYear(), 0, 1);
      return Math.ceil((((t - yearStart) / 86400000) + 1) / 7);
    };
    const getParity = (d) => (getISOWeek(d) % 2 === 0) ? 'paire' : 'impaire';
    const fmt = (d) => d.toISOString().split('T')[0];

    const calendrier = [];
    let date = new Date(annee, 0, 1);
    // Aller au premier jour de livraison de l'année
    while (date.getDay() !== jourIndex) date.setDate(date.getDate() + 1);

    const dateFin = new Date(annee, 11, 31);

    while (date <= dateFin && calendrier.length < nbPaniers) {
      const dateStr = fmt(date);
      const weekStr = `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, '0')}`;
      const parite = getParity(date);

      let valide = true;
      let deplace = false;
      let dateOriginale = null;
      let dateFinale = new Date(date);

      // 1. Semaine de fermeture
      if (semainesFermeture.includes(weekStr)) valide = false;

      // 2. Jour férié avec règles de décalage
      if (valide && joursFeriesSet.has(dateStr)) {
        let jourDecale = null;
        if (jourIndex === 5) { // vendredi → jeudi (jour avant)
          jourDecale = new Date(date); jourDecale.setDate(date.getDate() - 1);
        } else if (jourIndex === 1) { // lundi → mardi (jour après)
          jourDecale = new Date(date); jourDecale.setDate(date.getDate() + 1);
        } else {
          const avant = new Date(date); avant.setDate(date.getDate() - 1);
          const apres = new Date(date); apres.setDate(date.getDate() + 1);
          jourDecale = (!joursFeriesSet.has(fmt(avant))) ? avant : apres;
        }
        if (jourDecale) {
          const dStr = fmt(jourDecale);
          const wStr = `${jourDecale.getFullYear()}-W${String(getISOWeek(jourDecale)).padStart(2, '0')}`;
          if (!joursFeriesSet.has(dStr) && !semainesFermeture.includes(wStr)) {
            dateFinale = jourDecale; deplace = true; dateOriginale = dateStr;
          } else {
            valide = false;
          }
        } else {
          valide = false;
        }
      }

      // 3. Parité (pour livraison 15 jours)
      if (valide && pariteDepart) {
        if (parite !== pariteDepart) valide = false;
      }

      if (valide) {
        calendrier.push({
          date: fmt(dateFinale),
          jour: ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'][dateFinale.getDay()],
          semaine: weekStr,
          parite,
          deplace: deplace ? 1 : 0,
          date_originale: dateOriginale || null,
          nb_paniers: 1
        });
      }

      // Avancer : 7 jours (chaque semaine) ou 14 (si parité forcée)
      date.setDate(date.getDate() + (pariteDepart ? 14 : 7));
    }

    const totalPlaces = calendrier.length;
    const ok = totalPlaces >= nbPaniers;

    // Sauvegarde
    DB.delete('calendrier_livraison', 0); // placeholder, on recrée tout pour cette tournée/saison
    // Supprimer les entrées existantes pour cette tournée/saison
    const existants = DB.get('calendrier_livraison').filter(c => c.tournee_id == tourneeId && c.saison_id == saisonId);
    existants.forEach(c => DB.delete('calendrier_livraison', c.id));

    const insertTx = DB.get('calendrier_livraison');
    for (const r of calendrier) {
      DB.insert('calendrier_livraison', {
        tournee_id: tourneeId,
        saison_id: saisonId,
        date_livraison: r.date,
        semaine_parite: r.parite,
        nb_paniers: r.nb_paniers,
        deplace_manuellement: r.deplace,
        date_originale: r.date_originale
      });
    }

    // Affichage
    const resultat = document.getElementById('cal-resultat');
    const alerte = document.getElementById('cal-alerte');
    const lignes = document.getElementById('cal-lignes');
    const resume = document.getElementById('cal-resume');

    resultat.classList.remove('hidden');
    alerte.classList.add('hidden');

    resume.textContent = `${totalPlaces} date(s) de livraison générée(s) pour ${nbPaniers} panier(s) demandé(s) • ${ok ? 'OK' : 'INCOMPLET'}`;

    lignes.innerHTML = calendrier.map((r, i) => {
      const estDecale = r.deplace == 1;
      return `
        <tr>
          <td class="font-medium">${r.date}</td>
          <td>${r.jour}</td>
          <td class="text-xs">${r.semaine}</td>
          <td class="text-xs">${r.parite}</td>
          <td>${r.nb_paniers}</td>
          <td><span class="badge ${estDecale ? 'badge-warn' : 'badge-ok'}">${estDecale ? 'Décalé' : 'Normal'}</span></td>
          <td><span class="text-xs text-slate-400">—</span></td>
        </tr>
      `;
    }).join('');

    if (!ok) {
      this.showAlert('cal-alerte',
        `Attention : seulement ${totalPlaces} date(s) sur ${nbPaniers} demandées ont pu être placées. Réduisez le nombre de paniers ou modifiez les contraintes.`,
        'warning');
    }

    this.chargerHistoriqueCalendrier();
  },

  chargerHistoriqueCalendrier() {
    const tbody = document.getElementById('cal-historique');
    if (!tbody) return;
    const rows = DB.get('calendrier_livraison');
    // Grouper par tournée/saison
    const groupes = {};
    rows.forEach(r => {
      const key = `${r.tournee_id}-${r.saison_id}`;
      if (!groupes[key]) groupes[key] = [];
      groupes[key].push(r);
    });
    const tournées = DB.get('tournees');
    const saisons = DB.get('saisons');

    tbody.innerHTML = Object.entries(groupes).map(([key, entries]) => {
      const [tid, sid] = key.split('-');
      const t = tournées.find(t => t.id == tid);
      const s = saisons.find(s => s.id == sid);
      const nbPaniers = entries.reduce((s, e) => s + (e.nb_paniers || 1), 0);
      return `
        <tr>
          <td>${t ? t.identifiant : '?'}</td>
          <td>${s ? s.libelle : '?'}</td>
          <td>${entries.length}</td>
          <td>${nbPaniers}</td>
          <td class="text-xs">${entries[0].date_livraison || '-'}</td>
          <td><button onclick="app.voirCalendrier(${sid}, ${tid})" class="text-xs text-indigo-600 hover:underline">Voir</button></td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="6" class="text-center text-slate-400 py-4">Aucun calendrier généré.</td></tr>';
  },

  voirCalendrier(saisonId, tourneeId) {
    document.getElementById('cal-saison').value = saisonId;
    document.getElementById('cal-tournee').value = tourneeId;
    const rows = DB.get('calendrier_livraison').filter(c => c.saison_id == saisonId && c.tournee_id == tourneeId).sort((a,b) => a.date_livraison.localeCompare(b.date_livraison));
    const resultat = document.getElementById('cal-resultat');
    const lignes = document.getElementById('cal-lignes');
    const resume = document.getElementById('cal-resume');
    const alerte = document.getElementById('cal-alerte');

    resultat.classList.remove('hidden');
    alerte.classList.add('hidden');
    resume.textContent = `${rows.length} date(s) de livraison (calendrier existant)`;
    lignes.innerHTML = rows.map(r => {
      const estDecale = r.deplace_manuellement == 1;
      return `
        <tr>
          <td class="font-medium">${r.date_livraison}</td>
          <td>${['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'][new Date(r.date_livraison).getDay()]}</td>
          <td class="text-xs">${app.semaineISO(r.date_livraison)}</td>
          <td class="text-xs">${r.semaine_parite || '-'}</td>
          <td>${r.nb_paniers}</td>
          <td><span class="badge ${estDecale ? 'badge-warn' : 'badge-ok'}">${estDecale ? 'Déplacé manuellement' : 'Normal'}</span></td>
          <td>
            <input type="date" class="form-input text-xs p-1" value="${r.date_livraison}" onchange="app.deplacerDateCalendrier(${r.id}, this.value)" />
          </td>
        </tr>
      `;
    }).join('');
  },

  deplacerDateCalendrier(id, nouvelleDate) {
    if (!nouvelleDate) return;
    const row = DB.get('calendrier_livraison').find(c => c.id == id);
    if (!row) return;
    // Vérifier doublon
    const existe = DB.get('calendrier_livraison').find(c => c.tournee_id == row.tournee_id && c.date_livraison === nouvelleDate && c.id != id);
    if (existe) {
      this.showAlert('cal-alerte', 'Cette date est déjà utilisée pour cette tournée.', 'error');
      this.voirCalendrier(row.saison_id, row.tournee_id);
      return;
    }
    DB.update('calendrier_livraison', id, {
      date_livraison: nouvelleDate,
      deplace_manuellement: 1,
      date_originale: row.date_originale || row.date_livraison
    });
    this.showAlert('cal-alerte', 'Date déplacée avec succès.', 'success');
    this.voirCalendrier(row.saison_id, row.tournee_id);
  },

  exporterCalendrier() {
    const rows = DB.get('calendrier_livraison');
    if (rows.length === 0) {
      this.showAlert('cal-alerte', 'Aucun calendrier à exporter.', 'error');
      return;
    }
    let csv = 'Date,Jour,Semaine,Parité,Nb paniers,Déplacé manuellement\n';
    rows.forEach(r => {
      const d = new Date(r.date_livraison);
      csv += `${r.date_livraison},${['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][d.getDay()]},${r.semaine_parite || '-'},${r.semaine_parite || '-'},${r.nb_paniers},${r.deplace_manuellement}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendrier_livraison.csv';
    a.click();
  },

  showAlert(id, message, type = 'info') {
    const el = document.getElementById(id);
    const classes = { info: 'alert-info', success: 'alert-success', warning: 'alert-warning', error: 'alert-error' };
    el.className = `alert ${classes[type]}`;
    el.innerHTML = `<strong>${type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : type === 'warning' ? 'Attention' : 'Info'} :</strong> ${message}`;
    el.classList.remove('hidden');
  },

  // ==================================================================
  // RENDU 17 - INTERFACE : Formulaire de commande (sujet A)
  // ==================================================================
  buildCommande() {
    const section = document.createElement('div');
    section.id = 'section-commande';
    section.className = 'section active';
    const types = DB.get('types_abonnements');
    const frequences = DB.get('frequences');
    const depots = DB.getDepotsAvecPlaces();

    section.innerHTML = `
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-green-900 mb-1">Rendu 17 — Formulaire de commande</h1>
        <p class="text-slate-600 text-sm">Sujet A : L'adhérent choisit un abonnement et son point de dépôt. Mise à jour en temps réel.</p>
      </div>

      <div class="lg:grid-cols-4 lg:gap-6 grid grid-cols-1 gap-6">
        <!-- Formulaire -->
        <div class="lg:col-span-3">
          <div class="card bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="font-bold text-green-900 mb-4 text-sm uppercase tracking-wider">Votre commande d'abonnement</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-group md:col-span-3">
                <label class="form-label">Type d'abonnement (panier)</label>
                <select id="cmd-type" class="form-select" onchange="app.majCommande()">
                  ${types.map(t => `<option value="${t.id}" data-prix="${t.prix}">${t.nom}</option>`).join('')}
                </select>
              </div>
              <div class="form-group md:col-span-3">
                <label class="form-label">Fréquence de livraison</label>
                <select id="cmd-frequence" class="form-select" onchange="app.majCommande()">
                  ${frequences.map(f => `<option value="${f.id}">${f.nom}</option>`).join('')}
                </select>
              </div>
              <div class="form-group md:col-span-3">
                <label class="form-label">Point de dépôt</label>
                <select id="cmd-depot" class="form-select" onchange="app.majCommande()">
                  ${depots.map(d => `<option value="${d.id}" data-capacite="${d.capacite}" data-places="${d.places_restantes}" data-complet="${d.complet}" data-categorie="${d.categorie}">${d.nom} — ${d.ville}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Récapitulatif temps réel -->
            <div class="mt-6 p-5 rounded-xl bg-green-50 border border-green-200">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="font-bold text-green-900 text-lg">Récapitulatif</div>
                  <div class="text-sm text-green-700" id="cmd-resume-type">—</div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-green-900" id="cmd-prix-total">0,00 €</div>
                  <div class="text-xs text-green-600">par livraison</div>
                </div>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div><span class="text-slate-500">Fréquence :</span> <span class="font-medium" id="cmd-freq-text">—</span></div>
                <div><span class="text-slate-500">Dépôt :</span> <span class="font-medium" id="cmd-depot-text">—</span></div>
                <div><span class="text-slate-500">Places restantes :</span> <span class="font-medium" id="cmd-places" class="text-green-600">—</span></div>
                <div><span class="text-slate-500">Statut dépôt :</span> <span class="font-medium" id="cmd-statut-depot">—</span></div>
              </div>
            </div>

            <div class="mt-4" id="cmd-alerte" class="hidden"></div>

            <div class="mt-6">
              <div class="form-group">
                <label class="form-label">Votre nom (pour la commande)</label>
                <input type="text" id="cmd-nom-client" placeholder="Ex: Jean Dupont" class="form-input" />
              </div>
              <button id="btn-commander" class="w-full bg-green-900 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition shadow-md shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                Valider la commande
              </button>
              <p class="text-xs text-slate-500 mt-2">Une fois validée, un abonnement est créé et ajouté aux statistiques.</p>
            </div>
          </div>
        </div>

        <!-- Résumé / Paniers -->
        <div class="lg:col-span-1">
          <div class="card bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h3 class="font-bold text-green-900 mb-4 text-sm uppercase tracking-wider">Dépôts disponibles</h3>
            <div class="space-y-3" id="cmd-depots-list">
              ${depots.map(d => `
                <div class="p-3 rounded-lg border border-slate-200 ${d.complet ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}">
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-semibold text-slate-900">${d.nom}</div>
                      <div class="text-xs text-slate-500">${d.adresse}, ${d.code_postal} ${d.ville}</div>
                      ${d.categorie === 'reserve' ? '<div class="text-xs text-amber-600 mt-1">Réservé : ' + (d.texte_reserve || 'public spécifique') + '</div>' : ''}
                    </div>
                    <div class="text-right">
                      <div class="font-bold ${d.complet ? 'text-rose-600' : 'text-green-600'} text-sm">
                        ${d.complet ? 'COMPLET' : d.places_restantes + ' place(s)'}
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Commandes récentes -->
      <div class="mt-8">
        <h3 class="font-bold text-green-900 mb-3 text-sm uppercase tracking-wider">Dernières commandes</h3>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Client</th><th>Abonnement</th><th>Dépôt</th><th>Prix</th><th>Statut</th></tr>
            </thead>
            <tbody id="cmd-historique"></tbody>
          </table>
        </div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById('btn-commander').addEventListener('click', () => this.validerCommande());
      this.majCommande();
      this.chargerCommandes();
    }, 0);

    return section;
  },

  majCommande() {
    const typeId = parseInt(document.getElementById('cmd-type').value);
    const freqId = parseInt(document.getElementById('cmd-frequence').value);
    const depotId = parseInt(document.getElementById('cmd-depot').value);

    const type = DB.get('types_abonnements').find(t => t.id == typeId);
    const frequence = DB.get('frequences').find(f => f.id == freqId);
    const depot = DB.get('depots').find(d => d.id == depotId);

    if (!type || !frequence || !depot) return;

    const nbActifs = DB.get('abonnements').filter(a => a.depot_id == depot.id && a.active).length;
    const places = depot.capacite - nbActifs;
    const complet = places <= 0;

    // Texte
    document.getElementById('cmd-resume-type').textContent = type.nom;
    document.getElementById('cmd-prix-total').textContent = type.prix.toFixed(2) + ' €';
    document.getElementById('cmd-freq-text').textContent = frequence.nom;
    document.getElementById('cmd-depot-text').textContent = depot.nom;
    document.getElementById('cmd-places').textContent = Math.max(0, places);
    document.getElementById('cmd-places').className = complet ? 'font-medium text-rose-600' : 'font-medium text-green-600';
    document.getElementById('cmd-statut-depot').textContent = complet ? 'COMPLET' : 'Disponible';
    document.getElementById('cmd-statut-depot').className = complet ? 'font-medium text-rose-600' : 'font-medium text-green-600';

    const btn = document.getElementById('btn-commander');
    const alerte = document.getElementById('cmd-alerte');

    if (complet) {
      btn.disabled = true;
      alerte.classList.remove('hidden');
      alerte.className = 'alert alert-error mb-4';
      alerte.innerHTML = '<strong>Erreur :</strong> Ce point de dépôt est complet. Choisissez-en un autre.';
    } else {
      btn.disabled = false;
      alerte.classList.add('hidden');
    }

    // Mettre à jour la liste des dépôts côté droit
    const depots = DB.getDepotsAvecPlaces();
    const list = document.getElementById('cmd-depots-list');
    if (list) {
      list.innerHTML = depots.map(d => {
        const nbActifs2 = DB.get('abonnements').filter(a => a.depot_id == d.id && a.active).length;
        const p2 = d.capacite - nbActifs2;
        const c2 = p2 <= 0;
        return `
          <div class="p-3 rounded-lg border border-slate-200 ${c2 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-semibold text-slate-900">${d.nom}</div>
                <div class="text-xs text-slate-500">${d.adresse}, ${d.code_postal} ${d.ville}</div>
              </div>
              <div class="text-right">
                <div class="font-bold ${c2 ? 'text-rose-600' : 'text-green-600'} text-sm">${c2 ? 'COMPLET' : p2 + ' place(s)'}</div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  validerCommande() {
    const nomClient = document.getElementById('cmd-nom-client').value.trim();
    const typeId = parseInt(document.getElementById('cmd-type').value);
    const freqId = parseInt(document.getElementById('cmd-frequence').value);
    const depotId = parseInt(document.getElementById('cmd-depot').value);

    const depot = DB.get('depots').find(d => d.id == depotId);
    const nbActifs = DB.get('abonnements').filter(a => a.depot_id == depot.id && a.active).length;
    if (nbActifs >= depot.capacite) {
      this.showAlert('cmd-alerte', 'Ce dépôt est devenu complet entre-temps.', 'error');
      return;
    }

    // Créer un client temporaire si nom saisi
    let clientId = null;
    if (nomClient) {
      const [prenom, ...nomParts] = nomClient.split(' ');
      const nom = nomParts.join(' ') || nomClient;
      const c = DB.insert('clients', { civilite: '', nom, prenom: prenom || '', adresse: '', code_postal: '', ville: '', telephone: '', email: '', mot_de_passe: '' });
      clientId = c.id;
    }

    const type = DB.get('types_abonnements').find(t => t.id == typeId);
    const cmd = DB.insert('commandes', {
      client_id: clientId,
      type_abonnement_id: typeId,
      frequence_id: freqId,
      depot_id: depotId,
      total: type.prix,
      statut: 'validee'
    });

    // Créer l'abonnement lié
    if (clientId) {
      DB.insert('abonnements', {
        client_id: clientId,
        type_abonnement_id: typeId,
        frequence_id: freqId,
        depot_id: depotId,
        date_debut: new Date().toISOString().split('T')[0],
        active: 1
      });
    }

    this.showAlert('cmd-alerte', 'Commande validée avec succès ! Votre abonnement est enregistré.', 'success');
    document.getElementById('cmd-nom-client').value = '';
    this.majCommande();
    this.chargerCommandes();
    this.updateBadge();
    this.render(); // rafraîchir les stats si on revient à l'accueil
  },

  chargerCommandes() {
    const tbody = document.getElementById('cmd-historique');
    if (!tbody) return;
    const rows = DB.get('commandes');
    const types = DB.get('types_abonnements');
    const depots = DB.get('depots');
    const clients = DB.get('clients');

    tbody.innerHTML = rows.slice().reverse().slice(0, 10).map(c => {
      const t = types.find(x => x.id == c.type_abonnement_id);
      const d = depots.find(x => x.id == c.depot_id);
      const cl = clients.find(x => x.id == c.client_id);
      return `
        <tr>
          <td>${cl ? cl.prenom + ' ' + cl.nom : 'Anonyme'}</td>
          <td>${t ? t.nom : '?'}</td>
          <td>${d ? d.nom : '?'}</td>
          <td>${c.total.toFixed(2)} €</td>
          <td><span class="badge badge-ok">${c.statut}</span></td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5" class="text-center text-slate-400 py-4">Aucune commande.</td></tr>';
  },

  // ==================================================================
  // DONNÉES (gestion CRUD simplifiée)
  // ==================================================================
  buildDonnées() {
    const section = document.createElement('div');
    section.id = 'section-donnees';
    section.className = 'section active';
    section.innerHTML = `
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-green-900 mb-1">Gestion des données</h1>
        <p class="text-slate-600 text-sm">Paramétrage des saisons, tournées, dépôts et jours fériés.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <div class="card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="font-bold text-green-900 mb-4 text-sm uppercase tracking-wider">Ajouter un dépôt</h3>
            <form id="form-depot" class="space-y-3">
              <div class="form-group">
                <label class="form-label">Nom</label>
                <input type="text" id="d-nom" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Ville</label>
                <input type="text" id="d-ville" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Téléphone</label>
                <input type="text" id="d-tel" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Capacité (paniers)</label>
                <input type="number" id="d-capacite" value="30" min="1" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Catégorie</label>
                <select id="d-categorie" class="form-select">
                  <option value="ouvert">Ouvert à tous</option>
                  <option value="reserve">Réservé à un public spécifique</option>
                  <option value="professionnel">Professionnel</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tournée</label>
                <select id="d-tournee" class="form-select">
                  <option value="">Aucune</option>
                  ${DB.get('tournees').map(t => `<option value="${t.id}">${t.identifiant}</option>`).join('')}
                </select>
              </div>
              <button type="submit" class="w-full bg-green-900 text-white py-2 rounded-md hover:bg-green-800 transition">Ajouter</button>
            </form>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="font-bold text-green-900 mb-4 text-sm uppercase tracking-wider">Liste des dépôts</h3>
            <div class="table-wrapper">
              <table class="data-table">
                <thead><tr><th>Nom</th><th>Ville</th><th>Capacité</th><th>Actifs</th><th>Tournée</th><th>Action</th></tr></thead>
                <tbody id="liste-depots"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-green-900 mb-4 text-sm uppercase tracking-wider">Tournées</h3>
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr><th>Identifiant</th><th>Libellé</th><th>Jour préparation</th><th>Jour livraison</th><th>Action</th></tr></thead>
              <tbody id="liste-tournees">
                ${DB.get('tournees').map(t => `
                  <tr>
                    <td>${t.identifiant}</td><td>${t.libelle}</td><td>${t.jour_preparation}</td><td>${t.jour_livraison}</td>
                    <td><button onclick="app.supprimer('tournees', ${t.id})" class="text-xs text-rose-600 hover:underline">Supprimer</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-green-900 mb-4 text-sm uppercase tracking-wider">Jours fériés (Saison 2026)</h3>
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr><th>Date</th><th>Libellé</th><th>Action</th></tr></thead>
              <tbody id="liste-feries">
                ${DB.get('jours_feries').filter(j => j.saison_id == 1).map(j => `
                  <tr>
                    <td>${j.date_ferie}</td><td>${j.libelle}</td>
                    <td><button onclick="app.supprimer('jours_feries', ${j.id})" class="text-xs text-rose-600 hover:underline">Supprimer</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById('form-depot').addEventListener('submit', (e) => {
        e.preventDefault();
        const tourneeId = document.getElementById('d-tournee').value || null;
        DB.insert('depots', {
          nom: document.getElementById('d-nom').value,
          ville: document.getElementById('d-ville').value,
          telephone: document.getElementById('d-tel').value,
          capacite: parseInt(document.getElementById('d-capacite').value),
          categorie: document.getElementById('d-categorie').value,
          tournee_id: tourneeId,
          ordre_livraison: null
        });
        e.target.reset();
        this.render();
      });
      this.chargerListeDepots();
    }, 0);

    return section;
  },

  chargerListeDepots() {
    const tbody = document.getElementById('liste-depots');
    if (!tbody) return;
    const abonnements = DB.get('abonnements');
    const tournées = DB.get('tournees');
    tbody.innerHTML = DB.get('depots').map(d => {
      const actifs = abonnements.filter(a => a.depot_id == d.id && a.active).length;
      const t = tournées.find(t => t.id == d.tournee_id);
      return `
        <tr>
          <td class="font-medium">${d.nom}</td>
          <td>${d.ville}</td>
          <td>${d.capacite}</td>
          <td>${actifs}</td>
          <td>${t ? t.identifiant : '-'}</td>
          <td><button onclick="app.supprimer('depots', ${d.id})" class="text-xs text-rose-600 hover:underline">Supprimer</button></td>
        </tr>
      `;
    }).join('');
  },

  supprimer(table, id) {
    if (!confirm('Supprimer cet élément ?')) return;
    DB.delete(table, id);
    this.render();
  },

  resetData() {
    if (!confirm('Réinitialiser toutes les données aux valeurs par défaut ?')) return;
    DB.reset();
    this.render();
    this.updateBadge();
  },

  semaineISO(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Démarrage
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
