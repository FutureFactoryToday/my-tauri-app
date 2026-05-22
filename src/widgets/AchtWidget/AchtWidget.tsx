import { useState } from 'react';
import styles from './AchtWidget.module.css';

interface Props {
  label: string;
  onHeatChange?: (active: boolean) => void;
  onFanChange?: (active: boolean) => void;
  onValueSubmit?: (value: number) => void;
  currentTemp?: number;
}

export default function AchtWidget({ 
  label, 
  onHeatChange, 
  onFanChange, 
  onValueSubmit,
  currentTemp = 0 
}: Props) {
  const [isHeatOn, setIsHeatOn] = useState(false);
  const [isFanOn, setIsFanOn] = useState(false);
  const [inputValue, setInputValue] = useState("0");

  const handleHeatToggle = () => {
    const newState = !isHeatOn;
    setIsHeatOn(newState);
    if (onHeatChange) onHeatChange(newState);
  };

  const handleFanToggle = () => {
    const newState = !isFanOn;
    setIsFanOn(newState);
    if (onFanChange) onFanChange(newState);
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
          <div 
            className={`${styles.iosSwitch} ${isHeatOn ? styles.on : ''}`} 
            onClick={handleHeatToggle}
          >
            <div className={styles.handle} />
          </div>
          <span>Heater</span>
        </div>

        <div className={styles.switchRow}>
          <div 
            className={`${styles.iosSwitch} ${isFanOn ? styles.on : ''}`} 
            onClick={handleFanToggle}
          >
            <div className={styles.handle} />
          </div>
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
