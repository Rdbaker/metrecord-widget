import { BOOTSTRAP_DONE } from "shared/eventTypes";
import { ISnapMessage } from "shared/interfaces";
import { getEventManager } from "../eventManager";

const manager = getEventManager();

const postMessageToHost = (event: ISnapMessage) => {
  window.parent.postMessage(event, "*");
};

manager.addEventListener(BOOTSTRAP_DONE, postMessageToHost);
