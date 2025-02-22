import { useState } from "react";
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const useCases = [
  {
    title: "Internal Developer Platform",
    description: <p>Build custom IDPs that abstract cloud complexity, enforce governance, and empower developers with self-service capabilities.</p>,
  },
  {
    title: "Automated Infrastructure",
    description: <p>Automate the creation of entire development, testing, and production environments, including networking, security, and compute resources.</p>,
  },
  {
    title: "Unified Control Plane",
    description: <p>Implement control planes to manage infrastructure and application deployments across cloud platforms or on premises.</p>,
  },
  {
    title: "Developer Abstractions",
    description: <p>Build powerful, high-level abstractions that allow developers to focus on product development rather than infrastructure complexity.</p>,
  },
  {
    title: "Multi-Cloud Orchestration",
    description: <p>Combine operators like <a href="https://aws-controllers-k8s.github.io/community/docs/community/overview/" target="_blank">ACK</a>, <a href="https://cloud.google.com/config-connector/docs/overview" target="_blank">Config Connector</a>, and <a href="https://azure.github.io/azure-service-operator/" target="_blank">ASO</a> to manage resources across multiple cloud providers and platforms.</p>,
  },
  {
    title: "Operator Composition",
    description: <p>Build custom operators, manage complex multi-step processes within an operator, and compose off-the-shelf operators into cohesive platforms.</p>,
  },
  {
    title: "Deployment Orchestration",
    description: <p>Orchestrate application deployments with automated canary releases, blue/green deployments, and rollouts with complex dependencies or steps.</p>,
  },
  {
    title: "Policy as Code",
    description: <p>Define and enforce organizational policies through code to ensure compliance and consistency in a declarative, testable way.</p>,
  },
];

const UseCasesList = () => {
  return (
    <ul className={styles.useCasesList}>
      {useCases.map((useCase, index) => (
        <li key={index} className={styles.useCaseItem}>
          <h3>{useCase.title}</h3>
          {useCase.description}
        </li>
      ))}
    </ul>
  );
};

export type SpotlightItem = {
  header: JSX.Element,
  subheader?: JSX.Element,
  description: JSX.Element,
  imageSrc?: string,
};

export type TabbedSpotlightItem = {
  header: JSX.Element,
  subheader?: JSX.Element,
  description: JSX.Element,
  imageSrcs: string[],
  imageTitles: string[]
};

const exampleKoreo: TabbedSpotlightItem = {
  header: <>Workflows and functions</>,
  subheader: <>provide composable primitives for building platforms</>,
  description: (
  <>
    <p>
      <strong>Koreo empowers you to build complex Kubernetes platforms using composable workflows and functions</strong>, drawing inspiration from functional programming principles. Workflows act as blueprints for platform operations, defining the steps for tasks like application deployments or infrastructure provisioning. Functions are the individual building blocks within these workflows, encapsulating specific logic for data transformation, API interaction, or resource creation. And with built-in testing, you can validate configuration and catch errors early in the development process.
    </p>
    <p>
      The true power of Koreo lies in its ability to program these workflows. Incorporate conditional logic, loops, and error handling to create dynamic platform operations. Automate complex processes, enforce policies, and build self-service platforms for your development teams.
    </p>
  </>
  ),
  imageSrcs: ["/img/home/workflow_koreo.png", "/img/home/value_function_koreo.png", "/img/home/resource_function_koreo.png", "/img/home/resource_function_test_koreo.png"],
  imageTitles: ["aws-env.koreo", "tags.koreo", "vpc.koreo", "test-vpc.koreo"],
};

const spotlightItems: SpotlightItem[] = [
  {
    header: <>Powerful configuration management</>,
    subheader: <>with flexible resource orchestration</>,
    description: (
    <>
      <p>
        Koreo is a platform engineering toolkit that introduces a new approach to configuration management and resource orchestration in Kubernetes. It builds upon the best aspects of tools like Helm, Kustomize, Argo, and Crossplane while addressing some of their limitations.
      </p>
      <p>
      <strong>It serves as a meta-controller programming language and runtime</strong> that allows you to compose off-the-shelf operators into cohesive platforms by orchestrating Kubernetes controllers. Through powerful primitives, Koreo enables DevOps and platform engineers to create dynamic workflows that automate everything from simple deployments to entire internal developer platforms. Its layered configuration management enables teams like security, compliance, or SRE to enforce consistent standards and practices for resources within your organization.
      </p>
    </>
    ),
    imageSrc: "/img/home/koreo.png",
  },
  {
    header: <>Dynamic resource materialization</>,
    subheader: <>for configuration that's more than just templating</>,
    description: (
      <>
        <p>
          Compose Kubernetes resources that align with organizational standards and policies using <strong>configuration layers and pluggable logic</strong>. Provide developers with high-level platform abstractions, allowing them to focus on product development rather than infrastructure complexity. With Koreo, you can combine base templates, overlays, and custom functions to materialize resources. Pull configurations from different sources, apply business logic, and enforce consistency across environments. Automate complex provisioning workflows, ensure compliance, and quickly adapt to evolving infrastructure needs.
        </p>
        <p>
          With Koreo's tooling and first-class testing support, working with Kubernetes configuration feels more like actual programming—<em>because it is</em>.
        </p>
      </>
    ),
    imageSrc: "/img/home/hero.gif",
  },
  {
    header: <>Automate. Abstract. Orchestrate.</>,
    subheader: <>Koreo use cases and solutions</>,
    description: <UseCasesList />,
  },
  {
    header: <>The team behind Koreo</>,
    subheader: <>with over a decade of platform engineering expertise</>,
    description: (
    <>
      <p>
        <a href="https://realkinetic.com" target="_blank">Real Kinetic</a> has spent years helping organizations—from startups to Fortune 500s—implement platform engineering to accelerate product delivery, improve efficiency, and reduce complexity. Before that, the team played a key role in building the internal platform for Workiva, an early cloud-native SaaS company, enabling its growth from startup to IPO.
      </p>
      <p>
      Koreo distills this experience into a powerful toolkit for building internal developer platforms in a fraction of the time. It also powers <a href="https://konfigurate.com" target="_blank">Konfigurate</a>, our pre-configured platform that allows startups and scaleups to focus on product development, not undifferentiated work.
      </p>
    </>
    ),
    imageSrc: "/img/home/real_kinetic_konfigurate.png",
  },
];

function HomepageHeader() {
  return (
    <section className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <Heading as="h1" className={styles.heroTitle}>The<br /><span className="heroHeaderHighlight">platform engineering toolkit</span><br />for Kubernetes</Heading>
        <p className={styles.heroSubtitle}>
          Koreo is a new approach to <strong>Kubernetes configuration management</strong> empowering developers and platform teams through programmable workflows and structured data
        </p>
        <Link className={clsx("button button--lg actionButton")} to="/docs/overview">
          Get Started
        </Link>
        <Link className={clsx("button button--lg secondaryActionButton")} to="#">
          Learn More
        </Link>
      </div>
      <div className={styles.heroVideo}>
        <img src="/img/home/koreo_workflow.gif" alt="Koreo Configuration Management" />
      </div>
    </section>
  );
}

export function Spotlight({ header, subheader, description, imageSrc, alt = false }) {
  return (
    <>
      <section className={styles.spotlight}>
        <div className={styles.spotlightContainer}>
          {imageSrc ? (
            <>
              {alt ? (
                <>
                  <img
                    src={imageSrc}
                    alt={header}
                    className={styles.spotlightImage}
                  />
                  <div className={styles.spotlightInfo}>
                    <Heading as="h2" className={styles.spotlightHeader}>{header}</Heading>
                    <span className={styles.spotlightSubheader}>{subheader}</span>
                    <div className={styles.spotlightDescription}>
                      {description}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.spotlightInfo}>
                    <Heading as="h2" className={styles.spotlightHeader}>{header}</Heading>
                    <span className={styles.spotlightSubheader}>{subheader}</span>
                    <div className={styles.spotlightDescription}>
                      {description}
                    </div>
                  </div>
                  <img
                    src={imageSrc}
                    alt={header}
                    className={styles.spotlightImage}
                  />
                </>
              )}
            </>
          ) : (
            <div className={styles.spotlightInfoFullWidth}>
              <Heading as="h2" className={styles.spotlightHeader}>{header}</Heading>
              <span className={styles.spotlightSubheader}>{subheader}</span>
              <div className={styles.spotlightDescription}>
                {description}
              </div>
            </div> 
          )}
        </div>
      </section>
    </>
  );
}

export function TabbedSpotlight({ header, subheader, description, imageSrcs, imageTitles, alt = false }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className={styles.spotlight}>
      <div className={styles.spotlightContainer}>
        {imageSrcs.length > 0 && (
          <div className={styles.tabbedSpotlightContent}>
            {alt ? (
              <>
                <div className={styles.tabbedImageContainer}>
                  <div className={styles.tabs}>
                    {imageTitles.map((name, index) => (
                      <button
                        key={index}
                        className={`${styles.tabButton} ${activeTab === index ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(index)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <img
                    src={imageSrcs[activeTab]}
                    alt={imageTitles[activeTab]}
                    className={styles.tabbedSpotlightImage}
                  />
                </div>
                <div className={styles.spotlightInfo}>
                  <h2 className={styles.spotlightHeader}>{header}</h2>
                  <span className={styles.spotlightSubheader}>{subheader}</span>
                  <div className={styles.spotlightDescription}>{description}</div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.spotlightInfo}>
                  <h2 className={styles.spotlightHeader}>{header}</h2>
                  <span className={styles.spotlightSubheader}>{subheader}</span>
                  <div className={styles.spotlightDescription}>{description}</div>
                </div>
                <div className={styles.tabbedImageContainer}>
                  <div className={styles.tabs}>
                    {imageTitles.map((name, index) => (
                      <button
                        key={index}
                        className={`${styles.tabButton} ${activeTab === index ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(index)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <img
                    src={imageSrcs[activeTab]}
                    alt={imageTitles[activeTab]}
                    className={styles.tabbedSpotlightImage}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  ); 
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.tagline}
      description="Koreo is a new approach to Kubernetes configuration management empowering developers and platform teams through programmable workflows and structured data">
      <main>
        <div className={styles.heroBackgroundContainer}>
          <HomepageHeader />
          <HomepageFeatures />
          <Spotlight {...spotlightItems[0]} />
        </div>
        <div className={styles.spotlightPurpleContainer}>
          <TabbedSpotlight {...exampleKoreo} />
        </div>
        <div className={styles.spotlightWhiteContainer}>
          <Spotlight {...spotlightItems[1]} />
        </div>
        <div className={styles.spotlightWhiteContainer}>
          <Spotlight {...spotlightItems[2]} />
        </div>
        <div className={styles.spotlightRadialGradientContainer}>
          <Spotlight {...spotlightItems[3]} />
        </div>
      </main>
    </Layout> 
  );
}
