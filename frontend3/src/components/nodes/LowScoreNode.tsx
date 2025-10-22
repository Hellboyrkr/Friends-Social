import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { RFUserNodeData } from '../../types';

const LowScoreNode: React.FC<NodeProps> = ({ data }) => {
  const d = data as RFUserNodeData;
  return (
    <div className="card" style={{ background: '#fff7ed', borderColor: 'transparent', minWidth: 160 }}>
      <div style={{ fontWeight: 700 }}>{d.username} <span style={{ color: '#f97316' }}>({d.age})</span></div>
      <div className="label">popularity: <b>{d.popularityScore}</b></div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
export default LowScoreNode;
