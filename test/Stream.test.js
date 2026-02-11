import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.useFakeTimers()

// ===============================
// MOCK EVENTSOURCE (track instance)
// ===============================

const sseInstances = []

class MockEventSource {
  constructor(url) {
    this.url = url
    this.listeners = {}
    this.close = vi.fn()
    sseInstances.push(this)
  }

  addEventListener(event, callback) {
    this.listeners[event] = callback
  }

  removeEventListener(event) {
    delete this.listeners[event]
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event]({ data })
    }
  }
}

global.EventSource = MockEventSource

// ===============================
// MOCK FETCH (for polling)
// ===============================

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    text: () =>
      Promise.resolve(
        '<div data-swap="test:append">POLL</div>'
      )
  })
)

// ===============================
// helper flush microtasks
// ===============================

async function flush() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('Briz - SSE & Polling', () => {
  beforeEach(() => {
      window.document.dispatchEvent(new Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true
    }))
    document.body.innerHTML = ''
    vi.clearAllMocks()
    sseInstances.length = 0
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  async function loadLib() {
  const lib = await import('../dist/Briz.min.js')

  document.dispatchEvent(new Event("DOMContentLoaded", {
    bubbles: true
  }))

  await Promise.resolve() // flush microtask
  return lib
}

  // =========================================
  // POLLING
  // =========================================

  it('should start polling and call fetch repeatedly', async () => {
    document.body.innerHTML = `
      <div data-polling="/api/test" data-refresh="1s"></div>
      <div data-swap="test:append"></div>
    `

    await loadLib()

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetch).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('should stop polling when element removed', async () => {
    document.body.innerHTML = `
      <div id="poll" data-polling="/api/test" data-refresh="1s"></div>
      <div data-swap="test:append"></div>
    `

    await loadLib()

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetch).toHaveBeenCalledTimes(1)

    const el = document.getElementById('poll')
    el.remove()

    await vi.advanceTimersByTimeAsync(2000)

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  // =========================================
  // SSE
  // =========================================

  it('should create EventSource instance', async () => {
    document.body.innerHTML = `
      <div data-sse="/sse" data-event="message"></div>
    `

    await loadLib()

    expect(sseInstances.length).toBe(1)
    expect(sseInstances[0].url).toBe('/sse')
  })

  it('should process incoming SSE data and swap DOM', async () => {
    document.body.innerHTML = `
      <div data-sse="/sse" data-event="message"></div>
      <div data-swap="test:append"></div>
    `

    await loadLib()

    expect(sseInstances.length).toBe(1)

    sseInstances[0].emit(
      'message',
      '<div data-swap="test:append">SSE</div>'
    )

    await flush()

    const target = document.querySelector('[data-swap="test:append"]')
    expect(target.innerHTML).toContain('SSE')
  })

  it('should close SSE when element removed', async () => {
    document.body.innerHTML = `
      <div id="sse" data-sse="/sse" data-event="message"></div>
    `
    
    await loadLib()

    expect(sseInstances.length).toBe(1)

    const el = document.getElementById('sse')
    el.remove()

    await flush()

    expect(sseInstances[0].close).toHaveBeenCalled()
  })
})