import { useState } from 'react';
import styles from './App.module.css';
import './global.css';
import Shell from './layout/Shell/Shell';
import LogoWidget from './widgets/LogoWidget/LogoWidget';
import AchtWidget from './widgets/AchtWidget/AchtWidget';
import IlluminatorWidget from './widgets/IlluminatorWidget/IlluminatorWidget';
import ActuatorWidget from './widgets/ActuatorWidget/ActuatorWidget';
//import ManualOperating from './components/Manuals/ManualOperating';
import { useCncServer } from './hooks/useCncServer';

export default function App() {
  const {isConnected, isDeviceConnected, send, lastMessage } = useCncServer("ws://localhost:8080/ws");

  const [currentMode, setCurrentMode] = useState("Режим 1");

  return (
    <Shell>
        {/* LogoWidget */}
        <LogoWidget 
          label="СОКМ-4-1600 Сер.№26002"
        />
      <div className={styles.dashboard}>
        {/* Первая плитка открывает окно */}
        {/*<DroWidget 
          label={isConnected ? "Open terminal" : "Connecting"}
          onClick={() => {
            console.log("Click Ok!");
            setOpen(true);
            }}
        />*/}


        <ActuatorWidget
          label="Актуатор (мира)"
          currentMode={currentMode}
          send={send}
          lastMessage={lastMessage}
          isConnected={isConnected}
          onHomeClick={() => {
            console.log("Home button clicked");
            if (isConnected) {
              send("amove home");
            }
          }}
          onModeChange={(mode) => {
            console.log("Mode changed to:", mode);
            setCurrentMode(mode);
            if (isConnected) {
              switch (mode) {
                case "Режим 1":
                  send("amove zero"); // Быстрое перемещение в позицию 1
                  break;
                case "Режим 2":
                  send("G0 X50 Y50"); // Быстрое перемещение в позицию 2
                  break;
                case "Режим 3":
                  send("G0 X100 Y100"); // Быстрое перемещение в позицию 3
                  break;
                default:
                  break;
              }
            }
          }}
          onPosChange={(value) => {
            console.log("Move by:", value);
            if (isConnected) {
              const cleanValue = value.replace('+', ''); // убираем знак +
              send(`imove ${cleanValue}`);
            }
          }}
        />

        
        <AchtWidget 
          label="АЧТ"
          send={send}
          lastMessage={lastMessage}
          isConnected={isConnected}
          onHeatChange={(active) => {
            console.log("Heater status:", active);
          }}
          onFanChange={(active) => {
            console.log("Fan status:", active);
          }}
          onHeater={(command) => {
            if (isConnected) send(command);
            // Убираем setTimeout — теперь виджет сам обновит температуру
          }}
          onFan={(command) => {
            if (isConnected) send(command);
          }}
          onValueSubmit={(value) => {
            console.log("Setting target temp to:", value);
            if (isConnected) {
              send(`heat ${value.toFixed(1)}`);
              // setTimeout тоже убираем, виджет сам запросит
            }
          }}
        />

        <IlluminatorWidget 
          label="Осветитель"
          onCommand={(command) => {
            console.log("Illuminator command:", command);
            if (isConnected) {
              send(command);
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
      {/*{open && (
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
      )}*/}

      {/* Индикаторы статуса внизу страницы */}
      <div className={styles.statusPanel} style={{ padding: '10px', fontSize: '16px', display: 'flex', gap: '30px'}}>
        <div style={{ color: isConnected ? '#0f0' : '#f00' }}>
          SERVER (L2): {isConnected ? "ONLINE" : "OFFLINE"}
        </div>
        
        <div style={{ color: isDeviceConnected ? '#0f0' : '#f00' }}>
          DEVICE (L1): {isDeviceConnected ? "CONNECTED" : "NOT FOUND"}
        </div>
      </div>

    </Shell>
  );
}
