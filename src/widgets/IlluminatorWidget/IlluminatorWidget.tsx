import { useState } from 'react';
import styles from './IlluminatorWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';

interface Props {
  label: string;
  onVisibleChange?: (active: boolean, power: number) => void;
  on800nmChange?: (active: boolean, power: number) => void;
  on365nmChange?: (active: boolean, power: number) => void;
}

export default function IlluminatorWidget({ label, onVisibleChange, on800nmChange, on365nmChange }: Props) {
  const [visOn, setVisOn] = useState(false);
  const [irOn, setIrOn] = useState(false);
  const [uvOn, setUvOn] = useState(false);

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

      {/* Ряд White */}
      <div className={styles.rowWrapper}>
        <span className={styles.rowLabel}>Видимый (белый)</span>
        <div className={styles.illuminatorRow}>
          <Iswitch checked={visOn} onChange={setVisOn} />
          <div className={`${styles.inputGroup} ${!visOn ? styles.disabled : ''}`}>
            <input 
              type="text" value={visVal} className={styles.input}
              onChange={(e) => validateAndSet(e.target.value, setVisVal)}
              disabled={!visOn}
            />
            <button className={styles.submitBtn} onClick={() => onVisibleChange?.(visOn, Number(visVal))}>Установить</button>
          </div>
        </div>
      </div>

      {/* Ряд 800nm */}
      <div className={styles.rowWrapper}>
        <span className={styles.rowLabel}>800 нм</span>
        <div className={styles.illuminatorRow}>
          <Iswitch checked={irOn} onChange={setIrOn} />
          <div className={`${styles.inputGroup} ${!irOn ? styles.disabled : ''}`}>
            <input 
              type="text" value={irVal} className={styles.input}
              onChange={(e) => validateAndSet(e.target.value, setIrVal)}
              disabled={!irOn}
            />
            <button className={styles.submitBtn} onClick={() => on800nmChange?.(irOn, Number(irVal))}>Установить</button>
          </div>
        </div>
      </div>

      {/* Ряд 365nm */}
      <div className={styles.rowWrapper}>
        <span className={styles.rowLabel}>365 нм</span>
        <div className={styles.illuminatorRow}>
          <Iswitch checked={uvOn} onChange={setUvOn} />
          <div className={`${styles.inputGroup} ${!uvOn ? styles.disabled : ''}`}>
            <input 
              type="text" value={uvVal} className={styles.input}
              onChange={(e) => validateAndSet(e.target.value, setUvVal)}
              disabled={!uvOn}
            />
            <button className={styles.submitBtn} onClick={() => on365nmChange?.(uvOn, Number(uvVal))}>Установить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
