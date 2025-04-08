import Heading from '@theme/Heading';
import styles from './styles.module.css';
import CodeCompareIcon from '@site/static/img/code-compare-light.svg';

import { FC, ReactNode } from 'react';

interface ComparisonProps {
  name: string;
  subtitle: string;
  content: ReactNode;
  imageSrc: string;
  additionalContent?: ReactNode;
}

const Comparison: FC<ComparisonProps> = ({ name, subtitle, content, imageSrc, additionalContent }) => {
  return (
    <section className={styles.backgroundContainer}>
      <div>
        <div className={styles.compareHero}>
          <div className={styles.compareInfo}>
            <Heading as="h3" className={styles.compareLabel}>
              <CodeCompareIcon stroke="currentColor" fill="currentColor" className={styles.compareIcon} role="img" />
              <span className={styles.gradientText}>comparing</span>
            </Heading>
            <Heading as="h1" className={styles.compareName}>{name}</Heading>
            <Heading as="h2" className={styles.compareSubtitle}>{subtitle}</Heading>
            <div className={styles.content}>{content}</div>
          </div>
          <div className={styles.compareRight}>
            <img src={imageSrc} alt={name} className={styles.compareImage} />
            <div className={styles.compareContent}>{additionalContent}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
