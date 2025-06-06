---
id: overview
title: Koreo Overview
sidebar_position: 1
---

Koreo is a platform engineering toolkit for Kubernetes. It provides a new
approach to Kubernetes configuration management and resource orchestration,
empowering developers and platform teams through programmable workflows and
structured data. These programmable workflows enable you to implement automated
multi-step processes. This could be something as simple as automating a
deployment or something as complex as automating entire internal developer
platforms, cloud environments, or infrastructure control planes.

Koreo provides a means for programming or orchestrating Kubernetes controllers.
This could be Kubernetes "built-in" controllers, such as Deployment or Job
controllers, "off-the-shelf" controllers, such as GCP's
[Config Connector](https://cloud.google.com/config-connector/docs/overview) or
AWS's [ACK](https://aws-controllers-k8s.github.io/community/docs/community/overview/),
or custom controllers you've built yourself. Koreo enables you to build
automations around these controllers or compose them into cohesive platforms.

In essence, Koreo serves as a "meta-controller programming language" and
runtime because it provides primitives for managing other controllers. It's
like programming—or _choreographing_—Kubernetes controllers and control loops
in order to build automated processes. 

Additionally, Koreo provides a means for building infrastructure abstractions
because it allows the encapsulation of complex processes and automation into
simple, developer-friendly APIs. This is why we call it a "platform engineering
toolkit"—it allows platform teams to build powerful abstractions.

## Background and Why

The original motivation for creating Koreo was configuring modern, dynamic
cloud infrastructure. The initial use case, in particular, was configuring and
managing scalable, ephemeral, serverless systems. Koreo is the engine that
powers [Konfigurate](https://konfigurate.com), a batteries-included developer
platform for startups and scaleups.

Many existing Infrastructure as Code (IaC) tools play very poorly, or are even
dangerous to use, with dynamic infrastructure. Most infrastructure is
dynamic–we just like to imagine that it is static. ­In practice, services
crash, restart, need to scale, are rebalanced, and so forth. Infrastructure
might be changed via a UI or CLI and the updates not made within the IaC,
leading to drift. Ideally, our systems for managing infrastructure are able to
perform the correct actions under changing conditions.

There is a pattern for implementing such systems: [Kubernetes
controllers](https://kubernetes.io/docs/concepts/architecture/controller/). The
underlying concept is using a control loop to continually pull resources closer
to the specified configuration. Effectively, it is the automation of what a
human should do: watch the state of the system, and if indicated, take some
actions to alter the system state, moving it closer to the desired state.

Tools like Crossplane and kro offer an evolution of IaC that take a
controller-based approach, but they introduce their own challenges and
limitations. In particular, we really need the ability to compose arbitrary
Kubernetes resources and controllers, not just specific provider APIs or
statically defined resources. What if we could treat _anything_ in Kubernetes
as a referenceable object capable of acting as the input or output to an
automated workflow, and without the need for building tons of CRDs or custom
operators? Additionally, it's critical that resources can be namespaced rather
than cluster-scoped to support multi-tenant environments and that the
corresponding infrastructure can live in cloud projects or accounts separate
from where the control plane itself lives.

The second observation was that getting any one resource (meaning systems,
services, or APIs) working once is usually straightforward. Integrating
_multiple_ resources together is much harder. Making many resources work
together in a way that is repeatable and pleasant to interact with is very
hard. In modern software development, the integration of systems is the core
challenge platform engineering teams face. The Koreo team has a background of
applying a product engineering mindset to infrastructure engineering problems,
and we've taken that approach to providing tools for platform engineering
teams.

Finally, tools like Helm and Kustomize, while useful for simpler
configurations, become unwieldy when dealing with the complexity of modern
Kubernetes deployments, going beyond simple value substitution or static
patching. A more structured approach is needed. Koreo is a data structure
orchestration engine. Although it’s primarily designed for Kubernetes resource
orchestration, Koreo's core functionality can orchestrate and manage virtually
any structured data.

Koreo aims to provide a more robust, programmable, and scalable solution for
these modern infrastructure challenges.

## Core Concepts

Koreo is built around two core conceptual primitives:
[Workflows](../workflow.md) and [Functions](./glossary.md#function). An
additional primitive, [FunctionTest](/docs/function-test.md), sets Koreo
apart by making testing a first-class construct.

On their own, [Functions](./glossary.md#function) do nothing, but they are
the foundation of the system. They define component-specific control loops in a
well-structured but powerful way.

### Functions

There are two types of Functions: [ValueFunctions](../value-function.md)
and [ResourceFunctions](../resource-function.md).

Functions define a control loop that follows a specific structure.
ValueFunctions have the simplest structure: precondition checks, input data
transformations (computations), and a returned result. ResourceFunctions
follow the same pattern, except they specify an external resource they will
interact with and the CRUD actions that should be taken to make that resource
look as it should.

ValueFunctions are "pure" in the functional programming sense; they are
side-effect free. These are designed to perform computations like validating
inputs or reshaping data structures.

ResourceFunctions interact with the Kubernetes API. They support reading,
creating, updating, and deleting resources. They offer support for validating
inputs, specifying rules for how to manage its resource, and extracting values
for usage by other Functions.

Developers may optionally load static configuration from
[ResourceTemplates](../resource-template.md). ResourceFunctions may
dynamically compute the ResourceTemplate to be loaded at runtime. This provides
a simple, but controlled, means of offering different base configurations to
your end consumers.

Both Function types may return values for usage within other Functions or to be
surfaced as [state](./glossary.md#state). This allows for the composition
of robust, dynamic resource configurations.

### Workflows

[Workflows](../workflow.md) define the relationship between Functions and other
Workflows (together known as [Logic](./glossary.md#logic)). Their job is to map,
and possibly transform, the outputs from one piece of Logic into another's
inputs, then return an overall result.

Workflows specify a trigger resource, the Logic to be run, how they should be
run, and map values between the Logic of each step. The Logic to be run is
specified within "steps". Each Workflow step may provide input values to the
Logic it references and may map return values from previous steps into another
step's inputs. The input mappings are analyzed to automatically determine the
execution order for Logic, and the steps may run concurrently where possible.
Steps may specify conditions and state to be surfaced into the trigger
resource's status.

Workflows can also be _nested_ as sub-Workflows to construct composable
processes.

### FunctionTest

Often validating systems is difficult. To help ensure systems are stable and
predictable, Koreo includes a first-class contract-testing construct:
[FunctionTest](/docs/function-test.md). Using FunctionTest, a developer can
easily test happy-path sequences, test "variant" conditions, and error cases
throughout the reconcile loops. This allows for robust testing of error
conditions, detection of loops, and detection of accidental behavioral changes.

## Programming Model

Koreo is effectively a structured, functional programming language designed for
building and running interacting control loops. It is designed to make creating
asynchronous, event-driven systems predictable, reliable, and maintainable on
top of Kubernetes.

It is crucial to remember the execution context:
[control loops](./glossary.md#control-loop). Workflows are run
periodically, either in response to resource changes or based on a timer. That
means a Workflow's Functions will be run repeatedly (over time). ValueFunctions
are pure, running them with the same inputs should always produce the same
outputs. To help ensure stability and ease of programming, side effects are
isolated to ResourceFunctions. The job of a ResourceFunction is to ensure the
specification of the resource it manages matches the expected specification.
The resources ResourceFunctions manage are typically controlled (or used) by
another controller, and hence ResourceFunction acts as the interface to
external systems.

### Hot Reloading

Koreo supports restart-free, hot reloading of Workflows, Functions,
ResourceTemplates, and FunctionTests. This enables rapid development and
testing of your systems without complex build/deploy processes.

### Namespace Priority

Koreo allows for loading Workflows and Functions from namespaces in priority
order. This makes altering behavior for select teams or providing a "release
channel" more straightforward.

Combined with hot reloading, this allows for development controllers to monitor
testing/development namespaces to test new versions of your Workflow and
Function code.

### Versioning

Versioning may be leveraged via convention, and is strongly encouraged.
Versioning enables resources to be evolved over time without breaking existing
users.
