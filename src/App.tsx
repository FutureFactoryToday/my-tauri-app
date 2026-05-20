import React, { useState } from 'react';
import styles from './App.module.css';
import './global.css';
import Shell from './layout/Shell/Shell';
import DroWidget from './widgets/DroWidget/DroWidget';
import ManualOperating from './components/Manuals/ManualOperating';
import { useCncServer } from './hooks/useCncServer';

export default function App() {
  const { send } = useCncServer("ws://localhost:8080/ws");
  const [open, setOpen] = useState(false);

  return (
    <Shell>
      <div className={styles.dashboard}>
        {/* Первая плитка открывает окно */}
        <DroWidget label="OPEN TERMINAL" onClick={() => setOpen(true)} />
        {/* Остальные 11 плиток */}
        {Array.from({ length: 11 }).map((_, i) => (
          <DroWidget key={i} label={`WIDGET ${i + 2}`} />
        ))}
      </div>

      {open && <ManualOperating onClose={() => setOpen(false)} onSend={send} />}
    </Shell>
  );
}
