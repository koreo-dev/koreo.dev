import Heading from '@theme/Heading';
import styles from './styles.module.css';

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
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.compareIcon} stroke="currentColor" fill="currentColor" viewBox="0 0 512 512"><path d="M322.8 484.2c6.5 5.9 7 16.1 1.1 22.6s-16.1 7-22.6 1.1l-88-80c-3.3-3-5.2-7.3-5.2-11.8s1.9-8.8 5.2-11.8l88-80c6.5-5.9 16.7-5.5 22.6 1.1s5.5 16.7-1.1 22.6L265.4 400l70.6 0c44.2 0 80-35.8 80-80l0-161.6c-36.5-7.4-64-39.7-64-78.4c0-44.2 35.8-80 80-80s80 35.8 80 80c0 38.7-27.5 71-64 78.4L448 320c0 61.9-50.1 112-112 112l-70.6 0 57.4 52.2zM384 80a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM189.2 27.8c-6.5-5.9-7-16.1-1.1-22.6s16.1-7 22.6-1.1l88 80c3.3 3 5.2 7.3 5.2 11.8s-1.9 8.8-5.2 11.8l-88 80c-6.5 5.9-16.7 5.5-22.6-1.1s-5.5-16.7 1.1-22.6L246.6 112 176 112c-44.2 0-80 35.8-80 80l0 161.6c36.5 7.4 64 39.7 64 78.4c0 44.2-35.8 80-80 80s-80-35.8-80-80c0-38.7 27.5-71 64-78.4L64 192c0-61.9 50.1-112 112-112l70.6 0L189.2 27.8zM128 432a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"/></svg>
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
