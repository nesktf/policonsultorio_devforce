
export class Result<T, E = Error> {
  private _value: T | null;
  private _error: E | null;

  private constructor(value: T | null, error: E | null) {
    this._value = value;
    this._error = error;
  }

  andThen<U>(f: (val: T) => Result<U, E>): Result<U, E> {
    if (this._value != null) {
      return f(this._value);
    } else {
      return new Result<U, E>(null, this._error);
    }
  }

  catch<U>(f: (err: E) => Result<T, U>): Result<T, U> {
    if (this._error != null) {
      return f(this._error);
    } else {
      return new Result<T, U>(this._value, null);
    }
  }

  transform<U>(f: (val: T) => U): Result<U, E> {
    if (this._value != null) {
      return new Result<U, E>(f(this._value), null);
    } else {
      return new Result<U, E>(null, this._error);
    }
  }

  transformError<U>(f: (err: E) => U): Result<T, U> {
    if (this._error != null) {
      return new Result<T, U>(null, f(this._error));
    } else {
      return new Result<T, U>(this._value, null);
    }
  }

  hasValue(): boolean { return this._value != null; }
  hasError(): boolean { return this._error != null; }

  unwrap(): T {
    if (this._value == null) {
      throw this._error;
    }
    return this._value;
  }

  unwrapOr(def_val: T) {
    if (this._value != null) {
      return this._value;
    } else {
      return def_val;
    }
  }

  error(): E {
    if (this._error == null) {
      throw new Error("No error in Result<T, E>")
    }
    return this._error;
  }

  errorOr(def_err: E): E {
    if (this._error != null) {
      return this._error;
    } else {
      return def_err;
    }
  }

  static Some<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(value, null);
  }
  static None<T, E = Error>(err: E): Result<T, E> {
    return new Result<T, E>(null, err);
  }
  static CatchFrom<T, E = Error>(f: () => T, errtype: { new(err: string): E; }): Result<T, E> {
    try {
      return new Result<T, E>(f(), null);
    } catch (err) {
      return new Result<T, E>(null, new errtype(`${err}`));
    }
  }
}

export class Maybe<T> {
  private _value: T | null;

  private constructor(value: T | null) {
    this._value = value;
  }

  andThen<U>(f: (value: T) => Maybe<U>): Maybe<U> {
    if (this._value != null) {
      return f(this._value);
    } else {
      return new Maybe<U>(null);
    }
  }

  catch(f: () => Maybe<T>): Maybe<T> {
    if (!this._value != null) {
      return f();
    } else {
      return new Maybe<T>(this._value);
    }
  }

  transform<U>(f: (value: T) => U): Maybe<U> {
    if (this._value != null) {
      return new Maybe(f(this._value));
    } else {
      return new Maybe<U>(null);
    }
  }

  hasValue(): boolean { return this._value != null; }

  unwrap(): T {
    if (this._value == null) {
      throw new Error("No value in Maybe<T>");
    }
    return this._value;
  }

  unwrapOr(def_val: T): T {
    if (this._value != null) {
      return this._value;
    } else {
      return def_val;
    }
  }

  static Some<T>(value: T): Maybe<T> {
    return new Maybe<T>(value);
  }
  static None<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }
  static CatchFrom<T>(f: () => T): Maybe<T> {
    try {
      return new Maybe<T>(f());
    } catch (_err) {
      return new Maybe<T>(null);
    }
  }
}