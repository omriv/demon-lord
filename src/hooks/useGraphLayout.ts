import { useMemo } from 'react';
import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { Task } from '../types/task';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 90;

function getAncestorPath(tasks: Task[], selectedId: string): Set<string> {
  const path = new Set<string>();
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  let current: string | null = selectedId;
  while (current) {
    path.add(current);
    current = taskMap.get(current)?.parent ?? null;
  }
  return path;
}

export function useGraphLayout(tasks: Task[], selectedId: string | null, onSelect: (id: string) => void) {
  return useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 30 });

    tasks.forEach(task => {
      g.setNode(task.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    tasks.forEach(task => {
      if (task.parent) g.setEdge(task.parent, task.id);
    });

    dagre.layout(g);

    // Build position map for mutex direction detection
    const posMap = new Map<string, { x: number; y: number }>();
    tasks.forEach(task => {
      const pos = g.node(task.id);
      if (pos) posMap.set(task.id, { x: pos.x, y: pos.y });
    });

    const pathSet = selectedId ? getAncestorPath(tasks, selectedId) : new Set<string>();

    const nodes: Node[] = tasks.map(task => {
      const pos = posMap.get(task.id);
      if (!pos) return null;
      return {
        id: task.id,
        type: 'taskNode',
        position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
        data: {
          ...task,
          selected: task.id === selectedId,
          onPath: pathSet.has(task.id),
          onSelect,
        },
      };
    }).filter(Boolean) as Node[];

    const edges: Edge[] = [];

    // Parent → child edges (step / orthogonal routing)
    tasks.forEach(task => {
      if (!task.parent) return;
      const onPath = pathSet.has(task.id) && pathSet.has(task.parent);
      edges.push({
        id: `e-${task.parent}-${task.id}`,
        source: task.parent,
        sourceHandle: 'bottom',
        target: task.id,
        targetHandle: 'top',
        type: 'step',
        style: {
          stroke: onPath ? '#93c5fd' : '#4b5563',
          strokeWidth: onPath ? 2.5 : 1.5,
        },
      });
    });

    // Mutex edges — straight horizontal line between siblings via side handles
    const seen = new Set<string>();
    tasks.forEach(task => {
      if (!task.choiceWith) return;
      const key = [task.id, task.choiceWith].sort().join('|||');
      if (seen.has(key)) return;
      seen.add(key);

      const aPos = posMap.get(task.id);
      const bPos = posMap.get(task.choiceWith);
      if (!aPos || !bPos) return;

      const aIsLeft = aPos.x <= bPos.x;
      const leftId  = aIsLeft ? task.id         : task.choiceWith;
      const rightId = aIsLeft ? task.choiceWith  : task.id;

      edges.push({
        id: `mutex-${key}`,
        source: leftId,
        sourceHandle: 'right',
        target: rightId,
        targetHandle: 'left',
        type: 'straight',
        style: {
          stroke: '#00e6ff',
          strokeWidth: 3,
          strokeDasharray: '8 4',
        },
        markerEnd: undefined,
        markerStart: undefined,
      });
    });

    return { nodes, edges };
  }, [tasks, selectedId, onSelect]);
}
