export type FeatureDefinition = {
  isEnabled(): boolean
}

export class FeatureFlag {
  static define(name: string): FeatureDefinition {
    return {
      isEnabled() {
        return true
      },
    }
  }
}
