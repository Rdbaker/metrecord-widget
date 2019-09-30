import { IPerformanceContext } from "./context";

export interface ISnapMessage {
  type: string;
  value: object | ISnapInitEventValue;
}

export interface IEventMap {
  [key: string]: Array<(event: ISnapMessage) => void>;
}

export interface ISnapInitEventValue {
  clientId: string;
  user: string;
  context: IPerformanceContext;
}
