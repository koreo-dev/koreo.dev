import { FeatureItem, Features } from '../Features';

type HomepageFeaturesProps  = {
  purple?: boolean;
}

const featureList: FeatureItem[] = [
  {
    title: <>Programmable workflows</>,
    Svg: require('@site/static/img/arrow-progress-duotone-thin.svg').default,
    description: (
      <>
        Define complex, multi-step processes that react to events and manage the lifecycle of your Kubernetes resources. Koreo workflows enable automation of everything from simple deployments to entire cloud environments. It's like programming—or <em>choreographing</em>—Kubernetes controllers.
      </>
    ),
  },
  {
    title: <>Structured configuration management</>,
    Svg: require('@site/static/img/file-lines-thin.svg').default,
    description: (
      <>
        Manage Kubernetes configurations the way they were intended—as structured data, not just templated strings. This allows you to easily validate, transform, and combine configurations from multiple sources in a manageable and scalable way.
      </>
    ),
  },
  {
    title: <>Dynamic resource materialization</>,
    Svg: require('@site/static/img/circles-overlap-duotone-thin.svg').default,
    description: (
      <>
        Inject values from a config file or overlay partial definitions to build up a complete resource view. Combine configurations from different sources like security, compliance, and SRE, and even apply custom logic, to give developers a golden path for provisioning applications, resources, or anything Kubernetes manages.
      </>
    ),
  },
  {
    title: <>Configuration as functions</>,
    Svg: require('@site/static/img/function-duotone-thin.svg').default,
    description: (
      <>
        Inspired by functional programming principles, Koreo lets you decompose configuration into functions. These functions act as reusable building blocks to encapsulate common tasks and logic within your Koreo workflows. This promotes modularity, reduces duplication, and makes workflows easier to maintain and evolve.
      </>
    ),
  },
  {
    title: <>Declarative operator model</>,
    Svg: require('@site/static/img/arrows-rotate-thin.svg').default,
    description: (
      <>
        Define your desired state through workflows and functions, and Koreo will automatically reconcile the actual state to match. This declarative approach simplifies management and ensures consistency across your infrastructure.
      </>
    ),
  },
  {
    title: <>First-class testing and tooling</>,
    Svg: require('@site/static/img/code-duotone-thin.svg').default,
    description: (
      <>
        <em>Actually</em> treat configuration as code with Koreo's built-in testing framework and developer tooling. Write unit tests for individual functions and entire workflows to catch errors early and prevent unexpected behavior. Koreo's IDE integration gives you real-time feedback, autocomplete, and introspection.
      </>
    ),
  },
];

export default function HomepageFeatures({purple}: HomepageFeaturesProps): JSX.Element {
  return <Features features={featureList} purple={purple} />;
}
