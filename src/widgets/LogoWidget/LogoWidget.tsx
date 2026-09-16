import styles from './LogoWidget.module.css';
import logo from './main_logo.png';

interface Props { 
  label: string; 
  onClick?: () => void; 
}

export default function LogoWidget({ label, onClick }: Props) {
  return (
    <div className={styles.tile} onClick={onClick}>
      <img src={logo} alt={label} className={styles.logo} />
      <div className={styles.text}>{label}</div>
    </div>
  );
}