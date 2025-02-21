import Layout from '@theme/Layout';
import Comparison from '@site/src/components/Comparison';

export default function Home(): JSX.Element {
  const content = (
    <>
      <p>Crossplane allows you to manage infrastructure as Kubernetes resources across different platforms, such as AWS, GCP, or Azure.  It extends the Kubernetes API to manage resources outside of Kubernetes itself using Crossplane Providers. These Providers bundle Managed Resources and controllers which allow Crossplane to provision and manage the respective infrastructure resources. In contrast, Koreo was designed specifically to allow you to use <em>off-the-shelf</em> operators for provisioning and managing infrastructure versus needing to implement the Crossplane API or using Crossplane-specific operators. It serves as a meta-controller programming language used to orchestrate Kubernetes control loops.</p>
      <h3>Configuration Management</h3>
      <p>Crossplane does not provide a configuration management solution directly. Instead, you might use a tool such as Helm, Kustomize, or Koreo to manage configuration for Crossplane resources. Koreo provides an integrated solution for configuration management and orchestration since it is designed specifically <em>for</em> orchestrating resource configuration.</p>
      <h3>Workflow Orchestration</h3>
      <p>Crossplane's workflow capabilities are primarily focused on managing resource dependencies and reconciliation. The closest analog to a Koreo workflow in Crossplane is a <em>Composition</em>. Compositions allow exposing a single abstraction that encapsulates multiple resources. Koreo's workflows share some similarities but provide a more general-purpose resource orchestration engine, enabling complex, multi-step processes for platform operations that leverage <em>any</em> operator or controller instead of a specific API.</p>
      <h3>Resource Materialization</h3>
      <p>Crossplane uses Providers to translate Kubernetes API calls into the target provider's APIs. Koreo leverages existing Kubernetes operators to provision and manage infrastructure. Koreo's dynamic resource materialization allows you to define, combine, and test resource materialization by using atomic overlays rather than sets of JSON patches. This approach makes mapping arbitrary values between resources or transforming static Kubernetes configurations to create or update resources declarative and testable.</p>
      <h3>Target Audience</h3>
      <p>Both Crossplane and Koreo are designed for platform engineering teams looking to build their own internal developer platform or control plane. Crossplane takes an approach of using a Provider API and Provider marketplace to support extensibility. This provides more out-of-the-box solutions but is ultimately limited to what is supported by the Providers. Koreo provides a lower-level toolkit designed to compose arbitrary operators into a cohesive platform by orchestrating any type of Kubernetes resource.</p>
    </>
  );

  const whenToChoose = (
    <>
      <h3>When to choose Crossplane</h3>
      <ul>
        <li>You are primarily looking for an Infrastructure as Code alternative and there are existing Providers that meet your needs</li>
        <li>You are not looking to leverage existing Kubernetes operators</li>
      </ul>
      <h3>When to choose Koreo</h3>
      <ul>
        <li>You prefer leveraging existing, off-the-shelf Kubernetes operators for infrastructure management</li>
        <li>You need fine-grained control over the configuration and lifecycle of Kubernetes resources</li>
        <li>You require complex, programmable workflows with business logic for Kubernetes platform operations</li>
      </ul>
      <br />
    </>
  );

  return (
    <Layout
      title="Crossplane"
      description="Solutions for Kubernetes resource orchestration">
      <main>
        <Comparison
          name="Crossplane"
          subtitle="Solutions for Kubernetes resource orchestration"
          content={content}
          imageSrc="/img/compare/crossplane.png"
          additionalContent={whenToChoose}
        /> 
      </main>
    </Layout> 
  );
}

