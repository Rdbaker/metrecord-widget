import { Socket } from "phoenix";

import { BOOTSTRAP_DONE, INCREMENT_COUNT, PUSH_EVENT, TIME, RECORD_SNAPSHOT } from "shared/eventTypes";
import { ISnapBootstrapDoneEventValue, ISnapMessage, ISnapTimerEventValue, ISnapIncrementEventValue, ISnapSnapshotEventValue } from "shared/interfaces";
import { WS_URL } from "shared/resources";
import { getEventManager } from "../eventManager";

const manager = getEventManager();
const socket = new Socket(`${WS_URL}/socket`);
let channel = null;
let userId: string = null;
let clientId: string = null;

socket.connect();

const handleBootstrapDone = (event: ISnapMessage) => {
  const bootstrapDoneEvent = (event.value as ISnapBootstrapDoneEventValue);
  const user = bootstrapDoneEvent.user;
  clientId = bootstrapDoneEvent.clientId;
  userId = user;

  channel = socket.channel(`event:${user}`, { client_id: clientId });

  channel.join()
    .receive("ok", () => {
      manager.addEventListener(PUSH_EVENT, ({ value }) => {
        const payload = {
          client_id: clientId,
          end_user_id: user,
          snap_event: value,
        };
        channel.push("record_event", payload);
      });
    })
    .receive("error", () => {
      console.warn("failed to join channel");
    });
  channel.push("record_context", {
    client_id: clientId,
    end_user_id: user,
    user_context: bootstrapDoneEvent.context,
  });
};

const handleTimerEventPublish = (event: ISnapMessage) => {
  const timerEvent: ISnapTimerEventValue = (event.value as ISnapTimerEventValue);
  channel.push("create:timer", { data: timerEvent, name: timerEvent.metric, client_id: clientId, end_user_id: userId });
};

const handleIncrementEventPublish = (event: ISnapMessage) => {
  const incrementEvent: ISnapIncrementEventValue = (event.value as ISnapIncrementEventValue);
  channel.push(
    "create:increment",
    {
      client_id: clientId,
      data: incrementEvent,
      end_user_id: userId,
      name: incrementEvent.metric,
    });
};

const recordSnapshot = (event: ISnapMessage) => {
  const snapshotEvent: ISnapSnapshotEventValue = (event.value as ISnapSnapshotEventValue);
  channel.push("record_context", {
    client_id: clientId,
    end_user_id: snapshotEvent.user,
    user_context: snapshotEvent.context,
  });
};

manager.addEventListener(BOOTSTRAP_DONE, handleBootstrapDone);
manager.addEventListener(TIME, handleTimerEventPublish);
manager.addEventListener(INCREMENT_COUNT, handleIncrementEventPublish);
manager.addEventListener(RECORD_SNAPSHOT, recordSnapshot);
