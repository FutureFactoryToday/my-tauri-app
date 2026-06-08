import { useState } from 'react';
import styles from './App.module.css';
import './global.css';
import Shell from './layout/Shell/Shell';
//import DroWidget from './widgets/DroWidget/DroWidget';
import AchtWidget from './widgets/AchtWidget/AchtWidget';
import IlluminatorWidget from './widgets/IlluminatorWidget/IlluminatorWidget';
import ActuatorWidget from './widgets/ActuatorWidget/ActuatorWidget';
//import ManualOperating from './components/Manuals/ManualOperating';
import { useCncServer } from './hooks/useCncServer';

export default function App() {
  const {isConnected, isDeviceConnected, send, /*lastMessage*/ } = useCncServer("ws://localhost:8080/ws");
  //const [open, setOpen] = useState(false);

  const [initializationStatus, setInitializationStatus] = useState("Ready");
  const [currentMode, setCurrentMode] = useState("Режим 1");
  const [isPrecisionModeOn, setIsPrecisionModeOn] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);

  return (
    <Shell>
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
          label="Actuator Control"
          initializationStatus={initializationStatus}
          currentMode={currentMode}
          onHomeClick={() => {
            console.log("Home button clicked");
            if (isConnected) {
              send("G28"); // Команда "Домой" для ЧПУ
              // Обновляем статус инициализации после отправки команды
              setInitializationStatus("Initializing...");
              // Здесь можно добавить логику ожидания ответа от станка
              // и установки статуса "Ready"
            }
          }}
          onModeChange={(mode) => {
            console.log("Mode changed to:", mode);
            setCurrentMode(mode);
            if (isConnected) {
              switch (mode) {
                case "Режим 1":
                  send("G0 X10 Y10"); // Быстрое перемещение в позицию 1
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
          onPrecisionModeToggle={(active) => {
            console.log("Precision mode:", active ? "ON" : "OFF");
            setIsPrecisionModeOn(active);
            if (isConnected) {
              send(active ? "M108" : "M109"); // Команды для точного режима
            }
          }}
          onMultiplierChange={(multiplier) => {
            console.log("Multiplier set to:", multiplier);
            setCurrentMultiplier(multiplier);
          }}
          onPulse={() => {
            console.log("Pulse generated");
            if (isConnected && isPrecisionModeOn) {
              // Отправка импульса с учётом текущей кратности
              const pulseCommand = `G0 X${currentMultiplier}`;
              send(pulseCommand);
            }
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
