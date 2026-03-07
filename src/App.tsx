import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import type { NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TaskNode from './components/TaskNode';
import TaskEditor from './components/TaskEditor';
import TaskListPanel from './components/TaskListPanel';
import { useGraphLayout } from './hooks/useGraphLayout';
import { extractCollections } from './utils/extractCollections';
import type { Task } from './types/task';
import initialTasks from './data/tasks.json';

const nodeTypes: NodeTypes = { taskNode: TaskNode as NodeTypes[string] };

function emptyNewTask(parentId: string | null): Task {
  return {
    id: '__new__',
    name: '',
    parent: parentId,
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

interface GraphViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  skills: string[];
  items: string[];
  onAddSkill: (s: string) => void;
  onAddItem: (s: string) => void;
}

function GraphView({ tasks, setTasks, skills, items, onAddSkill, onAddItem }: GraphViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingNew, setEditingNew] = useState<Task | null>(null);
  const { fitView } = useReactFlow();

  const handleSelect = useCallback((id: string) => {
    setEditingNew(null);
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  const { nodes, edges } = useGraphLayout(tasks, selectedId, handleSelect);

  const selectedTask: Task | null = editingNew ?? (selectedId ? (tasks.find(t => t.id === selectedId) ?? null) : null);

  const handleSave = (updated: Task) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === updated.id);
      if (exists) return prev.map(t => (t.id === updated.id ? updated : t));
      return [...prev, updated];
    });
    setEditingNew(null);
    setSelectedId(updated.id);
    setTimeout(() => fitView({ padding: 0.1, duration: 400 }), 50);
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id && t.parent !== id));
    setSelectedId(null);
    setEditingNew(null);
  };

  const handleAddChild = (parentId: string) => {
    setEditingNew(emptyNewTask(parentId));
    setSelectedId(null);
  };

  const handleAddRoot = () => {
    setEditingNew(emptyNewTask(null));
    setSelectedId(null);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Task[];
        setTasks(data);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950">
      {/* Graph */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700 shrink-0">
          <span className="text-white font-bold text-sm mr-2">Demon Lord — Task Map</span>
          <button onClick={handleAddRoot} className="btn-sm bg-blue-700 hover:bg-blue-600">+ New Root Task</button>
          <button onClick={handleExport} className="btn-sm bg-green-700 hover:bg-green-600">⬇ Export JSON</button>
          <label className="btn-sm bg-gray-700 hover:bg-gray-600 cursor-pointer">
            ⬆ Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <span className="ml-auto text-gray-500 text-xs">{tasks.length} tasks</span>
        </div>

        <div className="flex-1 relative min-h-0">
          <TaskListPanel tasks={tasks} selectedId={selectedId} onSelect={id => { setEditingNew(null); setSelectedId(id); }} />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#374151" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={n => n.id === selectedId ? '#60a5fa' : '#94a3b8'}
              nodeStrokeWidth={0}
              maskColor="rgba(0,0,0,0.25)"
              style={{ background: '#0f172a', border: '1px solid #374151', width: 240, height: 160 }}
              pannable
              zoomable
            />
          </ReactFlow>
        </div>
      </div>

      {/* Sidebar */}
      {selectedTask && (
        <TaskEditor
          task={selectedTask.id === '__new__' ? selectedTask : (tasks.find(t => t.id === selectedTask.id) ?? null)}
          allTasks={tasks}
          skills={skills}
          items={items}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => { setSelectedId(null); setEditingNew(null); }}
          onAddChild={handleAddChild}
          onAddSkill={onAddSkill}
          onAddItem={onAddItem}
        />
      )}
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks as Task[]);

  const initial = useMemo(() => extractCollections(initialTasks as Task[]), []);
  const [skills, setSkills] = useState<string[]>(initial.skills);
  const [items, setItems] = useState<string[]>(initial.items);

  const onAddSkill = useCallback((s: string) => {
    setSkills(prev => prev.includes(s) ? prev : [...prev, s].sort());
  }, []);

  const onAddItem = useCallback((s: string) => {
    setItems(prev => prev.includes(s) ? prev : [...prev, s].sort());
  }, []);

  return (
    <ReactFlowProvider>
      <GraphView
        tasks={tasks}
        setTasks={setTasks}
        skills={skills}
        items={items}
        onAddSkill={onAddSkill}
        onAddItem={onAddItem}
      />
    </ReactFlowProvider>
  );
}
