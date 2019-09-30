import { IEventMap, ISnapMessage } from "shared/interfaces";

class EventManager {
  private eventMap: IEventMap;

  constructor() {
    this.eventMap = {};
  }

  public addEventListener(eventName: string, listener: (event: ISnapMessage) => void) {
    if (this.eventMap.hasOwnProperty(eventName)) {
      this.eventMap[eventName].push(listener);
    } else {
      this.eventMap[eventName] = [listener];
    }
  }

  public emit(eventName: string, event: ISnapMessage) {
    console.log("emitting", eventName, event);
    (this.eventMap[eventName] || []).forEach((func) => func.call(undefined, event));
  }
}

const manager = new EventManager();

export const getEventManager = () => manager;
