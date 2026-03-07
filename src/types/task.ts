export type RequirementType = 'task' | 'skill' | 'item' | 'power';

export interface Requirement {
  name: string;
  type: RequirementType;
  amount: number;
}

export interface Task {
  id: string;
  name: string;
  parent: string | null;
  choiceWith: string | null;
  // Rewards
  skill: string | null;
  skillAmount: number | null;
  power: number | null;
  count: number;
  item: string | null;
  itemAmount: number | null;
  // Requirements
  requirements: Requirement[];
}
