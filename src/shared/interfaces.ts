import { IPerformanceContext } from "./context";

export interface ISnapMessage {
  type: string;
  value: object | ISnapInitEventValue | ISnapBootstrapDoneEventValue | ISnapTrackEventValue | ISnapErrorEventValue | ISnapAjaxEventValue;
}

export interface IEventMap {
  [key: string]: Array<(event: ISnapMessage) => void>;
}

export interface ISnapHighCPUEventValue {
  cpuPctUtilization: number;
  clicks: IClickTrackForAPI[];
  context: IPerformanceContext;
}

export interface ISnapAjaxEventValue {
  value: number;
  request: any;
  response: any;
  context: IPerformanceContext;
}

export interface IPerformanceTrack {
  cpuApprox: number;
  clientTimestamp: number;
}

export interface IClickTrack {
  clickTarget: Element;
  clientTimestamp: number;
}

export interface IClickTrackForAPI {
  elt: string;
  clientTimestamp: number;
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

export interface ISnapTrackEventValue {
  metric: string;
  value: number;
  context: IPerformanceContext;
}

export interface ISnapSnapshotEventValue {
  context: IPerformanceContext;
  user: string;
}

export interface ISnapErrorEventValue {
  message: string;
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  stack: string;
  name: string;
  clientTimestamp: number;
  context: IPerformanceContext;
  clicks: IClickTrackForAPI[];
}
