import { api } from './client';
import { User, UserInput, Hobby } from '../types';
import { computePopularity } from '../utils/popularity';

/** Canonical catalog used by the UI chips (left sidebar). */
const ID_TO_NAME: Record<string, string> = {
  h1: 'Cycling',
  h2: 'Gaming',
  h3: 'Cooking',
  h4: 'Reading',
  h5: 'Music',
};
const NAME_TO_ID: Record<string, string> = Object.fromEntries(
  Object.entries(ID_TO_NAME).map(([id, name]) => [name.toLowerCase(), id])
);

/** Turn a backend hobby entry (string|null) into a UI Hobby object */
function hobbyFromBackend(x: any): Hobby | null {
  if (!x || typeof x !== 'string') return null;
  const name = x.trim();
  if (!name) return null;

  // map known names to our standard ids; otherwise create a custom id
  const knownId = NAME_TO_ID[name.toLowerCase()];
  if (knownId) return { id: knownId, name: ID_TO_NAME[knownId] };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return { id: `custom-${slug}`, name };
}

/** Turn UI Hobby object (or id/name) into the backend representation (name string) */
function hobbyToBackendName(h: any): string | null {
  if (!h) return null;
  if (typeof h === 'string') return h.trim() || null;               // already a name
  if (typeof h === 'object') {
    // if id is a known id, use its canonical name; else fallback to object.name
    const id: string | undefined = h.id;
    if (id && ID_TO_NAME[id]) return ID_TO_NAME[id];
    const nm = (h.name ?? '').toString().trim();
    return nm || null;
  }
  return null;
}

function sanitizeUser(u: any): User {
  const hobbiesRaw = Array.isArray(u?.hobbies) ? u.hobbies : [];
  const hobbies = hobbiesRaw.map(hobbyFromBackend).filter(Boolean) as Hobby[];

  // compute popularity locally if backend doesn't provide; safe & instant
  const popularityScore =
    typeof u?.popularityScore === 'number' ? u.popularityScore : computePopularity({ ...u, hobbies });

  return {
    id: String(u.id),
    username: String(u.username ?? ''),
    age: Number(u.age ?? 0),
    hobbies,
    popularityScore,
  };
}

/** Ensure outgoing payload uses hobby names (strings) and no nulls */
function normalizeOutgoing(input: Partial<UserInput>): any {
  const out: any = { ...input };
  if (Array.isArray(out.hobbies)) {
    out.hobbies = out.hobbies
      .map(hobbyToBackendName)
      .filter((s: any): s is string => !!s);
  }
  return out;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get('/users');
  return (Array.isArray(data) ? data : []).map(sanitizeUser);
}

export async function createUser(input: UserInput): Promise<User> {
  const payload = normalizeOutgoing(input);
  const { data } = await api.post('/users', payload);
  return sanitizeUser(data);
}

export async function updateUser(id: string, input: Partial<UserInput>): Promise<User> {
  const payload = normalizeOutgoing(input);
  const { data } = await api.put(`/users/${id}`, payload);
  return sanitizeUser(data);
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
