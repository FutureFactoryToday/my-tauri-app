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

  const getValidHeatValue = () => {
    let num = parseFloat(inputValue);
    if (isNaN(num) || num < 0.1) {
      return 0.1;
    }
    return num;
  };

  const handleHeatToggle = () => {
    const newState = !isHeatOn;
    setIsHeatOn(newState);
    if (onHeatChange) onHeatChange(newState);
    if (onHeater) {
      onHeater(newState ? "heat on" : "heat off");
    }
  };

  const handleFanToggle = () => {
    const newState = !isFanOn;
    setIsFanOn(newState);
    if (onFanChange) onFanChange(newState);
    if (onFan) {
      onFan(newState ? "fan on" : "fan off");
    }
  };

  const handleSubmit = () => {
    const validNum = getValidHeatValue();
    
    // Принудительно форматируем текст в инпуте до "5.0", чтобы UI выглядел красиво
    setInputValue(validNum.toFixed(1));

    // Отправляем числовое значение родителю (для G-кода M104)
    if (onValueSubmit) {
      onValueSubmit(validNum);
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
        <div className={styles.tempGroup}>
          <span className={styles.tempValue}>{currentTemp.toFixed(1)}°C</span>
          <span className={styles.tempLabel}>Current Temp</span>
        </div>
      </div>

      {/* 3. Поле ввода и кнопка (Горизонтально) */}
      <div className={`${styles.inputGroup} ${!isHeatOn ? styles.disabled : ''}`}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;

            // 1. Разрешаем полностью очистить поле
            if (val === '') {
              setInputValue(val);
              return;
            }

            // 2. Проверяем формат: только цифры, максимум одна точка и не более 1 знака после нее (шаг 0.1)
            if (!/^[0-9]*\.?[0-9]?$/.test(val)) {
              return; // Блокируем ввод, если знаков после точки больше одного или формат неверный
            }

            // 3. Проверяем диапазон, если это уже полноценное число
            const num = parseFloat(val);
            if (!isNaN(num)) {
              if (num > 10) return; // Блокируем, если число стало больше 10
              
              // Особый случай для нуля: не разрешаем вводить "0" два раза подряд (например, "00")
              if (val.startsWith('0') && val.length > 1 && val[1] !== '.') {
                return;
              }
            }

            // Если все проверки пройдены — обновляем стейт
            setInputValue(val);
          }}
          // onBlur нужен только для того, чтобы подтянуть до 0.1, если пользователь оставил "0" или "0."
          onBlur={(e) => {
            const num = parseFloat(e.target.value);
            if (isNaN(num) || num < 0.1) {
              setInputValue('0.1');
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
