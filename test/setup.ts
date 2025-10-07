// Polyfill process for browser environment
if (typeof globalThis.process === 'undefined') {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>()
  globalThis.process = {
    on: (event: string, handler: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, [])
      }
      listeners.get(event)!.push(handler)
    },
    off: (event: string, handler: (...args: unknown[]) => void) => {
      if (listeners.has(event)) {
        const eventListeners = listeners.get(event)!
        const index = eventListeners.indexOf(handler)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    }
  } as typeof process
}
