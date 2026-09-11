import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './AchtWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';
import DigitalKeyboard from '../../components/DigitalKeyboard/DigitalKeyboard';

const MIN_TEMP = 10;
const MAX_TEMP = 600;

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

  const [validationHint, setValidationHint] = useState('');

  const tileRef = useRef<HTMLDivElement>(null);
  const focusIntervalRef = useRef<number | null>(null);
  const naturalBottomRef = useRef<number | null>(null);

  // --- Возврат фокуса ---
  const stopFocusRetries = useCallback(() => {
    if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
    }
  }, []);

  const setFocusToTile = useCallback(() => {
    if (!tileRef.current) return;
    stopFocusRetries();

    tileRef.current.focus({ preventScroll: true });
    if (document.activeElement === tileRef.current) return;

    focusIntervalRef.current = window.setInterval(() => {
      if (!tileRef.current) {
        stopFocusRetries();
        return;
      }
      tileRef.current.focus({ preventScroll: true });
      if (document.activeElement === tileRef.current) {
        stopFocusRetries();
      }
    }, 100);
  }, [stopFocusRetries]);

  useEffect(() => {
    return () => stopFocusRetries();
  }, [stopFocusRetries]);

  useEffect(() => {
    if (!isKeyboardOpen) {
      setTimeout(() => setFocusToTile(), 50);
    }
  }, [isKeyboardOpen, setFocusToTile]);

  // --- Запоминаем естественную нижнюю границу ---
  useEffect(() => {
    if (isKeyboardOpen && tileRef.current && naturalBottomRef.current === null) {
      naturalBottomRef.current = tileRef.current.getBoundingClientRect().bottom;
    }
    if (!isKeyboardOpen) {
      naturalBottomRef.current = null;
    }
  }, [isKeyboardOpen]);

  // --- Сдвиг виджета ровно над клавиатурой ---
  useEffect(() => {
    if (!isKeyboardOpen || keyboardHeight === 0 || naturalBottomRef.current === null) {
      setShiftAmount(0);
      return;
    }
    const keyboardTop = window.innerHeight - keyboardHeight;
    const overlap = naturalBottomRef.current - keyboardTop;
    setShiftAmount(overlap > 0 ? overlap : 0);
  }, [isKeyboardOpen, keyboardHeight]);

  // --- Сдвиг соседей выше ---
  useEffect(() => {
    if (!tileRef.current) return;
    const parent = tileRef.current.parentElement;
    if (!parent) return;

    const siblings = Array.from(parent.children);
    const myIndex = siblings.indexOf(tileRef.current);
    const previousSiblings = siblings.slice(0, myIndex) as HTMLElement[];

    previousSiblings.forEach((el) => {
      el.style.position = 'relative';
      el.style.transition = 'top 0.3s ease';
      el.style.top = shiftAmount ? `-${shiftAmount}px` : '0';
    });

    return () => {
      previousSiblings.forEach((el) => {
        el.style.top = '0';
      });
    };
  }, [shiftAmount]);

  // --- Обработчики ---
  const handleInputChange = (val: string) => {
    if (val === '') {
      setInputValue(val);
      setValidationHint('');
      return;
    }
    if (!/^[0-9]*\.?[0-9]?$/.test(val)) return;
    if (val.startsWith('0') && val.length > 1 && val[1] !== '.') return;

    const num = parseFloat(val);
    if (isNaN(num)) return;

    if (num < MIN_TEMP || num > MAX_TEMP) {
      setInputValue(val);
      setValidationHint(`ВВЕДИТЕ ЗНАЧЕНИЕ ОТ ${MIN_TEMP} ДО ${MAX_TEMP}`);
      return;
    }

    setInputValue(val);
    setValidationHint('');
  };

  // const getValidHeatValue = () => {
  //   const num = parseFloat(inputValue);
  //   if (isNaN(num)) return MIN_TEMP;
  //   return Math.min(Math.max(num, MIN_TEMP), MAX_TEMP);
  // };

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
    const num = parseFloat(inputValue);

    if (isNaN(num) || num < MIN_TEMP || num > MAX_TEMP) {
      setValidationHint(`Введите значение от ${MIN_TEMP} до ${MAX_TEMP}`);
      return;
    }

    setValidationHint('');
    setInputValue(num.toFixed(1));
    if (onValueSubmit) onValueSubmit(num);
  };

  const handleKeyboardClose = () => {
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
        position: 'relative',
        top: shiftAmount ? -shiftAmount : 0,
        transition: 'top 0.3s ease',
      }}
    >
      <div className={styles.header}>{label}</div>

      <div className={styles.controlsGroup}>
        <div className={styles.switchRow}>
          <Iswitch checked={isHeatOn} onChange={handleHeatToggle} />
          <span>Нагреватель</span>
        </div>
        <div className={styles.switchRow}>
          <Iswitch checked={isFanOn} onChange={handleFanToggle} />
          <span>Вентилятор</span>
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
          value={validationHint || inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsKeyboardOpen(true)}
          onBlur={() => {
            if (isKeyboardOpen) return;

            const num = parseFloat(inputValue);
            if (inputValue === '' || isNaN(num)) {
              setInputValue(String(MIN_TEMP));
              setValidationHint('');
              return;
            }
            if (num < MIN_TEMP || num > MAX_TEMP) {
              setValidationHint(`Введите значение от ${MIN_TEMP} до ${MAX_TEMP}`);
              return;
            }
            setValidationHint('');
          }}
          disabled={!isHeatOn}
          className={`${styles.input} ${validationHint ? styles.inputErrorText : ''}`}
          placeholder="0.0"
          inputMode="none"
        />
        <button
          onClick={handleSubmit}
          disabled={!isHeatOn || !!validationHint}
          className={styles.submitBtn}
        >
          Установить
        </button>
      </div>

      <DigitalKeyboard
        open={isKeyboardOpen}
        onClose={handleKeyboardClose}
        onChange={handleInputChange}
        targetRef={tileRef as React.RefObject<HTMLElement>}
        onHeightChange={setKeyboardHeight}
      />
    </div>
  );
}