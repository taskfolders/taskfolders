export type FeatureDefinition = {
  name: string
  isEnabled(): boolean
}

export class FeatureFlag {
  static create(
    name: string,
    kv: { enabled?: boolean } = {},
  ): FeatureDefinition {
    return {
      name,
      isEnabled() {
        return kv.enabled ?? false
      },
    }
  }
}
