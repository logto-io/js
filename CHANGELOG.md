# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.13](https://github.com/logto-io/js/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-11-08)


### Bug Fixes

* use `.mjs` for ESM files ([#429](https://github.com/logto-io/js/issues/429)) ([2993007](https://github.com/logto-io/js/commit/2993007a0dac3c9ed79e2415fcc55059d2d7a494))



## [1.0.0-beta.12](https://github.com/logto-io/js/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-02)


### Bug Fixes

* **client:** remove access token from storage after sign-out ([90f50de](https://github.com/logto-io/js/commit/90f50de6cdac575305510f4bfdf35b17bf9e4a0e))



## [1.0.0-beta.11](https://github.com/logto-io/js/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-26)


### Features

* **node,next,express:** get access token with resource ([#420](https://github.com/logto-io/js/issues/420)) ([6fb22ea](https://github.com/logto-io/js/commit/6fb22ea51a50c7a8b1b64cb6d2aa665c18b3a0b8))


### Bug Fixes

* **deps:** update dependency @logto/core-kit to v1.0.0-beta.20 ([d9750b1](https://github.com/logto-io/js/commit/d9750b16d79172fb4e9a1166c3f0623452570686))
* **next-sample:** fix undefined in getServerSideProps ([#423](https://github.com/logto-io/js/issues/423)) ([f15e875](https://github.com/logto-io/js/commit/f15e875f34413b3cc1093db590c83af86c0b0374))



## [1.0.0-beta.10](https://github.com/logto-io/js/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-10-21)


### Bug Fixes

* **deps:** update dependency @logto/core-kit to v1.0.0-beta.19 ([ae0be3b](https://github.com/logto-io/js/commit/ae0be3b6c9bc09f4f291dbb1e2a5be6de3d7afb1))
* **remix:** use the correct sign-out redirect URL which comes down from the Logto instance ([80418c5](https://github.com/logto-io/js/commit/80418c5ff759fc195611a2ffc1245911c501e67f))



## [1.0.0-beta.9](https://github.com/logto-io/js/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-10-19)


### Features

* **express,next,node:** support fetchUserInfo ([#413](https://github.com/logto-io/js/issues/413)) ([91431d0](https://github.com/logto-io/js/commit/91431d0328d95654928ee86db883884b85120af5))
* **remix:** migrate the Remix SDK over from @openformation/logto-remix ([90818f1](https://github.com/logto-io/js/commit/90818f1fe6fc772878427a37af85d5dbe1c8e6ab))


### Bug Fixes

* **deps:** update dependency @logto/core-kit to v1.0.0-beta.16 ([b65a499](https://github.com/logto-io/js/commit/b65a4994dbe43293ac08ba40f07967cf3daaca75))



## [1.0.0-beta.8](https://github.com/logto-io/js/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2022-09-23)

**Note:** Version bump only for package root





## [1.0.0-beta.7](https://github.com/logto-io/js/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2022-09-20)


### Bug Fixes

* remove persist access token ([#406](https://github.com/logto-io/js/issues/406)) ([f2ba84f](https://github.com/logto-io/js/commit/f2ba84f07e8486e2edf6f35e06446738ea0158e7))



## [1.0.0-beta.6](https://github.com/logto-io/js/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-09-17)


### Features

* **browser,react,vue:** enable userinfo endpoint ([cae6eff](https://github.com/logto-io/js/commit/cae6effd1b75b31627b896e210f6acda46faedeb))


### Bug Fixes

* bump to essentials v1.2.1 to use utf-8 on decoding base64 ([5a4ad09](https://github.com/logto-io/js/commit/5a4ad093e14ffa4927a09f4f692c0c26f412b7c0))



## [1.0.0-beta.5](https://github.com/logto-io/js/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-09-13)


### Features

* **js,client:** enable user endpoint in js core and client sdks ([abd2842](https://github.com/logto-io/js/commit/abd28427f36594d9fa90a9c4aa27b526d9150d5a))


### Bug Fixes

* **react,vue:** do not set loading to false after calling signIn ([#403](https://github.com/logto-io/js/issues/403)) ([06b6060](https://github.com/logto-io/js/commit/06b6060c22e927c05545310a09ca080a55e89ec7))



## [1.0.0-beta.4](https://github.com/logto-io/js/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-09-09)


### Bug Fixes

* **browser-sample:** make sign-in work again ([#389](https://github.com/logto-io/js/issues/389)) ([9201291](https://github.com/logto-io/js/commit/9201291cd06e539dec94c4923d83086656d5e7d8))
* **react,vue:** fix mis-handled isAuthenticated state in react and vue sdks ([9fe790d](https://github.com/logto-io/js/commit/9fe790d0057e50ab07448465d1f6875fe2e4523f))



## [1.0.0-beta.3](https://github.com/logto-io/js/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-22)


### Features

* **express-sample:** add express sample code ([#380](https://github.com/logto-io/js/issues/380)) ([301ea8d](https://github.com/logto-io/js/commit/301ea8dacd50d9ca859f4bec796b95937e35c3e7))



## [1.0.0-beta.2](https://github.com/logto-io/js/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-08-08)


### Features

* **express:** init express and add routes handler ([#375](https://github.com/logto-io/js/issues/375)) ([5fbfc1b](https://github.com/logto-io/js/commit/5fbfc1b7c80660706562a36c7a90c0f7b52fd10e))
* **express:** with logto ([#378](https://github.com/logto-io/js/issues/378)) ([9626b76](https://github.com/logto-io/js/commit/9626b764eb84287a1e29783a768f33190d28411d))
* **node:** support client secret ([#372](https://github.com/logto-io/js/issues/372)) ([43d0de9](https://github.com/logto-io/js/commit/43d0de9ede0a80ab7752b25f65ea5436129a20ac))



## [1.0.0-beta.1](https://github.com/logto-io/js/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-25)


### Features

* **next:** handleAuthRoutes ([#367](https://github.com/logto-io/js/issues/367)) ([5bf3a13](https://github.com/logto-io/js/commit/5bf3a133eafc3f93f77fd164352cd779f67a867a))



## [1.0.0-beta.0](https://github.com/logto-io/js/compare/v1.0.0-alpha.3...v1.0.0-beta.0) (2022-07-21)


### Features

* **client:** add client package ([#329](https://github.com/logto-io/js/issues/329)) ([04c7b56](https://github.com/logto-io/js/commit/04c7b56d8db7d560380370ecbd6544de70145251))
* **client:** persist access token ([#359](https://github.com/logto-io/js/issues/359)) ([10fb181](https://github.com/logto-io/js/commit/10fb1813648fd01ad2f0322fafe731e24d354829))
* **next-sample:** implement nextjs sample ([#362](https://github.com/logto-io/js/issues/362)) ([406082d](https://github.com/logto-io/js/commit/406082d2cc40c70a3237d66f29888e82f04ea361))
* **next:** add sign in callback route ([#348](https://github.com/logto-io/js/issues/348)) ([80c9e34](https://github.com/logto-io/js/commit/80c9e345e816c4a0cddf0a507c18aa2593a359c5))
* **next:** grant access token and check expiration ([#361](https://github.com/logto-io/js/issues/361)) ([3171b58](https://github.com/logto-io/js/commit/3171b58dae9dd4bc0944349ce39ce038a00960ed))
* **next:** init and sign in route ([#339](https://github.com/logto-io/js/issues/339)) ([f17364a](https://github.com/logto-io/js/commit/f17364ab85d91766a07571b48aea4cb88a4f4461))
* **next:** set getAccessToken as an option ([#364](https://github.com/logto-io/js/issues/364)) ([e27577c](https://github.com/logto-io/js/commit/e27577cef70d6461f03a68006a68cb413294341d))
* **next:** sign out ([#358](https://github.com/logto-io/js/issues/358)) ([f773ce0](https://github.com/logto-io/js/commit/f773ce00c30916ee09351bfb36a71b89e1966065))
* **next:** ssr support ([#363](https://github.com/logto-io/js/issues/363)) ([886e260](https://github.com/logto-io/js/commit/886e2601c7d465e7c980c62ce1707f2d2f74f18f))
* **next:** with logto api route ([#355](https://github.com/logto-io/js/issues/355)) ([60eb143](https://github.com/logto-io/js/commit/60eb143dca87119752f8f9cc1758240c3e3e92eb))
* **node:** node sdk ([#338](https://github.com/logto-io/js/issues/338)) ([2cb03c1](https://github.com/logto-io/js/commit/2cb03c18ef7e44f2a146db219e54e6e0c495fcf2))



## [1.0.0-alpha.3](https://github.com/logto-io/js/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-08)

**Note:** Version bump only for package root





## [1.0.0-alpha.2](https://github.com/logto-io/js/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-08)


### Features

* **js:** optimize error message for unavailable crypto.subtle in insecure contexts ([#324](https://github.com/logto-io/js/issues/324)) ([38aedf7](https://github.com/logto-io/js/commit/38aedf7256cbc3b9d3d9056211025f59526edeff))



## [1.0.0-alpha.1](https://github.com/logto-io/js/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-07)

**Note:** Version bump only for package root





## [1.0.0-alpha.0](https://github.com/logto-io/js/compare/v0.2.2...v1.0.0-alpha.0) (2022-07-07)


### Bug Fixes

* packing ([#321](https://github.com/logto-io/js/issues/321)) ([c808005](https://github.com/logto-io/js/commit/c8080058fa1861c02f264a0d8db568c0292d3d7f))



### [0.2.2](https://github.com/logto-io/js/compare/v0.2.1...v0.2.2) (2022-06-30)


### Bug Fixes

* **browser:** should use prompt param on sign-in ([#319](https://github.com/logto-io/js/issues/319)) ([08ceb64](https://github.com/logto-io/js/commit/08ceb6423034289b31086811bbed9e225509549b))



### [0.2.1](https://github.com/logto-io/js/compare/v0.2.0...v0.2.1) (2022-06-30)

**Note:** Version bump only for package root





## [0.2.0](https://github.com/logto-io/js/compare/v0.1.18...v0.2.0) (2022-06-30)


### Features

* **js,browser:** configurable prompt ([#311](https://github.com/logto-io/js/issues/311)) ([2b9ae04](https://github.com/logto-io/js/commit/2b9ae0460f35e636aee448c46f810c74b6e5b230))
* remove userinfo ([#317](https://github.com/logto-io/js/issues/317)) ([3f9d412](https://github.com/logto-io/js/commit/3f9d412cb2ec930fe036c8ad9c7d1568498581e8))



### [0.1.18](https://github.com/logto-io/js/compare/v0.1.17...v0.1.18) (2022-06-29)


### Bug Fixes

* **js:** support null in id token ([#314](https://github.com/logto-io/js/issues/314)) ([abb53e2](https://github.com/logto-io/js/commit/abb53e296ed50afb339a7f4864e7f368cacb0e1e))



### [0.1.17](https://github.com/logto-io/js/compare/v0.1.16...v0.1.17) (2022-06-29)


### Bug Fixes

* **deps:** update dependency superstruct to ^0.16.0 ([#302](https://github.com/logto-io/js/issues/302)) ([d23c3d3](https://github.com/logto-io/js/commit/d23c3d393a55e508c2173d0ce0a14320e33f2873))
* **js SDK:** getAccessTokenByRefreshToken should not return idToken ([95a1b96](https://github.com/logto-io/js/commit/95a1b9659040a4d6a7f387387c1b927c9389f01a))
* **js:** refresh access token without a resource should return id token ([05d34d6](https://github.com/logto-io/js/commit/05d34d6d389e0bac9889c1ee7cbb937a78173d0c))



### [0.1.16](https://github.com/logto-io/js/compare/v0.1.15...v0.1.16) (2022-06-14)


### Features

* **browser:** append reserved scopes in LogtoClient constructor ([#305](https://github.com/logto-io/js/issues/305)) ([296f6d6](https://github.com/logto-io/js/commit/296f6d65a2ef7514a035c8f06dc921ce049e62b2))



### [0.1.15](https://github.com/logto-io/js/compare/v0.1.14...v0.1.15) (2022-06-08)

**Note:** Version bump only for package root





### [0.1.14](https://github.com/logto-io/js/compare/v0.1.13...v0.1.14) (2022-06-02)

**Note:** Version bump only for package root





### [0.1.13](https://github.com/logto-io/js/compare/v0.1.12...v0.1.13) (2022-06-01)

**Note:** Version bump only for package root





### [0.1.12](https://github.com/logto-io/js/compare/v0.1.11...v0.1.12) (2022-05-31)


### Bug Fixes

* **react:** calling getIdTokenClaims will not cause infinite loop ([10a5caa](https://github.com/logto-io/js/commit/10a5caad9a7f90c93f8251fef60d94bb088a4e59))



### [0.1.11](https://github.com/logto-io/js/compare/v0.1.10...v0.1.11) (2022-05-28)

**Note:** Version bump only for package root





### [0.1.10](https://github.com/logto-io/js/compare/v0.1.9...v0.1.10) (2022-05-28)


### Bug Fixes

* **js:** oidc error description should be optional string ([0867e34](https://github.com/logto-io/js/commit/0867e34cb570c603f2611f0d26156210eebd0de1))



### [0.1.9](https://github.com/logto-io/js/compare/v0.1.8...v0.1.9) (2022-05-27)


### Bug Fixes

* 'LogtoClientError' should be exported as class instead of type ([85fc983](https://github.com/logto-io/js/commit/85fc98346ce336ebd58ba61e0cbd3d127b814a13))



### [0.1.8](https://github.com/logto-io/js/compare/v0.1.7...v0.1.8) (2022-05-27)


### Features

* **vue-sample:** add vue sample project to demonstrate vue sdk ([717e53b](https://github.com/logto-io/js/commit/717e53b78a029de7a173ccb7f5b0ffa08445c95d))
* **vue:** create vue sdk ([6a68267](https://github.com/logto-io/js/commit/6a68267ff8c86bdde22050f351b95afae63753e2))


### Bug Fixes

* **browser-sample:** add typescript to browser-sample dev dependencies ([756283c](https://github.com/logto-io/js/commit/756283cf39254e4c3e6d45bb66dff9bb72d41c7c))
* **vue-sample:** include link dependency correctly in build options ([8b37058](https://github.com/logto-io/js/commit/8b37058d4e0d049e464d28c57d9c97599f3dfde6))



### [0.1.7](https://github.com/logto-io/js/compare/v0.1.6...v0.1.7) (2022-05-17)


### Bug Fixes

* **browser:** clear authenticated status before signing-in ([bd0b921](https://github.com/logto-io/js/commit/bd0b921eb78176d13df6d1c990efe7a1f513f4b8))
* lockfile ([f2e1908](https://github.com/logto-io/js/commit/f2e1908725148b25bca54d86e106f98df2501fc1))



### [0.1.6](https://github.com/logto-io/js/compare/v0.1.5...v0.1.6) (2022-05-17)


### Features

* **react:** add error prop to useLogto context ([ebe9e96](https://github.com/logto-io/js/commit/ebe9e962d65fa547d5a6349b2beb99b35e50dfe0))


### Bug Fixes

* lockfile ([3fae0c9](https://github.com/logto-io/js/commit/3fae0c97d15d0a7be51039b162c1b9bdc5ec3237))
* manually run script before publish ([#258](https://github.com/logto-io/js/issues/258)) ([1b67085](https://github.com/logto-io/js/commit/1b6708539c7f8a16bc5000f4cab12bdca08b5c50))



### [0.1.5](https://github.com/logto-io/js/compare/v0.1.4...v0.1.5) (2022-05-05)


### Bug Fixes

* **browser:** read/write refreshToken from/to localStorage only ([5e95349](https://github.com/logto-io/js/commit/5e9534945bfb069d5e1b6206a1899ef6e69ab4d9))
* **browser:** remove session item after successful sign-in ([f33bcd2](https://github.com/logto-io/js/commit/f33bcd23807a09e84a491e535fc288a4e1f33f19))
* leverage root `prepack` lifecycle for publish ([#235](https://github.com/logto-io/js/issues/235)) ([8e66d82](https://github.com/logto-io/js/commit/8e66d82dacd204c32ffc39f4440b47e0f7541cc3))



### [0.1.4](https://github.com/logto-io/js/compare/v0.1.3...v0.1.4) (2022-03-18)


### Features

* **browser:** reuse remote jwks and odic config ([#231](https://github.com/logto-io/js/issues/231)) ([1469bb1](https://github.com/logto-io/js/commit/1469bb16a5009aaca5f42b73add341204e7accf4))



### [0.1.3](https://github.com/logto-io/js/compare/v0.1.2...v0.1.3) (2022-03-16)

**Note:** Version bump only for package root





### [0.1.2](https://github.com/logto-io/js/compare/v0.1.2-rc.1...v0.1.2) (2022-03-10)

**Note:** Version bump only for package root





### [0.1.2-rc.1](https://github.com/logto-io/js/compare/v0.1.2-rc.0...v0.1.2-rc.1) (2022-03-10)

**Note:** Version bump only for package root





### [0.1.2-rc.0](https://github.com/logto-io/js/compare/v0.1.1-rc.0...v0.1.2-rc.0) (2022-03-10)


### Bug Fixes

* remove `prepublish` script ([#221](https://github.com/logto-io/js/issues/221)) ([cc89533](https://github.com/logto-io/js/commit/cc895337762cf7740578a8eb14835ed0d5d72905))
* remove offline option when updating lockfile ([3e4f331](https://github.com/logto-io/js/commit/3e4f331859abfafece2b35761aa142f8543b8713))



### [0.1.1-rc.0](https://github.com/logto-io/js/compare/v0.1.0...v0.1.1-rc.0) (2022-03-10)


### Bug Fixes

* add `publishConfig` to packages ([a809e25](https://github.com/logto-io/js/commit/a809e257982f7d3c31f104fa5daf983c535adfc5))



## 0.1.0 (2022-03-10)


### ⚠ BREAKING CHANGES

* **js:** initialize js/js package (#122)

### Features

* add license ([#42](https://github.com/logto-io/js/issues/42)) ([89fb076](https://github.com/logto-io/js/commit/89fb076b4c400adf3a0556af10f3f76466bf5e7f))
* **browser-sample:** add browser sample pages ([ebc990d](https://github.com/logto-io/js/commit/ebc990d1407a6c6967ce5cc9e9a50158b9d1a3b9))
* **browser-sample:** init package ([10076e1](https://github.com/logto-io/js/commit/10076e15e6c491c2584cb8a0269f0d7bfddef526))
* **browser:** add LogtoClient constructor ([0a09559](https://github.com/logto-io/js/commit/0a09559e25eb2badcfe390ad0e99756c8ef96f1c))
* **browser:** add LogtoClient constructor ([#160](https://github.com/logto-io/js/issues/160)) ([d738c0b](https://github.com/logto-io/js/commit/d738c0b842476f1ba72e0acd1ee1dd79d0689ce0))
* **browser:** browser end user information getters ([b93ebe4](https://github.com/logto-io/js/commit/b93ebe40c04fc76c365b72761a05a01416e4bee2))
* **browser:** check if sign-in redirect URI has been redirected ([3baabcf](https://github.com/logto-io/js/commit/3baabcff3776ef9be5064870b979a517df4c1fd8))
* **browser:** export js core types from browser SDK ([325cfdf](https://github.com/logto-io/js/commit/325cfdf7dc61202b369d535a91fe71b81b78248c))
* **browser:** handle sign-in callback  ([#181](https://github.com/logto-io/js/issues/181)) ([58a4792](https://github.com/logto-io/js/commit/58a47924923bae27f69db6585322820c634f4688))
* **browser:** sign out ([6e85fac](https://github.com/logto-io/js/commit/6e85facc8d71d1b62e2eb57e1ffa29061fd8e68e))
* **browser:** sign-in session storage ([#175](https://github.com/logto-io/js/issues/175)) ([98120fd](https://github.com/logto-io/js/commit/98120fd69bcdbf5262972adcf5116bb97aab7c50))
* **browser:** signIn ([#170](https://github.com/logto-io/js/issues/170)) ([2418193](https://github.com/logto-io/js/commit/24181931643472318345678ec68b7e874a72fd5a))
* **client:** support node ([#96](https://github.com/logto-io/js/issues/96)) ([367ec03](https://github.com/logto-io/js/commit/367ec036dbe9d4243ca9c4544e8a67dcf31d436b))
* codeVerifier and codeChallenge ([#35](https://github.com/logto-io/js/issues/35)) ([7efe0eb](https://github.com/logto-io/js/commit/7efe0eb2d2e0cc9e543544be77af8dc5c3e10b0d))
* custom scope ([#71](https://github.com/logto-io/js/issues/71)) ([2a48b3d](https://github.com/logto-io/js/commit/2a48b3d5069cc4616d501c622947715621cae358))
* decode token ([#34](https://github.com/logto-io/js/issues/34)) ([42655d6](https://github.com/logto-io/js/commit/42655d6e7cd46c5458e41a62907fdfc719cca4bb))
* discover ([#37](https://github.com/logto-io/js/issues/37)) ([d17912e](https://github.com/logto-io/js/commit/d17912e6ee7a5c9359bf5bea69aa25e53f1b305a))
* express-server ([78b495a](https://github.com/logto-io/js/commit/78b495a115dc5cb78594df866cc557f6f4d32d96))
* getAccessToken ([#65](https://github.com/logto-io/js/issues/65)) ([9480d8b](https://github.com/logto-io/js/commit/9480d8b63e66e8e9cf1c50d3d9bc552e52aa8a7d))
* grantTokenByAuthorizationCode ([#40](https://github.com/logto-io/js/issues/40)) ([eddb25e](https://github.com/logto-io/js/commit/eddb25e26122b5a3e9f8c3ab24b58f7bf6db301c))
* grantTokenByRefreshToken ([#45](https://github.com/logto-io/js/issues/45)) ([34f0081](https://github.com/logto-io/js/commit/34f0081585fd3d1e5d5db97618a5ed072957a01b))
* handle redirect callback ([#64](https://github.com/logto-io/js/issues/64)) ([c7d0b6a](https://github.com/logto-io/js/commit/c7d0b6a53a66d531dfd6c01c5f8b0babb3ae0419))
* isLoginRedirect ([#77](https://github.com/logto-io/js/issues/77)) ([af0aa9f](https://github.com/logto-io/js/commit/af0aa9f308427d393cb8872d8680480aee3f359b))
* **js:** add CodeTokenResponse ([#186](https://github.com/logto-io/js/issues/186)) ([ece931c](https://github.com/logto-io/js/commit/ece931c3556a3fb654127ef258e25c141e27fa7a))
* **js:** add state to loginWithRedirect to prevent csrf attacking ([#94](https://github.com/logto-io/js/issues/94)) ([3d41e08](https://github.com/logto-io/js/commit/3d41e08da84c648d0dbe9926cc5a4f2f6f432a28))
* **js:** core function generateSignOutUri ([0a26ebe](https://github.com/logto-io/js/commit/0a26ebea93d08e559fb81ef930aa0e604b90b24f))
* **js:** decodeIdToken ([#128](https://github.com/logto-io/js/issues/128)) ([973708b](https://github.com/logto-io/js/commit/973708b7f3f518b85591384a6d1392b74ef71ab1))
* **js:** export in index.ts ([#159](https://github.com/logto-io/js/issues/159)) ([423c185](https://github.com/logto-io/js/commit/423c1851e6339a5069559abc564e229aa111529a))
* **js:** fetch access token by authorization code ([1160683](https://github.com/logto-io/js/commit/1160683f2eabde8f988c01cddd829fc480b54b20))
* **js:** fetchOidcConfig ([#138](https://github.com/logto-io/js/issues/138)) ([8555d16](https://github.com/logto-io/js/commit/8555d169e82d7b814b017583ad2f924b3a6ac45d))
* **js:** fetchUserInfo ([#152](https://github.com/logto-io/js/issues/152)) ([e0dca51](https://github.com/logto-io/js/commit/e0dca5153354966470c00d8c23a8066e26fb27e2))
* **js:** generate state, code verifier and code challenge ([#125](https://github.com/logto-io/js/issues/125)) ([9784f3a](https://github.com/logto-io/js/commit/9784f3a97f4d84d9945cd46b8a6a9b93b33b8964))
* **js:** implement fetchTokenByRefreshToken ([4e6600e](https://github.com/logto-io/js/commit/4e6600e6035fb2b849d224c171ca1bc29b34cb3e))
* **js:** refactor fetchTokenByRefreshToken ([#147](https://github.com/logto-io/js/issues/147)) ([f8dbcce](https://github.com/logto-io/js/commit/f8dbcce16ce9af14936807d7eb59e0d7bbde8edd))
* **js:** requester ([#137](https://github.com/logto-io/js/issues/137)) ([c86745b](https://github.com/logto-io/js/commit/c86745bab035543b3d14dc5fe1433e413d3d51f2))
* **js:** revoke ([#153](https://github.com/logto-io/js/issues/153)) ([2e554ca](https://github.com/logto-io/js/commit/2e554ca79b9ec1b140da2a81704d0e65d5a751eb))
* **js:** scopes and generateSignInUri ([#150](https://github.com/logto-io/js/issues/150)) ([c47e3ea](https://github.com/logto-io/js/commit/c47e3ea4a94c35e63e0d77bcc27438c380c657ca))
* **js:** verifyAndParseCodeFromCallbackUri ([#132](https://github.com/logto-io/js/issues/132)) ([7180b03](https://github.com/logto-io/js/commit/7180b031c53161dd3ff77115e1e0e5d3fa73b224))
* **js:** verifyIdToken ([#127](https://github.com/logto-io/js/issues/127)) ([954dc6d](https://github.com/logto-io/js/commit/954dc6d9f046e752f635248bcd87e15cf02fb63e))
* **lint:** add lint-stage to all packages ([1289e3e](https://github.com/logto-io/js/commit/1289e3e11896d4fc68bb465d94d52f7cc4e90064))
* loginWithRedirect and handleCallback ([5629e2a](https://github.com/logto-io/js/commit/5629e2afd04429d88ad5db80b514161da0474a88))
* logout ([#56](https://github.com/logto-io/js/issues/56)) ([3884ab9](https://github.com/logto-io/js/commit/3884ab9523d5821eb5d25a418c6dd10a1937f003))
* logto client ([#53](https://github.com/logto-io/js/issues/53)) ([75b5ed0](https://github.com/logto-io/js/commit/75b5ed0b4eac376406a1c6dca9f3c75246b82de6))
* memory storage ([#52](https://github.com/logto-io/js/issues/52)) ([d2fa92e](https://github.com/logto-io/js/commit/d2fa92ece27db4713ce3597f8b495772bbc065f1))
* node ([1957bf4](https://github.com/logto-io/js/commit/1957bf4c09bba98a8b8272cfb9f8a4d1156cf9a4))
* onAuthStateChange ([#82](https://github.com/logto-io/js/issues/82)) ([e8dda56](https://github.com/logto-io/js/commit/e8dda5632bb4b7ad6e0901154484ab035a699afd))
* **playground:** migrate playground to js repo ([65bc597](https://github.com/logto-io/js/commit/65bc597453fb0f16cc7bd9e329509518ce8e8680))
* protected route ([#84](https://github.com/logto-io/js/issues/84)) ([d28db7c](https://github.com/logto-io/js/commit/d28db7c98fe596a31013bda51645b129b3d0bda9))
* **react-playground:** implement react-playground ([897911d](https://github.com/logto-io/js/commit/897911dcdbd2a574374f0eb5794ac4684ec06859))
* **react-playground:** make encrypted user login info in url invisible ([#109](https://github.com/logto-io/js/issues/109)) ([13df814](https://github.com/logto-io/js/commit/13df8142d8e318a5782ec35d6661f76326b85766))
* **react-sample:** add react sample webpages ([3716789](https://github.com/logto-io/js/commit/3716789b9df75f5a0e593b43cf24a0138315e2ff))
* **react-sample:** init react sample project ([467c76a](https://github.com/logto-io/js/commit/467c76a8ced26cdb8459a729412101a6ad186824))
* **react-sdk:** update react sdk ([951d316](https://github.com/logto-io/js/commit/951d316fc6efae955b0e79a0a7cc8f80bfe91bce))
* **react:** auto handle callback ([#92](https://github.com/logto-io/js/issues/92)) ([58ee454](https://github.com/logto-io/js/commit/58ee45453780edde82d3ff8d8cb2fb00a779a8f9))
* **react:** init provider & hook ([#74](https://github.com/logto-io/js/issues/74)) ([b30e993](https://github.com/logto-io/js/commit/b30e993e3483ebcb340dd318e12e640eddf2360e))
* **react:** react SDK with context provider ([1be502d](https://github.com/logto-io/js/commit/1be502d333c25209be44bd3a34911d3546555d7f))
* redirect and login ([#30](https://github.com/logto-io/js/issues/30)) ([8758507](https://github.com/logto-io/js/commit/87585079fe168749eaaaea24ec01d05936a2abfa))
* requestLogin ([#43](https://github.com/logto-io/js/issues/43)) ([f0abbd3](https://github.com/logto-io/js/commit/f0abbd3f3e500411c131d4afc83374625113abdf))
* storage ([#49](https://github.com/logto-io/js/issues/49)) ([07ae993](https://github.com/logto-io/js/commit/07ae993d781bfb675f6b7d506fc6714a682b4bfd))
* token-set ([#48](https://github.com/logto-io/js/issues/48)) ([2e98b05](https://github.com/logto-io/js/commit/2e98b056d92b93f3fdd3e3588c3f996e715a179d))
* tokenset ([#32](https://github.com/logto-io/js/issues/32)) ([1a919bc](https://github.com/logto-io/js/commit/1a919bcd4a3a8eb903c5dae0c5066c1c4c85049f))
* transaction manager ([#51](https://github.com/logto-io/js/issues/51)) ([9aadf06](https://github.com/logto-io/js/commit/9aadf06a72309fef9abddfe5d410e8d78a3c7971))
* verifyIdToken ([#39](https://github.com/logto-io/js/issues/39)) ([f324ad9](https://github.com/logto-io/js/commit/f324ad962e28159572899a541b0e929279b0f763)), closes [#35](https://github.com/logto-io/js/issues/35)


### Bug Fixes

* `package.json` ([8afd534](https://github.com/logto-io/js/commit/8afd534e5d79db29c9ef1aa55cfa94549ea025b8))
* await generateCodeChallenge ([#63](https://github.com/logto-io/js/issues/63)) ([82f7fe0](https://github.com/logto-io/js/commit/82f7fe0bf4d47ac7d090e39ebe520c89aba5aea6))
* **browser:** getAccessToken saves refreshToken and idToken ([#191](https://github.com/logto-io/js/issues/191)) ([cb768f0](https://github.com/logto-io/js/commit/cb768f0a2b1353dbeab427b04fcd21f932a4b061))
* **browser:** isSignInRedirected should return false when session is empty ([#210](https://github.com/logto-io/js/issues/210)) ([ca4ad2c](https://github.com/logto-io/js/commit/ca4ad2c0f2ab5a723a33b9c3dae2bd76c92f9b43))
* **browser:** should use userinfo_endpoint in fetchUserInfo function ([04caf8d](https://github.com/logto-io/js/commit/04caf8d43af099a15f58d4e7653a453f56733e6d))
* **ci:** fix some dummy code ([53dc7cf](https://github.com/logto-io/js/commit/53dc7cf0a37cfbed5ef34725edebf6a8de7ce144))
* **client:** ci lint fix ([5795db1](https://github.com/logto-io/js/commit/5795db10375351fb53b6495426b83ec2c3112f38))
* **client:** cr fix ([fb8f214](https://github.com/logto-io/js/commit/fb8f2146d0c79cedf008be2daca80c2b490137c6))
* **client:** fix client sdk ([c333ca8](https://github.com/logto-io/js/commit/c333ca81540e3781dc953f5462f85dc77b9b0f1f))
* **client:** fix superstruct validation rule ([b93b9a7](https://github.com/logto-io/js/commit/b93b9a77896d50e66660f6933ca1df23ce4fba55))
* **client:** typings location ([#68](https://github.com/logto-io/js/issues/68)) ([0ee542d](https://github.com/logto-io/js/commit/0ee542dc51cd387303164cb264d216d71c7886b1))
* **client:** wrap window.location.assign ([#101](https://github.com/logto-io/js/issues/101)) ([bddc3eb](https://github.com/logto-io/js/commit/bddc3eb7f98bf23987c296a44eb7beccf8c11c3b))
* **core:** cr fix ([46671a1](https://github.com/logto-io/js/commit/46671a1a126244c5a62e423ecc7f487811bf1ccb))
* export storage ([#61](https://github.com/logto-io/js/issues/61)) ([93bf512](https://github.com/logto-io/js/commit/93bf5127432f87fcdbf175f7cba63bf06bc1b3e0))
* fix npm script typo ([d410522](https://github.com/logto-io/js/commit/d4105227c9ed9db1e0939a0dd11f0e1bb3264096))
* **js:** grant type should be 'authorization_code'  instead of 'code' ([5d416d0](https://github.com/logto-io/js/commit/5d416d0bb0901dc7fd7b79afdb504a1cdf11b901))
* **js:** response_type should be hard-coded as 'code' ([5048ae1](https://github.com/logto-io/js/commit/5048ae152f15a9fd5c2626c5e6c54d8fd327aadb))
* **js:** update lock file ([0536626](https://github.com/logto-io/js/commit/0536626c2c54e531f475baf784aeeae4786c119e))
* **js:** update node-fetch version ([8f012dd](https://github.com/logto-io/js/commit/8f012dd962e234d59a5d2e4f7397e863ee97f02d))
* **plaground:** cr fix ([2b444db](https://github.com/logto-io/js/commit/2b444db8d75414bbab0b871c9f55fa1f5560e942))
* **playgrond:** set webpack performance hint to warning ([2d81d71](https://github.com/logto-io/js/commit/2d81d71089bae979e082abf77be10ef99820555f))
* **playground:** extend package size limit ([c7aa38f](https://github.com/logto-io/js/commit/c7aa38f986dc567c3847d656248de1b7baf05adb))
* **playground:** fix playground jest evn errors ([36f6030](https://github.com/logto-io/js/commit/36f6030b387f92ce8284e7fefd461f0fd486ed2a))
* publish workflow ([#219](https://github.com/logto-io/js/issues/219)) ([1d13dab](https://github.com/logto-io/js/commit/1d13dabfcbea913c5bbcb371dc2b34082f65e604))
* **react-sample:** table style not applied issue ([#217](https://github.com/logto-io/js/issues/217)) ([2a2bf77](https://github.com/logto-io/js/commit/2a2bf779f3364eb5ccea8bddb6a51fdf0369ef2f))
* **react-sdk:** cr fix ([1fe7093](https://github.com/logto-io/js/commit/1fe709356860117ed0e5f9ed79123cb3c17727b9))
* remove useless comments ([#57](https://github.com/logto-io/js/issues/57)) ([21b6f65](https://github.com/logto-io/js/commit/21b6f658ab0a9a382f7404fdaa7b96d4b37a6c1e))
* rm unnecessary console.log in unit tests ([#70](https://github.com/logto-io/js/issues/70)) ([30f6933](https://github.com/logto-io/js/commit/30f6933db66a34253108840d0c1f701440da7623))
* tsc commonjs ([#73](https://github.com/logto-io/js/issues/73)) ([ec14c84](https://github.com/logto-io/js/commit/ec14c84bc974119cd4109fcd761bdea6b6a65d1f))
* **ut:** update jest coverage configs ([b10d84e](https://github.com/logto-io/js/commit/b10d84edbf6c1639bfaa4dbb9fa41f4a10543bde))


### Code Refactoring

* **js:** initialize js/js package ([#122](https://github.com/logto-io/js/issues/122)) ([07322cb](https://github.com/logto-io/js/commit/07322cb02dd461cc69dc1f7bf815c649e91046da))
