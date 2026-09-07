import { useState, useRef, useEffect } from 'react';
import styles from './ActuatorWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';

interface Props {
  label: string;
  onHomeClick?: () => void;
  onModeChange?: (mode: string) => void;
  onPosChange?: (mode: string) => void;
  onPrecisionModeToggle?: (active: boolean) => void;
  onMultiplierChange?: (multiplier: number) => void;
  onPulse?: () => void;
  initializationStatus?: string;
  currentMode?: string;
  onForwardHold?: (step: number) => void;   // при удержании «вперёд»
  onBackwardHold?: (step: number) => void;  // при удержании «назад»
}

export default function ActuatorWidget({
  label,
  onHomeClick,
  onModeChange,
  onPosChange,
  onPrecisionModeToggle,
  onMultiplierChange,
  onPulse,
  onForwardHold,
  onBackwardHold,
  initializationStatus = 'Готов',
  currentMode = 'Режим 1'
}: Props) {
  const [isPrecisionModeOn, setIsPrecisionModeOn] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

    const handleHomeClick = () => {
      if (onHomeClick) onHomeClick();
    };

    // --- Управление удержанием ---
    const startHold = (direction: 'forward' | 'backward') => {
    if (holdIntervalRef.current) return; // уже идёт удержание
    const step = direction === 'forward' ? 0.1 : -0.1;
    // Сразу вызываем один раз
    if (direction === 'forward') {
      onForwardHold?.(step);
    } else {
      onBackwardHold?.(step);
    }
    // Затем каждые 100 мс
    holdIntervalRef.current = window.setInterval(() => {
      if (direction === 'forward') {
        onForwardHold?.(step);
      } else {
        onBackwardHold?.(step);
      }
    }, 100);
  };

  const stopHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  useEffect(() => {
  return () => stopHold();
  }, []);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value;
    if (onModeChange) onModeChange(mode);
  };

  const handlePrecisionModeToggle = () => {
    const newState = !isPrecisionModeOn;
    setIsPrecisionModeOn(newState);
    if (onPrecisionModeToggle) onPrecisionModeToggle(newState);
  };

  const handlePulse = () => {
    if (onPulse) onPulse();
  };

  const isReady = initializationStatus === 'Готов';

  const moveSteps = [
    { label: "- 0,1 мм", value: "-0.1" },
    { label: "- 1 мм", value: "-1" },
    { label: "- 10 мм", value: "-10" },
    { label: "+ 10 мм", value: "+10" },
    { label: "+ 1 мм", value: "+1" },
    { label: "+ 0,1 мм", value: "+0.1" },
  ];

  return (
    <div className={styles.tile}>
      <div className={styles.header}>{label}</div>

      {/* 1. Панель инициализации */}
      <div className={styles.panel}>
        <div className={styles.statusDisplay}>
          <button
          onClick={handleHomeClick}
          className={styles.homeBtn}
          >
          ДОМОЙ
          </button>
          <span className={styles.statusLabel}>Статус инициализации:</span>
          <span
            className={`${styles.statusValue} ${isReady ? styles.ready : styles.notReady}`}
          >
            {initializationStatus}
          </span>
        </div>
      </div>

      {/* 2. Панель выбора положения */}
      <div className={styles.panel}>
        <select
          value={currentMode}
          onChange={handleModeChange}
          disabled={!isReady}
          className={styles.modeSelect}
        >
          <option value="Режим 1">НУЛЕВОЕ ПОЛОЖЕНИЕ</option>
          <option value="Режим 2">MODE 2</option>
          <option value="Режим 3">MODE 3</option>
        </select>
        <button
          onClick={() => onModeChange?.(currentMode)}
          disabled={!isReady}
          className={styles.goBtn}
        >
          ВЫПОЛНИТЬ
        </button>
      </div>

      {/* 3. Панель управления положением */}
      <div className={styles.panelPos}>
        {moveSteps.map((step) => (
          <button
            key={step.value}
            onClick={() => onPosChange?.(step.value)}
            disabled={!isReady}
            className={styles.goBtn}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* 4. Панель плавного управления */}
      <div className={styles.panel}>
        <Iswitch checked={isPrecisionModeOn} onChange={handlePrecisionModeToggle} />
        <span>ПЛАВНЫЙ РЕЖИМ</span>

        <button
          onMouseDown={() => startHold('backward')}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold('backward')}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
          className={styles.homeBtn}
        >
          &lt;&lt;
        </button>

        <button
          onMouseDown={() => startHold('forward')}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold('forward')}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
          className={styles.homeBtn}
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
}
