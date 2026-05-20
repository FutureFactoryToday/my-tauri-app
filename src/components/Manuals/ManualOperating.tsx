import React, { useState } from 'react';
import styles from './ManualOperating.module.css';

interface Props {
  onClose: () => void;
  onSend: (val: string) => void;
}

export default function ManualOperating({ onClose, onSend }: Props) {
  const [val, setVal] = useState("");

  const handleSend = () => {
    if (val.trim()) {
      onSend(val);
      setVal(""); // Очищаем поле после отправки
    }
  };

  return (
    <div className={styles.overlay}>
      <h2 className={styles.title}>Terminal: Manual Input</h2>
      
      <textarea 
        className={styles.inputField}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="G0 X100 Y100..."
        autoFocus
      />
      
      <div className={styles.buttonContainer}>
        <button className={styles.btn} onClick={handleSend}>
          Send Command
        </button>
        <button className={styles.btn} onClick={onClose}>
          Close Terminal
        </button>
      </div>
    </div>
  );
}
