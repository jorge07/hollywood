# Value Objects

From Wikipedia:

>In computer science, a value object is a small object that represents a simple entity whose equality is not based on **identity**.
I.E. two value objects are equal when they have the same value, not necessarily being the same object

**Identity**, they key concept. Value Objects doesn't have conceptual **Identity**: **Price**, **Password**, **DateTime**... Those examples doesn't have **Identity**.

Means:
*Price(5)* instance and another one *Price(5)* instance, are **equal** even living as different instances.

Value Objects will encapsulate his own rules inside, enforcing encapsulation.

I.E. **Password** Rules

- At least 6 characters
- At least 1 number
- No consecutive numbers
- No more than 120 characters
- Needs to be stored in a secured way.

Translating this into code:

```typescript
class Password {
    public readonly hashedPassword: string;
    constructor(plainPassword: string) {
        Password.atLeast6Characters(plainPassword);
        Password.atLeast6Characters(plainPassword);
        Password.atLeast6Characters(plainPassword);
        Password.atLeast6Characters(plainPassword);
        this.hashedPassword = hash(plainPassword)
    }
    private atLeast6Characters(plainPassword: string): void {...}
    private atLeast1Number(plainPassword: string): void {...}
    private noConsecutiveCumbers(plainPassword: string): void {...}
    private noMoreThan120Characters(plainPassword: string): void {...}
}
```

# Identity

Some Value Objects may be the Identity of another Entity Object. 
A **Customer** entity will have a *customerID*, that can't be nullable but a valid uuid. In that case we will have a **class CustomerID** containing inside the business rules. 
*CustomerID* still a value object, it just represents the identity of another Entity.

> Next: [**Entities**](concepts/entities.md)
