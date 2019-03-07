/**
 * A device register
 */
export default class Register {
  /**
   * Creates a new device register
   * 
   * @param address the address of the register
   */
  constructor(public readonly address: number) {}
}

/**
 * A readable device register
 * @param <T> the type of data that the register contains
 */
export class ReadRegister<T> extends Register {
  /**
   * Creates a new readable register
   * 
   * @param address the address of the register
   * @param size the size of the data stored at the register
   * @param decode a function that decodes the register's data
   */
  constructor(address: number, public readonly size: number, 
      public readonly decode: (data: Buffer) => T) {
    super(address);
  };
}

/**
 * A device register that is both readable and writeable
 * @param <T> the type of data that the register contains
 */
export class ReadWriteRegister<T> extends ReadRegister<T> {
  /**
   * Creates a new read-write register
   * 
   * @param address the address of the register
   * @param size the size of the data stored at the register
   * @param decode decodes the data stored at the register
   * @param encode encodes data to be stored at the register
   */
  constructor(address: number, size: number, 
    decode: (data: Buffer) => T, public readonly encode: (data: T) => Buffer) {
      super(address, size, decode);
    }
}

/**
 * A function register
 * 
 * @param <P> the type of the function's parameters
 * @param <R> the type of data that the function returns
 */
export class FunctionRegister<P, R> {
  /**
   * Creates a new function register
   * 
   * @param address the address of the register
   * @param size the size of the data returned by the function in bytes
   * @param decode decodes the data returned by the function
   * @param encode encodes the parameters
   */
  constructor(public readonly address: number, public readonly size: number, 
    public readonly decode: (data: Buffer) => R, public readonly encode: (data: P) => Buffer) {
  }
}
