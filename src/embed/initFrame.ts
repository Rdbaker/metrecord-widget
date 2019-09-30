import { INIT_IFRAME } from "shared/eventTypes";
import { ISnapInitEventValue, ISnapMessage } from "shared/interfaces";
import { getEventManager } from "./eventManager";

const handleInitEvent = (event: ISnapMessage) => {
  const initValue = (event.value as ISnapInitEventValue);
  const clientId = initValue.clientId;

  console.log('handling init event', clientId);
};

getEventManager().addEventListener(INIT_IFRAME, handleInitEvent);
