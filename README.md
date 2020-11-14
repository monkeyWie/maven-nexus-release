# Maven Nexus Release

用于自动发布 jar 包至 Apache Maven Central，在`maven deploy`之后通过 API 模拟登录 Nexus 进行`close`和`release`。

# 使用

查看 [action.yml](action.yml)

## GPG 私钥导出

- 列出秘钥

```
gpg --list-secret-keys --keyid-format LONG
------------------------------------------------
sec   rsa4096/2A6B618785DD7899 2020-11-05 [SC]
      992BB9305698C72B846EF4982A6B618785DD7899
uid                 [ultimate] monkeyWie <liwei-8466@qq.com>
ssb   rsa4096/F8E9F8CBD90028C5 2020-11-05 [E]
```

- 导出秘钥

```
gpg --armo --export-secret-keys 2A6B618785DD7899
```

## 基础示例

```yaml
steps:
  - uses: actions/checkout@v2
  - name: Set up JDK 1.8
    uses: actions/setup-java@v1
    with:
      java-version: 1.8

  - name: Set up Apache Maven Central
    uses: actions/setup-java@v1
    with: # running setup-java again overwrites the settings.xml
      java-version: 1.8
      server-id: releases # Value of the distributionManagement/repository/id field of the pom.xml
      server-username: MAVEN_USERNAME # env variable for username in deploy
      server-password: MAVEN_CENTRAL_TOKEN # env variable for token in deploy
      gpg-passphrase: MAVEN_GPG_PASSPHRASE # env variable for GPG private key passphrase
      gpg-private-key: ${{ secrets.MAVEN_GPG_PRIVATE_KEY }} # Value of the GPG private key to import

  - name: Publish to Apache Maven Central
    run: mvn clean deploy
    env:
      MAVEN_USERNAME: xxx
      MAVEN_CENTRAL_TOKEN: ${{ secrets.MAVEN_CENTRAL_TOKEN }}
      MAVEN_GPG_PASSPHRASE: ${{ secrets.MAVEN_GPG_PASSPHRASE }}

  - name: Release on nexus
    uses: monkeyWie/maven-nexus-release@v1.0.0
    with:
      maven-repo-server-username: xxx
      maven-repo-server-password: ${{ secrets.MAVEN_CENTRAL_TOKEN }}
```
