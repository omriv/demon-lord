import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string | null;
  options: string[];
  placeholder?: string;
  nullable?: boolean;
  onChange: (value: string | null) => void;
  onAddNew: (value: string) => void;
}

const ADD_NEW = '__add_new__';

export default function Combobox({ value, options, placeholder, nullable = false, onChange, onAddNew }: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const confirm = () => {
    const v = draft.trim();
    if (v) {
      onAddNew(v);
      onChange(v);
    }
    setAdding(false);
    setDraft('');
  };

  const cancel = () => {
    setAdding(false);
    setDraft('');
  };

  if (adding) {
    return (
      <div className="flex gap-1">
        <input
          ref={inputRef}
          className="input flex-1"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel(); }}
          placeholder="New name..."
        />
        <button onClick={confirm} className="text-green-400 hover:text-green-300 px-1 text-sm">✓</button>
        <button onClick={cancel} className="text-gray-500 hover:text-gray-300 px-1 text-sm">×</button>
      </div>
    );
  }

  return (
    <select
      className="input"
      value={value ?? ''}
      onChange={e => {
        if (e.target.value === ADD_NEW) { setAdding(true); return; }
        onChange(e.target.value || null);
      }}
    >
      {nullable && <option value="">{placeholder ?? '(none)'}</option>}
      {!nullable && !value && <option value="">{placeholder ?? '—'}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      <option value={ADD_NEW}>＋ Add new…</option>
    </select>
  );
}
