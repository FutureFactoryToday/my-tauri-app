import { useState, useEffect, useRef, useCallback } from 'react';

export const useCncServer = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  const connect = useCallback(() => {

    if(ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) return;

    console.log(`L3 Probing link to ${url}...`);
    const nws = new WebSocket(url);

    nws.onopen = () => {
      console.log("L3 Connecting OK");
      setIsConnected(true);
      if(reconnectTimerRef.current){
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    nws.onmessage = (event) => {
      setLastMessage(event.data);
    };

    nws.onclose = (event: CloseEvent) => {
      setIsConnected(false);
      ws.current = null;
      console.log(`L3 Link closed (code: ${event.code}). Reconnect after 2 sec`);

      if(!reconnectTimerRef.current) {
        reconnectTimerRef.current = window.setTimeout(() => {
          reconnectTimerRef.current = null;
          connect();
        }, 2000);
      }
    };

    nws.onerror = () => {
      console.log("L3 Connecting ERROR");
      nws.close();
    };

    ws.current = nws;
  }, [url]);


  // useEffect(() => {
  //   connect();
  //   return () => {
  //     ws.current?.close();
  //   };
  // }, [connect]);


  useEffect(() => {
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      console.log("L3 Connecting OK");
      setIsConnected(true);
    };
    socket.onclose = () => {
      console.log("L3 Connecting Closed");
      setIsConnected(false);
      setIsDeviceConnected(false);
    };
    socket.onmessage = (event) => {
      const data = event.data.toString();

      if (data === "STATUS:READY") {
        setIsDeviceConnected(true);
      } else if (data === "STATUS:NO_DEVICE") {
        setIsDeviceConnected(false);
      } else {
        // Если это обычные данные от станка
        setLastMessage(data);
      }
    };
    return () => {
      socket.close();
    };
  }, [url]);

  const send = (msg: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) 
    {
      console.log("L3 -> Sending to L2:", msg);
      ws.current.send(msg);
    }
    else
    {
      console.error("L3: Socket not ready. State");
    }
  };

  return { isConnected, isDeviceConnected, lastMessage, send };
};
