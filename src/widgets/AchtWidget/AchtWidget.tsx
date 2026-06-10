import { useState } from 'react';
import styles from './AchtWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';

interface Props {
  label: string;
  onHeatChange?: (active: boolean) => void;
  onFanChange?: (active: boolean) => void;
  onHeater?: (command: string) => void;
  onFan?: (command: string) => void;
  onValueSubmit?: (value: number) => void;
  currentTemp?: number;
}

export default function AchtWidget({ 
  label, 
  onHeatChange, 
  onFanChange, 
  onValueSubmit,
  onHeater,
  onFan,
  currentTemp = 0 
}: Props) {
  const [isHeatOn, setIsHeatOn] = useState(false);
  const [isFanOn, setIsFanOn] = useState(false);
  const [inputValue, setInputValue] = useState("0");

  const handleHeatToggle = () => {
    const newState = !isHeatOn;
    setIsHeatOn(newState);
    if (onHeatChange) onHeatChange(newState);
    if (onHeater) {
      onHeater(newState ? "led blink" : "led off");
    }
  };

  const handleFanToggle = () => {
    const newState = !isFanOn;
    setIsFanOn(newState);
    if (onFanChange) onFanChange(newState);
    if (onFan) {
      onFan(newState ? "led on" : "led off");
    }
  };

  const handleSubmit = () => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && onValueSubmit) {
      onValueSubmit(val);
    }
  };

  return (
    <div className={styles.tile}>
      <div className={styles.header}>{label}</div>

      {/* 1. Переключатели (iOS Style) */}
      <div className={styles.controlsGroup}>
        <div className={styles.switchRow}>
          <Iswitch checked={isHeatOn} onChange={handleHeatToggle} />  
          <span>Heater</span>
        </div>

        <div className={styles.switchRow}>
          <Iswitch checked={isFanOn} onChange={handleFanToggle} />  
          <span>Fan</span>
        </div>
      </div>

      {/* 2. Текущая температура */}
      <div className={styles.tempDisplay}>
        <span className={styles.tempValue}>{currentTemp.toFixed(1)}°C</span>
        <span className={styles.tempLabel}>Current Temp</span>
      </div>

      {/* 3. Поле ввода и кнопка (Горизонтально) */}
      <div className={`${styles.inputGroup} ${!isHeatOn ? styles.disabled : ''}`}>
        <input 
          type="text" 
          value={inputValue}
            onChange={(e) => {
                // Добавляем простую проверку: разрешаем только цифры и точку
                const val = e.target.value;
                if (val === '' || /^[0-9.]*$/.test(val)) {
                setInputValue(val);
                }
            }}
          disabled={!isHeatOn}
          className={styles.input}
          placeholder="0.0"
        />
        <button 
          onClick={handleSubmit} 
          disabled={!isHeatOn}
          className={styles.submitBtn}
        >
          SET
        </button>
      </div>
    </div>
  );
}
