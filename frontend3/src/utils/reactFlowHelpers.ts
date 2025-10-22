import { RFUserNode, User } from '../types';

export function toHighOrLowNode(u: User, position?: { x: number; y: number }): RFUserNode {
  const type = u.popularityScore > 5 ? 'highScore' : 'lowScore';
  return {
    id: u.id,
    type,
    data: {
      userId: u.id,
      username: u.username,
      age: u.age,
      popularityScore: u.popularityScore
    },
    position: position ?? { x: Math.random() * 600, y: Math.random() * 400 }, // simple layout
    draggable: true
  };
}
