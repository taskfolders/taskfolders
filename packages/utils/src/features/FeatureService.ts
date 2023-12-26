import { DC } from '../dependencies/DC'
import { FeatureDefinition } from './FeatureFlag'
import { FeatureId, FeatureRef } from './FeatureRef'

export class FeatureService {
  _featuresByString = new Map<string, { enabled: boolean; value? }>()

  static get global() {
    return DC.global.fetch(this)
  }

  // static isEnabled(feature: FeatureDefinition) {
  //   return DC.global.fetch(this).isEnabled(feature)
  // }

  isEnabled(thing: FeatureDefinition | string) {
    let ref = FeatureRef.from(thing)
    let found = this._featuresByString.get(ref.id)
    if (!found) {
      found = { enabled: ref.feature?.isEnabled() ?? false }
      this._featuresByString.set(ref.id, found)
    }
    return found.enabled
  }

  disable(feat: FeatureDefinition | string) {
    let ref = FeatureRef.from(feat)
    this._featuresByString.set(ref.id, { enabled: false })
  }

  enable(feat: FeatureDefinition | string) {
    let ref = FeatureRef.from(feat)
    this._featuresByString.set(ref.id, { enabled: true })
  }

  setValue(feat: FeatureId, value) {
    let ref = FeatureRef.from(feat)
    let found = this._featuresByString.get(ref.id)
    if (found) {
      found = { enabled: ref.feature.isEnabled() ?? false, value }
    }
    this._featuresByString.set(ref.id, found)
  }
}

DC.decorate(FeatureService, { lifetime: 'singleton' })
