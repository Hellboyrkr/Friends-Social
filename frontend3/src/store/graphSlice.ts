import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getGraph } from '../api/graph';
import { RFEdge, RFUserNode, User } from '../types';
import { toHighOrLowNode } from '../utils/reactFlowHelpers';

export type GraphState = {
  nodes: RFUserNode[];
  edges: RFEdge[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
};

const initialState: GraphState = {
  nodes: [],
  edges: [],
  status: 'idle'
};

export const fetchGraph = createAsyncThunk('graph/fetch', async () => {
  // now returns { nodes, edges } directly
  return await getGraph();
});

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    nodePositionChanged: (
      state,
      action: PayloadAction<{ id: string; position: { x: number; y: number } }>
    ) => {
      const n = state.nodes.find((x) => x.id === action.payload.id);
      if (n) n.position = action.payload.position;
    },
    edgeAdded: (state, action: PayloadAction<RFEdge>) => {
      state.edges.push(action.payload);
    },
    edgeRemoved: (state, action: PayloadAction<{ id: string }>) => {
      state.edges = state.edges.filter((e) => e.id !== action.payload.id);
    },
    // upsert: update if exists, otherwise add
    userPatched: (state, action: PayloadAction<User>) => {
      const idx = state.nodes.findIndex((n) => n.id === action.payload.id);
      if (idx >= 0) {
        state.nodes[idx] = toHighOrLowNode(action.payload, state.nodes[idx].position);
      } else {
        state.nodes.push(toHighOrLowNode(action.payload));
      }
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchGraph.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchGraph.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.nodes = action.payload.nodes;
        state.edges = action.payload.edges;
      })
      .addCase(fetchGraph.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { nodePositionChanged, edgeAdded, edgeRemoved, userPatched } = graphSlice.actions;
export default graphSlice.reducer;
