import { merge } from 'ramda';

import { ActionTypes as UIActionTypes, IframeViews, IframeViewTypes } from 'modules/ui/constants';


const defaultState = {
  hidden: true,
  view: IframeViews.NONE,
  type: IframeViewTypes.NONE,
  meta: {},
  lastSentContainerClass: '',
};


export default (state = defaultState, action) => {
  switch (action.type) {
    case UIActionTypes.hideUI:
      return merge(state, { hidden: true });
    case UIActionTypes.showUI:
      return merge(state, { hidden: false });
    case UIActionTypes.setView:
      return merge(state, { view: action.view });
    case UIActionTypes.setType:
      return merge(state, { type: action.viewType });
    case UIActionTypes.setViewTypeAndMeta:
      return merge(state, { type: action.payload.viewType, view: action.payload.view, meta: action.payload.meta });
    case UIActionTypes.setTypeAndMeta:
      return merge(state, { type: action.payload.viewType, meta: action.payload.meta });
    case UIActionTypes.setViewAndType:
      return merge(state, { type: action.viewType, view: action.view });
    case UIActionTypes.setLastSentContainerClass:
      return merge(state, { lastSentContainerClass: action.payload.classnames });
    default:
      return state;
  }
};