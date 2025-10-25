import React from 'react';
import { useAppDispatch, useAppSelector } from '../Graph/useStoreHooks';
import { removeUser, selectUser } from '../../store/usersSlice';
import ConfirmDialog from '../ConfirmDialog';
import toast from 'react-hot-toast';

const UserList: React.FC = () => {
  const { items } = useAppSelector((s) => s.users);
  const dispatch = useAppDispatch();
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  return (
    <div className="grid">
      {items.map(u => (
        <div key={u.id} className="card" style={{ padding: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{u.username}</div>
              <div className="label">age {u.age} • popularity {u.popularityScore}</div>
            </div>
            <div className="row">
              <button className="btn" onClick={() => dispatch(selectUser(u.id))}>Edit</button>
              <button className="btn" onClick={() => setConfirmId(u.id)} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Delete</button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={!!confirmId}
        title="Delete user?"
        description="This will remove the user. If they have relationships, the backend should unlink first or block deletion."
        confirmLabel="Delete"
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          if (!confirmId) return;
          try { await dispatch(removeUser(confirmId)).unwrap(); }
          catch (e: any) { toast.error(e?.message || 'Delete failed'); }
          setConfirmId(null);
        }}
      />
    </div>
  );
};

export default UserList;
