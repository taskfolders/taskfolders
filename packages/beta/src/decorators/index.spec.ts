describe('x', () => {
  it('x', async () => {
    class InstanceCollector {
      instances = new Set()
      install = (value, { kind }) => {
        if (kind === 'class') {
          const _this = this
          return function (...args) {
            // (A)
            const inst = new value(...args) // (B)
            _this.instances.add(inst)
            return inst
          }
        }
      }
    }
    function bound(originalMethod: any, context: ClassMethodDecoratorContext) {}

    const collector = new InstanceCollector()

    //@collector.install
    class MyClass {
      foo() {}
    }

    const inst1 = new MyClass()
  })
})
