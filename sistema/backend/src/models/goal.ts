export interface Goal {
  id: string;
  name: string;
}

export type GoalInput = Omit<Goal, 'id'>;
