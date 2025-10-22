import { configureStore, AnyAction } from '@reduxjs/toolkit';
import type { Reducer } from 'redux';
import undoable, { StateWithHistory } from 'redux-undo';

import graphReducer, { type GraphState } from './graphSlice';
import usersReducer from './usersSlice';
import hobbiesReducer from './hobbiesSlice';

const graphUndoable: Reducer<StateWithHistory<GraphState>, AnyAction> =
  (undoable(graphReducer, {
    limit: 50,
    filter: (action) =>
      ['graph/nodePositionChanged', 'graph/edgeAdded', 'graph/edgeRemoved'].includes(action.type),
  }) as unknown) as Reducer<StateWithHistory<GraphState>, AnyAction>;

export const store = configureStore({
  reducer: {
    graph: graphUndoable,
    users: usersReducer,
    hobbies: hobbiesReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
