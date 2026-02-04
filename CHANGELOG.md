# [6.0.0](https://github.com/jorge07/hollywood/compare/v5.0.4...v6.0.0) (2026-02-04)


### Bug Fixes

* **ci:** correct GH_TOKEN secret name typo in release workflow ([e110ce0](https://github.com/jorge07/hollywood/commit/e110ce0e5473b119a6170ac10ba440f83616e9d8))
* **ci:** use GH_TOKEN for checkout to enable push ([b9ee1f6](https://github.com/jorge07/hollywood/commit/b9ee1f69bde174e2ef59fb5a65ae09e10220c283))
* **ci:** use HTTPS for repository URL in package.json ([32da0b6](https://github.com/jorge07/hollywood/commit/32da0b61309ded76a94ff17063b9e463700c27d3))
* **deps:** resolve picomatch peer dependency conflict ([3131874](https://github.com/jorge07/hollywood/commit/31318746274204935f7cfe6b70949906479977ce))
* resolve lint errors in snapshot rehydration ([e897099](https://github.com/jorge07/hollywood/commit/e89709931887e6075a69ab7289a2e16298d76ce6))
* **test:** ignore occurredAt in Scenario event comparison ([95cc8a0](https://github.com/jorge07/hollywood/commit/95cc8a03dfa92266eb6f09e4618ae277af0454ae))


### Features

* implement dead letter queue for failed events ([a2e15eb](https://github.com/jorge07/hollywood/commit/a2e15ebfab26a3646c157b91ef47579d4a325bd6))
* implement event versioning and upcasting ([a82fc6a](https://github.com/jorge07/hollywood/commit/a82fc6a7b2dd59c58824d061b59eee16e71d29ad))
* implement idempotency keys for duplicate prevention ([e2811a4](https://github.com/jorge07/hollywood/commit/e2811a42382f3ea89873dadd336816a360e0fbf0))
* implement optimistic locking for concurrency control ([9251a65](https://github.com/jorge07/hollywood/commit/9251a6593d6dfbfb01c6c14d071cf0ce448502a0))
* implement projection rebuild capability ([fc8f0d3](https://github.com/jorge07/hollywood/commit/fc8f0d370d26aacf89603bcd616ea4dd3863f8ff))
* implement saga/process manager support ([465a565](https://github.com/jorge07/hollywood/commit/465a565967487625a8a3fc5c417d155aabe8bbcd))
* **v6-beta:** modernize framework with bug fixes, type safety, and new patterns ([6b0354a](https://github.com/jorge07/hollywood/commit/6b0354a43eff70af75240d86646e1d466329aa62))
* **v6:** DDD architecture improvements and DevEx enhancements ([0ca24f9](https://github.com/jorge07/hollywood/commit/0ca24f9a3d98f24d1678af17f6b541d768be9feb))


### BREAKING CHANGES

* **v6:** - AggregateRoot now requires Identity instead of string
- Repository.load() accepts Identity instead of string
- DomainEvent interface now requires aggregateId and occurredAt fields
- Removed legacy apply* reflection pattern (use registerHandler only)
- Removed AggregateRootId type alias

Domain Layer:
- Add ValueObject<T> base class with deep equality semantics
- Add Identity value object with UUID validation
- Add Entity<TId> base class with identity-based equality
- Add DomainService base class for cross-aggregate operations
- Add ensure() and ensureNotNull() invariant helpers to EventSourcedAggregateRoot
- Fix Object.assign snapshot restoration with safe rehydration pattern
- Strengthen DomainEvent typing with required fields

Application Layer:
- Add startup validation for missing @autowiring decorator
- Improve MissingAutowiringAnnotationException with fix instructions
- Extract IEventBus interface for proper composition

Infrastructure Layer:
- Move Repository from Domain to EventSourcing layer (fixes dependency violation)
- Update EventStore to use Identity for aggregate IDs

Framework Layer:
- ModuleContext now accepts object literals for services (not just Map)
- Maintain backward compatibility with Map syntax

Testing:
- Export Testing module with Scenario class and test helpers
- Add createTestEventStore, createTestRepository, createTestKernel utilities
- Add comprehensive tests for all new features (371 tests passing)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

## [5.0.4](http://github.com/jorge07/hollywood/compare/v5.0.3...v5.0.4) (2022-03-11)


### Bug Fixes

* **ci:** install modules before release ([9707ccd](http://github.com/jorge07/hollywood/commit/9707ccde25ef952dcd9f89b483e2d44e5b990e43))

## [5.0.3](http://github.com/jorge07/hollywood/compare/v5.0.2...v5.0.3) (2022-03-10)


### Bug Fixes

* **ci:** add npm publish ([b140f7a](http://github.com/jorge07/hollywood/commit/b140f7a5ca776c985fe1e7d721ae43cda5b90afe))
* **ci:** pass npm token to github actions ([88bbd8b](http://github.com/jorge07/hollywood/commit/88bbd8b6dbde6b72cd1b80c3864ea6fa92fafff5))

# 1.0.0 (2022-02-12)


### Features

* **ci:** automated releases workflow ([7b77f02](http://github.com/jorge07/hollywood/commit/7b77f0285b76f00fe6609384fa7b8041634c76ff))
