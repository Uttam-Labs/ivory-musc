import { SiteContainer } from "@/components/site-container";
import styles from "../collection.module.css";

export default function CollectionLoading() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Loading collection">
      <SiteContainer className={styles.inner}>
        <div className={styles.loadingHeading} />
        <div className={styles.loadingGrid} aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div className={styles.loadingCard} key={index}>
              <div className={styles.loadingImage} />
              <div className={styles.loadingLine} />
              <div className={`${styles.loadingLine} ${styles.loadingLineShort}`} />
            </div>
          ))}
        </div>
      </SiteContainer>
    </main>
  );
}
