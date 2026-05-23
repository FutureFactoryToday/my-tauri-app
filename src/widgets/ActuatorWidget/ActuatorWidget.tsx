import { useState } from 'react';
import styles from './ActuatorWidget.module.css';

interface Props {
  label: string;
  onHomeClick?: () => void;
  onModeChange?: (mode: string) => void;
  onPrecisionModeToggle?: (active: boolean) => void;
  onMultiplierChange?: (multiplier: number) => void;
  onPulse?: () => void;
  initializationStatus?: string;
  currentMode?: string;
}

export default function ActuatorWidget({
  label,
  onHomeClick,
  onModeChange,
  onPrecisionModeToggle,
  onMultiplierChange,
  onPulse,
  initializationStatus = 'Ready',
  currentMode = 'Режим 1'
}: Props) {
  const [isPrecisionModeOn, setIsPrecisionModeOn] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value;
    if (onModeChange) onModeChange(mode);
  };

  const handlePrecisionModeToggle = () => {
    const newState = !isPrecisionModeOn;
    setIsPrecisionModeOn(newState);
    if (onPrecisionModeToggle) onPrecisionModeToggle(newState);
  };

  const handleMultiplierChange = (newMultiplier: number) => {
    setMultiplier(newMultiplier);
    if (onMultiplierChange) onMultiplierChange(newMultiplier);
  };

  const handlePulse = () => {
    if (onPulse) onPulse();
  };

  const isReady = initializationStatus === 'Ready';

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
          HOME
          </button>
          <span className={styles.statusLabel}>Статус инициализации:</span>
          <span
            className={`${styles.statusValue} ${isReady ? styles.ready : styles.notReady}`}
          >
            {initializationStatus}
          </span>
        </div>
      </div>

      {/* 2. Панель управления положением */}
      <div className={styles.panel}>
        <select
          value={currentMode}
          onChange={handleModeChange}
          disabled={!isReady}
          className={styles.modeSelect}
        >
          <option value="Режим 1">MODE 1</option>
          <option value="Режим 2">MODE 2</option>
          <option value="Режим 3">MODE 3</option>
        </select>
        <button
          onClick={() => onModeChange?.(currentMode)}
          disabled={!isReady}
          className={styles.goBtn}
        >
          GOTO
        </button>
      </div>

      {/* 3. Панель точного управления */}
      <div className={styles.panel}>
        {/* Переключатель режима точного управления */}
        <div
          className={`${styles.iosSwitch} ${isPrecisionModeOn ? styles.on : ''}`}
          onClick={handlePrecisionModeToggle}
        >
          <div className={styles.handle} />
        </div>
        <span>Точный режим</span>

        {/* Ползунок кратности перемещения */}
        <div className={`${styles.multiplierSlider} ${!isPrecisionModeOn ? styles.disabled : ''}`}>
          <button
            onClick={() => handleMultiplierChange(1)}
            className={multiplier === 1 ? styles.activeMultiplier : ''}
            disabled={!isPrecisionModeOn}
          >
            x1
          </button>
          <button
            onClick={() => handleMultiplierChange(10)}
            className={multiplier === 10 ? styles.activeMultiplier : ''}
            disabled={!isPrecisionModeOn}
          >
            x10
          </button>
          <button
            onClick={() => handleMultiplierChange(100)}
            className={multiplier === 100 ? styles.activeMultiplier : ''}
            disabled={!isPrecisionModeOn}
          >
            x100
          </button>
        </div>

        {/* Маховик */}
        <div
          className={`${styles.handwheel} ${!isPrecisionModeOn ? styles.disabled : ''}`}
          onMouseDown={handlePulse}
          onTouchStart={handlePulse}
        >
          <div className={styles.handwheelInner}>
            <div className={styles.cursorSpot} />
          </div>
        </div>
      </div>
    </div>
  );
}
