import *  as SharedEventTypes from 'shared/eventTypes';


const postMessageEventTypes = [
  SharedEventTypes.SET_DEBUG_MODE,
  SharedEventTypes.CHANGE_CONTAINER_CLASS,
  SharedEventTypes.DOMAIN_NOT_ALLOWED,
  SharedEventTypes.BOOTSTRAP_DONE,
];


const maybeCoercePayload = payload => {
  if (payload instanceof Error) {
    return String(payload);
  }

  return payload;
}


const postMessageToParent = ({
  type,
  payload,
}) => {
  const value = maybeCoercePayload(payload);
  window.parent.postMessage({type, value}, '*');
}


const postMessageMiddleware = () => next => action => {
  const shouldPostMessage = postMessageEventTypes.indexOf(action.type) !== -1;

  if (shouldPostMessage) {
    postMessageToParent(action);
  }

  next(action);
};


export default postMessageMiddleware;