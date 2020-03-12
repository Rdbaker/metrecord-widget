import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers, compose, Store } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { Provider } from 'react-redux';


import postMessageMiddleware from 'modules/shim/middleware';

import shimEpic from 'modules/shim/epic';
import shimReducer from 'modules/shim/reducer';
import uiEpic from 'modules/ui/epic';
import uiReducer from 'modules/ui/reducer';

import { DEBUG } from 'shared/resources';

import Widget from './Widget';


const epicMiddleware = createEpicMiddleware();
const loggingMiddleware = () => (next: any) => (action: any) => {
  if (DEBUG) {
    console.info('[Metrecord.Widget] applying action', action);
  }
  next(action);
}

const store: Store = createStore(
  combineReducers({
    ui: uiReducer,
    shim: shimReducer,
  }),
  compose(
    applyMiddleware(loggingMiddleware),
    applyMiddleware(epicMiddleware),
    applyMiddleware(postMessageMiddleware),
  ),
);


const isSnapMessage = (event: MessageEvent): boolean => {
  return event.data && event.data.hasOwnProperty("type") && event.data.hasOwnProperty("value");
};

const handleRawMessage = (event: MessageEvent) => {
  if (isSnapMessage(event)) {
    store.dispatch(event.data);
  }
};

window.addEventListener("message", handleRawMessage, false);


if (DEBUG) {
  (window as any).store = store;
}

epicMiddleware.run(
  combineEpics(
    uiEpic,
    shimEpic,
  )
)

ReactDOM.render(
  <Provider store={store}>
    <Widget />
  </Provider>,
  document.getElementById('app')
);
