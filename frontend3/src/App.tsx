import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { UIProvider } from './providers/UIProvider';
import Sidebar from './components/Sidebar/Sidebar';
import GraphCanvas from './components/Graph/GraphCanvas';
import UserForm from './components/UserPanel/UserForm';
import UserList from './components/UserPanel/UserList';
import RelationshipPanel from './components/RelationshipPanel/RelationshipPanel';

// Simple inline layout so you don't have to touch CSS files right now
const shellStyles: React.CSSProperties = {
  height: '100vh',
  display: 'grid',
  gridTemplateColumns: '280px 1fr 320px', // left sidebar | canvas | right panel
  gridTemplateRows: '1fr',
  overflow: 'hidden',
};

const leftStyles: React.CSSProperties = {
  borderRight: '1px solid #e5e7eb',
  minWidth: 0,
  overflow: 'auto',
  padding: 12,
};

const mainStyles: React.CSSProperties = {
  minWidth: 0,
  overflow: 'hidden', // React Flow likes its container to not scroll
  padding: 12,
};

const rightStyles: React.CSSProperties = {
  borderLeft: '1px solid #e5e7eb',
  minWidth: 0,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 12,
};

export default function App() {
  return (
    <Provider store={store}>
      <UIProvider>
        <ReactFlowProvider>
          <div style={shellStyles}>
            <aside style={leftStyles}>
              <Sidebar />
            </aside>

            <main style={mainStyles}>
              <GraphCanvas />
            </main>

            {/* SINGLE right panel */}
            <aside style={rightStyles}>
              <UserForm />
              <UserList />
              <RelationshipPanel />
            </aside>
          </div>
        </ReactFlowProvider>
      </UIProvider>
    </Provider>
  );
}
