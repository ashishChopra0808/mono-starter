'use client';

import { useTheme } from '../theme-provider';
import styles from './page.module.css';

export default function Index() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>@mono/design-tokens</h1>
          <p className={styles.subtitle}>
            Multi-theme semantic design system
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Theme Switcher</h2>
            <p className={styles.cardText}>
              Current active theme: <strong>{theme}</strong>
            </p>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.buttonPrimary} 
                onClick={toggleTheme}
              >
                Toggle Theme
              </button>
              <button 
                className={styles.buttonSecondary} 
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button 
                className={styles.buttonSecondary} 
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
              <button 
                className={styles.buttonSecondary} 
                onClick={() => setTheme('midnight')}
              >
                Midnight
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Semantic Color Examples</h2>
          <div className={styles.grid}>
            
            <div className={styles.demoCard}>
              <h3 className={styles.demoTitle}>Primary Action</h3>
              <p className={styles.demoText}>Used for main call to actions.</p>
              <button className={styles.buttonPrimary}>Primary Button</button>
            </div>

            <div className={styles.demoCard}>
              <h3 className={styles.demoTitle}>Secondary Action</h3>
              <p className={styles.demoText}>Used for less prominent actions.</p>
              <button className={styles.buttonSecondary}>Secondary Button</button>
            </div>

            <div className={styles.demoCardDestructive}>
              <h3 className={styles.demoTitleDestructive}>Destructive</h3>
              <p className={styles.demoTextDestructive}>Used for destructive actions like delete.</p>
              <button className={styles.buttonDestructive}>Delete Resource</button>
            </div>

            <div className={styles.demoCardSuccess}>
              <h3 className={styles.demoTitleSuccess}>Success State</h3>
              <p className={styles.demoTextSuccess}>Action completed successfully.</p>
            </div>

            <div className={styles.demoCardWarning}>
              <h3 className={styles.demoTitleWarning}>Warning State</h3>
              <p className={styles.demoTextWarning}>Proceed with caution.</p>
            </div>

            <div className={styles.demoCardMuted}>
              <h3 className={styles.demoTitleMuted}>Muted State</h3>
              <p className={styles.demoTextMuted}>Disabled or informational surface.</p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
