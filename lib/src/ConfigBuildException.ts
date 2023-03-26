export class ConfigBuildException extends Error {
  static stackTraceLimit = 0;
  private previous?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);

    Object.defineProperty(this, 'previous', {
      value: cause,
      enumerable: false,
      writable: false,
    });

    Object.defineProperty(this, 'name', {
      value: ConfigBuildException.name,
      enumerable: false,
      writable: false,
    });

    this.enhanceStackTrace(this.constructor, cause);
  }

  public getPrevious(): unknown {
    return this.previous;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected enhanceStackTrace(constructor: Function, cause: unknown) {
    if (cause != undefined) {
      this.stack = this.message + '\n';

      if (cause instanceof Error && cause.stack !== undefined) this.stack += cause.stack;
      else this.stack += String(cause);
    }
  }
}
