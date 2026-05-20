import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Подключение...");
  const [logs, setLogs] = useState([]);
  const [command, setCommand] = useState("");
  const socketRef = useRef(null);

  // 1. Инициализация соединения при запуске
  useEffect(() => {
    // Укажи IP адрес Orange Pi, если демон запущен на ней (например 'ws://192.168.1.15:8080/ws')
    // Если тестируешь локально — оставляй localhost
    const ws = new WebSocket("ws://localhost:8080/ws");
    socketRef.current = ws;

    ws.onopen = () => setStatus("Подключено к L2 (Online)");
    ws.onclose = () => setStatus("Связь с L2 потеряна (Offline)");
    ws.onerror = () => setStatus("Ошибка сети");

    // Прием данных от демона (ответы от L1 или Loopback)
    ws.onmessage = (event) => {
      const message = event.data;
      setLogs((prev) => [...prev.slice(-10), `Станок: ${message}`]);
    };

    return () => ws.close(); // Закрываем сокет при выходе
  }, []);

  // 2. Функция отправки команды
  const sendToMachine = (text) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(text);
      setLogs((prev) => [...prev.slice(-10), `Вы: ${text}`]);
      setCommand(""); // Очистить поле ввода
    }
  };

  return (
    <div className="container">
      <div className={`status-bar ${status.includes("Online") ? "online" : "offline"}`}>
        {status}
      </div>

      <div className="log-window">
        {logs.map((log, i) => (
          <div key={i} className="log-entry">{log}</div>
        ))}
      </div>

      <div className="controls">
        <input 
          value={command} 
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Введите G-код (напр. G0 X10)"
          onKeyDown={(e) => e.key === 'Enter' && sendToMachine(command)}
        />
        <button onClick={() => sendToMachine(command)}>Отправить</button>
      </div>

      <div className="jog-panel">
        <h3>Ручное управление (Jogging)</h3>
        <button onClick={() => sendToMachine("G0 X-10")}>X-</button>
        <button onClick={() => sendToMachine("G0 X10")}>X+</button>
        <button onClick={() => sendToMachine("G0 Y10")}>Y+</button>
        <button onClick={() => sendToMachine("G0 Y-10")}>Y-</button>
      </div>
    </div>
  );
}

export default App;
