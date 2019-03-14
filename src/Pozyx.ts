import Connection from "./connections/Connection";
import { ReadRegister, ReadWriteRegister, Status } from "./registers";

const EXPECTED_WHO_AM_I = 0x43

/**
 * A pozyx device
 */
export default class Pozyx {
  private _connection: Connection;

  private _firmwareVersion: [number, number];
  private _hardwareVersion: number;
  private _isShield: boolean;
  private _selfTestResults: Status.SelfTestResult;

  private _isInitialized = false;

  constructor(connection: Connection) {
    this._connection = connection;
  }

  /**
   * Checks whether or not this pozyx is remote
   */
  public isRemote(): boolean {
    return this._connection.isRemote;
  }

  /**
   * Returns whether or not this device is an arduino shield
   * 
   * @returns {@code true} if this device is an arduino shield, {@code false} 
   *                       otherwise
   */
  public isShield(): boolean {
    this._assertInitialized();

    return this._isShield;
  }

  /**
   * Returns a tuple representing the firmware version
   * 
   * @returns a tuple representing the firmware version. The first value is the
   *          major version and the second value is the minor version
   */
  public getFirmwareVersion(): [number, number] {
    this._assertInitialized();

    return this._firmwareVersion;
  }

  /**
   * Returns the hardware version of the device
   * 
   * @returns the hardware version
   */
  public getHardwareVersion(): number {
    this._assertInitialized();

    return this._hardwareVersion;
  }

  /**
   * Returns the results of the device's self test
   * 
   * @returns the results of the device's self test
   */
  public getSelfTestResults(): Status.SelfTestResult {
    this._assertInitialized();

    return this._selfTestResults;
  }

  /**
   * Initializes the connection with the device
   */
  public init(): Promise<void> {
    return this._connection.init()
      .then(() => this.ping())
      .then(() => this._readRegisters([Status.FIRMWARE_VERSION, 
        Status.HARDWARE_VERSION, Status.SELF_TEST_RESULTS]))
      .then(data => { // get device info
        this._firmwareVersion = data[0];

        [this._hardwareVersion, this._isShield] = data[1];

        this._selfTestResults = data[2];
      })
      .then(() => {this._isInitialized = true});
  }

  /**
   * Checks connection with device.
   * 
   * @returns {Promise} resolved if connection is verified, rejected if 
   *                    connection cannot be verified.
   */
  public async ping(): Promise<void> {
    if (await this.getWhoAmI() != EXPECTED_WHO_AM_I)
      throw new Error('Failed to ping pozyx');
  }

  /**
   * Reads from the register
   * 
   * @param register the register to read
   * @returns {Promise} resolved to the data stored at the register
   */
  public async readReg<T>(register: ReadRegister<T>): Promise<T> {
    const buf = await this._connection.read(register.address, register.size);
    return register.decode(buf);
  }

  /**
   * Writes the data to the register
   * 
   * @param register the register to write to
   * @param data the data to write
   * @returns {Promise} resolved when the write is complete
   */
  public async writeReg<T>(register: ReadWriteRegister<T>, data: T): Promise<any> {
    const buf = register.encode(data);
    return this._connection.write(register.address, buf);
  }

  /**
   * Gets the value stored at the WHO_AM_I register. Used to verify connection
   * to device
   * 
   * @returns {Promise<number>}
   */
  public getWhoAmI(): Promise<number> {
    return this.readReg(Status.WHO_AM_I);
  }

  private _assertInitialized() {
    if (! this._isInitialized)
      throw new Error('Device has not been initialized');
  }

  private async _readRegisters(registers: ReadRegister<any>[]): Promise<any[]> {
    const last = registers[registers.length - 1];
    const buf = await this._connection.read(registers[0].address, last.address + last.size);
    const data = [];

    for (let i = 0, offset = 0; i < registers.length; offset += registers[i++].size)
      data[i] = registers[i].decode(buf.slice(offset, offset + registers[i].size));

    return data;
  }
}
