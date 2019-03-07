import { ReadRegister } from "./Register";

/**
 * Used to read the WHO_AM_I register
 * After being decode the result is some number. Hopefully 0x43
 */
export const WHO_AM_I = new ReadRegister<number>(0x00, 1, data => data.readUInt8(0));

/**
 * Used to get the firmware version of the device
 * After being decoded the result is [major, minor]
 */
export const FIRMWARE_VERSION = new ReadRegister<[number, number]>(0x01, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // | MAJOR                         | MINOR                         |

  const data = buf.readUInt8(0);
  const major = data >> 4, minor = data & 0b1111;
  return [major, minor];
});

/**
 * Used to get the hardware version of the device
 * After being decoded the result is [version, isAnchor]
 */
export const HARDWARE_VERSION = new ReadRegister<[number, boolean]>(0x02, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // | Type                  | VERSION                               |

  const data = buf.readUInt8(0);
  const type = data >> 5;
  let version;

  // get version number
  if ((data & 0b1_1111) == 0x2)
    version = 1.2;
  else if ((data & 0b1_1111) == 0x3)
    version = 1.3;
  else
    throw new Error("Invalid hardware version: " + (data & 0b1_1111));

  if (type != 0x0 && type != 0x1)
    throw new Error("Invalid hardware type: " + type);
  
  return [version, type == 0x0];
});

/**
 * Results of the device's self test
 */
export interface SelfTestResult {
  /**
   * Whether or not the accelerometer passed the self test.
   */
  acc: boolean,

  /**
   * Whether or not the mangetometer passed the self test. This is always false 
   * for anchors because anchors do not have a mangetometer.
   */
  magn: boolean,

  /**
   * Whether or not the gyroscope passed the self test. This is always false 
   * for anchors because anchors do not have a gyroscope.
   */
  gyro: boolean,

  /**
   * Whether or not the IMU microcontroller passed the self test. This is always false 
   * for anchors because anchors do not have an IMU.
   */
  imu: boolean,

  /**
   * Whether or not the pressure sensor passed the self test. This is always false 
   * for anchors because anchors do not have a pressure sesnor.
   */
  press: boolean,

  /**
   * Whether or not the ultra-wideband transceiver passed the self test.
   */
  uwb: boolean,
}

/**
 * Reads the device's self test results.
 * Decodes tp a {@link SelfTestResult}
 */
export const SELF_TEST_RESULTS = new ReadRegister<SelfTestResult>(0x03, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |       |       |  UWB  | PRESS |  IMU  | GYRO  | MAGN  | ACC   |

  const data = buf.readUInt8(0);
  return {
    acc: (data & 1) == 1,
    magn: ((data >> 1) & 1) == 1,
    gyro: ((data >> 2) & 1) == 1,
    imu: ((data >> 3) & 1) == 1,
    press: ((data >> 4) & 1) == 1,
    uwb: ((data >> 5) & 1) == 1,
  };
});

/**
 * Pozyx errors
 */
export enum PozyxError {
  SUCCESS = 0x00,
  I2C_WRITE = 0x01,
  I2C_CMDFULL = 0x02,
  ANCHOR_ADD = 0x03,
  COMM_QUEUE_FULL = 0x04,
  I2C_READ = 0x05,
  UWB_CONFIG = 0x06,
  OPERATION_QUEUE_FULL = 0x07,
  TDMA = 0xA0,
  STARTUP_BUSFAULT = 0x08,
  FLASH_INVALID = 0x09,
  NOT_ENOUGH_ANCHORS = 0X0A,
  DISCOVERY = 0X0B,
  CALIBRATION = 0x0C,
  FUNC_PARAM = 0x0D,
  ANCHOR_NOT_FOUND = 0x0E,
  FLASH = 0x0F,
  MEMORY = 0x10,
  RANGING = 0x11,
  RTIMEOUT1 = 0x12,
  RTIMEOUT2 = 0x13,
  TXLATE = 0x14,
  UWB_BUSY = 0x15,
  POSALG = 0x16,
  NOACK = 0x17,
  SNIFF_OVERFLOW = 0xE0,
  NO_PPS = 0xF0,
  NEW_TASK = 0xF1,
  UNRECDEV = 0xFE,
  GENERAL = 0xFF,
}

/**
 * Pozyx error codes
 */
export const ERROR_CODES = {};

for (const key in PozyxError)
  if (PozyxError.hasOwnProperty(key))
    ERROR_CODES[PozyxError[key]] = key;

/**
 * Reads the error code from the device.
 */
export const ERROR_CODE = new ReadRegister<PozyxError>(0x04, 1, buf => buf.readUInt8(0));

/**
 * Status of an interrupt
 */
export interface InterruptStatus {
  /**
   * Indicates the interrupt was due to an error
   */
  err: boolean,

  /**
   * Indicates the interrupt was due to new position data
   */
  pos: boolean,

  /**
   * Indicates the interrupt was due to new imu data
   */
  imu: boolean,

  /**
   * Indicates the interrupt was due to date received over uwb
   */
  rx_data: boolean,

  /**
   * Indicates the interrupt was due to a function completion
   */
  func: boolean,
}

/**
 * Reads the interrupt status of the device
 * Decodes to a {@link InterruptStatus}
 */
export const INT_STATUS = new ReadRegister<InterruptStatus>(0x05, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // |                       | FUNC  |RX_DATA| IMU   | POS   | ERR   |
  const data = buf.readUInt8(0);

  return {
    err: (data & 1) == 1,
    pos: ((data >> 1) & 1) == 1,
    imu: ((data >> 2) & 1) == 1,
    rx_data: ((data >> 3) & 1) == 1,
    func: ((data >> 4) & 1) == 1,
  };
});

/**
 * The calibration status of the device's subsystems
 */
export interface CalibrationStatus {
  /**
   * Calibration status of magnetometer
   */
  mag: boolean,

  /**
   * Calibration status of accelerometer
   */
  acc: boolean,

  /**
   * Calibration status of gyroscope
   */
  gyro: boolean,

  /**
   * Calibration status of whole device
   */
  system: boolean,
}

/**
 * Reads the device's calibration status
 * Decodes to a {@link ReadRegister}
 */
export const CALIBRATION_STATUS = new ReadRegister<CalibrationStatus>(0x06, 1, buf => {
  // | bit 7 | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 |
  // | SYS Calib     | GYR Calib     | ACC Calib     | MAG Calib     |
  
  // 0x3 indicates calibrated, 0x0 indicates not calibrated
  const data = buf.readUInt8(0);

  return {
    mag: (data & 0b11) == 0x3,
    acc: ((data >> 2) & 0b11) == 0x3,
    gyro: ((data >> 4) & 0b11) == 0x3,
    system: ((data >> 6) & 0b11) == 0x3,
  };
});
