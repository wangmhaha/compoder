export const pipe =
  <T>(...fns: Array<(arg: T) => Promise<T>>) =>
  async (value: T): Promise<T> => {
    return fns.reduce<Promise<T>>(
      async (promise, fn) => fn(await promise),
      Promise.resolve(value),
    )
  }
