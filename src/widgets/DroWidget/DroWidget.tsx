import styles from './DroWidget.module.css';

interface Props { 
  label: string; 
  onClick?: () => void; 
}

export default function DroWidget({ label, onClick }: Props) {
  return (
    <div className={styles.tile} onClick={onClick}>
      <div className={styles.text}>{label}</div>
    </div>
  );
}
