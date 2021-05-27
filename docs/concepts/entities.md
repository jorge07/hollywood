# Entities

From Wikipedia:

> An object that is not defined by its attributes, but rather by a thread of continuity and its identity.

An Entity is different from a Value Object mainly because an Entity has an **Identity** while a Value Object does not.

Each `Review` in Amazon is unique:

```typescript

class Review {
    constructor(
        public readonly reviewId: ReviewID,
        public readonly score: Score,
    ) {
    }
    // Some logic here
}

```

**Review** has **Identity** and that's the reason why is considered an entity and not a value object.

Next: [**Aggregates**](concepts/aggregates.md)
