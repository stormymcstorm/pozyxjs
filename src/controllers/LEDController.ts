import Pozyx from '../Pozyx';
import {Config, Function} from '../registers';
import {assertFunctionCallSuccess} from '../utils';

type LEDNumber = 1 | 2 | 3 | 4;

/**
 * Handles controlling LEDs on the device
 */
export default class LEDController {
  private _device: Pozyx;

  /**
   * Creates a new LED controller
   * 
   * @param device the device to control
   */
  constructor(device: Pozyx) {
    this._device = device;
  }

  /**
   * Claims the LEDs so that they may be controlled
   * 
   * @param leds the LEDs to claims
   * @returns {Promise} resolved when the LEDs have been claimed
   */
  public async claim(...leds: LEDNumber[]) {
    let conf = await this._device.readReg(Config.CONFIG_LEDS);
    
    for (let i = 0; i < leds.length; i++) 
      conf.leds[leds[i] - 1] = false;
    
    return this._device.writeReg(Config.CONFIG_LEDS, conf);
  }

  /**
   * Releases the LEDs so that they can be controlled by the device
   * 
   * @param leds the LEDs to release
   * @returns {Promise} resolved when the leds have been released
   */
  public async release(...leds: LEDNumber[]) {
    let conf = await this._device.readReg(Config.CONFIG_LEDS);
    
    for (let i = 0; i < leds.length; i++) 
      conf.leds[leds[i] - 1] = true;
    
    return this._device.writeReg(Config.CONFIG_LEDS, conf);
  }

  /**
   * Sets the state of a LED. The LED must be claimed in order to change it's 
   * state
   * 
   * @param led the LED whose state to set
   * @param on  whether or not the LED should be on
   * @returns {Promise} resolved when the state has been set
   */
  public setState(led: LEDNumber, on: boolean): Promise<void> {
    const states = [];
    states[led - 1] = on;

    return this._device.callReg(Function.LED_CTRL, states)
      .then(assertFunctionCallSuccess);
  }

  /**
   * Sets the states of all the LEDs
   * 
   * @param states the states to set for each LED. Each item in the array 
   *               corresponds to an LED
   * @returns {Promise} resolved when the LEDs are set
   */
  public setStates(states: [boolean, boolean, boolean, boolean]): Promise<void> {
    return this._device.callReg(Function.LED_CTRL, states)
      .then(assertFunctionCallSuccess);
  }
}
