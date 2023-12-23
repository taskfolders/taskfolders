import { DC } from '../dependencies/DC'
import { FeatureDefinition } from './FeatureFlag'

export class FeatureService {
  _featuresByKlass = new Map<any, { enabled }>()

  static get global() {
    return DC.global.fetch(this)
  }

  // static isEnabled(feature: FeatureDefinition) {
  //   return DC.global.fetch(this).isEnabled(feature)
  // }

  isEnabled(feature: FeatureDefinition) {
    let found = this._featuresByKlass.get(feature)
    if (!found) {
      let next = feature
      found = { enabled: next.isEnabled() }
      this._featuresByKlass.set(feature, found)
    }
    return found.enabled
  }

  disable(feature: FeatureDefinition) {
    this._featuresByKlass.set(feature, { enabled: false })
  }

  enable(feature: FeatureDefinition) {
    this._featuresByKlass.set(feature, { enabled: true })
  }
}

DC.decorate(FeatureService, { lifetime: 'singleton' })
