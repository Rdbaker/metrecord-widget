import { Socket } from "phoenix";

import {
  BOOTSTRAP_DONE,
  PUSH_EVENT,
  RECORD_SNAPSHOT,
  TRACK,
  ERROR,
  HIGH_CPU,
  AJAX
} from "shared/eventTypes";
import {
  ISnapBootstrapDoneEventValue,
  ISnapMessage,
  ISnapSnapshotEventValue,
  ISnapTrackEventValue,
  ISnapErrorEventValue,
  ISnapHighCPUEventValue,
  ISnapAjaxEventValue,
} from "shared/interfaces";
import { WS_URL } from "shared/resources";
import { getEventManager } from "../eventManager";

const manager = getEventManager();
const socket = new Socket(`${WS_URL}/socket`);
let channelNotReadyQueue: any[] = [];
let channel: any = null;
let userId: string = null;
let clientId: string = null;

socket.connect();


const emptyQueue = () => {
  channelNotReadyQueue.forEach(args => {
    channel.push(...args);
  });
  channelNotReadyQueue = [];
};


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
};


const handleTrackEventPublish = (event: ISnapMessage) => {
  const trackEvent: ISnapTrackEventValue = (event.value as ISnapTrackEventValue);
  const args = ["create:track", { data: trackEvent, name: trackEvent.metric, client_id: clientId, end_user_id: userId }];
  if (channel === null) {
    channelNotReadyQueue.push(args);
  } else {
    emptyQueue();
    channel.push(...args);
  }
};


const handleErrorEventPublish = (event: ISnapMessage) => {
  const errorEvent: ISnapErrorEventValue = (event.value as ISnapErrorEventValue);
  const args = ["create:error", { data: errorEvent, name: errorEvent.name, client_id: clientId, end_user_id: userId }];
  if (channel === null) {
    channelNotReadyQueue.push(args);
  } else {
    emptyQueue();
    channel.push(...args);
  }
};


const recordSnapshot = (event: ISnapMessage) => {
  const snapshotEvent: ISnapSnapshotEventValue = (event.value as ISnapSnapshotEventValue);
  const args = ["record_context", { client_id: clientId, end_user_id: snapshotEvent.user, user_context: snapshotEvent.context }];
  if (channel === null) {
    channelNotReadyQueue.push(args);
  } else {
    emptyQueue();
    channel.push(...args);
  }
};


const recordHighCPU = (event: ISnapMessage) => {
  const highCpuEvent: ISnapHighCPUEventValue = (event.value as ISnapHighCPUEventValue);
  // TODO: make this `const args =...` and add it to the queue
  ["create:highcpu", { client_id: clientId, end_user_id: userId, data: highCpuEvent, name: `${userId}:highcpu` }];
  // console.log(args[1])
  // if (channel === null) {
  //   channelNotReadyQueue.push(args);
  // } else {
  //   emptyQueue();
  //   channel.push(...args);
  // }
};

const recordAjaxCall = (event: ISnapMessage) => {
  const ajaxEvent: ISnapAjaxEventValue = (event.value as ISnapAjaxEventValue);
  const args = ["create:ajax", { client_id: clientId, end_user_id: userId, data: ajaxEvent, name: `${ajaxEvent.request.uri}`}]
  if (channel === null) {
    channelNotReadyQueue.push(args);
  } else {
    emptyQueue();
    channel.push(...args);
  }
}

manager.addEventListener(BOOTSTRAP_DONE, handleBootstrapDone);
manager.addEventListener(TRACK, handleTrackEventPublish);
manager.addEventListener(RECORD_SNAPSHOT, recordSnapshot);
manager.addEventListener(ERROR, handleErrorEventPublish);
manager.addEventListener(HIGH_CPU, recordHighCPU);
manager.addEventListener(AJAX, recordAjaxCall);