import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './AchtWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';
import DigitalKeyboard from '../../components/DigitalKeyboard/DigitalKeyboard';

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
  currentTemp = 0,
}: Props) {
  const [isHeatOn, setIsHeatOn] = useState(false);
  const [isFanOn, setIsFanOn] = useState(false);
  const [inputValue, setInputValue] = useState('0');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [shiftAmount, setShiftAmount] = useState(0);

  const tileRef = useRef<HTMLDivElement>(null);
  const focusIntervalRef = useRef<number | null>(null);

  console.log('[AchtWidget] render, isKeyboardOpen =', isKeyboardOpen);

  // Остановка повторных попыток
  const stopFocusRetries = useCallback(() => {
    if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
      console.log('[AchtWidget] stopFocusRetries: интервал очищен');
    }
  }, []);

  // Возврат фокуса с повторными попытками до успеха
  const setFocusToTile = useCallback(() => {
    console.log('[AchtWidget] setFocusToTile вызван');
    if (!tileRef.current) {
      console.log('[AchtWidget] setFocusToTile: tileRef.current = null');
      return;
    }
    stopFocusRetries(); // сбрасываем предыдущие попытки

    // Пробуем сразу
    tileRef.current.focus({ preventScroll: true });
    console.log('[AchtWidget] setFocusToTile: после focus(), activeElement =', document.activeElement);
    if (document.activeElement === tileRef.current) {
      console.log('[AchtWidget] setFocusToTile: фокус успешно установлен с первой попытки');
      return;
    }

    // Если не получилось — запускаем интервал
    console.log('[AchtWidget] setFocusToTile: фокус не установлен, запускаем интервал');
    focusIntervalRef.current = window.setInterval(() => {
      if (!tileRef.current) {
        console.log('[AchtWidget] setFocusToTile (interval): tileRef.current = null, очищаем');
        stopFocusRetries();
        return;
      }
      tileRef.current.focus({ preventScroll: true });
      console.log('[AchtWidget] setFocusToTile (interval): после focus, activeElement =', document.activeElement);
      if (document.activeElement === tileRef.current) {
        console.log('[AchtWidget] setFocusToTile (interval): фокус установлен, очищаем интервал');
        stopFocusRetries();
      }
    }, 100);
  }, [stopFocusRetries]);

  // Очистка интервала при размонтировании
  useEffect(() => {
    console.log('[AchtWidget] useEffect cleanup для stopFocusRetries');
    return () => stopFocusRetries();
  }, [stopFocusRetries]);

  // Возврат фокуса при закрытии клавиатуры
  useEffect(() => {
    console.log('[AchtWidget] useEffect isKeyboardOpen =', isKeyboardOpen);
    if (!isKeyboardOpen) {
      console.log('[AchtWidget] Клавиатура закрыта, планируем возврат фокуса через 50ms');
      setTimeout(() => {
        console.log('[AchtWidget] setTimeout для возврата фокуса, activeElement до =', document.activeElement);
        setFocusToTile();
        console.log('[AchtWidget] setTimeout для возврата фокуса, activeElement после =', document.activeElement);
      }, 50);
    }
  }, [isKeyboardOpen, setFocusToTile]);

  // Вычисление поднятия виджета при перекрытии
  useEffect(() => {
    if (!isKeyboardOpen || keyboardHeight === 0 || !tileRef.current) {
      setShiftAmount(0);
      return;
    }
    const rect = tileRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const overlaps = rect.bottom > windowHeight - keyboardHeight;
    setShiftAmount(overlaps ? keyboardHeight : 0);
  }, [isKeyboardOpen, keyboardHeight]);

  // --- Обработчики ---
  const handleInputChange = (val: string) => {
    console.log('[AchtWidget] handleInputChange, val =', val);
    if (val === '') {
      setInputValue(val);
      return;
    }
    if (!/^[0-9]*\.?[0-9]?$/.test(val)) return;
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num > 10) return;
      if (val.startsWith('0') && val.length > 1 && val[1] !== '.') return;
    }
    setInputValue(val);
  };

  const getValidHeatValue = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0.1) return 0.1;
    return num;
  };

  const handleHeatToggle = () => {
    const newState = !isHeatOn;
    setIsHeatOn(newState);
    if (onHeatChange) onHeatChange(newState);
    if (onHeater) onHeater(newState ? 'heat on' : 'heat off');
  };

  const handleFanToggle = () => {
    const newState = !isFanOn;
    setIsFanOn(newState);
    if (onFanChange) onFanChange(newState);
    if (onFan) onFan(newState ? 'fan on' : 'fan off');
  };

  const handleSubmit = () => {
    console.log('[AchtWidget] handleSubmit');
    const validNum = getValidHeatValue();
    setInputValue(validNum.toFixed(1));
    if (onValueSubmit) onValueSubmit(validNum);
  };

  const handleKeyboardClose = () => {
    console.log('[AchtWidget] handleKeyboardClose, текущий inputValue =', inputValue);
    if (inputValue.endsWith('.')) {
      setInputValue(inputValue.slice(0, -1));
    }
    setIsKeyboardOpen(false);
  };

  return (
    <div
      className={styles.tile}
      ref={tileRef}
      tabIndex={0}
      style={{
        marginTop: shiftAmount ? `-${shiftAmount}px` : '0',
        transition: 'margin-top 0.3s ease',
      }}
    >
      <div className={styles.header}>{label}</div>

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

      <div className={styles.tempDisplay}>
        <div className={styles.tempGroup}>
          <span className={styles.tempValue}>{currentTemp.toFixed(1)}°C</span>
          <span className={styles.tempLabel}>Current Temp</span>
        </div>
      </div>

      <div className={`${styles.inputGroup} ${!isHeatOn ? styles.disabled : ''}`}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            console.log('[AchtWidget] input onFocus, открываем клавиатуру');
            setIsKeyboardOpen(true);
          }}
          onBlur={(e) => {
            console.log('[AchtWidget] input onBlur, current activeElement =', document.activeElement);
            const num = parseFloat(e.target.value);
            if (isNaN(num) || num < 0.1) {
              setInputValue('0.1');
            }
          }}
          disabled={!isHeatOn}
          className={styles.input}
          placeholder="0.0"
          inputMode="none"
        />
        <button
          onClick={handleSubmit}
          disabled={!isHeatOn}
          className={styles.submitBtn}
        >
          SET
        </button>
      </div>

      <DigitalKeyboard
        open={isKeyboardOpen}
        onClose={handleKeyboardClose}
        onChange={handleInputChange}
        targetRef={tileRef as React.RefObject<HTMLElement>}
        onHeightChange={(height) => {
          console.log('[AchtWidget] onHeightChange, height =', height);
          setKeyboardHeight(height);
        }}
      />
    </div>
  );
}