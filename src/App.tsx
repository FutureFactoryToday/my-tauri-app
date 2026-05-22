import { useState } from 'react';
import styles from './App.module.css';
import './global.css';
import Shell from './layout/Shell/Shell';
import DroWidget from './widgets/DroWidget/DroWidget';
import AchtWidget from './widgets/AchtWidget/AchtWidget';
import IlluminatorWidget from './widgets/IlluminatorWidget/IlluminatorWidget';
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
        
        <AchtWidget 
          label="ACHT Control"
          currentTemp={24.5} // Здесь можно передать переменную из сокета
          onHeatChange={(active) => {
            console.log("Heater status:", active);
            // Например: send(active ? "HEATER_ON" : "HEATER_OFF");
          }}
          onFanChange={(active) => {
            console.log("Fan status:", active);
            // Например: send(active ? "M106" : "M107");
          }}
          onValueSubmit={(value) => {
            console.log("Setting target temp to:", value);
            if(isConnected) {
              send(`M104 S${value}`); // Отправка G-кода в станок
            }
          }}
        />

        <IlluminatorWidget 
          label="Illumination"
          onVisibleChange={(active, power) => {
            console.log("White Light:", active, "Power:", power);
            if(isConnected) {
              // Пример команды: L1 - тип лампы, S - мощность
              send(`M150 L1 S${active ? power : 0}`); 
            }
          }}
          on800nmChange={(active, power) => {
            console.log("800nm (IR):", active, "Power:", power);
            if(isConnected) {
              send(`M150 L2 S${active ? power : 0}`);
            }
          }}
          on365nmChange={(active, power) => {
            console.log("365nm (UV):", active, "Power:", power);
            if(isConnected) {
              send(`M150 L3 S${active ? power : 0}`);
            }
          }}
        />

        {/* Остальные 11 плиток */}
        {/*{Array.from({ length: 2 }).map((_, i) => (
          <DroWidget 
            key={i} 
            label={`EMPTY ${i + 2}`} 
          />
        ))}*/}
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
