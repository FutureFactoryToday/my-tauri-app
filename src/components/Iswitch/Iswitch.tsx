import styles from './Iswitch.module.css';

interface IswitchProps {
  checked: boolean;
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
}

export default function Iswitch({ checked, onChange, disabled = false }: IswitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`${styles.switch} ${checked ? styles.on : ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={styles.handle} />
    </div>
  );
}