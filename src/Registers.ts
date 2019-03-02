/**
 * Pozyx device status registers
 */
export enum Status {
  /**
   * Returns the constant value 0x43
   */
  WHO_AM_I = 0x0,

  /**
   * The firmware version of the device
   */
  FIRMWARE_VERSION = 0x1,

  /**
   * The hardware version of the device
   */
  HARDWARE_VERSION = 0x2,

  /**
   * The result of the devices self test
   */
  SELFTEST_RESULT = 0x3,

  /**
   * Possibly a system error
   */
  ERROR_CODE = 0x4,

  /**
   * The source of the interrupt
   */
  INTERRUPT_STATUS = 0x5,

  /**
   * The calibration status
   */
  CALIBRATION_STATUS = 0x6,
}

export enum Config {
  /**
   * Enables or disables interrupt
   */
  INTERRUPT_MASK = 0x10,

  /**
   * Configures the interrupt pin
   */
  INTERRUPT_PIN = 0x11,

  /**
   * Configures the position filter
   */
  POSITIONING_FILTER = 0x14,

  /**
   * The LED configuration
   */
  LED_CONFIGURATION = 0x15,

  /**
   * Configures the algorithm used for positioning
   */
  POSITIONING_ALGORITHM = 0x16,

  /**
   * Configure the number of anchors to use for positioning and how they are selected
   */
  POSITIONING_NUMBER_OF_ANCHORS = 0x17,

  /**
   * Defines the update interval in ms for continuous positioning
   */
  POSITIONING_INTERVAL = 0x18,

  /**
   * Configures the network id of the device
   */
  NETWORK_ID = 0x1A,

  /**
   * Configures the UWB channel number
   */
  UWB_CHANNEL = 0x1C,

  /**
   * Configure the UWB datarate and pulse repetition frequency (PRF)
   */
  UWB_RATES = 0x1D,

  /**
   * Configure the UWB preamble length.
   */
  UWB_PLEN = 0x1E,

  /**
   * Configure the power gain for the UWB transmitter
   */
  UWB_GAIN = 0x1F,

  /**
   * Configure the trimming value for the uwb crystal.
   */
  UWB_CRYSTAL_TRIM = 0x20,

  /**
   * Configure the ranging protocol
   */
  RANGING_PROTOCOL = 0x21,

  /**
   * Configure the operation mode of the device
   */
  OPERATION_MODE = 0x22,

  /**
   * Configure the operation mode for the device's sensors
   */
  SENSORS_MODE = 0x23,

  /**
   * Configure GPIO pin 1
   */
  CONFIG_GPIO_1 = 0x27,

  /**
   * Configure GPIO pin 2
   */
  CONFIG_GPIO_2 = 0x28,

  /**
   * Configure GPIO pin 3
   */
  CONFIG_GPIO_3 = 0x29,

  /**
   * Configure GPIO pin 4
   */
  CONFIG_GPIO_4 = 0x2A,
};

/**
 * All of the positioning configuration registers.
 */
// export const ALL_POSITIONING_REGISTERS = [
//   Config.POSITIONING_FILTER, 
//   Config.POSITIONING_INTERVAL, 
//   Config.POSITIONING_ALGORITHM, 
//   Config.POSITIONING_NUMBER_OF_ANCHORS
// ];

/**
 * All  of the UWB configuration registers
 */
// export const ALL_UWB_REGISTERS = [
//   Config.UWB_CHANNEL, 
//   Config.UWB_RATES, 
//   Config.UWB_PLEN, 
//   Config.UWB_GAIN
// ];

/**
 * Pozyx position data registers
 */
export enum PositionData {
  /**
   * The x coordinate of the device in mm
   */
  POSITION_X = 0x30,

  /**
   * The y coordinate of the device in mm
   */
  POSITION_Y = 0x34,

  /**
   * The z coordinate of the device in mm
   */
  POSITION_Z = 0x38,

  /**
   * The error covariance of x
   */
  POSITIONING_ERROR_X = 0x3C,

  /**
   * The error covariance of y
   */
  POSITIONING_ERROR_Y = 0x3E,

  /**
   * The error covariance of z
   */
  POSITIONING_ERROR_Z = 0x40,

  /**
   * The error covariance of xy
   */
  POSITIONING_ERROR_XY = 0x42,

  /**
   * The error covariance of xz
   */
  POSITIONING_ERROR_XZ = 0x44,

  /**
   * The error covariance of yz
   */
  POSITIONING_ERROR_YZ = 0x46,
};

/**
 * Pozyx sensor data registers
 */
export enum SensorData {
  /**
   * Maximum measured norm of the 3D linear acceleration in milli g-force. 
   * Value is reset after reading
   */
  MAX_LINEAR_ACCELERATION = 0x4E,

  /**
   * Pressure measured in mPa
   */
  PRESSURE = 0x50,

  /**
   * Acceleration in x direction measured in milli g-force
   */
  ACCELERATION_X = 0x54,

  /**
   * Acceleration in y direction measured in milli g-force
   */
  ACCELERATION_Y = 0x56,

  /**
   * Acceleration in z direction measured in milli g-force
   */
  ACCELERATION_Z = 0x58,

  /**
   * Strength of the magnetic field in the x direction measured as 1e-6T = 16 int
   */
  MAGNETIC_X = 0x5A,

  /**
   * Strength of the magnetic field in the y direction measured as 1e-6T = 16 int
   */
  MAGNETIC_Y = 0x5C,

  /**
   * Strength of the magnetic field in the z direction measured as 1e-6T = 16 int
   */
  MAGNETIC_Z = 0x5E,

  /**
   * Compensated angular velocity in the x direction measured as 1 degree = 16 int
   */
  GYRO_X = 0x60,

  /**
   * Compensated angular velocity in the y direction measured as 1 degree = 16 int
   */
  GYRO_Y = 0x62,

  /**
   * Compensated angular velocity in the z direction measured as 1 degree = 16 int
   */
  GYRO_Z = 0x64,

  /**
   * Yaw (heading) of device measured as 1 degree = 16 int
   */
  EULER_ANGLE_YAW = 0x66,

  /**
   * Roll (heading) of device measured as 1 degree = 16 int
   */
  EULER_ANGLE_ROLL = 0x68,

  /**
   * Pitch (heading) of device measured as 1 degree = 16 int
   */
  EULER_ANGLE_PITCH = 0x6A,

  /**
   * Weight of measured quaternion measured as 1 = 2^14 int
   */
  QUATERNION_W = 0x6C,

  /**
   * X of measured quaternion measured as 1 = 2^14 int
   */
  QUATERNION_X = 0x6E,  // x of quaternion

  /**
   * Y of measured quaternion measured as 1 = 2^14 int
   */
  QUATERNION_Y = 0x70,

  /**
   * Z of measured quaternion measured as 1 = 2^14 int
   */
  QUATERNION_Z = 0x72,

  /**
   * Linear acceleration in x direction measured as 1 mg = 16 int
   */
  LINEAR_ACCELERATION_X = 0x74, 

  /**
   * Linear acceleration in y direction measured as 1 mg = 16 int
   */
  LINEAR_ACCELERATION_Y = 0x76,

  /**
   * Linear acceleration in z direction measured as 1 mg = 16 int
   */
  LINEAR_ACCELERATION_Z = 0x78,

  /**
   * Acceleration of gravity measured in x direction measured as 1 mg = 16 int
   */
  GRAVITY_VECTOR_X = 0x7A,

  /**
   * Acceleration of gravity measured in y direction measured as 1 mg = 16 int
   */
  GRAVITY_VECTOR_Y = 0x7C,

  /**
   * Acceleration of gravity measured in z direction measured as 1 mg = 16 int
   */
  GRAVITY_VECTOR_Z = 0x7E,

  /**
   * Read temperature for internal chip temperatures
   */
  TEMPERATURE = 0x80,  // Temperature
}

/**
 * Pozyx function registers
 */
export enum Function {
  /**
   * Resets the device
   */
  RESET_SYSTEM = 0xB0,

  /**
   * Sets the state of the LEDS
   */
  LED_CONTROL = 0xB1,  // Control LEDS 1 to 4 on the board

  /**
   * Writes to the transmit buffer
   */
  WRITE_TX_DATA = 0xB2,  // Write data in the UWB transmit (TX) buffer

  /**
   * Transmits the transmit buffer
   */
  SEND_TX_DATA = 0xB3,

  /**
   * Reads data from the receive buffer
   */
  READ_RX_DATA = 0xB4,  // Read data from the UWB receive (RX) buffer

  /**
   * Initiates ranging
   */
  DO_RANGING = 0xB5,

  /**
   * Initiates positioning
   */
  DO_POSITIONING = 0xB6,

  /**
   * Defines which devices to use for positioning
   */
  SET_POSITIONING_ANCHOR_IDS = 0xB7,

  /**
   * Gets the list of the devices used for positioning
   */
  GET_POSITIONING_ANCHOR_IDS = 0xB8,

  /**
   * Resets a section flash memory
   */
  RESET_FLASH_MEMORY = 0xB9,

  /**
   * Saves a section of the configuration to the flash memory
   */
  SAVE_FLASH_MEMORY = 0xBA,

  /**
   * Gets the information stored in the flash memory
   */
  GET_FLASH_DETAILS = 0xBB,

  /**
   * Gets a list of all known devices
   */
  GET_DEVICE_LIST_IDS = 0xC0,

  /**
   * Initiates discovery of nearby devices
   */
  DO_DISCOVERY = 0xC1,

  /**
   * Clears the device list
   */
  CLEAR_DEVICES = 0xC3,

  /**
   * Adds a device to the device list
   */
  ADD_DEVICE = 0xC4,

  /**
   * Gets the device information
   */
  GET_DEVICE_INFO = 0xC5,

  /**
   * Gets the devices current coordinates
   */
  GET_DEVICE_COORDINATES = 0xC6,

  /**
   * Gets the stored range information of a given pozyx device
   */
  GET_DEVICE_RANGE_INFO = 0xC7,
  
  /**
   * Get the channel impulse response (CIR) coefficients
   */
  CIR_DATA = 0xC8,

  /**
   * Initiates positing with the given data
   */
  DO_POSITIONING_WITH_DATA = 0xCC,
};
