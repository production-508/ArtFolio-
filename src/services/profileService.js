/**
 * Service API pour la personnalisation des profils
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('token');
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

// Paramètres du profil
export async function getProfileSettings() {
  const res = await fetch(`${API_URL}/api/profile/settings`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur récupération paramètres');
  return res.json();
}

export async function updateProfileSettings(settings) {
  const res = await fetch(`${API_URL}/api/profile/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(settings)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erreur mise à jour');
  }
  return res.json();
}

// Liens sociaux
export async function getSocialLinks() {
  const res = await fetch(`${API_URL}/api/profile/social-links`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur récupération liens sociaux');
  return res.json();
}

export async function addSocialLink(link) {
  const res = await fetch(`${API_URL}/api/profile/social-links`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(link)
  });
  if (!res.ok) throw new Error('Erreur ajout lien');
  return res.json();
}

export async function updateSocialLink(id, link) {
  const res = await fetch(`${API_URL}/api/profile/social-links/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(link)
  });
  if (!res.ok) throw new Error('Erreur modification lien');
  return res.json();
}

export async function deleteSocialLink(id) {
  const res = await fetch(`${API_URL}/api/profile/social-links/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur suppression lien');
  return res.json();
}

// Sections custom
export async function getCustomSections() {
  const res = await fetch(`${API_URL}/api/profile/custom-sections`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur récupération sections');
  return res.json();
}

export async function addCustomSection(section) {
  const res = await fetch(`${API_URL}/api/profile/custom-sections`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(section)
  });
  if (!res.ok) throw new Error('Erreur ajout section');
  return res.json();
}

export async function updateCustomSection(id, section) {
  const res = await fetch(`${API_URL}/api/profile/custom-sections/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(section)
  });
  if (!res.ok) throw new Error('Erreur modification section');
  return res.json();
}

export async function deleteCustomSection(id) {
  const res = await fetch(`${API_URL}/api/profile/custom-sections/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur suppression section');
  return res.json();
}

// Stats et preview
export async function getProfileStats() {
  const res = await fetch(`${API_URL}/api/profile/stats`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur récupération stats');
  return res.json();
}

export async function getProfilePreview() {
  const res = await fetch(`${API_URL}/api/profile/preview`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur récupération preview');
  return res.json();
}

// Profil public (par slug)
export async function getPublicProfile(slug) {
  const res = await fetch(`${API_URL}/api/profile/public/${slug}`);
  if (!res.ok) throw new Error('Profil non trouvé');
  return res.json();
}
