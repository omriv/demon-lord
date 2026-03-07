import { useState } from 'react';
import type { Task } from '../types/task';

interface Props {
  tasks: Task[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function TaskListPanel({ tasks, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = tasks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col items-end">
      <button
        onClick={() => setOpen(o => !o)}
        title="Task list"
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        All Tasks ({tasks.length})
      </button>

      {open && (
        <div className="mt-1.5 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col max-h-[70vh]">
          {/* Search */}
          <div className="p-2 border-b border-gray-700">
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Search tasks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-4">No tasks found</p>
            )}
            {filtered.map(task => (
              <button
                key={task.id}
                onClick={() => { onSelect(task.id); setOpen(false); }}
                className={`
                  w-full text-left px-3 py-2 text-xs border-b border-gray-800 last:border-0
                  hover:bg-gray-700 transition-colors
                  ${task.id === selectedId ? 'bg-blue-900/40 text-blue-300' : 'text-gray-200'}
                `}
              >
                <span className="font-medium">{task.name}</span>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {task.skill && (
                    <span className="text-[9px] text-gray-400">{task.skill}</span>
                  )}
                  {task.parent && (
                    <span className="text-[9px] text-gray-500">↑ {task.parent}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
