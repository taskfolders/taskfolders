import { FeatureFlag } from './FeatureFlag'
import { FeatureService } from './FeatureService'
const BetaFeature = FeatureFlag.define('beta')

describe('x', () => {
  it('x', async () => {
    let sut = new FeatureService()
    expect(sut.isEnabled(BetaFeature)).toBe(true)

    sut.disable(BetaFeature)
    expect(sut.isEnabled(BetaFeature)).toBe(false)

    sut.enable(BetaFeature)
  })

  it('x global', async () => {
    let res = FeatureService.global.isEnabled(BetaFeature)
    expect(res).toBe(true)
  })

  it('set from environment', async () => {})
  it('set from json', async () => {})
  it('set from query string', async () => {})
})
