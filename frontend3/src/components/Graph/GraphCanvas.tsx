import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '@xyflow/react/dist/style.css';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Connection
} from '@xyflow/react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { useAppSelector } from './useStoreHooks';
import { fetchGraph, nodePositionChanged } from '../../store/graphSlice';
import { connectUsers, addHobbyToUser, selectUser } from '../../store/usersSlice';
import HighScoreNode from '../nodes/HighScoreNode';
import LowScoreNode from '../nodes/LowScoreNode';
import toast from 'react-hot-toast';

const nodeTypes = { highScore: HighScoreNode, lowScore: LowScoreNode };

const GraphInner: React.FC<{
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (c: Connection) => void;
  onNodeDragStop: (_e: any, node: any) => void;
  onNodeClick: (_e: any, node: any) => void;
  onHobbyDrop: (targetNodeId: string, hobbyId: string) => void;
}> = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeDragStop, onNodeClick, onHobbyDrop }) => {
  // simple DnD handlers that don't need useReactFlow context
  const onDragOver = useCallback((evt: React.DragEvent) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
  }, []);

  // find closest node center by brute force (good enough here)
  const findNearestNodeId = useCallback((clientX: number, clientY: number) => {
    // We rely on elementFromPoint heuristic since we don't have screenToFlowPosition here without context.
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    // Walk up the DOM to find a node wrapper (data-id attribute)
    let cur: HTMLElement | null = el;
    while (cur) {
      const id = cur.getAttribute?.('data-id');
      if (id) return id;
      cur = cur.parentElement;
    }
    return null;
  }, []);

  const onDrop = useCallback(
    (evt: React.DragEvent) => {
      evt.preventDefault();
      const hobbyId = evt.dataTransfer.getData('application/hobby-id');
      if (!hobbyId) return;
      const targetNodeId = findNearestNodeId(evt.clientX, evt.clientY);
      if (!targetNodeId) {
        toast('Drop closer to a node');
        return;
      }
      onHobbyDrop(targetNodeId, hobbyId);
    },
    [findNearestNodeId, onHobbyDrop]
  );

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      onDragOver={onDragOver}
      onDrop={onDrop}
      fitView
      proOptions={proOptions}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

const GraphCanvas: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const present = useAppSelector((s) => s.graph.present);

  // explicitly type as any[] so setters accept arrays (not never[])
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setNodes((present.nodes as any[]) || []);
    setEdges((present.edges as any[]) || []);
  }, [present.nodes, present.edges, setNodes, setEdges]);

  useEffect(() => {
    if ((present.nodes?.length ?? 0) === 0 && (present.edges?.length ?? 0) === 0) {
      dispatch(fetchGraph()).finally(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [dispatch, present.nodes?.length, present.edges?.length]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      dispatch(connectUsers(connection.source, connection.target));
    },
    [dispatch]
  );

  const onNodeDragStop = useCallback(
    (_e: any, node: any) => {
      dispatch(nodePositionChanged({ id: node.id, position: node.position }));
    },
    [dispatch]
  );

  const onNodeClick = useCallback(
    (_e: any, node: any) => {
      dispatch(selectUser(node.id));
    },
    [dispatch]
  );

  const handleHobbyDrop = useCallback(
    (targetNodeId: string, hobbyId: string) => {
      dispatch(addHobbyToUser(targetNodeId, hobbyId));
    },
    [dispatch]
  );

  if (!isReady) return <div>Loading graph…</div>;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <GraphInner
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onHobbyDrop={handleHobbyDrop}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default GraphCanvas;
