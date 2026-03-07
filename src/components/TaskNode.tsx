import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { Task } from '../types/task';

export interface TaskNodeData extends Task {
  selected?: boolean;
  onSelect: (id: string) => void;
}

const skillColors: Record<string, string> = {
  combat: 'bg-red-900/60 border-red-500',
  movement: 'bg-blue-900/60 border-blue-500',
  crafting: 'bg-orange-900/60 border-orange-500',
  alchemy: 'bg-purple-900/60 border-purple-500',
  speaking: 'bg-yellow-900/60 border-yellow-500',
  precision: 'bg-cyan-900/60 border-cyan-500',
  farming: 'bg-green-900/60 border-green-500',
  sleeping: 'bg-slate-700/60 border-slate-400',
  reading: 'bg-indigo-900/60 border-indigo-500',
  'animal handling': 'bg-lime-900/60 border-lime-500',
  ecomancy: 'bg-emerald-900/60 border-emerald-400',
};

const getNodeColor = (skill: string | null): string =>
  skill ? (skillColors[skill] ?? 'bg-gray-800/60 border-gray-500') : 'bg-gray-800/60 border-gray-500';

function TaskNode(props: NodeProps) {
  const data = props.data as unknown as TaskNodeData;
  const colorClass = getNodeColor(data.skill);
  const isChoice = !!data.choiceWith;

  return (
    <div
      className={`
        relative border-2 rounded-lg px-3 py-2 cursor-pointer min-w-[140px] max-w-[180px]
        transition-all duration-150 shadow-lg
        ${colorClass}
        ${data.selected ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' : ''}
        ${isChoice ? 'border-dashed' : ''}
      `}
      onClick={() => data.onSelect(data.id)}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />

      {isChoice && (
        <span className="absolute -top-2 right-1 text-[9px] bg-amber-500 text-black rounded px-1 font-bold">
          CHOICE
        </span>
      )}

      <p className="text-white text-xs font-semibold leading-tight text-center">{data.name}</p>

      <div className="mt-1.5 flex flex-wrap gap-1 justify-center">
        {data.skill && (
          <span className="text-[9px] text-gray-300 bg-black/30 rounded px-1">
            {data.skill} +{data.skillAmount}
          </span>
        )}
        {data.power && (
          <span className="text-[9px] text-yellow-300 bg-black/30 rounded px-1">
            ⚡+{data.power}
          </span>
        )}
        {data.item && (
          <span className="text-[9px] text-green-300 bg-black/30 rounded px-1">
            🎁{data.item}
          </span>
        )}
      </div>

      <div className="mt-1 text-center">
        <span className="text-[9px] text-gray-400">×{data.count}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
}

export default memo(TaskNode);
