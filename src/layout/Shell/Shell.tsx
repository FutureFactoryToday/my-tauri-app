import React from 'react';
import styles from './Shell.module.css';

export default function Shell({ children }: { children: React.ReactNode }) {
  return <div className={styles.wrapper}>{children}</div>;
}
