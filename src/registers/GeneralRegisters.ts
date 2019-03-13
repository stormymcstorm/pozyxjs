import { ReadRegister, ReadWriteRegister } from './Register';

/**
 * Reads the device's DEVICE_LIST_SIZE register. This value represents the number of
 * devices stored internally.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_DEVICE_LIST_SIZE}
 */
export const DEVICE_LIST_SIZE = new ReadRegister<number>(0x81, 1, buf => buf.readUInt8(0));

/**
 * Reads the device's RX_NETWORK_ID register. This value represents the network id of the
 * latest received message.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_RX_NETWORK_ID}
 */
export const RX_NETWORK_ID = new ReadRegister<number>(0x82, 2, buf => buf.readUInt16LE(0));

/**
 * Reads the device's RX_DATA_LEN register. This value represents the length of the latest
 * received message.
 * Decodes to a number.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_RX_DATA_LEN}
 */
export const RX_DATA_LEN = new ReadRegister<number>(0x84, 1, buf => buf.readUInt8(0));

/**
 * Reads the device's GPIO1 register. This value represents the state of the
 * GPIO pin 1.
 * Decodes to a boolean {@code true} for high and {@code false} for low.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GPIO1}
 */
export const GPIO1 = new ReadWriteRegister<boolean>(0x85, 1,
  buf => buf.readUInt8(0) == 1,
  data => {
    return Buffer.from([+data]);
  }
);

/**
 * Reads the device's GPIO2 register. This value represents the state of the
 * GPIO pin 2.
 * Decodes to a boolean {@code true} for high and {@code false} for low.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GPIO2}
 */
export const GPIO2 = new ReadWriteRegister<boolean>(0x86, 1, GPIO1.decode, GPIO1.encode);

/**
 * Reads the device's GPIO3 register. This value represents the state of the
 * GPIO pin 3.
 * Decodes to a boolean {@code true} for high and {@code false} for low.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GPIO3}
 */
export const GPIO3 = new ReadWriteRegister<boolean>(0x87, 1, GPIO1.decode, GPIO1.encode);

/**
 * Reads the device's GPIO4 register. This value represents the state of the
 * GPIO pin 4.
 * Decodes to a boolean {@code true} for high and {@code false} for low.
 * @see {@link https://www.pozyx.io/product-info/developer-tag/datasheet-register-overview#POZYX_GPIO4}
 */
export const GPIO4 = new ReadWriteRegister<boolean>(0x88, 1, GPIO1.decode, GPIO1.encode);
