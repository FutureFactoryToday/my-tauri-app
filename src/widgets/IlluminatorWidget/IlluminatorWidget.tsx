import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './IlluminatorWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';
import DigitalKeyboard from '../../components/DigitalKeyboard/DigitalKeyboard';

const MIN_POWER = 0;
const MAX_POWER = 300;

type Field = 'vis' | 'ir' | 'uv';

interface Props {
  label: string;
  onCommand?: (command: string) => void;
}

export default function IlluminatorWidget({
  label,
  onCommand,
}: Props) {
  const [visOn, setVisOn] = useState(false);
  const [irOn, setIrOn] = useState(false);
  const [uvOn, setUvOn] = useState(false);

  const [visVal, setVisVal] = useState('0');
  const [irVal, setIrVal] = useState('0');
  const [uvVal, setUvVal] = useState('0');

  const [visHint, setVisHint] = useState('');
  const [irHint, setIrHint] = useState('');
  const [uvHint, setUvHint] = useState('');

  const [activeField, setActiveField] = useState<Field | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [shiftAmount, setShiftAmount] = useState(0);

  const tileRef = useRef<HTMLDivElement>(null);
  const focusIntervalRef = useRef<number | null>(null);
  const naturalBottomRef = useRef<number | null>(null);

  const getValueFor = useCallback((field: Field): string => {
    if (field === 'vis') return visVal;
    if (field === 'ir') return irVal;
    return uvVal;
  }, [visVal, irVal, uvVal]);

  const setValueFor = useCallback((field: Field, val: string) => {
    if (field === 'vis') setVisVal(val);
    else if (field === 'ir') setIrVal(val);
    else setUvVal(val);
  }, []);

  const setHintFor = useCallback((field: Field, hint: string) => {
    if (field === 'vis') setVisHint(hint);
    else if (field === 'ir') setIrHint(hint);
    else setUvHint(hint);
  }, []);

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

  // --- Ввод значения ---
  const handleInputChange = (field: Field, val: string) => {
    if (val === '') {
      setValueFor(field, val);
      setHintFor(field, '');
      return;
    }
    if (!/^[0-9]*\.?[0-9]?$/.test(val)) return;
    if (val.startsWith('0') && val.length > 1 && val[1] !== '.') return;

    const num = parseFloat(val);
    if (isNaN(num)) return;

    if (num < MIN_POWER || num > MAX_POWER) {
      setValueFor(field, val);
      setHintFor(field, `ВВЕДИТЕ ЗНАЧЕНИЕ ОТ ${MIN_POWER} ДО ${MAX_POWER}`);
      return;
    }

    setValueFor(field, val);
    setHintFor(field, '');
  };

  const openKeyboardFor = (field: Field) => {
    setActiveField(field);
    setIsKeyboardOpen(true);
  };

  const handleKeyboardClose = () => {
    if (activeField) {
      const value = getValueFor(activeField);
      if (value.endsWith('.')) {
        setValueFor(activeField, value.slice(0, -1));
      }
    }
    setIsKeyboardOpen(false);
    setActiveField(null);
  };

  const handleToggle = (field: Field, newState: boolean) => {
    if (field === 'vis') setVisOn(newState);
    else if (field === 'ir') setIrOn(newState);
    else setUvOn(newState);

    if (!newState) {
      // Очищаем поле ввода и подсказку
      setValueFor(field, '0');
      setHintFor(field, '');

      // Отправляем команду выключения
      const cmdField = field === 'vis' ? 'vi' : field;
      onCommand?.(`illuminator ${cmdField} 0`);
    }
  };

  const submitField = (field: Field) => {
    const value = getValueFor(field);
    const num = parseFloat(value);

    if (isNaN(num) || num < MIN_POWER || num > MAX_POWER) {
      setHintFor(field, `Введите значение от ${MIN_POWER} до ${MAX_POWER}`);
      return;
    }

    setHintFor(field, '');
    const formatted = num.toFixed(1);
    setValueFor(field, formatted);

    const cmdField = field === 'vis' ? 'vi' : field;
    onCommand?.(`illuminator ${cmdField} ${formatted}`);
  };

  const renderRow = (
    field: Field,
    rowLabel: string,
    isOn: boolean,
    val: string,
    hint: string
  ) => (
    <div className={styles.rowWrapper}>
      <span className={styles.rowLabel}>{rowLabel}</span>
      <div className={styles.illuminatorRow}>
        <Iswitch checked={isOn} onChange={(v) => handleToggle(field, v)} />
        <div className={`${styles.inputGroup} ${!isOn ? styles.disabled : ''}`}>
          <input
            type="text"
            value={hint || val}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onFocus={() => openKeyboardFor(field)}
            onBlur={() => {
              if (isKeyboardOpen && activeField === field) return;
              const num = parseFloat(val);
              if (val === '' || isNaN(num)) {
                setValueFor(field, String(MIN_POWER));
                setHintFor(field, '');
                return;
              }
              if (num < MIN_POWER || num > MAX_POWER) {
                setHintFor(field, `Введите значение от ${MIN_POWER} до ${MAX_POWER}`);
                return;
              }
              setHintFor(field, '');
            }}
            disabled={!isOn}
            className={`${styles.input} ${hint ? styles.inputErrorText : ''}`}
            inputMode="none"
          />
          <button
            className={styles.submitBtn}
            onClick={() => submitField(field)}
            disabled={!isOn || !!hint}
          >
            Установить
          </button>
        </div>
      </div>
    </div>
  );

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

      {renderRow('vis', 'Видимый (белый)', visOn, visVal, visHint)}
      {renderRow('ir', '800 нм', irOn, irVal, irHint)}
      {renderRow('uv', '365 нм', uvOn, uvVal, uvHint)}

      <DigitalKeyboard
        open={isKeyboardOpen}
        onClose={handleKeyboardClose}
        onChange={(val) => activeField && handleInputChange(activeField, val)}
        targetRef={tileRef as React.RefObject<HTMLElement>}
        onHeightChange={setKeyboardHeight}
      />
    </div>
  );
}