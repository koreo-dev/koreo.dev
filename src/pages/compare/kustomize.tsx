import Layout from '@theme/Layout';
import Comparison from '@site/src/components/Comparison';

export default function Home(): JSX.Element {
  const content = (
    <>
      <p>Kustomize has become a popular tool for managing Kubernetes configurations, offering a declarative way to customize base manifests through overlays and patches. However, as deployments grow in complexity, Kustomize's reliance on static overlays can become cumbersome and limiting. Koreo provides a more dynamic and programmatic approach, combining structured configuration with powerful workflows and built-in testing.</p>
      <h3>Configuration Management</h3>
      <p>Kustomize uses overlays and patches to modify base manifests. This approach becomes difficult to manage for configurations with many variations and particularly when there is a "matrix" type need—such as environments or regions. Inspired by Kustomize, Koreo uses a structured, data-driven approach, allowing you to combine configuration overlays from multiple sources, apply business logic, and declaratively build complex configurations more effectively with less duplication.</p>
      <h3>Workflow Orchestration</h3>
      <p>Kustomize lacks a built-in workflow engine. While you can chain Kustomize commands, it doesn't provide the ability to map values from one resource into another or easily set arbitrary resource values programmatically. This is not a problem for some use cases, but for orchestrating arbitrary resources it can be prohibitive. Koreo offers first-class, programmable workflows enabling you to define complex, multi-step processes for managing your Kubernetes resources and mapping values between them.</p>
      <h3>Resource Materialization</h3>
      <p>Kustomize generates Kubernetes manifests by applying static overlays. Koreo's dynamic resource materialization allows you to combine base templates, overlays, and functions to create resources tailored to your specific needs, providing greater flexibility and control.</p>
      <h3>Target Audience</h3>
      <p>Kustomize is a good choice for managing simpler configurations and applying variations to base manifests. Koreo is designed for teams managing complex Kubernetes environments and requiring robust workflow orchestration, dynamic configuration, and built-in testing. However, the two tools are not mutually exclusive. In some cases it can make sense to use Kustomize in <em>combination</em> with Koreo!</p>
    </>
  );

  const whenToChoose = (
    <>
      <h3>When to choose Kustomize</h3>
      <ul>
        <li>You are managing simpler configurations with a limited number of variations</li>
        <li>You primarily need a tool for applying overlays and patches to base manifests</li>
        <li>Your configuration variations are static values and do not rely on computed values or business logic</li>
      </ul>
      <h3>When to choose Koreo</h3>
      <ul>
        <li>You need to map arbitrary values from one resource to another or you would like to flatten your Kustomize overlay hierarchy and instead optionally apply overlays</li>
        <li>You need to manage highly complex configurations with numerous variations</li>
        <li>You require a robust workflow engine for Kubernetes deployments</li>
        <li>Dynamic configuration based on various inputs is essential</li>
        <li>You are building and managing complex Kubernetes platforms</li>
      </ul>
      <br />
    </>
  );

  return (
    <Layout
      title="Kustomize"
      description="Solutions for Kubernetes configuration management">
      <main>
        <Comparison
          name="Kustomize"
          subtitle="Solutions for Kubernetes configuration management"
          content={content}
          imageSrc="/img/compare/kustomize.png"
          additionalContent={whenToChoose}
        /> 
      </main>
    </Layout> 
  );
}

