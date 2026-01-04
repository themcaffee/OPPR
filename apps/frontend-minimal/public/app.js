// Configuration
const API_BASE = '/api/v1';
const DEFAULT_PAGE_SIZE = 20;

// State
const state = {
  rankings: { page: 1, data: [], pagination: null },
  tournaments: { page: 1, data: [], pagination: null },
};

// DOM Elements
const elements = {
  // Navigation
  navRankings: document.getElementById('nav-rankings'),
  navTournaments: document.getElementById('nav-tournaments'),

  // Views
  rankingsView: document.getElementById('rankings-view'),
  tournamentsView: document.getElementById('tournaments-view'),

  // Rankings
  rankingsLoading: document.getElementById('rankings-loading'),
  rankingsError: document.getElementById('rankings-error'),
  rankingsTable: document.getElementById('rankings-table'),
  rankingsBody: document.getElementById('rankings-body'),
  rankingsPagination: document.getElementById('rankings-pagination'),

  // Tournaments
  tournamentsLoading: document.getElementById('tournaments-loading'),
  tournamentsError: document.getElementById('tournaments-error'),
  tournamentsTable: document.getElementById('tournaments-table'),
  tournamentsBody: document.getElementById('tournaments-body'),
  tournamentsPagination: document.getElementById('tournaments-pagination'),
};

// API Functions
async function fetchAPI(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchRankings(page = 1) {
  return fetchAPI(
    `/players?page=${page}&limit=${DEFAULT_PAGE_SIZE}&sortBy=ranking&sortOrder=asc&isRated=true`
  );
}

async function fetchTournaments(page = 1) {
  return fetchAPI(`/tournaments?page=${page}&limit=${DEFAULT_PAGE_SIZE}&sortBy=date&sortOrder=desc`);
}

// Render Functions
function renderRankingsTable(players) {
  elements.rankingsBody.innerHTML = players
    .map(
      (player) => `
    <tr>
      <td>${player.ranking ?? '-'}</td>
      <td>${escapeHtml(player.name ?? 'Unknown')}</td>
      <td>${player.rating?.toFixed(0) ?? '-'}</td>
      <td>${player.eventCount ?? 0}</td>
    </tr>
  `
    )
    .join('');
}

function renderTournamentsTable(tournaments) {
  elements.tournamentsBody.innerHTML = tournaments
    .map(
      (tournament) => `
    <tr>
      <td>${escapeHtml(tournament.name)}</td>
      <td>${formatDate(tournament.date)}</td>
      <td>${escapeHtml(tournament.location ?? '-')}</td>
      <td>${formatEventBooster(tournament.eventBooster)}</td>
      <td>${tournament.firstPlaceValue?.toFixed(2) ?? '-'}</td>
    </tr>
  `
    )
    .join('');
}

function renderPagination(container, pagination, onPageChange) {
  if (!pagination || pagination.totalPages <= 1) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = `
    <button ${pagination.page <= 1 ? 'disabled' : ''} data-page="${pagination.page - 1}">Previous</button>
    <span>Page ${pagination.page} of ${pagination.totalPages}</span>
    <button ${pagination.page >= pagination.totalPages ? 'disabled' : ''} data-page="${pagination.page + 1}">Next</button>
  `;

  container.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page)) onPageChange(page);
    });
  });
}

// Utility Functions
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatEventBooster(type) {
  const labels = {
    NONE: 'Standard',
    CERTIFIED: 'Certified',
    CERTIFIED_PLUS: 'Certified+',
    CHAMPIONSHIP_SERIES: 'Championship',
    MAJOR: 'Major',
  };
  return labels[type] ?? type;
}

function showView(view, button) {
  // Hide all views
  elements.rankingsView.classList.add('hidden');
  elements.tournamentsView.classList.add('hidden');

  // Deactivate all nav buttons
  elements.navRankings.classList.remove('active');
  elements.navTournaments.classList.remove('active');

  // Show selected view
  view.classList.remove('hidden');
  button.classList.add('active');
}

// Load Functions
async function loadRankings(page = 1) {
  elements.rankingsLoading.classList.remove('hidden');
  elements.rankingsError.classList.add('hidden');
  elements.rankingsTable.classList.add('hidden');

  try {
    const result = await fetchRankings(page);
    state.rankings.data = result.data;
    state.rankings.pagination = result.pagination;
    state.rankings.page = page;

    renderRankingsTable(result.data);
    renderPagination(elements.rankingsPagination, result.pagination, loadRankings);

    elements.rankingsTable.classList.remove('hidden');
  } catch (error) {
    elements.rankingsError.textContent = `Failed to load rankings: ${error.message}`;
    elements.rankingsError.classList.remove('hidden');
  } finally {
    elements.rankingsLoading.classList.add('hidden');
  }
}

async function loadTournaments(page = 1) {
  elements.tournamentsLoading.classList.remove('hidden');
  elements.tournamentsError.classList.add('hidden');
  elements.tournamentsTable.classList.add('hidden');

  try {
    const result = await fetchTournaments(page);
    state.tournaments.data = result.data;
    state.tournaments.pagination = result.pagination;
    state.tournaments.page = page;

    renderTournamentsTable(result.data);
    renderPagination(elements.tournamentsPagination, result.pagination, loadTournaments);

    elements.tournamentsTable.classList.remove('hidden');
  } catch (error) {
    elements.tournamentsError.textContent = `Failed to load tournaments: ${error.message}`;
    elements.tournamentsError.classList.remove('hidden');
  } finally {
    elements.tournamentsLoading.classList.add('hidden');
  }
}

// Event Listeners
elements.navRankings.addEventListener('click', () => {
  showView(elements.rankingsView, elements.navRankings);
});

elements.navTournaments.addEventListener('click', () => {
  showView(elements.tournamentsView, elements.navTournaments);
  // Load tournaments on first view
  if (state.tournaments.data.length === 0) {
    loadTournaments();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadRankings();
});
