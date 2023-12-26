import { FeatureService } from './FeatureService'
import querystring from 'node:querystring'

export function setFeaturesFromQueryString(sut: FeatureService, qs: string) {
  let query = querystring.decode(qs)

  Object.entries(query).map(([key, value]) => {
    let ma = key.match(/ff-(?<id>.*)/)
    if (ma) {
      let { id } = ma.groups
      if (value === '' || value === '1') {
        sut.enable(id)
      } else if (value === '0') {
        sut.disable(id)
      } else {
        sut.setValue(id, value)
      }
    }
  })
}
