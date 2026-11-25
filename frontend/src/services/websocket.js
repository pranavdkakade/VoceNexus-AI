/**
 * VoceNexus WebSocket Client Service
 * Manages connection lifecycle and message dispatching to the backend voice endpoint.
 */

class VoiceWebSocket {
  constructor() {
    this.ws = null;
    this.url = 'ws://localhost:8000/ws/voice';
    this.listeners = {
      message: [],
      open: [],
      close: [],
      error: [],
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(url = this.url) {
    this.url = url;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = (event) => {
        this.reconnectAttempts = 0;
        this.listeners.open.forEach((cb) => cb(event));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.message.forEach((cb) => cb(data));
        } catch (e) {
          this.listeners.message.forEach((cb) => cb({ response: event.data }));
        }
      };

      this.ws.onclose = (event) => {
        this.listeners.close.forEach((cb) => cb(event));
      };

      this.ws.onerror = (error) => {
        this.listeners.error.forEach((cb) => cb(error));
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? JSON.stringify({ text: data }) : JSON.stringify(data);
      this.ws.send(payload);
      return true;
    }
    return false;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    };
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export const voiceWs = new VoiceWebSocket();
