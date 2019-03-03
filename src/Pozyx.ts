import Connection from "./connections/Connection";
import {Status} from "./Registers";

/**
 * A pozyx device
 */
export default class Pozyx {
  private _connection: Connection;
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
   * Initializes the connection with the device
   */
  public init(): Promise<void> {
    return this._connection.init()
      .then(() => this.ping())
      .then(() => {this._isInitialized = true});
  }

  /**
   * Checks connection with device.
   * 
   * @returns {Promise} resolved if connection is verified, rejected if 
   *                    connection cannot be verified.
   */
  public async ping(): Promise<void> {
    if (await this.getWhoAmI() != 0x43)
      throw new Error('Failed to ping pozyx');
  }

  /**
   * Gets the value stored at the WHO_AM_I register. Used to verify connection
   * to device
   * @returns {Promise<number>}
   */
  public async getWhoAmI(): Promise<number> {
    const data = await this._connection.read(Status.WHO_AM_I, 1);

    return data.readUInt8(0);
  }
}
