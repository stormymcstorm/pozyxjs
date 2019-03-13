import { ReadWriteRegister } from ".";
import { arrayFromMask, maskFromArray } from "./util";

/**
 * Configuration for device interrupts
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_INT_MASK}
 */
export interface InterruptMask {
  /**
   * Should interrupt on error
   */
  err: boolean,

  /**
   * Should interrupt on new position data
   */
  pos: boolean,

  /**
   * Should interrupt on new imu data
   */
  imu: boolean,

  /**
   * Should interrupt on date received over uwb
   */
  rx_data: boolean,

  /**
   * Should interrupt on function completion
   */
  func: boolean,

  /**
   * The interrupt pin to use. 0 or 1
   */
  pin: number,
}

/**
 * Reads and writes to the interrupt mask.
 * Encodes from and decodes to {@link InterruptMask}
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_INT_MASK}
 */
export const INT_MASK = new ReadWriteRegister<InterruptMask>(0x10, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |  PIN  |               | FUNC  |RX_DATA| IMU   | POS   | ERR   |
  const data = buf.readUInt8(0);

  return {
    err: (data & 1) == 1,
    pos: (data >> 1 & 1) == 1,
    imu: (data >> 2 & 1) == 1,
    rx_data: (data >> 3 & 1) == 1,
    func: (data >> 4 & 1) == 1,
    pin: data >> 7 & 1,
  };
}, data => {
  const bm = +data.err
    | +data.pos << 1
    | +data.imu << 2
    | +data.rx_data << 3
    | +data.func << 4
    | data.pin << 7;

  return Buffer.from([bm]);
});

/**
 * Configuration for the interrupt pin
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_INT_CONFIG}
 */
export interface InterruptPinConfig {
  /**
   * The pin number to use for the interrupt. Possible values are between 0 and 6.
   */
  pin: number,

  /**
   * If {@code true} then the pin will operate in open drain mode, otherwise it
   * will operate in push-pull mode.
   */
  open: boolean,

  /**
   * The voltage level when an interrupt happens. {@code true} for active high
   * and {@code false} for active low.
   */
  active: boolean,

  /**
   * Whether or not the pin should latch after an interrupt
   */
  latch: boolean,
}

/**
 * Reads and writes to the device's INT_CONFIG register. Used to configure the
 * interrupt pin.
 * Encodes from and decodes to {@link InterruptPinConfig}.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_INT_CONFIG}
 */
export const INT_CONFIG = new ReadWriteRegister<InterruptPinConfig>(0x11, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |               | LATCH |  ACT  |  MODE |         PINNUM        |
  const data = buf.readUInt8(0);

  return {
    pin: data & 0b111,
    open: (data >> 3 & 1) == 1,
    active: (data >> 4 & 1) == 1,
    latch: (data >> 5 & 1) == 1,
  };
}, data => {
  if (data.pin < 0 || data.pin > 6)
    throw new Error('Invalid pin number: ' + data.pin);

  const bm = data.pin 
    | +data.open << 3
    | +data.active << 4
    | +data.latch << 5;
  
  return Buffer.from([bm]);
});

/**
 * Position filters
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_FILTER}
 */
export enum PositionFilter {
  /**
   * No position filter
   */
  NONE = 0x0,
  
  /**
   * A low-pass filter used to filter out high-frequency jitters
   */
  FIR = 0x1,

  /**
   * A moving average filter used to smooth the trajectory
   */
  MOVING_AVERAGE = 0x3,

  /**
   * A moving median filter used to filter outliers
   */
  MOVING_MEDIAN = 0x4,
}

/**
 * Reads and writes to the device's POS_FILTER register.
 * Encodes from and decodes to [{@link PositionFilter}, strength].
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_FILTER}
 */
export const POS_FILTER = new ReadWriteRegister<[PositionFilter, number]>(0x14, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |            STRENGTH           |             FILTER            |
  const data = buf.readUInt8(0);
  const strength = data >> 4 & 0b1111;
  const filter = data & 0b1111;

  return [filter, strength];
}, data => {
  const [filter, strength] = data;

  if (filter != 0x0 && filter != 0x1 && filter != 0x4)
    throw new Error('Invalid filter: ' + filter);

  if (strength < 0 || strength > 15)
    throw new RangeError('Invalid filter strength: ' + strength);

  // create bitmap
  const bm = filter & 0b1111 | (strength & 0b1111) << 4;

  return Buffer.from([bm]);
});

/**
 * Configuration for the LEDs
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_LED_CONFIG}
 */
export interface LEDConfiguration {
  /**
   * Whether or not each LED should be controlled by pozyx. Each LED corresponds 
   * to the index of the array
   */
  leds: [boolean, boolean, boolean, boolean],

  /**
   * Whether or not the LED should blink on reception of a UWB message
   */
  led_rx: boolean,

  /**
   * Whether or not the LED should blink on transmission of a UWB message
   */
  led_tx: boolean,
};

/**
 * Reads and writes to the device's CONFIG_LED register.
 * Encodes from and decodes to {@link LEDConfiguration}
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_LED_CONFIG}
 */
export const CONFIG_LEDS = new ReadWriteRegister<LEDConfiguration>(0x15, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |               | LEDTX | LEDRX | LED 4 | LED 3 | LED 2 | LED 1 |
  const data = buf.readUInt8(0);

  return {
    leds: [
      (data & 1) == 1,
      (data >> 1 & 1) == 1,
      (data >> 2 & 1) == 1,
      (data >> 3 & 1) == 1,
    ],
    led_rx: (data >> 4 & 1) == 1,
    led_tx: (data >> 5 & 1) == 1,
  };
}, data => {
  // create bitmap
  const bm = maskFromArray(data.leds)
    | +data.led_rx << 4
    | +data.led_tx << 5;

  return Buffer.from([bm]);
});

/**
 * Positioning algorithms
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_ALG}
 */
export enum PositionAlgorithm {
  /**
   * Estimates position only using UWB measurements. Does not require continuous 
   * positioning.
   */
  UWB_ONLY = 0x0,

  /**
   * Estimates position based on last known position. Designed to operate at an
   * update rate greater than 1 Hz. Only available for 3D positioning.
   */
  TRACKING = 0x4,
}

/**
 * The dimensions to calculate the position in.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_ALG}
 */
export enum PositionDimension {
  /**
   * 2D mode. Only the x and y coordinates are estimated. It is expected that
   * all tags and anchors are located in the same plane.
   */
  D_2 = 0x2,

  /**
   * 2.5D mode. Only the x and y coordinates are estimated. Anchors and tags do
   * not need to be located in the same horizontal plane. It is necessary that
   * the z coordinates of the anchors and tags are known 
   */
  D_2_5 = 0x1,

  /**
   * 3D mode. The x, y and z coordinates are estimated
   */
  D_3 = 0x3,
}

/**
 * Reads and writes to the device's POS_ALG register. Used to configure the
 * positioning algorithm.
 * Encodes from and decodes to [{@link PositionAlgorithm}, {@link PositionDimension}].
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_ALG}
 */
export const POS_ALG = new ReadWriteRegister<[PositionAlgorithm, PositionDimension]>(0x16, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |               |      DIM      |           ALGORITHM           |
  const data = buf.readUInt8(0);

  return [data & 0b1111, data >> 4 & 0b11];
}, data => {
  const [algo, dim] = data;

  if (algo != 0x0 && algo != 0x4)
    throw new Error('Invalid positioning algorithm:' + algo);
  
  if (dim != 0x1 && dim != 0x2 && dim != 0x3)
    throw new Error('Invalid positioning dimension: ' + dim);

  return Buffer.from([algo | dim << 4]);
});

/**
 * Reads and writes to the device's POS_NUM_ANCHORS register.
 * Used to configure the number of anchors used for positioning and how they are
 * selected. The number of anchors to use must be between 3 and 15. The mode must
 * be {@code true} for automatic anchor selection or {@code false} for a fixed 
 * anchor set.
 * Encodes from and decodes to [num, mode].
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_NUM_ANCHORS}
 */
export const POS_NUM_ANCHORS = new ReadWriteRegister<[number, boolean]>(0x17, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |             MODE              |              NUM              |
  const data = buf.readUInt8(0);
  const num = data & 0b1111, mode = (data >> 4 & 0b1111) == 1;

  return [num, mode];
}, data => {
  if (data[0] < 3 || data[0] > 15)
    throw new Error('Invalid number of anchors: ' + data[0]);
  
  // create bitmap from data
  const bm = data[0] | +data[1] << 4;

  return Buffer.from([bm]);
});

/**
 * Reads and writes to the device's POS_INTERVAL register. Used to define an
 * update interval for continuous positioning. Interval must be between 10ms and 
 * 60000ms. A interval of 0 will disable continuous mode.
 * Encodes from and decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_INTERVAL}
 */
export const POS_INTERVAL = new ReadWriteRegister<number>(0x18, 2, buf => 
  buf.readUInt16LE(0), 
  data => {
  if (data != 0 && (data < 10 || data > 60000))
    throw new Error('Invalid positioning interval: ' + data);

  const buf = Buffer.allocUnsafe(2);
  buf.writeUInt16LE(data, 0);

  return buf;
});

/**
 * Reads and writes to the device's NETWORK_ID register. The value should be 
 * unique within the network.
 * Encodes from and decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_NETWORK_ID}
 */
export const NETWORK_ID = new ReadWriteRegister<number>(0x1a, 2, 
  buf => buf.readUInt16LE(0),
  data => {
  const buf = Buffer.allocUnsafe(2);
  buf.writeUInt16LE(data, 0);

  return buf;
});


/**
 * Reads and writes to the device's UWB_CHANNEL register. The register can 
 * contain the values 1,2,3,4,5 or 7.
 * Encodes from and decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_UWB_CHANNEL}
 */
export const UWB_CHANNEL = new ReadWriteRegister<number>(0x1c, 1, 
  buf => buf.readUInt8(0),
  data => {
    if ((data < 1 || data > 5) && data != 7)
      throw new Error('Invalid UWB channel number: ' + data);

    return Buffer.from([data]);
  }
);

/**
 * Reads and writes to the device's UWB_RATES register. Used to set the UWB bitrate
 * and nominal pulse repetition frequency (PRF). Possible values for the bitrate
 * are 0,1 and 2. Possible values for PRF are 1 and 2.
 * Encodes from and decodes to [bitrate, prf]
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_UWB_RATES}
 */
export const UWB_RATES = new ReadWriteRegister<[number, number]>(0x1d, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |      PRF      |                    BITRATE                    |
  const data = buf.readUInt8(0);
  const bitrate = data & 0b11_1111, prf = data >> 6;

  return [bitrate, prf];
}, data => {
  const bm = data[0] | (data[1] << 6);
  return Buffer.from([bm]);
});

/**
 * Reads and writes to the device's UWB_PLEN. Used to set the UWB preamble length.
 * Possible values are 0x0c, 0x28, 0x18, 0x08, 0x34, 0x24, 0x14, 0x04.
 * Encodes from and decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_UWB_PLEN}
 */
export const UWB_PLEN = new ReadWriteRegister<number>(0x1e, 1,
  buf => buf.readUInt8(0),
  data => {
    if (data != 0x0c && data != 0x28 && data != 0x18 && data != 0x34 && 
      data != 0x24 && data != 0x14 && data != 0x04)
      throw new Error('Invalid preamble length: ' + data);

    return Buffer.from([0]);
  }
);

/**
 * Reads and writes to the device's UWB_GAIN register. Possible values are between
 * 0 and 67. The conversion is 1dB = 2.
 * Encodes from and decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_UWB_GAIN}
 */
export const UWB_GAIN = new ReadWriteRegister<number>(0x1f, 1,
  buf => buf.readInt8(0),
  data => {
    if (data < 0 || data > 67)
      throw new Error('Invalid UWB gain: ' + data);

    return Buffer.from([data]);
  }
);

/**
 * Reads and writes to the device's UWB_XTALTRIM register. Used from setting the
 * trimming value for the uwb crystal. 
 * Encodes from and decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_UWB_XTALTRIM}
 */
export const UWB_XTALTRIM = new ReadWriteRegister<number>(0x20, 1,
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |                               |             TRIMVAL           |
  buf => buf.readUInt8(0),
  data => {
    if (data < 0 || data > 16)
      throw new Error('Invalid trimming value: ' + data);
    
    return Buffer.from([data]);
  }
);

/**
 * Ranging protocols
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_RANGE_PROTCOL}
 */
export enum RangeProtocol {
  /**
   * Provides more accurate values but takes more time
   */
  PRECISION = 0x0,

  /**
   * Computes the range must faster, but can only be used when ranging or positioning continuously.
   * The results for the first 100ms will also be vert inaccurate.
   */
  FAST = 0x1,
}

/**
 * Reads and writes to the device's RANGE_PROTOCOL register. Possible values are
 * 0x0 for PRECISION and 0x1 for FAST.
 * Encodes from and decodes to {@link RangeProtocol}.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_RANGE_PROTCOL}
 */
export const RANGE_PROTOCOL = new ReadWriteRegister<RangeProtocol>(0x21, 1,
  buf => buf.readUInt8(0),
  data => {
    if (data != 0 && data != 1)
      throw new Error('Invalid ranging protocol: ' + data);
    
    return Buffer.from([data]);
  }
);

/**
 * The operation mode of a device
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_OPERATION_MODE}
 */
export enum OperationMode {
  /**
   * Device operates as a tag
   */
  TAG = 0x0,

  /**
   * Devices operates as anchor
   */
  ANCHOR = 0x1,
}

/**
 * Reads and writes to the device's OPERATION_MODE register. Used to set the device to
 * anchor or tag mode. Possible values are 0 for tag mode and 1 for anchor mode.
 * Encodes from and decodes to {@link OperationMode}.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_OPERATION_MODE}
 */
export const OPERATION_MODE = new ReadWriteRegister<OperationMode>(0x22, 1,
  buf => buf.readUInt8(0),
  data => {
    if (data != 0 && data != 1)
      throw new Error('Invalid operation mode: ' + data);
    
    return Buffer.from([data]);
  }
);

/**
 * Sensor modes for the device
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_SENSORS_MODE}
 */
export enum SensorMode {
  OFF = 0,
  ACC_ONLY = 1,
  MAG_ONLY = 2,
  GYRO_ONLY = 3,
  ACC_MAG = 4,
  ACC_GYRO = 5,
  MAG_GYRO = 6,
  AMG = 7,
  IMU = 8,
  COMPASS = 9,
  M4G = 10,
  NDOF_FMC_OFF = 11,
  NDOF = 12,
}

/**
 * Reads and writes to the device's SENSORS_MODE register. Used to set the 
 * operation mode for the device's sensors. Possible values are between 0 and 12.
 * Encodes from and decodes to {@link SensorMode}.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_SENSORS_MODE}
 */
export const SENSORS_MODE = new ReadWriteRegister<SensorMode>(0x23, 1,
  buf => buf.readUInt8(0),
  data => {
    if (data < 0 || data > 12)
      throw new Error('Invalid sensor mode: ' + data);
    
    return Buffer.from([data]);
  }
);


/**
 * Reads and writes to the device's CONFIG_GPIO1 register. Used to set the mode
 * and pull of the pin. Possible values for both are 0,1 and 2.
 * Encodes from and decodes to [mode, pull].
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_CONFIG_GPIO1}
 */
export const CONFIG_GPIO1 = new ReadWriteRegister<[number, number]>(0x27, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |                       |      PULL     |         MODE          |
  const data = buf.readUInt8(0);
  const mode = data & 0b111, pull = (data >> 3) & 0b11;

  return [mode, pull];
}, data => {
  const [mode, pull] = data;

  if (mode < 0 || mode > 2)
    throw new Error('Invalid mode: ' + mode);
  
  if (pull < 0 || pull > 2)
    throw new Error('Invalid pull: ' + pull);

  return Buffer.from([mode | (pull << 3)]);
});

/**
 * Reads and writes to the device's CONFIG_GPIO2 register. Used to set the mode
 * and pull of the pin. Possible values for both are 0,1 and 2.
 * Encodes from and decodes to [mode, pull].
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_CONFIG_GPIO2}
 */
export const CONFIG_GPIO2 = new ReadWriteRegister<[number, number]>(0x28, 1, 
  CONFIG_GPIO1.decode, CONFIG_GPIO1.encode);

/**
 * Reads and writes to the device's CONFIG_GPIO3 register. Used to set the mode
 * and pull of the pin. Possible values for both are 0,1 and 2.
 * Encodes from and decodes to [mode, pull].
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_CONFIG_GPIO3}
 */
export const CONFIG_GPIO3 = new ReadWriteRegister<[number, number]>(0x29, 1, 
  CONFIG_GPIO1.decode, CONFIG_GPIO1.encode);

/**
 * Reads and writes to the device's CONFIG_GPIO4 register. Used to set the mode
 * and pull of the pin. Possible values for both are 0,1 and 2.
 * Encodes from and decodes to [mode, pull].
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_CONFIG_GPIO4}
 */
export const CONFIG_GPIO4 = new ReadWriteRegister<[number, number]>(0x2a, 1, 
  CONFIG_GPIO1.decode, CONFIG_GPIO1.encode);
