import { useMemo } from 'react';
import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { Task } from '../types/task';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 90;

export function useGraphLayout(tasks: Task[], selectedId: string | null, onSelect: (id: string) => void) {
  return useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 30 });

    tasks.forEach(task => {
      g.setNode(task.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    tasks.forEach(task => {
      if (task.parent) {
        g.setEdge(task.parent, task.id);
      }
    });

    dagre.layout(g);

    const nodes: Node[] = tasks.map(task => {
      const pos = g.node(task.id);
      return {
        id: task.id,
        type: 'taskNode',
        position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
        data: {
          ...task,
          selected: task.id === selectedId,
          onSelect,
        },
      };
    });

    const edges: Edge[] = [];

    tasks.forEach(task => {
      if (task.parent) {
        edges.push({
          id: `e-${task.parent}-${task.id}`,
          source: task.parent,
          target: task.id,
          type: 'smoothstep',
          style: { stroke: task.choiceWith ? '#f59e0b' : '#4b5563', strokeWidth: 1.5 },
        });
      }
    });

    return { nodes, edges };
  }, [tasks, selectedId, onSelect]);
}
