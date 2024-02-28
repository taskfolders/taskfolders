import { FeatureFlag } from './FeatureFlag.js'
import { FeatureService } from './FeatureService.js'
import { setFeaturesFromEnv } from './setFeaturesFromEnv.js'
import { setFeaturesFromQueryString } from './setFeaturesFromQueryString.js'

const Beta = FeatureFlag.create('beta', { enabled: true })

describe('x', () => {
  it('x main #story', async () => {
    let sut = new FeatureService()
    expect(sut.isEnabled(Beta)).toBe(true)

    sut.disable(Beta)
    expect(sut.isEnabled(Beta)).toBe(false)

    sut.enable('beta')
    expect(sut.isEnabled(Beta)).toBe(true)
  })

  it('x global', async () => {
    let res = FeatureService.global.isEnabled(Beta)
    expect(res).toBe(true)
  })

  it('x pre-set feature state', async () => {
    {
      // enable by default
      let sut = new FeatureService()
      expect(sut.isEnabled(Beta)).toBe(true)
    }

    {
      // set default value
      let sut = new FeatureService()
      sut.disable('beta')
      expect(sut.isEnabled(Beta)).toBe(false)
    }
  })

  it('set from environment', async () => {
    let env = { FF_beta: '1', FOO: '2' }
    let sut = new FeatureService()

    setFeaturesFromEnv(sut, env)

    expect(sut.isEnabled('beta')).toBe(true)
    expect(sut.isEnabled('fox')).toBe(false)
  })

  it('set from json', async () => {})

  it('set from query string', async () => {
    let sut = new FeatureService()
    let qs = 'foo=bar&abc=xyz&ff-beta&ff-fox=1&ff-bar=tango'
    setFeaturesFromQueryString(sut, qs)

    expect(sut.isEnabled('beta')).toBe(true)
    expect(sut.isEnabled('fox')).toBe(true)
  })
})
