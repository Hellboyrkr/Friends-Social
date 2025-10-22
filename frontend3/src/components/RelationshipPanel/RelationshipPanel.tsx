import React, { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../Graph/useStoreHooks';
import { connectUsers, disconnectUsers } from '../../store/usersSlice';

const RelationshipPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((s) => s.users.items);
  const graphPresent = useAppSelector((s) => s.graph.present); // redux-undo support

  const [userA, setUserA] = useState<string>('');
  const [userB, setUserB] = useState<string>('');

  // Derive User A's connections from graph edges
  const selectedUserAFriends = useMemo(() => {
    if (!userA) return [] as string[];
    return (graphPresent?.edges ?? [])
      .filter((edge: any) => edge.source === userA || edge.target === userA)
      .map((edge: any) => (edge.source === userA ? edge.target : edge.source)) as string[];
  }, [userA, graphPresent?.edges]);

  const handleLink = () => {
    if (!userA || !userB || userA === userB) return;
    dispatch(connectUsers(userA, userB));
  };

  const handleUnlink = (friendId: string) => {
    if (!userA || !friendId) return;
    dispatch(disconnectUsers(userA, friendId));
  };

  const getUserName = (id: string) => users.find((u) => u.id === id)?.username ?? 'Unknown';

  const alreadyConnected = userA && userB
    ? selectedUserAFriends.includes(userB)
    : false;

  return (
    <div className="card p-3">
      <h3 className="font-semibold mb-2">Manage Relationships</h3>

      <label className="label">User A</label>
      <select className="input mb-2" value={userA} onChange={(e) => setUserA(e.target.value)}>
        <option value="">Select user…</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>

      <label className="label">User B</label>
      <select className="input mb-3" value={userB} onChange={(e) => setUserB(e.target.value)}>
        <option value="">Select user…</option>
        {users
          .filter((u) => u.id !== userA)
          .map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
      </select>

      <button
        className="btn primary w-full"
        onClick={handleLink}
        disabled={!userA || !userB || userA === userB || alreadyConnected}
        title={alreadyConnected ? 'Users are already connected' : 'Create a connection'}
      >
        {alreadyConnected ? 'Already Connected' : 'Create Link'}
      </button>

      {userA && (
        <>
          <h4 className="mt-4 mb-2 font-semibold">
            Connections for {getUserName(userA)}
          </h4>

          {selectedUserAFriends.length > 0 ? (
            <div className="grid gap-2">
              {selectedUserAFriends.map((fid: string) => (
                <div
                  key={fid}
                  className="row justify-between items-center rounded bg-slate-100 px-3 py-2"
                >
                  <span>{getUserName(fid)}</span>
                  <button className="btn ghost" onClick={() => handleUnlink(fid)}>
                    Unlink
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No current connections.</p>
          )}
        </>
      )}
    </div>
  );
};

export default RelationshipPanel;
