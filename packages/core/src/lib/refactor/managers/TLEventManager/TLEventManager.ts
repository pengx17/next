import type { TLApp, TLShape } from '../../'
import type {
  TLCallback,
  TLEventMap,
  TLSubscription,
  TLSubscriptionEventInfo,
  TLSubscriptionEventName,
} from '../../types'

export class TLEventManager<S extends TLShape, K extends TLEventMap, R extends TLApp<S, K>> {
  app: R

  constructor(app: R) {
    this.app = app
  }

  private subscriptions = new Set<TLSubscription<S, K, R, any>>([])

  subscribe = <E extends TLSubscriptionEventName>(event: E, callback: TLCallback<S, K, R, E>) => {
    if (callback === undefined) throw Error('Callback is required.')
    const subscription: TLSubscription<S, K, R, E> = { event, callback }
    this.subscriptions.add(subscription)
    return () => this.unsubscribe(subscription)
  }

  unsubscribe = (subscription: TLSubscription<S, K, R, any>) => {
    this.subscriptions.delete(subscription)
    return this
  }

  notify = <E extends TLSubscriptionEventName>(event: E, info: TLSubscriptionEventInfo<E>) => {
    this.subscriptions.forEach(subscription => {
      if (subscription.event === event) {
        subscription.callback(this.app, info)
      }
    })
    return this
  }
}
