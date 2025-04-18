import Layout from '@theme/Layout';
import Comparison from '@site/src/components/Comparison';

export default function Home(): JSX.Element {
  const content = (
    <>
      <p>Kube Resource Orchestrator, or kro, offers a way to define and manage groups of Kubernetes resources and expose them through custom APIs using ResourceGraphDefinitions (RGDs). In this sense, an RGD functions somewhat analogously to a Helm chart, simplifying the deployment of related application components. kro is centered around creating and managing a predefined set of resources within an RGD, which can introduce limitations when needing to interact with existing cluster resources or implement more sophisticated resource orchestration. Koreo, on the other hand, is designed to provide a flexible and extensible platform engineering <em>toolkit</em>. It enables you to program Kubernetes controllers using powerful primitives like ResourceFunctions and ValueFunctions, offering a unified approach to structured configuration and dynamic workflow orchestration within Kubernetes.</p>
      <h3>Configuration Management</h3>
      <p>kro does not provide a dedicated configuration management solution. Instead, users might leverage an external tool such as Kustomize to manage the configuration of resources within RGDs. Koreo offers a unified configuration management system with testing as a first-class concern, allowing you to define base configurations, apply overlays, and perform targeted patches to build up resource definitions. This approach to configuration management enables the decomposition of configurations into reusable and testable components, facilitating management by specialized teams such as SRE, security, or compliance.</p>
      <h3>Workflow Orchestration</h3>
      <p>kro is centered around managing the lifecycle of the resources <em>within</em> an RGD. Its controller-driven model and use of CEL expressions allows you to pass the values from one RGD resource to another, and kro will properly manage the order in which resources are created. However, it lacks a built-in workflow engine for orchestrating complex processes, mapping values between resources which exist <em>outside</em> the scope of an RGD, or reading values from other resources. Koreo also employs a controller-based model and CEL expressions to provide programmable workflows, but it goes further by providing rich control-flow primitives such as conditionals, switch statements, and for loops. This enables you to define intricate orchestration logic and seamlessly pass data and values between <em>any</em> Kubernetes resources in your cluster.</p>
      <h3>Resource Materialization</h3>
      <p>An RGD defines the resources kro should materialize. It specifies static resource templates (where <em>values</em> may be dynamic based on CEL expressions), the dependencies between resources, conditions for resource inclusion, and resource readiness criteria. kro does not interact with or read values from resources outside of the RGD. Koreo's dynamic resource materialization allows you to combine base templates, overlays, and functions to create resources tailored to your specific needs, including reading from and modifying existing resources based on dynamic inputs and outputs from workflow steps.</p>
      <h3>Target Audience</h3>
      <p>kro is a great option for users who want a straightforward way to package and manage the lifecycle of a defined set of Kubernetes resources and are looking for an alternative to Helm. Koreo is designed for teams managing more complex Kubernetes environments and requiring robust workflow orchestration and dynamic configuration.</p>
    </>
  );

  const whenToChoose = (
    <>
      <h3>When to choose kro</h3>
      <ul>
        <li>You need a simple way to group and manage the lifecycle of a specific set of Kubernetes resources</li>
        <li>Your use case doesn't require interacting with existing resources or consuming their values</li>
        <li>Your resource configurations are relatively simple or have a limited number of variations</li>
        <li>Your orchestration needs are limited to managing the resources within a defined RGD</li>
        <li>Your use case does not warrant the initial upfront complexity of Koreo</li>
      </ul>
      <h3>When to choose Koreo</h3>
      <ul>
        <li>You need to orchestrate complex, multi-step processes involving arbitrary resources in your cluster</li>
        <li>You require a flexible workflow engine with control-flow logic to map values and dependencies between different resources</li>
        <li>You need to manage highly complex configurations with numerous variations</li>
        <li>Dynamic configuration based on various inputs is essential</li>
        <li>Built-in testing of your orchestration and configuration logic is important</li>
        <li>You are building and managing complex Kubernetes platforms with dynamic configuration needs</li>
      </ul>
      <br />
    </>
  );

  return (
    <Layout
      title="kro"
      description="Solutions for Kubernetes resource orchestration">
      <main>
        <Comparison
          name="kro"
          subtitle="Solutions for Kubernetes resource orchestration"
          content={content}
          imageSrc="/img/compare/kro.png"
          additionalContent={whenToChoose}
        /> 
      </main>
    </Layout> 
  );
}

