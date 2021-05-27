# Aggregate Roots

From Wikipedia:

> The aggregate root is responsible for checking the consistency of changes in the aggregate. Objects outside the aggregate are allowed to hold references to the root but not to any other object of the aggregate. 

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

Following the same example as in the [**Aggregate**](concepts/aggregates.md) the **Glasses** entity will act as **AggregateRoot**.

From the outside, only **Glasses** entity can change the *Reviews*, give you the total score, etc... While other bits of logic are encapsulated in different entities and value objects in the aggregate.

> Next: [**Events**](concepts/events.md)
