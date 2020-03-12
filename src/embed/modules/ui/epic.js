import { combineEpics, ofType } from 'redux-observable';
import { switchMap, mapTo, delay, filter, flatMap, pluck } from 'rxjs/operators';
import { path } from 'ramda';

import * as SharedActionTypes from 'shared/eventTypes';
import * as UIActions from 'modules/ui/actions';
import { IframeViewTypes, IframeViews } from './constants';


const showFeedbackView$ = (action$, store$) => action$.pipe(
  ofType(SharedActionTypes.START_FEEDBACK_FLOW),
  filter(() => store$.value.ui.hidden),
  flatMap(() => [
      UIActions.setViewAndType({ view: IframeViews.FEEDBACK_VIEW, type: IframeViewTypes.FEEDBACK_FORM }),
      UIActions.changeContainerClass('feedback-form'),
  ])
);


const hideDuringTransition$ = (action$, store) => action$.pipe(
  ofType(SharedActionTypes.CHANGE_CONTAINER_CLASS),
  filter(action => path(['value', 'ui', 'lastSentContainerClass'], store) !== action.payload),
  pluck('payload'),
  switchMap(classnames => ([
    UIActions.hideUI(),
    UIActions.setLastSentContainerClass(classnames),
  ]))
)

const showAfterTransition$ = action$ => action$.pipe(
  ofType(SharedActionTypes.CHANGE_CONTAINER_CLASS_DONE),
  delay(120),
  mapTo(UIActions.showUI())
)

export default combineEpics(
  hideDuringTransition$,
  showAfterTransition$,
  showFeedbackView$,
)