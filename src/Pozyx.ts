import Connection from "./connections/Connection";
import {Status, Config, Function} from "./Registers";

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
   * Sets the states of the LEDs. Behavior is not defined if LEDs are not owned
   * @see {@link Pozyx#setLEDOwnership}
   * 
   * @param states  the states to set. True for on, false for off.
   * @returns {Promise} resolved when the LED states are set
   */
  public setLEDStates(states: boolean[]): Promise<any> {
    const stateBitmap = booleanArrayToBitmap(states) & 0b1111; // only consider bit 0..4

    return this._connection.call(Function.LED_CONTROL, Buffer.from([0b11110000 + stateBitmap]), 1);
  }

  /**
   * Sets the ownership of LEDs 1 through 4. See POZYX_CONFIG_LEDS register description 
   * <a href="https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview">here</a>
   * for information on what LEDs mean when owned by pozyx
   * 
   * @param claims  A list specifying the ownership of the led. True for user ownership, 
   *                false for pozyx ownership.
   * @returns {Promise} resolved when the led's ownership has been changed
   */
  public async setLEDOwnership(claims: boolean[]): Promise<any> {
    const claimBitmap = (booleanArrayToBitmap(claims) & 0b1111) ^ 0b1111; // only consider bit 0..4 and toggle bits
    const data = await this._connection.read(Config.LED_CONFIGURATION, 1);
    const confBitmap = data.readUInt8(0);

    if ((confBitmap & 0b1111) == claimBitmap) // write is not necessary
      return;

    data.writeUInt8((confBitmap & ~0b1111) + claimBitmap, 0);

    return this._connection.write(Config.LED_CONFIGURATION, data);
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

function booleanArrayToBitmap(arr: boolean[]) {
  let bm = 0;

  for (let i = 0; i < arr.length; i++)
    if (arr[i]) bm += 1 << i;

  return bm;
}
