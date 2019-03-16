import { FunctionRegister } from './Register';
import { maskFromArray, isValidNetworkID, isValidCoordinate, MIN_INT32, MAX_INT32 } from '../utils';
import Coordinate from '../Coordinate';

const EMPTY_BUFFER = Buffer.allocUnsafe(0);
const IS_SUCCESS = (buf: Buffer) => buf.readUInt8(0) > 0;
const NO_PARAMS = _ => EMPTY_BUFFER;

/**
 * Calls the device's RESET_SYS function. Used to reset the system.
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_RESET_SYS}
 */
export const RESET_SYS = new FunctionRegister<void, boolean>(0xb0, 1,
  IS_SUCCESS,
  NO_PARAMS,
);

/**
 * Calls the device's LED_CTRL function. Used to set the state of the leds.
 * Accepts a array of booleans or null values. Each value represents the the
 * state to set. {@code true} for on, {@code false} for off and {@code null} for
 * no change.
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_LED_CTRL}
 */
export const LED_CTRL = new FunctionRegister<[boolean?, boolean?, boolean?, boolean?], boolean>(0xb1, 1,
  IS_SUCCESS,
  params => {
    // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
    // | USE 4 | USE 3 | USE 2 | USE 1 | LED 4 | LED 3 | LED 2 | LED 1 |
    let bm = maskFromArray(params) | 0b1111 << 4;

    // set the USE x bit to zero if params[x] is undefined
    for (let i = 0 ; i < params.length; i++) 
      if (params[i] == null) bm &= ~(1 << i + 4);
    
    return Buffer.from([bm]);
  }
);

/**
 * Calls the device's TX_DATA function. Used to write data to the device's 
 * transmission buffer.
 * Accepts a buffer to write to the device's transmission buffer. 
 * The first byte of the buffer indicated the write offset
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_TX_DATA}
 */
export const TX_DATA = new FunctionRegister<Buffer, boolean>(0xb2, 1,
  IS_SUCCESS,
  params => {
    if (params.length < 2 || params.length > 100)
      throw new Error('Invalid transmission buffer length: ' + params.length);
    
    return params;
  }
);

/**
 * The type of the transmission to make
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_TX_SEND}
 */
export const enum TransmissionType {
  /**
   * Performs a remote read. The first databyte in the transmission buffer should
   * be the register address
   */
  REG_READ = 0x02,

  /**
   * Performs a remote write. The first databyte in the transmission buffer should
   * be the register address. The second should be the number of bytes that will be written
   */
  REG_WRITE = 0x04,

  /**
   * Performs a remote function call. The first databyte in the transmission 
   * buffer should be the register address followed by the parameters.
   */
  REG_FUNC = 0x08,

  /**
   * Simply sends the data stored in the transmission buffer
   */
  REG_DATA = 0x06,
}

/**
 * Calls the device's TX_SEND function. Used to transmit the device's
 * transmission buffer.
 * Accepts the network id of the device to transmit to and the transmission type. 
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_TX_SEND}
 */
export const TX_SEND = new FunctionRegister<[number, TransmissionType?], boolean>(0xb3, 1,
  IS_SUCCESS,
  params => {
    const [id, type] = params;

    if (type && type != 0x02 
      && type != 0x04
      && type != 0x08 
      && type != 0x06)
      throw new Error('Invalid transmission type: ' + type);
    
    const buf = Buffer.allocUnsafe(3);
    buf.writeUInt16LE(id, 0);
    buf.writeUInt8(type, 2);

    return buf;
  }
);

/**
 * Calls the device's RX_DATA function. Used to read the device's
 * receive buffer.
 * Accepts the read offset. 
 * Returns a buffer in which the first byte indicates the success of the function
 * call and the following bytes contain the data.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_RX_DATA}
 */
export const RX_DATA = new FunctionRegister<number, Buffer>(0xb4, 100,
  buf => buf,
  params => {
    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt16LE(params, 0);

    return buf;
  }
);

/**
 * Calls the device's DO_RANGING function. Used to initiate ranging with a given
 * device.
 * Accepts the network id of the device to get the range to. 
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_DO_RANGING}
 */
export const DO_RANGING = new FunctionRegister<number, boolean>(0xb5, 1,
  IS_SUCCESS,
  params => {
    const buf = Buffer.allocUnsafe(2);
    buf.writeInt16LE(params, 0);
    return buf;
  },
  25
);

/**
 * Calls the device's DO_POSITIONING function. Used to initiate positioning. 
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_DO_POSITIONING}
 */
export const DO_POSITIONING = new FunctionRegister<void, boolean>(0xb6, 1,
  IS_SUCCESS,
  NO_PARAMS,
  80
);

/**
 * Calls the device's SET_ANCHOR_IDS function. Used to set the anchor ids that
 * can be used for positioning.
 * Accepts an array of network id of the device to use for positioning. 
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_SET_ANCHOR_IDS}
 */
export const POS_SET_ANCHOR_IDS = new FunctionRegister<number[], boolean>(0xb7, 1, 
  IS_SUCCESS,
  params => {
    if (params.length > 16)
      throw new Error('Positioning anchors count cannot exceed 16');
    
    const buf = Buffer.allocUnsafe(params.length * 2);

    for (let i = 0; i < params.length; i++)
      buf.writeUInt16LE(params[i], i * 2);

    return buf;
  }
);

/**
 * Calls the device's GET_ANCHORS_IDS function. Used to get a list of all the devices
 * being used for positioning. 
 * Returns a tuple where the first value indicates the success of the function
 * call and the second value contains a array of the network ids of the devices
 * used for positioning.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GET_ANCHOR_IDS}
 */
export const POS_GET_ANCHOR_IDS = new FunctionRegister<void, [boolean, number[]]>(0xb8, 33,
  buf => {
    if (buf.readUInt8(0) == 0)  return [false, null];

    const ids = [];
    for (let i = 1; i < buf.length; i += 2)
      ids[(i - 1) / 2] = buf.readUInt16LE(i); 
    
    return [true, ids];
  },
  NO_PARAMS
);

/**
 * Calls the device's FLASH_REST function. Used to result the flash memory
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_FLASH_RESET}
 */
export const FLASH_RESET = new FunctionRegister<void, boolean>(0xb9, 1,
  IS_SUCCESS,
  NO_PARAMS
);

/**
 * The type of data to save to flash
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_FLASH_SAVE}
 */
export enum FlashSaveType {
  /**
   * Save register data
   */
  REGISTER_DATA = 0x01,

  /**
   * Save the anchor list used for positioning
   */
  ANCHOR_LIST = 0x02,

  /**
   * Save the device list
   */
  DEVICE_LIST = 0x03,
}

/**
 * Calls the device's FLASH_SAVE function. Used to save data to flash.
 * Accepts a tuple where the first value is the save type and the second value is
 * an optional array of register address if the save type was register data.
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_FLASH_SAVE}
 */
export const FLASH_SAVE = new FunctionRegister<[FlashSaveType, number[]?], boolean>(0xba, 1, 
  IS_SUCCESS,
  params => {
    const [type, registers] = params;
    const regLen = registers ? registers.length : 0;

    if (type != 0x01 && type != 0x02 && type != 0x03)
      throw new Error('Invalid flash save type: ' + type);
    
    if (type == 0x01 && ! regLen)
      throw new Error('Registers must be provided for saving register data');

    if (regLen > 10)
      throw new Error('Only 10 registers may be saved to flash at a time');

    const buf = Buffer.allocUnsafe(1 + regLen);
    buf.writeUInt8(type, 0);

    for (let i = 0; i < regLen; i++)
      buf.writeUInt8(registers[i], i + 1);
    
    return buf;
  }
);

/**
 * Calls the device's FLASH_DETAILS function. Used to check what is saved to flash.
 * Returns a buffer where the first byte indicates the success of the function
 * call each following bit indicates whether or not the the corresponding register 
 * has been saved
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_FLASH_DETAILS}
 */
export const FLASH_DETAILS = new FunctionRegister<void, Buffer>(0xbb, 21,
  buf => buf,
  NO_PARAMS,
);

/**
 * Calls the device's GET_IDS function. Used to get a list of all ids in the device's
 * device list.
 * Accepts a tuple where the first value is offset and the second is the size of 
 * the list to return
 * Returns a tuple where the first value indicates the success of the function
 * call and the second value is a list of network ids.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_DEVICES_GETIDS}
 */
export const DEVICES_GETIDS = new FunctionRegister<[number, number], [boolean, number[]]>(0xc0, 41,
  buf => {
    if (buf.readUInt8(0) == 0)
      return [false, null];
    
    const ids = [];

    for (let i = 1; i < buf.length; i += 2)
      ids[(i - 1) / 2] = buf.readUInt16LE(i);
    
    return [true, ids];
  },
  params => {
    const [offset, size] = params;

    if (offset < 0 || offset > 19)
      throw new Error('Invalid offset: ' + offset);
    
    if (size < 0 || size > 20)
      throw new Error('Invalid size: ' + size);

    const buf = Buffer.allocUnsafe(2);

    buf.writeUInt8(offset, 0);
    buf.writeUInt8(size, 1);

    return buf;
  }
);

/**
 * The type of discovery to perform
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_DEVICES_DISCOVER}
 */
export enum DiscoveryType {
  /**
   * Discover all device
   */
  ALL = 0x2,

  /**
   * Discover only anchors
   */
  ANCHORS = 0x0,

  /**
   * Discover only tags
   */
  TAGS = 0x1,
}

/**
 * Calls the device's DEVICES_DISCOVER function. Used to discover devices within
 * range.
 * Accepts a tuple where the first value is a {@link DiscoveryType}, the second 
 * value is the number of devices to undiscovered devices to wait for and the
 * third value is the timeout for discovery.
 * Returns a boolean indicating the success of the call
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_DEVICES_DISCOVER}
 */
export const DEVICES_DISCOVER = new FunctionRegister<[DiscoveryType?, number?, number?], boolean>(0xc1, 1,
  IS_SUCCESS,
  ([type = DiscoveryType.ALL, slots = 3, timeout = 10]) => {
    if (type != 0x0 && type != 0x1 && type != 0x2)
      throw new Error('Invalid discovery type: ' + type);
    
    if (slots < 0 || slots > 255)
      throw new RangeError('Invalid slot count: ' + slots);

    if (timeout < 0 || timeout > 255)
      throw new RangeError('Invalid timeout: ' + timeout);
    
    return Buffer.from([type, slots, timeout]);
  }
);

// TODO: DEVICES_CALIBRATE register
// export const DEVICES_CALIBRATE = new FunctionRegister<, boolean>(0xc1, 1,
//   IS_SUCCESS,
//   params => {

//   }
// );

/**
 * Calls the device's DEVICES_CLEAR function. Used to clear the device list
 * Returns a boolean indicating the success of the function call.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_DEVICES_CLEAR}
 */
export const DEVICES_CLEAR = new FunctionRegister<void, boolean>(0xc3, 1, 
  IS_SUCCESS,
  NO_PARAMS
);

export interface DeviceInfo {
  id: number,
  isAnchor: boolean,
  position: Coordinate
};

// TODO: DEVICE_ADD
export const DEVICE_ADD = new FunctionRegister<DeviceInfo, boolean>(0xc4, 1,
  IS_SUCCESS,
  ({id, isAnchor, position}) => {
    if (! isValidNetworkID(id))
      throw new Error('Invalid network id: ' + id);

    if (! isValidCoordinate(position))
      throw new Error('Invalid position: ' + position);

    const buf = Buffer.allocUnsafe(15);
    
    buf.writeUInt16LE(id, 0);
    buf.writeUInt8(+isAnchor, 2);

    buf.writeInt32LE(position.x, 3);
    buf.writeInt32LE(position.y, 7);
    buf.writeInt32LE(position.z, 11);

    return buf;
  }
);

// TODO: DEVICE_GETINFO
export const DEVICE_GETINFO = new FunctionRegister<number, [boolean, DeviceInfo]>(0xc5, 15,
  buf => {
    const ok = buf.readUInt8(0);

    if (! ok)
      return [false, null];

    const info = {
      id: buf.readUInt16LE(1),
      isAnchor: buf.readUInt8(3) == 1,
      position: {
        x: buf.readInt32LE(4),
        y: buf.readInt32LE(8),
        z: buf.readInt32BE(12)
      } 
    };

    return [true, info];
  },
  id => {
    if (isValidNetworkID(id))
      throw new Error('Invalid network id: ' + id);
    
    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt16LE(id, 0);

    return buf;
  }
);

// TODO: DEVICE_GETCOORDS
export const DEVICE_GETCOORDS = new FunctionRegister<number, [boolean, Coordinate]>(0xc6, 12,
  buf => {
    const ok = buf.readUInt8(0);

    if (! ok)
      return [false, null];

    return [true, {
      x: buf.readInt32LE(1),
      y: buf.readInt32LE(5),
      z: buf.readInt32LE(9),
    }];
  },
  id => {
    if (isValidNetworkID(id))
      throw new Error('Invalid network id: ' + id);
    
    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt16LE(id, 0);

    return buf;
  }
);

export interface RangeInfo {
  timestamp: number,
  range: number,
  strength: number,
}

// TODO: DEVICE_GETRANGEINFO
export const DEVICE_GETRANGEINFO = new FunctionRegister<number, [boolean, RangeInfo]>(0xc6, 10,
  buf => {
    const ok = buf.readUInt8(0);
    
    if (! ok)
      return [false, null];

    return [true, {
      timestamp: buf.readUInt32LE(1),
      range: buf.readUInt32LE(5),
      strength: buf.readInt16LE(9),
    }];
  },
  id => {
    if (isValidNetworkID(id))
      throw new Error('Invalid network id: ' + id);
    
    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt16LE(id, 0);

    return buf;
  }
);

// TODO: DEVICE_CIR_DATA
