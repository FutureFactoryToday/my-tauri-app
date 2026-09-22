import { useState, useRef, useEffect  } from 'react';
import styles from './ActuatorWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';

interface Props {
  label: string;
  onHomeClick?: () => void;
  onModeChange?: (mode: string) => void;
  onPosChange?: (mode: string) => void;
  onStepModeToggle?: (active: boolean) => void;
  onPrecisionModeToggle?: (active: boolean) => void;
  onPulse?: () => void;
  currentMode?: string;
  send?: (cmd: string) => void;
  lastMessage?: string | null;
  isConnected?: boolean;
}

export default function ActuatorWidget({
  label,
  onHomeClick,
  onModeChange,
  onPosChange,
  onStepModeToggle,
  onPrecisionModeToggle,
  currentMode = 'Режим 1',
  send,
  lastMessage,
  isConnected = false,
}: Props) {
  const [isPrecisionModeOn, setIsPrecisionModeOn] = useState(false);
  const [isStepModeOn, setIsStepModeOn] = useState(false);

  const [currentPos, setCurrentPos] = useState(0);

  const [initializationStatus, setInitializationStatus] = useState("Готов");

  const [isHoming, setIsHoming] = useState(false);

  // ↓ ref для send, чтобы useEffect опроса не перезапускался
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

    // ↓ парсинг ответа от МК
  useEffect(() => {
    if (!lastMessage) return;

    console.log('[ActuatorWidget] Received:', lastMessage);

    if (lastMessage.startsWith('Mpos is')) {
      // "Mpos is 12300" → "12300" → 12300 (микрометры, int32)
      const raw = lastMessage.replace('Mpos is ', '').trim();
      const microns = parseInt(raw, 10);

      if (!isNaN(microns)) {
        setCurrentPos(microns / 1000);   // µm → mm, храним полную точность
        console.log('[ActuatorWidget] Pos:', microns, 'µm →', (microns / 1000).toFixed(1), 'mm');
      }
    }
    if (isHoming && lastMessage.includes('is_home = true')) {
      console.log('[ActuatorWidget] Homing complete');
      setIsHoming(false);
      setInitializationStatus("Готов");
    }
  }, [lastMessage, isHoming]);

  // ↓ периодический опрос позиции (раз в секунду)
  useEffect(() => {
    console.log('[ActuatorWidget] Polling effect started');
    if (!isConnected) return;

    sendRef.current?.("amove current");   // запрос сразу после подключения

    const interval = setInterval(() => {
      sendRef.current?.("amove current");
    }, 500);

    return () => {
      console.log('[ActuatorWidget] Polling effect cleaned up');
      clearInterval(interval);
    };
  }, [isConnected]);   // ← только isConnected!

  const handleHomeClick = () => {
    // сообщаем наружу, если App всё ещё слушает
    if (onHomeClick) onHomeClick();

    // локальная логика парковки
    if (isConnected) {
      sendRef.current?.("amove home");
      setIsHoming(true);
      setInitializationStatus("Инициализация...");
    }
  };

  const isMovingRef = useRef(false);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value;
    if (onModeChange) onModeChange(mode);
  };

  const handleStepModeToggle = () => {
    const newState = !isStepModeOn;
    setIsStepModeOn(newState);
    if (onStepModeToggle) onStepModeToggle(newState);
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
          <span className={`${styles.statusValue} ${isReady ? styles.ready : styles.notReady}`}>
            {initializationStatus}
          </span>
          <div className={styles.DroGroup}>
            <span className={styles.DroValue}>{currentPos.toFixed(1)}</span>
            <span className={styles.DroLabel}>mm</span>
          </div>
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
      <div className={`${styles.panel} ${!isStepModeOn ? styles.disabled : ''}`}>
        <Iswitch checked={isStepModeOn} onChange={handleStepModeToggle} disabled={!isReady} />
        <span>ШАГОВЫЙ РЕЖИМ</span>

        <div className={styles.panelPos}>
          {moveSteps.map((step) => (
            <button
              key={step.value}
              onClick={() => onPosChange?.(step.value)}
              disabled={!isReady || !isStepModeOn}
              className={styles.goBtn}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Панель плавного управления */}
      <div className={`${styles.panel} ${!isPrecisionModeOn ? styles.disabled : ''}`}>
        <Iswitch checked={isPrecisionModeOn} onChange={handlePrecisionModeToggle} disabled={!isReady} />
        <span>ПЛАВНЫЙ РЕЖИМ</span>

        <div className={styles.panelPos}>
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
          className={styles.goBtn}
          disabled={!isReady || !isPrecisionModeOn}
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
          className={styles.goBtn}
          disabled={!isReady || !isPrecisionModeOn}
        >
          &gt;&gt;
        </button>
        </div>
      </div>
    </div>
  );
}
