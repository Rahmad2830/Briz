import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock EventSource
class MockEventSource {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.listeners = new Map();
    this.readyState = 0; // CONNECTING
    
    // Simulate connection opened
    setTimeout(() => {
      this.readyState = 1; // OPEN
    }, 0);
  }

  addEventListener(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    if (this.listeners.has(event)) {
      const handlers = this.listeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  dispatchEvent(event) {
    const eventType = event.type;
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(handler => handler(event));
    }
  }

  close() {
    this.readyState = 2; // CLOSED
  }

  // Helper untuk simulasi event dari server
  simulateMessage(eventType, data) {
    const event = new Event(eventType);
    event.data = data;
    this.dispatchEvent(event);
  }

  simulateError() {
    const event = new Event('error');
    if (this.onerror) {
      this.onerror(event);
    }
  }
}

describe('SSE Functions', () => {
  let dom;
  let document;
  let window;
  let EventSource;
  
  // Import fungsi dari source code
  let b; // WeakMap untuk menyimpan SSE connections
  let _; // Fungsi untuk inisialisasi semua SSE
  let v; // Fungsi untuk setup SSE pada element
  let k; // Fungsi untuk cleanup SSE
  let m; // Mock fungsi swap

  beforeEach(() => {
    // Setup JSDOM
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost'
    });
    document = dom.window.document;
    window = dom.window;
    
    // Setup global EventSource mock
    global.EventSource = MockEventSource;
    EventSource = MockEventSource;
    
    // Setup fungsi-fungsi dari source code
    b = new WeakMap();
    
    // Mock fungsi m (swap)
    m = vi.fn();
    
    // Fungsi v - setup SSE pada element
    v = (r) => {
      if (b.has(r)) return;
      
      let e = r.dataset.sse;
      if (!e) throw new Error('[data-sse] missing required attribute: data-sse');
      
      let t = r.dataset.event;
      if (!t) throw new Error('[data-sse] missing required attribute: data-event');
      
      let o = t.split(',').map(n => n.trim());
      let a = new EventSource(e, { withCredentials: true });
      let s = (n) => {
        if (n.data) m(n.data);
      };
      
      o.forEach(n => {
        a.addEventListener(n, s);
      });
      
      a.onerror = (n) => {
        console.error('[data-sse] SSE connection error', n);
      };
      
      b.set(r, {
        eventSource: a,
        handler: s,
        events: o
      });
    };
    
    // Fungsi k - cleanup SSE
    k = (r) => {
      let e = b.get(r);
      if (e) {
        e.events.forEach(t => {
          e.eventSource.removeEventListener(t, e.handler);
        });
        e.eventSource.close();
        b.delete(r);
      }
    };
    
    // Fungsi _ - inisialisasi semua SSE
    _ = () => {
      document.querySelectorAll('[data-sse]').forEach(e => {
        try {
          v(e);
        } catch (t) {
          console.error(t);
        }
      });
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('v() - Setup SSE', () => {
    it('should throw error if data-sse attribute is missing', () => {
      const el = document.createElement('div');
      el.setAttribute('data-event', 'message');
      
      expect(() => v(el)).toThrow('[data-sse] missing required attribute: data-sse');
    });

    it('should throw error if data-event attribute is missing', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      
      expect(() => v(el)).toThrow('[data-sse] missing required attribute: data-event');
    });

    it('should create EventSource with correct URL', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      v(el);
      
      const connection = b.get(el);
      expect(connection).toBeDefined();
      expect(connection.eventSource.url).toBe('/stream');
    });

    it('should create EventSource with withCredentials', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      v(el);
      
      const connection = b.get(el);
      expect(connection.eventSource.options.withCredentials).toBe(true);
    });

    it('should register single event listener', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      v(el);
      
      const connection = b.get(el);
      expect(connection.events).toEqual(['message']);
      expect(connection.eventSource.listeners.get('message')).toHaveLength(1);
    });

    it('should register multiple event listeners', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message, update, notification');
      
      v(el);
      
      const connection = b.get(el);
      expect(connection.events).toEqual(['message', 'update', 'notification']);
      expect(connection.eventSource.listeners.get('message')).toHaveLength(1);
      expect(connection.eventSource.listeners.get('update')).toHaveLength(1);
      expect(connection.eventSource.listeners.get('notification')).toHaveLength(1);
    });

    it('should not create duplicate connection for same element', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      v(el);
      const connection1 = b.get(el);
      
      v(el); // Call again
      const connection2 = b.get(el);
      
      expect(connection1).toBe(connection2);
    });

    it('should call m() when receiving SSE message', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      v(el);
      
      const connection = b.get(el);
      connection.eventSource.simulateMessage('message', '<div>Hello SSE</div>');
      
      expect(m).toHaveBeenCalledWith('<div>Hello SSE</div>');
    });

    it('should not call m() when data is empty', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      v(el);
      
      const connection = b.get(el);
      connection.eventSource.simulateMessage('message', '');
      
      expect(m).not.toHaveBeenCalled();
    });

    it('should handle multiple events correctly', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'update, notification');
      
      v(el);
      
      const connection = b.get(el);
      
      connection.eventSource.simulateMessage('update', '<div>Update</div>');
      expect(m).toHaveBeenCalledWith('<div>Update</div>');
      
      connection.eventSource.simulateMessage('notification', '<div>Notification</div>');
      expect(m).toHaveBeenCalledWith('<div>Notification</div>');
      
      expect(m).toHaveBeenCalledTimes(2);
    });
  });

  describe('k() - Cleanup SSE', () => {
    it('should remove event listeners and close connection', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      v(el);
      
      const connection = b.get(el);
      const closeSpy = vi.spyOn(connection.eventSource, 'close');
      
      k(el);
      
      expect(closeSpy).toHaveBeenCalled();
      expect(b.has(el)).toBe(false);
    });

    it('should remove all event listeners', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message, update');
      
      v(el);
      
      const connection = b.get(el);
      const removeEventListenerSpy = vi.spyOn(connection.eventSource, 'removeEventListener');
      
      k(el);
      
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('message', connection.handler);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('update', connection.handler);
    });

    it('should handle cleanup of non-existent connection', () => {
      const el = document.createElement('div');
      
      expect(() => k(el)).not.toThrow();
    });

    it('should not receive messages after cleanup', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      v(el);
      
      const connection = b.get(el);
      const eventSource = connection.eventSource;
      
      k(el);
      
      // Coba kirim message setelah cleanup
      eventSource.simulateMessage('message', '<div>Should not be called</div>');
      
      expect(m).not.toHaveBeenCalled();
    });
  });

  describe('_() - Initialize all SSE', () => {
    it('should initialize all elements with data-sse', () => {
      document.body.innerHTML = `
        <div data-sse="/stream1" data-event="message"></div>
        <div data-sse="/stream2" data-event="update"></div>
        <div data-sse="/stream3" data-event="notification"></div>
      `;
      
      _();
      
      const elements = document.querySelectorAll('[data-sse]');
      elements.forEach(el => {
        expect(b.has(el)).toBe(true);
      });
    });

    it('should skip elements with missing data-event attribute', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      document.body.innerHTML = `
        <div data-sse="/stream1" data-event="message"></div>
        <div data-sse="/stream2"></div>
      `;
      
      _();
      
      const validElement = document.querySelector('[data-sse="/stream1"]');
      const invalidElement = document.querySelector('[data-sse="/stream2"]');
      
      expect(b.has(validElement)).toBe(true);
      expect(b.has(invalidElement)).toBe(false);
      
      // Hanya 1 error karena element tanpa data-sse tidak akan di-query
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      
      consoleErrorSpy.mockRestore();
    });

    it('should not initialize already initialized elements', () => {
      document.body.innerHTML = `
        <div data-sse="/stream" data-event="message"></div>
      `;
      
      const el = document.querySelector('[data-sse]');
      
      _();
      const connection1 = b.get(el);
      
      _();
      const connection2 = b.get(el);
      
      expect(connection1).toBe(connection2);
    });
  });

  describe('Integration tests', () => {
    it('should handle full lifecycle: init -> receive -> cleanup', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      // Initialize
      v(el);
      expect(b.has(el)).toBe(true);
      
      // Receive message
      const connection = b.get(el);
      connection.eventSource.simulateMessage('message', '<div>Test</div>');
      expect(m).toHaveBeenCalledWith('<div>Test</div>');
      
      // Cleanup
      k(el);
      expect(b.has(el)).toBe(false);
      expect(connection.eventSource.readyState).toBe(2); // CLOSED
    });

    it('should handle multiple connections simultaneously', () => {
      document.body.innerHTML = `
        <div id="el1" data-sse="/stream1" data-event="message"></div>
        <div id="el2" data-sse="/stream2" data-event="update"></div>
      `;
      
      _();
      
      const el1 = document.getElementById('el1');
      const el2 = document.getElementById('el2');
      
      const conn1 = b.get(el1);
      const conn2 = b.get(el2);
      
      conn1.eventSource.simulateMessage('message', '<div>Message 1</div>');
      conn2.eventSource.simulateMessage('update', '<div>Update 1</div>');
      
      expect(m).toHaveBeenCalledTimes(2);
      expect(m).toHaveBeenNthCalledWith(1, '<div>Message 1</div>');
      expect(m).toHaveBeenNthCalledWith(2, '<div>Update 1</div>');
    });

    it('should handle error events', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const el = document.createElement('div');
      el.setAttribute('data-sse', '/stream');
      el.setAttribute('data-event', 'message');
      
      v(el);
      
      const connection = b.get(el);
      connection.eventSource.simulateError();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});