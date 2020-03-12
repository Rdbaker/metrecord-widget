import { combineEpics, ofType } from 'redux-observable';
import { flatMap, catchError, pluck, mergeMap } from 'rxjs/operators';
import { from, of } from 'rxjs';

import { OrgAPI } from 'api/org';
import { receivePublicOrg } from './actions';
import * as SharedActionTypes from 'shared/eventTypes.ts';


const initFrame$ = (action$) => action$.pipe(
  ofType(SharedActionTypes.INIT_IFRAME),
  pluck('value'),
  flatMap(({ clientId }) =>
    from(OrgAPI.fetchPublicOrg(clientId))
      .pipe(
        flatMap((response) => from(response.json())),
        mergeMap(({ data }) => {
          if (!data) throw new Error('org not found')
          // check if domain is allowed
          return [
            receivePublicOrg(data),
            { type: SharedActionTypes.BOOTSTRAP_DONE },
          ];
        }),
        catchError(err => {
          // TODO: log if debug
          console.warn(err)
          return of({ type: SharedActionTypes.DOMAIN_NOT_ALLOWED })
        }),
      )
  )
);

export default combineEpics(
  initFrame$,
)