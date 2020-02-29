import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ISnapMessage } from "shared/interfaces";

import { getEventManager } from "./eventManager";

// register all listeners
import "./listeners";
import Widget from './Widget';

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


ReactDOM.render(
  <Widget />,
  document.getElementById('app')
);