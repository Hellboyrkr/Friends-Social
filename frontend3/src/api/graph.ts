import { api } from './client';
import { RFUserNode, RFEdge } from '../types';

type BackendRFNode = {
  id: string;
  data: { username: string; age: number; hobbies?: any[]; popularityScore: number };
  position: { x: number; y: number };
  type?: string;
};

type BackendGraph = { nodes: BackendRFNode[]; edges: RFEdge[] };

export async function getGraph(): Promise<{ nodes: RFUserNode[]; edges: RFEdge[] }> {
  const { data } = await api.get<BackendGraph>('/graph');
  const nodes: RFUserNode[] = data.nodes.map(n => ({
    id: n.id,
    type: n.type ?? (n.data.popularityScore > 5 ? 'highScore' : 'lowScore'),
    position: n.position,
    data: {
      userId: n.id,                      // normalize for our node components
      username: n.data.username,
      age: n.data.age,
      popularityScore: n.data.popularityScore
    },
    draggable: true
  }));
  return { nodes, edges: data.edges };
}
