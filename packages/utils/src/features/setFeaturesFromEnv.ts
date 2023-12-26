import { FeatureService } from './FeatureService'

export function setFeaturesFromEnv(
  service: FeatureService,
  env: Record<string, string>,
) {
  Object.entries(env).map(([key, value]) => {
    let ma = key.match(/FF_(?<name>.*)/)
    if (ma) {
      let { name } = ma.groups
      if (value === '1') {
        service.enable(name)
      } else if (value === '0') {
        service.disable(name)
      } else {
        service.setValue(name, value)
      }
    }
  })
}
