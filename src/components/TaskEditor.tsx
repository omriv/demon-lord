import { useState, useEffect } from 'react';
import type { Task, Requirement, RequirementType } from '../types/task';

interface Props {
  task: Task | null;
  allTasks: Task[];
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onAddChild: (parentId: string) => void;
}

const REQ_TYPES: RequirementType[] = ['card', 'skill', 'item', 'power'];

function emptyTask(parent: string | null): Task {
  return {
    id: '',
    name: '',
    parent,
    choiceWith: null,
    skill: null,
    skillAmount: null,
    power: null,
    count: 1,
    item: null,
    itemAmount: null,
    requirements: [],
  };
}

export default function TaskEditor({ task, allTasks, onSave, onDelete, onClose, onAddChild }: Props) {
  const [form, setForm] = useState<Task>(task ?? emptyTask(null));
  const isNew = !task?.id || task.id === '';

  useEffect(() => {
    setForm(task ?? emptyTask(null));
  }, [task]);

  const set = <K extends keyof Task>(key: K, value: Task[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const updateReq = (i: number, patch: Partial<Requirement>) =>
    setForm(f => {
      const reqs = [...f.requirements];
      reqs[i] = { ...reqs[i], ...patch };
      return { ...f, requirements: reqs };
    });

  const addReq = () =>
    setForm(f => ({
      ...f,
      requirements: [...f.requirements, { name: '', type: 'item', amount: 1 }],
    }));

  const removeReq = (i: number) =>
    setForm(f => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }));

  const handleSave = () => {
    const id = form.name.trim();
    if (!id) return;
    onSave({ ...form, id, name: id });
  };

  if (!task && !isNew) return null;

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 w-80 min-w-[20rem] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
        <h2 className="text-white font-bold text-sm">{isNew ? 'New Task' : 'Edit Task'}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">×</button>
      </div>

      <div className="flex-1 px-4 py-3 space-y-4 text-sm">
        {/* Name */}
        <Field label="Task Name">
          <input
            className="input"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. fight goblins"
          />
        </Field>

        {/* Parent */}
        <Field label="Parent Task">
          <select className="input" value={form.parent ?? ''} onChange={e => set('parent', e.target.value || null)}>
            <option value="">(none — root)</option>
            {allTasks.filter(t => t.id !== form.id).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>

        {/* Choice With */}
        <Field label="Choice With (mutex)">
          <select className="input" value={form.choiceWith ?? ''} onChange={e => set('choiceWith', e.target.value || null)}>
            <option value="">(none)</option>
            {allTasks.filter(t => t.id !== form.id).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>

        <hr className="border-gray-700" />

        {/* Rewards */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Rewards</p>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Skill">
            <input className="input" value={form.skill ?? ''} onChange={e => set('skill', e.target.value || null)} placeholder="e.g. combat" />
          </Field>
          <Field label="Skill Amount">
            <input className="input" type="number" value={form.skillAmount ?? ''} onChange={e => set('skillAmount', e.target.value ? +e.target.value : null)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Power">
            <input className="input" type="number" value={form.power ?? ''} onChange={e => set('power', e.target.value ? +e.target.value : null)} />
          </Field>
          <Field label="Count">
            <input className="input" type="number" min={1} value={form.count} onChange={e => set('count', +e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Item">
            <input className="input" value={form.item ?? ''} onChange={e => set('item', e.target.value || null)} placeholder="e.g. gold" />
          </Field>
          <Field label="Item Amount">
            <input className="input" type="number" value={form.itemAmount ?? ''} onChange={e => set('itemAmount', e.target.value ? +e.target.value : null)} />
          </Field>
        </div>

        <hr className="border-gray-700" />

        {/* Requirements */}
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Requirements</p>
          <button onClick={addReq} className="text-xs text-blue-400 hover:text-blue-300">+ Add</button>
        </div>

        {form.requirements.map((req, i) => (
          <div key={i} className="bg-gray-800 rounded p-2 space-y-1.5">
            <div className="flex gap-1">
              <select
                className="input flex-1 text-xs"
                value={req.type}
                onChange={e => updateReq(i, { type: e.target.value as RequirementType })}
              >
                {REQ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => removeReq(i)} className="text-red-400 hover:text-red-300 text-sm px-1">×</button>
            </div>
            <input
              className="input text-xs w-full"
              placeholder="name / skill / item"
              value={req.name}
              onChange={e => updateReq(i, { name: e.target.value })}
            />
            <input
              className="input text-xs w-full"
              type="number"
              placeholder="amount"
              value={req.amount}
              onChange={e => updateReq(i, { amount: +e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700 space-y-2">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded py-1.5 text-sm font-semibold"
        >
          {isNew ? 'Create Task' : 'Save Changes'}
        </button>
        {!isNew && (
          <>
            <button
              onClick={() => onAddChild(form.id)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded py-1.5 text-sm"
            >
              + Add Child Task
            </button>
            <button
              onClick={() => { if (confirm(`Delete "${form.name}"?`)) onDelete(form.id); }}
              className="w-full bg-red-900/50 hover:bg-red-800/60 text-red-300 rounded py-1.5 text-sm"
            >
              Delete Task
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-gray-400 text-xs">{label}</label>
      {children}
    </div>
  );
}
