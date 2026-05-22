import { useState } from 'react';
import styles from './IlluminatorWidget.module.css';

interface Props {
  label: string;
  onVisibleChange?: (active: boolean, power: number) => void;
  on800nmChange?: (active: boolean, power: number) => void;
  on365nmChange?: (active: boolean, power: number) => void;
}

export default function IlluminatorWidget({ label, onVisibleChange, on800nmChange, on365nmChange }: Props) {
  // Состояния включения
  const [visOn, setVisOn] = useState(false);
  const [irOn, setIrOn] = useState(false);
  const [uvOn, setUvOn] = useState(false);

  // Состояния значений мощности
  const [visVal, setVisVal] = useState("0");
  const [irVal, setIrVal] = useState("0");
  const [uvVal, setUvVal] = useState("0");

  const validateAndSet = (val: string, setter: (v: string) => void) => {
    if (val === '' || /^[0-9]*$/.test(val)) {
      const num = parseInt(val);
      if (val === '' || (!isNaN(num) && num <= 300)) setter(val);
    }
  };

  return (
    <div className={styles.tile}>
      <div className={styles.header}>{label}</div>

      {/* Группа Видимый свет */}
      <div className={styles.illuminatorRow}>
        <div className={`${styles.iosSwitch} ${visOn ? styles.on : ''}`} onClick={() => setVisOn(!visOn)}>
          <div className={styles.handle} />
        </div>
        <span>White</span>
        <div className={`${styles.inputGroup} ${!visOn ? styles.disabled : ''}`}>
          <input 
            type="text" value={visVal} className={styles.input}
            onChange={(e) => validateAndSet(e.target.value, setVisVal)}
            disabled={!visOn}
          />
          <button className={styles.submitBtn} onClick={() => onVisibleChange?.(visOn, Number(visVal))}>OK</button>
        </div>
      </div>

      {/* Группа 800nm (IR) */}
      <div className={styles.illuminatorRow}>
        <div className={`${styles.iosSwitch} ${irOn ? styles.on : ''}`} onClick={() => setIrOn(!irOn)}>
          <div className={styles.handle} />
        </div>
        <span>800nm</span>
        <div className={`${styles.inputGroup} ${!irOn ? styles.disabled : ''}`}>
          <input 
            type="text" value={irVal} className={styles.input}
            onChange={(e) => validateAndSet(e.target.value, setIrVal)}
            disabled={!irOn}
          />
          <button className={styles.submitBtn} onClick={() => on800nmChange?.(irOn, Number(irVal))}>OK</button>
        </div>
      </div>

      {/* Группа 365nm (UV) */}
      <div className={styles.illuminatorRow}>
        <div className={`${styles.iosSwitch} ${uvOn ? styles.on : ''}`} onClick={() => setUvOn(!uvOn)}>
          <div className={styles.handle} />
        </div>
        <span>365nm</span>
        <div className={`${styles.inputGroup} ${!uvOn ? styles.disabled : ''}`}>
          <input 
            type="text" value={uvVal} className={styles.input}
            onChange={(e) => validateAndSet(e.target.value, setUvVal)}
            disabled={!uvOn}
          />
          <button className={styles.submitBtn} onClick={() => on365nmChange?.(uvOn, Number(uvVal))}>OK</button>
        </div>
      </div>
    </div>
  );
}
