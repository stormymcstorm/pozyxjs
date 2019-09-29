import { ReadRegister, ReadWriteRegister } from "./Register";

const MAX_INT32 = Math.pow(2, 31) - 1;
const MIN_INT32 = -Math.pow(2, 31);

/**
 * Reads and writes to the device's POS_X register. Used to set the position of 
 * the device or to read the position after computing it. Possible values must be
 * int32 so they must be between 2<sup>31 and 2<sup>31 - 1. Position is measured
 * in mm.
 * Encodes from and decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_X}
 */
export const POS_X = new ReadWriteRegister<number>(0x30, 4, 
  buf => buf.readInt32LE(0), 
  function encode(data) {
    if (data < MIN_INT32 || data > MAX_INT32)
      throw new Error('Invalid position: ' + data);
    
    const buf = Buffer.alloc(4);
    buf.writeInt32LE(data, 0);
    return buf;
  }
);

/**
 * Reads and writes to the device's POS_Y register. Used to set the position of 
 * the device or to read the position after computing it. Possible values must be
 * int32 so they must be between 2<sup>31 and 2<sup>31 - 1. Position is measured
 * in mm.
 * Encodes from and decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_Y}
 */
export const POS_Y = new ReadWriteRegister<number>(0x34, 4, POS_X.decode, POS_X.encode);

/**
 * Reads and writes to the device's POS_Z register. Used to set the position of 
 * the device or to read the position after computing it. Possible values must be
 * int32 so they must be between 2<sup>31 and 2<sup>31 - 1. Position is measured
 * in mm.
 * Encodes from and decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_Z}
 */
export const POS_Z = new ReadWriteRegister<number>(0x38, 4, POS_X.decode, POS_X.encode);

/**
 * Reads the device's POS_ERR_X register. This value represents the error 
 * covariance of x. The value will be a int16.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_ERR_X}
 */
export const POS_ERR_X = new ReadRegister<number>(0x3c, 2, buf => buf.readInt16LE(0));

/**
 * Reads the device's POS_ERR_Y register. This value represents the error 
 * covariance of y. The value will be a int16.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_ERR_Y}
 */
export const POS_ERR_Y = new ReadRegister<number>(0x3e, 2, POS_ERR_X.decode);

/**
 * Reads the device's POS_ERR_Z register. This value represents the error 
 * covariance of z. The value will be a int16.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_ERR_Z}
 */
export const POS_ERR_Z = new ReadRegister<number>(0x40, 2, POS_ERR_X.decode);

/**
 * Reads the device's POS_ERR_XY register. This value represents the error 
 * covariance of xy. The value will be a int16.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_ERR_XY}
 */
export const POS_ERR_XY = new ReadRegister<number>(0x42, 2, POS_ERR_X.decode);

/**
 * Reads the device's POS_ERR_XZ register. This value represents the error 
 * covariance of xz. The value will be a int16.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_ERR_XZ}
 */
export const POS_ERR_XZ = new ReadRegister<number>(0x44, 2, POS_ERR_X.decode);

/**
 * Reads the device's POS_ERR_YZ register. This value represents the error 
 * covariance of yz. The value will be a int16.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_POS_ERR_YZ}
 */
export const POS_ERR_YZ = new ReadRegister<number>(0x46, 2, POS_ERR_X.decode);

/**
 * Reads the device's MAX_LIN_ACC register. The value represents the maximum
 * norm of the 3D linear acceleration. 1mg = 1 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_MAG_LIN_ACC}
 */
export const MAX_LIN_ACC = new ReadRegister<number>(0x4e, 2, buf => buf.readUInt16LE(0));

/**
 * Reads the device's PRESSURE register. The value represents the measured pressure.
 * 1mPa = 1 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_PRESSURE}
 */
export const PRESSURE = new ReadRegister<number>(0x50, 4, buf => buf.readUInt32LE(0));

/**
 * Reads the device's ACCEL_X register. The value represents the measured 
 * acceleration in the x direction. 1mg = 1 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_ACCEL_X}
 */
export const ACCEL_X = new ReadRegister<number>(0x54, 2, buf => buf.readInt16LE(0));

/**
 * Reads the device's ACCEL_Y register. The value represents the measured 
 * acceleration in the y direction. 1mg = 1 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_ACCEL_Y}
 */
export const ACCEL_Y = new ReadRegister<number>(0x56, 2, ACCEL_X.decode);

/**
 * Reads the device's ACCEL_Z register. The value represents the measured 
 * acceleration in the z direction. 1mg = 1 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_ACCEL_Z}
 */
export const ACCEL_Z = new ReadRegister<number>(0x58, 2, ACCEL_X.decode);

/**
 * Reads the device's MAGN_X register. The value represents the measured 
 * magnetic field in the x direction. 1 micro Tesla = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_MAGN_X}
 */
export const MAGN_X = new ReadRegister<number>(0x5a, 2, buf => buf.readInt16LE(0));

/**
 * Reads the device's MAGN_Y register. The value represents the measured 
 * magnetic field in the y direction. 1 micro Tesla = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_MAGN_Y}
 */
export const MAGN_Y = new ReadRegister<number>(0x5c, 2, MAGN_X.decode);

/**
 * Reads the device's MAGN_Z register. The value represents the measured 
 * magnetic field in the z direction. 1 micro Tesla = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_MAGN_Z}
 */
export const MAGN_Z = new ReadRegister<number>(0x5e, 2, MAGN_X.decode);

/**
 * Reads the device's GYRO_X register. The value represents the measured 
 * angular velocity in the x direction. 1 degree = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GYRO_X}
 */
export const GYRO_X = new ReadRegister<number>(0x60, 2, buf => buf.readInt16LE(0));

/**
 * Reads the device's GYRO_Y register. The value represents the measured 
 * angular velocity in the y direction. 1 degree = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GYRO_Y}
 */
export const GYRO_Y = new ReadRegister<number>(0x62, 2,GYRO_X.decode);

/**
 * Reads the device's GYRO_Z register. The value represents the measured 
 * angular velocity in the z direction. 1 degree = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GYRO_Z}
 */
export const GYRO_Z = new ReadRegister<number>(0x64, 2,GYRO_X.decode);

/**
 * Reads the device's EUL_HEADING register. The value represents the measured 
 * absolute heading or yaw of the device. 1 degree = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_EUL_HEADING}
 */
export const EUL_HEADING = new ReadRegister<number>(0x66, 2, buf => buf.readInt16LE(0));

/**
 * Reads the device's EUL_ROLL register. The value represents the measured 
 * roll of the device. 1 degree = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_EUL_ROLL}
 */
export const EUL_ROLL = new ReadRegister<number>(0x68, 2, EUL_HEADING.decode);

/**
 * Reads the device's EUL_PITCH register. The value represents the measured 
 * pitch of the device. 1 degree = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_EUL_PITCH}
 */
export const EUL_PITCH = new ReadRegister<number>(0x6a, 2, EUL_HEADING.decode);

/**
 * Reads the device's QUAT_W register. The value represents the measured 
 * weight of the quaternion. 1 quaternion unit = 2^14 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_QWAT_W}
 */
export const QUAT_W = new ReadRegister<number>(0x6c, 2, buf => buf.readInt16LE(0));

/**
 * Reads the device's QUAT_X register. The value represents the measured 
 * x of the quaternion. 1 quaternion unit = 2^14 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_QWAT_X}
 */
export const QUAT_X = new ReadRegister<number>(0x6e, 2, QUAT_W.decode);

/**
 * Reads the device's QUAT_Y register. The value represents the measured 
 * y of the quaternion. 1 quaternion unit = 2^14 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_QWAT_Y}
 */
export const QUAT_Y = new ReadRegister<number>(0x70, 2, QUAT_W.decode);

/**
 * Reads the device's QUAT_Z register. The value represents the measured 
 * z of the quaternion. 1 quaternion unit = 2^14 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_QWAT_Z}
 */
export const QUAT_Z = new ReadRegister<number>(0x72, 2, QUAT_W.decode);

/**
 * Reads the device's LIA_X register. The value represents the measured 
 * linear acceleration in the x direction. 1 mg = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_LIA_X}
 */
export const LIA_X = new ReadRegister<number>(0x74, 2, buf => buf.readInt16LE(0));

/**
 * Reads the device's LIA_Y register. The value represents the measured 
 * linear acceleration in the y direction. 1 mg = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_LIA_Y}
 */
export const LIA_Y = new ReadRegister<number>(0x76, 2, LIA_X.decode);

/**
 * Reads the device's LIA_Z register. The value represents the measured 
 * linear acceleration in the z direction. 1 mg = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_LIA_Z}
 */
export const LIA_Z = new ReadRegister<number>(0x78, 2, LIA_X.decode);

/**
 * Reads the device's GRAV_X register. The value represents the measured 
 * gravitational acceleration in the x direction. 1 mg = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GRAV_X}
 */
export const GRAV_X = new ReadRegister<number>(0x7a, 2, buf => buf.readInt16LE(0));

/**
 * Reads the device's GRAV_Y register. The value represents the measured 
 * gravitational acceleration in the y direction. 1 mg = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GRAV_Y}
 */
export const GRAV_Y = new ReadRegister<number>(0x7c, 2, GRAV_X.decode);

/**
 * Reads the device's GRAV_Z register. The value represents the measured 
 * gravitational acceleration in the z direction. 1 mg = 16 int.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GRAV_Z}
 */
export const GRAV_Z = new ReadRegister<number>(0x7e, 2, GRAV_X.decode);

/**
 * Reads the device's TEMPERATURE register. The value represents the measured 
 * temperature.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_TEMPERATURE}
 */
export const TEMPERATURE = new ReadRegister<number>(0x80, 1, buf => buf.readInt8(0));
