export function wait(timeout?: number) {
  return new Promise(r => setTimeout(r, timeout))
}
