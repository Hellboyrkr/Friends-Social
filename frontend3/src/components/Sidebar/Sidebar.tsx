import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../Graph/useStoreHooks';
import { setQuery } from '../../store/hobbiesSlice';
import { addHobbyToUser } from '../../store/usersSlice';
import toast from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const { items, query } = useAppSelector((s) => s.hobbies);
  const selectedUserId = useAppSelector((s) => s.users.selectedId);
  const dispatch = useAppDispatch();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((h) => h.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

  return (
    <div className="grid">
      <input
        className="input"
        placeholder="Search hobbies…"
        value={query}
        onChange={(e) => dispatch(setQuery(e.target.value))}
      />
      <div className="grid" style={{ gap: 8 }}>
        {filtered.map((h) => (
          <div
            key={h.id}
            className="card"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/hobby-id', h.id);
            }}
            onClick={() => {
              if (!selectedUserId) {
                toast('Select a user (right panel) or drag onto a node');
                return;
              }
              dispatch(addHobbyToUser(selectedUserId, h.id));
            }}
            style={{ padding: 10, cursor: 'grab', userSelect: 'none' }}
            title="Click to add to selected user, or drag onto a node"
          >
            {h.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
