import { api } from './client';

export async function linkUsers(aId: string, bId: string) {
  const { data } = await api.post(`/users/${aId}/link`, { friendId: bId });
  return data as { message: string };
}

export async function unlinkUsers(aId: string, bId: string) {
  // axios supports DELETE with a body via the `data` key
  const { data } = await api.delete(`/users/${aId}/unlink`, { data: { friendId: bId } });
  return data as { message: string };
}
