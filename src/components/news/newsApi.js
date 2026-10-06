const API = import.meta.env.VITE_API_URL;

export function newsImageUrl(filename) {
  if (!filename) return '';
  if (filename.startsWith('http') || filename.startsWith('blob:')) return filename;
  return `${API}/uploads/${String(filename).replace(/^\/+/, '')}`;
}

async function readError(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return data?.message || data?.error || `Erro ${response.status} ao falar com a API.`;
}

export async function requestNews(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) throw new Error(await readError(response));

  const data = await response.json().catch(() => null);
  return data;
}

export async function uploadNewsImage(file, token) {
  const formData = new FormData();
  formData.append('imagem', file);

  const response = await fetch(`${API}/news/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error(await readError(response));

  const data = await response.json().catch(() => null);
  return data?.filename;
}
