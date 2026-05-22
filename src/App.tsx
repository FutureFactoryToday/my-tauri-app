import { useState } from 'react';
import styles from './App.module.css';
import './global.css';
import Shell from './layout/Shell/Shell';
import DroWidget from './widgets/DroWidget/DroWidget';
import ManualOperating from './components/Manuals/ManualOperating';
import { useCncServer } from './hooks/useCncServer';

export default function App() {
  const {isConnected, send, lastMessage } = useCncServer("ws://localhost:8080/ws");
  const [open, setOpen] = useState(false);

  return (
    <Shell>
      <div className={styles.dashboard}>
        {/* Первая плитка открывает окно */}
        <DroWidget 
          label={isConnected ? "Open terminal" : "Connecting"}
          onClick={() => {
            console.log("Click Ok!");
            setOpen(true);
            }}
        />
        {/* Остальные 11 плиток */}
        {Array.from({ length: 11 }).map((_, i) => (
          <DroWidget 
            key={i} 
            label={`EMPTY ${i + 2}`} 
          />
        ))}
      </div>

      {/* Manual control window */}
      {open && (
        <ManualOperating 
          onClose={() => setOpen(false)} 
          onSend={(cmd) => {
            if(isConnected) {
              console.log("L3 Sending:", cmd);
              send(cmd); //Send to L2
            }
            else {
              console.warn("Sending without link");
            }
          }} 
          lastResponse={lastMessage}
        />
      )}

      <div style={{ color: isConnected ? '#0f0' : '#f00' }}>
        L2 STATUS: {isConnected ? "CONNECTED" : "DISCONNECTED"}
      </div>

    </Shell>
  );
}
