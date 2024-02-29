import { FeatureDefinition } from './FeatureFlag.js'

export type FeatureId = FeatureDefinition | string

export class FeatureRef {
  id: string
  feature: FeatureDefinition

  static from(thing: FeatureId) {
    let obj = new this()
    if (typeof thing === 'string') {
      obj.id = thing
      //
    } else {
      obj.feature = thing
      obj.id = thing.name
    }
    return obj
  }
}
