import Layout from '@theme/Layout';
import Comparison from '@site/src/components/Comparison';

export default function Home(): JSX.Element {
  const content = (
    <>
      <p>Helm has long been a popular tool for managing Kubernetes applications, simplifying deployments through the use of charts. However, as Kubernetes environments grow more complex, some of Helm's limitations become apparent. Koreo offers a different approach, one that moves beyond basic string templating. Instead, it leverages programmable workflows and structured configuration to provide greater flexibility, control, and testability for modern Kubernetes configuration.</p>
      <h3>Configuration Management</h3>
      <p>Helm uses templating (Go templates), which can become complex and difficult to manage for intricate deployments. Once your Helm charts are beyond simple value substitutions and contain control-flow logic, it can become challenging to maintain and evolve them. Koreo employs a structured, data-driven approach to configuration, allowing you to combine configurations from multiple sources and apply business logic. This makes it easier to manage complex configurations and ensure consistency across environments. Koreo's testable layered approach can be easier to reason about for situations with more complicated configuration. Still, Helm may be more suitable for simpler use cases where Koreo's added overhead is unwarranted.</p>
      <h3>Workflow Orchestration</h3>
      <p>Helm's workflow capabilities are limited.  While you can script around Helm, it lacks a built-in workflow engine. Koreo provides first-class, programmable workflows, enabling you to define complex, multi-step processes for managing and orchestrating your Kubernetes resources. This allows for greater automation and control over deployments.</p>
      <h3>Resource Materialization</h3>
      <p>Helm installs pre-packaged charts and relies on static values files, which can limit flexibility and introduces complexity for situations that require more than simple value substitution. Koreo's dynamic resource materialization allows you to combine base templates, overlays, and custom functions to create resources tailored to your specific needs. With this model, you can orchestrate entire resource workflows, not just templatize resources.</p>
      <h3>Target Audience</h3>
      <p>Helm is often a good starting point for simpler deployments and application packaging. There is also a large ecosystem of pre-packaged Helm charts available. Koreo is designed for teams managing more complex Kubernetes environments and requiring robust workflow orchestration, testing, and configuration management capabilities. It's less of a point solution for packaging applications and more of a toolkit for building entire application platforms. However, Helm and Koreo are not mutually exclusive tools. In some cases, it might make sense to use Koreo to manage your workflow combined with Helm for application packaging.</p>
    </>
  );

  const whenToChoose = (
    <>
      <h3>When to choose Helm</h3>
      <ul>
        <li>You are managing simpler deployments</li>
        <li>You primarily need a tool for packaging and deploying applications with minimal configuration differences</li>
        <li>Your charts consist mostly of simple value substitutions</li>
        <li>You are deploying applications with existing charts</li>
      </ul>
      <h3>When to choose Koreo</h3>
      <ul>
        <li>Your templates are beyond simple value substitutions and contain control-flow logic</li>
        <li>You need to manage complex, multi-step deployments</li>
        <li>You require a flexible workflow engine for Kubernetes</li>
        <li>You need to combine configurations from multiple sources or apply business logic</li>
        <li>You are building and managing complex Kubernetes platforms</li>
      </ul>
      <br />
    </>
  );

  return (
    <Layout
      title="Helm"
      description="Solutions for Kubernetes configuration management">
      <main>
        <Comparison
          name="Helm"
          subtitle="Solutions for Kubernetes configuration management"
          content={content}
          imageSrc="/img/compare/helm.png"
          additionalContent={whenToChoose}
        /> 
      </main>
    </Layout> 
  );
}

