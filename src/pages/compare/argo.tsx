import Layout from '@theme/Layout';
import Comparison from '@site/src/components/Comparison';

export default function Home(): JSX.Element {
  const content = (
    <>
      <p>Argo Workflows is a powerful tool for orchestrating the execution of containerized workloads on Kubernetes. It's great at managing complex, container-centric workflows. Koreo is a data structure orchestration engine centered around Kubernetes. It's designed specifically for building and operating Kubernetes-based platforms, focusing on configuration-driven workflows and resource lifecycle management. In a sense, Koreo is a meta-controller programming language used to orchestrate Kubernetes control loops.</p>
      <h3>Configuration Management</h3>
      <p>Argo is not intended as a configuration management solution. Instead, you might use a tool such as Helm, Kustomize, or Koreo to manage configuration for Argo Workflows. Koreo provides an integrated solution for configuration management and orchestration since it is designed specifically <em>for</em> orchestrating resource configuration.</p>
      <h3>Workflow Orchestration</h3>
      <p>Argo Workflows are designed to allow you to orchestrate the execution of containerized workloads where each step in the workflow is a container. This might be CI/CD pipelines, machine learning jobs, ETL processes, or some other general-purpose application. Koreo workflows orchestrate the execution of functions, which may be pure ValueFunctions or side-effecting ResourceFunctions which manage Kubernetes resources.</p>
      <h3>Resource Materialization</h3>
      <p>Argo Workflows creates and manages resources as side effects of container execution within workflows. Koreo's dynamic resource materialization allows you to define, combine, and transform configurations before creating or updating Kubernetes resources, giving you more control and visibility.</p>
      <h3>Target Audience</h3>
      <p>Argo Workflows is often used by teams focused on application deployments, CI/CD pipelines, and general container orchestration. Koreo is designed for platform engineering teams building and managing the underlying Kubernetes platform itself, including control planes, infrastructure, and developer self-service capabilities. Koreo provides tooling to compose Kubernetes resources, off-the-shelf and custom operators, and Kubernetes' built-in controllers into a cohesive platform.</p>
    </>
  );

  const whenToChoose = (
    <>
      <h3>When to choose Argo Workflows</h3>
      <ul>
        <li>Your primary need is orchestration of container execution</li>
        <li>You need to orchestrate diverse containerized tasks beyond just Kubernetes resource management</li>
        <li>You have existing configuration management solutions and primarily need a workflow engine for containers</li>
      </ul>
      <h3>When to choose Koreo</h3>
      <ul>
        <li>You are building an internal developer platform or control plane on top of Kubernetes</li>
        <li>You need to manage complex configurations of Kubernetes resources</li>
        <li>Your focus is on enabling self-service platforms for developers</li>
        <li>You are wanting to compose operators into a cohesive platform or orchestrate Kubernetes resources</li>
      </ul>
      <br />
    </>
  );

  return (
    <Layout
      title="Argo Workflows"
      description="Solutions for Kubernetes resource orchestration">
      <main>
        <Comparison
          name="Argo Workflows"
          subtitle="Solutions for Kubernetes resource orchestration"
          content={content}
          imageSrc="/img/compare/argo.png"
          additionalContent={whenToChoose}
        /> 
      </main>
    </Layout> 
  );
}

