import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export type FeatureItem = {
  title: JSX.Element;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description?: JSX.Element;
  purple?: boolean;
};

type FeaturesProps  = {
  features: FeatureItem[];
  purple?: boolean;
}

function Feature({title, Svg, description, purple}: FeatureItem) {
  const className = clsx(styles.feature, purple ? styles.purpleFeature : "");
  return (
    <div className={className}>
      <div className={styles.featureTitleContainer}>
        <Svg stroke="currentColor" fill="currentColor" className={styles.featureSvg} role="img"/>
        <Heading as="h3">{title}</Heading>
      </div>
      {description && (
        <div className={styles.featureDescriptionContainer}>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}

export function Features({ features, purple }: FeaturesProps, ): JSX.Element {
  return (
    <section className={styles.features}>
      <div className={styles.featuresGrid}>
          {features.map((props, idx) => (
            <Feature key={idx} {...props} purple={purple} />
          ))}
      </div>
    </section>
  );
}
