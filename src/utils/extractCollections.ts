import type { Task } from '../types/task';

export function extractCollections(tasks: Task[]): { skills: string[]; items: string[] } {
  const skills = new Set<string>();
  const items = new Set<string>();

  tasks.forEach(task => {
    if (task.skill) skills.add(task.skill);
    if (task.item) items.add(task.item);
    task.requirements.forEach(req => {
      if (req.type === 'skill') skills.add(req.name);
      if (req.type === 'item') items.add(req.name);
    });
  });

  return {
    skills: Array.from(skills).sort(),
    items: Array.from(items).sort(),
  };
}
