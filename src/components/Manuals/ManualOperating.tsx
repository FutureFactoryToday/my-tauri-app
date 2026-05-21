import React, { useState } from 'react';
import styles from './ManualOperating.module.css';

interface Props {
  onClose: () => void;
  onSend: (val: string) => void;
  lastResponse: string;
}

export default function ManualOperating({ onClose, onSend, lastResponse }: Props) {
  const [val, setVal] = useState("");

  const handleSend = () => {
    if (val.trim()) {
      onSend(val);
      setVal(""); // Очищаем поле после отправки
    }
  };

  return (
    <div className={styles.overlay}>
      <h2 className={styles.title}>Manual control</h2>
      
      {/* Окно вывода логов от STM32 */}
      <div style={{
        background: '#000',
        color: '#0f0',
        padding: '10px', 
        height: '100px',
        marginBottom: '10px',
        overflowY: 'auto',
        border: '1px solid #333',
        fontFamily: 'monospace'
      }}>
        {lastResponse || "Waiting for data..."}
      </div>

      <textarea 
        className={styles.inputField}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Enter command..."
        autoFocus
      />
      
      <div className={styles.buttonContainer}>
        <button className={styles.btn} onClick={() => {onSend(val); setVal("");}}>
          Send
        </button>
        <button className={styles.btn} onClick={onClose}>
          Close Terminal
        </button>
      </div>
    </div>
  );
}
