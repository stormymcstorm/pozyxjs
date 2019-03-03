/**
 * A connection to a pozyx device
 */
export default interface Connection {
  /**
   * Whether or not the connection is remote
   */
  readonly isRemote: boolean;

  /**
   * Initializes the connection
   * 
   * @returns {Promise} resolved when the connection is initialized
   */
  init(): Promise<any>;

  /**
   * Checks whether or not the connection has been initialized
   */
  isInitialized(): boolean;

  /**
   * Reads from the given register
   * 
   * @param address the address of the register to read from
   * @param length the length of the data to read
   * @returns {Promise} resolves to the data. bytes are in little endian ordering
   */
  read(address: number, length: number): Promise<Buffer>;

  /**
   * Writes the data to the given register
   * 
   * @param address the address of the register to write to
   * @param data the data to write. bytes must be in little endian order
   * @returns {Promise} resolved when the write is complete
   */
  write(address: number, data: Buffer): Promise<any>;

  /**
   * Calls the function at the given register
   * 
   * @param address the address of the function's register
   * @param params the parameters to call the function with. bytes must be in little endian order
   * @param length the length of the data the function is expected to return
   * @returns {Promise<Buffer>} resolves to the data returned by the function. bytes are in little endian order
   */
  call(address: number, params: Buffer, length: number): Promise<Buffer>;
}
