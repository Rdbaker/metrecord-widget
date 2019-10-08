import { ISnapMessage } from "shared/interfaces";

import { getEventManager } from "./eventManager";

// register all listeners
import "./listeners";

const handleSnapMessage = (message: ISnapMessage) => {
  getEventManager().emit(message.type, message);
};

const isSnapMessage = (event: MessageEvent): boolean => {
  return event.data && event.data.hasOwnProperty("type") && event.data.hasOwnProperty("value");
};

const handleRawMessage = (event: MessageEvent) => {
  if (isSnapMessage(event)) {
    handleSnapMessage(event.data);
  }
};

window.addEventListener("message", handleRawMessage, false);
