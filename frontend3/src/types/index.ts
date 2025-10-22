import type { Node, Edge } from '@xyflow/react';

export type Hobby = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  username: string;
  age: number;
  hobbies: Hobby[];
  popularityScore: number; // server-calculated but we also compute locally for instant UX
};

export type UserInput = {
  username: string;
  age: number;
  hobbies?: string[]; // hobby IDs
};

export type GraphResponse = {
  users: User[];
  relationships: Array<{ source: string; target: string }>;
};

// React Flow node data
export type RFUserNodeData = {
  userId: string;
  username: string;
  age: number;
  popularityScore: number;
};

export type RFUserNode = Node<RFUserNodeData>;
export type RFEdge = Edge;
