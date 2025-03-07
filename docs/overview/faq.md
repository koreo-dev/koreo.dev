---
id: faq
title: FAQ
sidebar_position: 2
---

## What is Koreo?

Koreo is a platform engineering toolkit that facilitates building automations
within Kubernetes. It provides a powerful solution for configuration
management, resource orchestration, and testing, enabling platform teams to
build robust, self-service platforms for their developers. Koreo uses
composable [Workflows](../workflow.md) and [Functions](./glossary#function),
inspired by functional programming, to manage Kubernetes resources
programmatically. We call Koreo a "meta-controller programming language" and
runtime because it provides a programming language for orchestrating Kubernetes
controllers. This could be Kubernetes "built-in" controllers, such as
Deployment or Job controllers, "off-the-shelf" controllers, such as GCP's
[Config Connector](https://cloud.google.com/config-connector/docs/overview) or
AWS's [ACK](https://aws-controllers-k8s.github.io/community/docs/community/overview/),
or custom controllers you've built yourself. Koreo enables you to build
automations around these controllers or compose them into cohesive platforms.

Additionally, Koreo provides a means for building infrastructure abstractions
because it allows the encapsulation of complex processes and automation into
simple, developer-friendly APIs. This is why we call it a "platform engineering
toolkit"—it allows platform teams to build powerful abstractions.

Read the [Koreo Overview](./overview.md) for more background on the project.

## What problems does Koreo solve?

Koreo addresses the challenges of building and managing complex
Kubernetes-based platforms or control planes, including managing resources
_outside_ of Kubernetes itself through the use of operators. It simplifies
configuration management, automates complex deployments, helps to ensure
consistency and compliance for infrastructure resource configuration, and
provides a streamlined way to build and test Kubernetes platform operations. It
helps teams move beyond basic templating and scripting to a more robust,
programmable, and scalable approach.

Koreo was born out of the need to effectively configure and manage modern,
dynamic cloud infrastructure, particularly the challenges associated with
scalable, ephemeral, serverless systems. Traditional Infrastructure as Code
(IaC) tools often struggle with the dynamic nature of these environments. While
tools like Crossplane offer an evolution of IaC that is controller-based, they
introduce their own complexities and limitations. For example, requiring
resources to be cluster-scoped rather than namespaced or requiring
infrastructure to live in the same cloud project or account as the control
plane itself. Furthermore, tools like Helm and Kustomize, while useful for
simpler configurations, become unwieldy when dealing with the complexity of
modern Kubernetes deployments, going beyond simple value substitution or static
patching. Koreo aims to provide a more robust, programmable, and scalable
solution for these modern infrastructure challenges. It is the engine that
powers [Konfigurate](https://konfigurate.com), a batteries-included developer
platform for startups and scaleups.

Read [Background and Why](./overview.md#background-and-why) for more on the
motivation behind Koreo.

## Who is Koreo for?

Koreo is designed for platform engineering teams, DevOps engineers, and anyone
responsible for building and managing Kubernetes-based platforms, control
planes, or automations. It empowers them to create self-service platforms for
developers, automate complex infrastructure operations, and enforce
organizational policies.

## How does Koreo compare to Helm/Kustomize/Argo Workflows/Crossplane?

In short, Koreo builds on some of the strengths of these tools while addressing
their limitations. It provides a more unified and programmable approach to
Kubernetes platform engineering, including advanced workflow orchestration,
dynamic resource materialization, and built-in testing. Note that some of these
tools can be used in combination and are not mutually exclusive. For instance,
Koreo could be used in conjunction with Helm or Kustomize. Similarly, it could
be used to manage the configuration for Argo or Crossplane resources.

For more on each, see the comparison pages:

- [Comparing Helm](/compare/helm)
- [Comparing Kustomize](/compare/kustomize)
- [Comparing Argo Workflows](/compare/argo)
- [Comparing Crossplane](/compare/crossplane)

## What is the learning curve for Koreo?

Koreo's approach to configuration and resource management is very much inspired
by functional programming principles. Koreo itself _is_ a programming language
for resource orchestration and configuration. While it is conceptually simple
at a high level, introducing only a handful of concepts like [Workflows](./glossary.md#workflow)
and [Functions](./glossary.md#function), this new approach can be a large
paradigm shift when coming from conventional tools like Helm or Terraform.

The learning curve will also depend on your existing Kubernetes experience. For
configuration management use cases that don't warrant the flexibility and
capabilities of Koreo, tools like Helm or Kustomize can make more sense. Koreo
is more intended for advanced use cases, such as building internal developer
platforms, control planes, or complex automation. It will scale with complexity
better than these other tools, but there is some initial upfront complexity
when using Koreo.

## How does Koreo's configuration management work?

Koreo is a data structure orchestration engine. Although it's primarily
designed for Kubernetes resource orchestration, Koreo's core functionality can
orchestrate and manage virtually any structured data. What this means is that
Koreo manages Kubernetes configurations as structured data, not just strings or
static templates. This allows you to easily validate, transform, and combine
configurations from multiple sources in a predictable and manageable way. You
can use base templates, overlays, and patches, and even write custom functions
to generate parts of your configurations dynamically or apply business logic.

## What are Koreo Workflows?

Koreo Workflows are programmable blueprints for your Kubernetes platform
operations. They define the steps needed to achieve a specific outcome, such
as deploying an application or provisioning infrastructure. Workflows can
incorporate conditional logic, loops, and error handling for dynamic and robust
automation.

Read more about Workflows [here](../workflow.md).

## What are Koreo Functions?

Koreo Functions are reusable building blocks within Workflows. They encapsulate
specific logic for tasks like data transformation, API interaction, or resource
creation. There are two types of Functions,
[ValueFunctions](../value-function.md), which are pure functions used to shape
data or apply business logic, and [ResourceFunctions](../resource-function.md),
which correspond to a managed Kubernetes resource.
