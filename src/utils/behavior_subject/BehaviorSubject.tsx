import { isEmpty, isEqual } from 'lodash-es'

export type Listener<T> = (value: T) => void

export class BehaviorSubject<T> {
  private value: T
  private listeners: Listener<T>[] = []
  private status: 'running' | 'stop' = 'stop'

  constructor(initialValue: T) {
    this.value = initialValue
  }

  public start(): void {
    this.status = 'running'
  }

  public stop(): void {
    this.status = 'stop'
  }

  public isRunning(): boolean {
    return this.status === 'running'
  }

  public getValue(): T {
    return this.value
  }

  public setValue(newValue: T): void {
    if (isEqual(this.value, newValue)) return
    this.value = newValue
    this.notifyListeners()
  }

  public subscribe(listener: Listener<T>): void {
    if (this.listeners.includes(listener)) return
    this.listeners.push(listener)
    if (!isEmpty(this.value)) {
      listener(this.value)
      this.value = {} as T
    }
  }

  public unsubscribe(listener: Listener<T>): void {
    const index = this.listeners.indexOf(listener)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(): void {
    if (isEmpty(this.value) || isEmpty(this.listeners)) return
    for (const listener of this.listeners) {
      listener(this.value)
    }
    this.value = {} as T
  }
}
