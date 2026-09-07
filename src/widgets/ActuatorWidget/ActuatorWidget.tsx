import { useState, useRef } from 'react';
import styles from './ActuatorWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';

interface Props {
  label: string;
  onHomeClick?: () => void;
  onModeChange?: (mode: string) => void;
  onPosChange?: (mode: string) => void;
  onPrecisionModeToggle?: (active: boolean) => void;
  onPulse?: () => void;
  initializationStatus?: string;
  currentMode?: string;
}

export default function ActuatorWidget({
  label,
  onHomeClick,
  onModeChange,
  onPosChange,
  onPrecisionModeToggle,
  initializationStatus = 'Готов',
  currentMode = 'Режим 1'
}: Props) {
  const [isPrecisionModeOn, setIsPrecisionModeOn] = useState(false);
    const handleHomeClick = () => {
      if (onHomeClick) onHomeClick();
  };

  const isMovingRef = useRef(false);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value;
    if (onModeChange) onModeChange(mode);
  };

  const handlePrecisionModeToggle = () => {
    const newState = !isPrecisionModeOn;
    setIsPrecisionModeOn(newState);
    if (onPrecisionModeToggle) onPrecisionModeToggle(newState);
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
          onMouseDown={() => {
            if (!isMovingRef.current) {
              isMovingRef.current = true;
              onPosChange?.("-500");
            }
          }}
          onMouseUp={() => {
            if (isMovingRef.current) {
              isMovingRef.current = false;
              onPosChange?.("0");
            }
          }}
          onMouseLeave={() => {
            if (isMovingRef.current) {
              isMovingRef.current = false;
              onPosChange?.("0");
            }
          }}
          onTouchStart={() => {
            if (!isMovingRef.current) {
              isMovingRef.current = true;
              onPosChange?.("-500");
            }
          }}
          onTouchEnd={() => {
            if (isMovingRef.current) {
              isMovingRef.current = false;
              onPosChange?.("0");
            }
          }}
          onTouchCancel={() => {
            if (isMovingRef.current) {
              isMovingRef.current = false;
              onPosChange?.("0");
            }
          }}
          className={styles.homeBtn}
          disabled={!isReady}
        >
          &lt;&lt;
        </button>

        <button
          onMouseDown={() => {
            if (!isMovingRef.current) {
              isMovingRef.current = true;
              onPosChange?.("+500");
            }
          }}
          onMouseUp={() => {
            if (isMovingRef.current) {
              isMovingRef.current = false;
              onPosChange?.("0");
            }
          }}
          onMouseLeave={() => {
            if (isMovingRef.current) {
              isMovingRef.current = false;
              onPosChange?.("0");
            }
          }}
          onTouchStart={() => {
            if (!isMovingRef.current) {
              isMovingRef.current = true;
              onPosChange?.("+500");
            }
          }}
          onTouchEnd={() => {
            if (isMovingRef.current) {
              isMovingRef.current = false;
              onPosChange?.("0");
            }
          }}
          onTouchCancel={() => {
            if (isMovingRef.current) {
              isMovingRef.current = false;
              onPosChange?.("0");
            }
          }}
          className={styles.homeBtn}
          disabled={!isReady}
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
}
