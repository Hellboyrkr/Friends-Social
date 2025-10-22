import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { RFUserNodeData } from '../../types';

const HighScoreNode: React.FC<NodeProps> = ({ data }) => {
  const d = data as RFUserNodeData;
  return (
    <div className="card" style={{ borderColor: 'transparent', background: '#ecfeff', transition: 'all .2s', minWidth: 160 }}>
      <div style={{ fontWeight: 700 }}>{d.username} <span style={{ color: '#0ea5e9' }}>({d.age})</span></div>
      <div className="label">popularity: <b>{d.popularityScore}</b></div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
export default HighScoreNode;
