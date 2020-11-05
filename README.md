# Maven Nexus Release

用于自动发布 jar 包至 Apache Maven Central，在`maven deploy`之后通过 API 模拟登录 Nexus 进行`close`和`release`。

# 使用

查看 [action.yml](action.yml)

## 基础示例

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: actions/setup-java@v1
    with:
      java-version: "9.0.4" # The JDK version to make available on the path.
      java-package: jdk # (jre, jdk, or jdk+fx) - defaults to jdk
      architecture: x64 # (x64 or x86) - defaults to x64
  - run: java -cp java HelloWorldApp
```