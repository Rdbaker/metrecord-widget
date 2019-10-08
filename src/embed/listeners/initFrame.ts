import { OrgAPI } from "api/org";
import { BOOTSTRAP_DONE, INIT_IFRAME } from "shared/eventTypes";
import { ISnapInitEventValue, ISnapMessage } from "shared/interfaces";
import { checkStatus } from "utils/http";
import { getEventManager } from "../eventManager";

const manager = getEventManager();

const handleInitEvent = (event: ISnapMessage) => {
  const initValue = (event.value as ISnapInitEventValue);
  const clientId = initValue.clientId;
  OrgAPI.fetchPublicOrg(clientId)
    .then(checkStatus)
    .then(() => {
      manager.emit(BOOTSTRAP_DONE, { type: BOOTSTRAP_DONE, value: initValue });
    });
};

manager.addEventListener(INIT_IFRAME, handleInitEvent);
