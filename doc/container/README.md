# Hollywood-js

Hollywood-js is a Framework for building very modular and high scalable server side applications following CQRS (Command Query Responsibility Segregation) and enforcing IoC.

It provides a Bounded Context oriented architecture, enforcing isolation and event driven communication between them.
Hollywood-js it's strongly CQRS structured, allowing you to define or not a DDD / Clean Architecture project.

Includes advanced Event Sourcing capabilities like Event Store abstractions, Event Store Snapshots, Projections and Event Bus (Listeners and Subscribers).

# Why 

Real world requirements. I needed something as less invasive in my domain as possible. But at the same time powerful and flexible enough.
I've tried other CQRS packages, and the middleware support was very rare. At some point decided to try my own why base on other frameworks & libs from other languages I used in the past like symfony and broadway.

