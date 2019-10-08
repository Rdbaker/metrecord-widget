import { IPerformanceContext } from "./context";

export interface ISnapMessage {
  type: string;
  value: object | ISnapInitEventValue | ISnapBootstrapDoneEventValue | ISnapTimerEventValue;
}

export interface IEventMap {
  [key: string]: Array<(event: ISnapMessage) => void>;
}

export interface ISnapInitEventValue {
  clientId: string;
  user: string;
  context: IPerformanceContext;
}

export interface ISnapBootstrapDoneEventValue {
  context: IPerformanceContext;
  user: string;
  clientId: string;
}

export interface ISnapTimerEventValue {
  metric: string;
  time_ms: number;
}

export interface ISnapIncrementEventValue {
  metric: string;
  amount: number;
}

export interface ISnapSnapshotEventValue {
  context: IPerformanceContext;
  user: string;
}
