function bound(originalMethod: any, context: ClassMethodDecoratorContext) {}

//@collector.install
class MyClass {
  @bound
  foo() {}
}
