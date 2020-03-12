import { ActionTypes } from 'modules/ui/constants';
import * as SharedActionTypes from 'shared/eventTypes';


export const hideUI = () => ({
  type: ActionTypes.hideUI,
});

export const showUI = () => ({
  type: ActionTypes.showUI,
});

export const changeContainerClass = (classnames) => ({
  type: SharedActionTypes.CHANGE_CONTAINER_CLASS,
  payload: classnames,
});

export const setView = ({ view }) => ({
  type: ActionTypes.setView,
  view,
});

export const setType = ({ type }) => ({
  type: ActionTypes.setType,
  viewType: type,
});

export const setViewAndType = ({ view, type }) => ({
  type: ActionTypes.setViewAndType,
  view,
  viewType: type,
});

export const setViewTypeAndMeta = ({ view, type, meta }) => ({
  type: ActionTypes.setViewTypeAndMeta,
  payload: {
    viewType: type,
    view,
    meta,
  },
})

export const setLastSentContainerClass = (classnames) => ({
  type: ActionTypes.setLastSentContainerClass,
  payload: { classnames },
});

export const setTypeAndMeta = ({ type, meta }) => ({
  type: ActionTypes.setTypeAndMeta,
  payload: {
    viewType: type,
    meta,
  }
});