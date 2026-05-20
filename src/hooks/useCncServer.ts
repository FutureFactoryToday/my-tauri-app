import { useState, useEffect, useRef } from 'react';

export const useCncServer = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    ws.current = socket;
    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    return () => socket.close();
  }, [url]);

  const send = (msg: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(msg);
  };

  return { isConnected, send };
};
