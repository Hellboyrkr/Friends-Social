import React, { useEffect, useMemo, useState } from 'react';
import { addUser, editUser, fetchUsers, selectUser } from '../../store/usersSlice';
import { useAppDispatch, useAppSelector } from '../Graph/useStoreHooks';
import toast from 'react-hot-toast';
import type { Hobby } from '../../types'; // assumes Hobby = { id: string; name: string }

type UserInput = {
  username: string;
  age: number;
  hobbies: string[]; // names only
};

const empty: UserInput = { username: '', age: 18, hobbies: [] };

const UserForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, selectedId, status } = useAppSelector((s) => s.users);
  const allHobbies = useAppSelector((s) => s.hobbies.items) as Hobby[]; // [{id,name}]
  const [values, setValues] = useState<UserInput>(empty);
  const [freeHobby, setFreeHobby] = useState('');

  // initial load
  useEffect(() => {
    if (status === 'idle') dispatch(fetchUsers());
  }, [dispatch, status]);

  // helper: normalize Hobby[] | string[] -> string[]
  const toNames = (arr: Array<Hobby | string> | undefined): string[] =>
    (arr ?? [])
      .map((h) => (typeof h === 'string' ? h : h?.name))
      .filter((n): n is string => Boolean(n && n.trim()));

  // populate on selection
  useEffect(() => {
    const u = items.find((u) => u.id === selectedId);
    if (u) {
      setValues({
        username: u.username,
        age: u.age,
        hobbies: toNames(u.hobbies as any),
      });
    } else {
      setValues(empty);
    }
  }, [items, selectedId]);

  // listen to Sidebar staged hobby (when no user selected)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { hobbyId: string; hobbyName: string };
      if (!detail?.hobbyName) return;
      setValues((prev) =>
        prev.hobbies.includes(detail.hobbyName)
          ? prev
          : { ...prev, hobbies: [...prev.hobbies, detail.hobbyName] }
      );
    };
    window.addEventListener('add-hobby-to-form', handler as EventListener);
    return () => window.removeEventListener('add-hobby-to-form', handler as EventListener);
  }, []);

  const availableHobbyNames = useMemo(() => allHobbies.map((h) => h.name), [allHobbies]);

  const addHobbyByName = (name: string) => {
    const n = name.trim();
    if (!n) return;
    if (values.hobbies.includes(n)) {
      toast('Already added');
      return;
    }
    setValues((v) => ({ ...v, hobbies: [...v.hobbies, n] }));
    setFreeHobby('');
  };

  const removeHobby = (name: string) => {
    setValues((v) => ({ ...v, hobbies: v.hobbies.filter((h) => h !== name) }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.username.trim()) return toast.error('Username is required');
    if (values.age < 13 || values.age > 120) return toast.error('Age must be 13-120');

    try {
      if (selectedId) {
        await dispatch(editUser({ id: selectedId, patch: values })).unwrap();
        toast.success('User updated');
      } else {
        await dispatch(addUser(values)).unwrap(); // backend will accept hobbies: string[] or default []
        toast.success('User created');
      }
      setValues(empty);
      dispatch(selectUser(undefined));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save user');
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-1">
        <label className="label">Username</label>
        <input
          className="input"
          value={values.username}
          onChange={(e) => setValues({ ...values, username: e.target.value })}
          placeholder="e.g., Alice"
        />
      </div>

      <div className="grid gap-1">
        <label className="label">Age</label>
        <input
          className="input"
          type="number"
          min={13}
          max={120}
          value={values.age}
          onChange={(e) => setValues({ ...values, age: Number(e.target.value) })}
        />
      </div>

      <div className="grid gap-2">
        <label className="label">Hobbies</label>

        <div className="row">
          {/* quick-pick */}
          <select
            className="input"
            onChange={(e) => e.target.value && addHobbyByName(e.target.value)}
            value=""
          >
            <option value="">Add from list…</option>
            {availableHobbyNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {/* free-text */}
          <input
            className="input"
            placeholder="Add custom hobby…"
            value={freeHobby}
            onChange={(e) => setFreeHobby(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addHobbyByName(freeHobby);
              }
            }}
          />
          <button type="button" className="btn ghost" onClick={() => addHobbyByName(freeHobby)}>
            Add
          </button>
        </div>

        {/* chips */}
        <div className="flex flex-wrap gap-2">
          {values.hobbies.map((h) => (
            <span
              key={h}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm"
            >
              {h}
              <button
                type="button"
                onClick={() => removeHobby(h)}
                className="text-slate-500 hover:text-slate-700"
                aria-label={`Remove ${h}`}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
          {values.hobbies.length === 0 && (
            <span className="text-xs text-slate-500">
              No hobbies yet — pick from list or add your own.
            </span>
          )}
        </div>
      </div>

      <div className="row justify-end">
        {selectedId && (
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setValues(empty);
              dispatch(selectUser(undefined));
            }}
          >
            Cancel
          </button>
        )}
        <button className="btn primary" type="submit">
          {selectedId ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
