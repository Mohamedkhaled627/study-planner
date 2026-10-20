export interface PlanTask {
  taskId: string;
  deadline: Date | null;
  priority: 0 | 1 | 2; // 0=LOW 1=MED 2=HIGH
  estimatedMin: number;
}

export interface FreeBlock {
  weekday: number; // 0=Monday..6=Sunday
  startMin: number;
  endMin: number;
}

export interface PlanItemDTO {
  taskId: string;
  weekday: number;
  startMin: number;
  endMin: number;
}

export interface UnfitDTO {
  taskId: string;
  shortMin: number;
}
