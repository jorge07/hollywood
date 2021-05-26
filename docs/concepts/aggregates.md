# Aggregates

From Wikipedia:

> A group of objects that are bound together by a root entity: the aggregate root. Objects outside the aggregate are allowed to hold references to the root but not to any other object of the aggregate. The aggregate root is responsible for checking the consistency of changes in the aggregate.

Example:

In an Optic, glasses are the main product. Those glasses are from different brands and types and each one of those glasses are uniquely identified.
The glasses are reviewed, so they can be promoted base on the final score given by the experts.

```typescript
type GlassesID = string;
type GlassesName = string;
type Brand = string;

class GlassesType {
    private readonly types = {
        FAKE: 3,
        SUN: 2,
        SAFETY: 1,
        NORMAL: 0,
    };

    public readonly value: string;

    constructor(type: string) {
        this.validOfThrow(type);
        this.value = type;
    }

    private static validOfThrow(type: string): void {
        if (!Object.keys(this.types).contains(type)) {
            throw new Error(`Invalid type ${type}`);
        }
    }
}

class Score {
    constructor(public readonly value: number) {
        // Some validation
        // Not negative
        // Between 0-10
    }
}

class Review {
    constructor(
        public readonly reviewId: ReviewID,
        public readonly score: Score,
    ) {
    }
}

class Glasses {
    public static create(
        glassesId: GlassesID,
        name: GlassesName,
        brand: Brand,
        type: GlassesType,
        reviews: Array<Review>,
    ): Customer {
        return new Glasses(customerId, email, password, type, reviews);
    }

    public addReview(review: Review): void {
        this.reviews.push(review);
    }

    public score(): Number {
        if (this.reviews && !this.reviews.length) {
            return 0;
        }
        
        return this.reviews.reduce((total: number, currentValue: Review) => {
            return total + currentValue.score.value;
        }) / this.reviews.length;
    }

    private constructor(
        public readonly glassesId: GlassesID,
        public readonly name: GlassesName,
        public readonly brand: Brand,
        public readonly type: GlassesType,
        public readonly reviews: Array<Review>
    ) {
    }
}
```

In the above example, you can see here **Glasses** is where all this conglomerate converges.
Not only, following the S of SOLID, **Glasses** will be the only entrypoint for modifications to this system, making it the [**AggregateRoot**](concepts/aggregate-root.md) of this **Aggregate** system.

> Next: [**AggregateRoot**](concepts/aggregate-root.md)
