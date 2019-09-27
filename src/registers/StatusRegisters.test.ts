import {expect} from 'chai';
import * as Status from './StatusRegisters';

describe('Status registers', () => {
  describe('WHO_AM_I', () => {
    it('should have the address 0x00', () => 
      expect(Status.WHO_AM_I).to.have.property('address').that.equals(0x00));

    it('should have a size of 1 byte', () =>
      expect(Status.WHO_AM_I).to.have.property('size').that.equals(1));

    it('should decode to first byte in buffer', () =>
      expect(Status.WHO_AM_I.decode(Buffer.from([1, 2, 3]))).to.equal(1));
  });

  describe('FIRMWARE_VERSION', () => {
    it('should have the address 0x01', () =>
      expect(Status.FIRMWARE_VERSION).to.have.property('address').that.equals(0x01));
    
    it('should have a size of 1 byte', () =>
      expect(Status.FIRMWARE_VERSION).to.have.property('size').that.equals(1));

    it('should decode to a pair', () =>
      expect(Status.FIRMWARE_VERSION.decode(Buffer.from([0xff]))).to.have.lengthOf(2));

    it('should decode to a pair where the first value is the major version', () =>
      expect(Status.FIRMWARE_VERSION.decode(Buffer.from([2 << 4]))[0]).to.equal(2));

    it('should decode to a pair where the second value is the minor version', () =>
      expect(Status.FIRMWARE_VERSION.decode(Buffer.from([2]))[1]).to.equal(2));
  });

  describe('HARDWARE_VERSION', () => {
    it('should have the address 0x02', () =>
      expect(Status.HARDWARE_VERSION).to.have.property('address').that.equals(0x02));

    it('should have a size of 1 byte', () =>
      expect(Status.HARDWARE_VERSION).to.have.property('size').that.equals(1));
    
    it('should decode to a pair', () =>
      expect(Status.HARDWARE_VERSION.decode(Buffer.from([0xff]))).to.have.lengthOf(2));
    
    it('should decode to a pair where the first value is the version', () => 
      expect(Status.HARDWARE_VERSION.decode(Buffer.from([0x2]))[0]).to.equal(1.2));

    it('should decode to a pair where the second value is whether or not the device is a arduino shield', () =>
      expect(Status.HARDWARE_VERSION.decode(Buffer.from([1 << 5]))[1]).to.equal(true));

    it('should decode to version 1.2 for the flag 0x2', () =>
      expect(Status.HARDWARE_VERSION.decode(Buffer.from([0x2]))[0]).to.equal(1.2));

    it('should decode to version 1.3 for the flag 0x3', () =>
      expect(Status.HARDWARE_VERSION.decode(Buffer.from([0x3]))[0]).to.equal(1.3));

    it('should decode to true for bit flag of 0x1', () =>
      expect(Status.HARDWARE_VERSION.decode(Buffer.from([0x1 << 5]))[1]).to.equal(true));

    it('should decode to false for bit flag of 0x0', () =>
      expect(Status.HARDWARE_VERSION.decode(Buffer.from([0x0 << 5]))[1]).to.equal(false));
  });

  describe('SELF_TEST_RESULTS', () => {
    it('should have the address 0x03', () =>
      expect(Status.SELF_TEST_RESULTS).to.have.property('address').that.equals(0x03));

    it('should have a size of 1 byte', () =>
      expect(Status.SELF_TEST_RESULTS).to.have.property('size').that.equals(1));

    it('should set uwb to true when bit 5 is 1', () =>
      expect(Status.SELF_TEST_RESULTS.decode(Buffer.from([0b0010_0000])))
      .to.have.property('uwb').that.equals(true));

    it('should set press to true when bit 4 is 1', () =>
      expect(Status.SELF_TEST_RESULTS.decode(Buffer.from([0b0001_0000])))
      .to.have.property('press').that.equals(true));

    it('should set imu to true when bit 3 is 1', () =>
      expect(Status.SELF_TEST_RESULTS.decode(Buffer.from([0b0000_1000])))
      .to.have.property('imu').that.equals(true));
    
    it('should set gyro to true when bit 2 is 1', () =>
      expect(Status.SELF_TEST_RESULTS.decode(Buffer.from([0b0000_0100])))
      .to.have.property('gyro').that.equals(true));

    it('should set mag to true when bit 1 is 1', () =>
      expect(Status.SELF_TEST_RESULTS.decode(Buffer.from([0b0000_0010])))
      .to.have.property('mag').that.equals(true));

    it('should set acc to true when bit 0 is 1', () =>
      expect(Status.SELF_TEST_RESULTS.decode(Buffer.from([0b0000_0001])))
      .to.have.property('acc').that.equals(true));
  });

  describe('ERROR_CODE', () => {
    it('should have the address 0x04', () =>
      expect(Status.ERROR_CODE).to.have.property('address').that.equals(0x04));

    it('should have a size of 1 byte', () =>
      expect(Status.ERROR_CODE).to.have.property('size').that.equals(1));

    it('should decode to first byte in buffer', () =>
      expect(Status.WHO_AM_I.decode(Buffer.from([1, 2, 3]))).to.equal(1));
  });

  describe('INT_STATUS', () => {
    it('should have the address 0x05', () =>
      expect(Status.INT_STATUS).to.have.property('address').that.equals(0x05));

    it('should have a size of 1 byte', () =>
      expect(Status.INT_STATUS).to.have.property('size').that.equals(1));

    it('should set func to true when bit 4 is 1', () =>
      expect(Status.INT_STATUS.decode(Buffer.from([0b0001_0000])))
      .to.have.property('func').that.equals(true));

    it('should set rx_data to true when bit 3 is 1', () =>
      expect(Status.INT_STATUS.decode(Buffer.from([0b0000_1000])))
      .to.have.property('rx_data').that.equals(true));

    it('should set imu to true when bit 2 is 1', () =>
      expect(Status.INT_STATUS.decode(Buffer.from([0b0000_0100])))
      .to.have.property('imu').that.equals(true));

    it('should set pos to true when bit 1 is 1', () =>
      expect(Status.INT_STATUS.decode(Buffer.from([0b0000_0010])))
      .to.have.property('pos').that.equals(true));

    it('should set err to true when bit 0 is 1', () =>
      expect(Status.INT_STATUS.decode(Buffer.from([0b0000_0001])))
      .to.have.property('err').that.equals(true));
  });

  describe('CALIBRATION_STATUS', () => {
    it('should have the address 0x06', () =>
      expect(Status.CALIBRATION_STATUS).to.have.property('address').that.equals(0x06));

    it('should have a size of 1 byte', () =>
      expect(Status.CALIBRATION_STATUS).to.have.property('size').that.equals(1));

    it('should set system to true when bit 6 is 3', () =>
      expect(Status.CALIBRATION_STATUS.decode(Buffer.from([0b1100_0000])))
      .to.have.property('system').that.equals(true));
    
    it('should set gyro to true when bit 4 is 3', () =>
      expect(Status.CALIBRATION_STATUS.decode(Buffer.from([0b0011_0000])))
      .to.have.property('gyro').that.equals(true));
    
    it('should set acc to true when bit 2 is 3', () =>
      expect(Status.CALIBRATION_STATUS.decode(Buffer.from([0b0000_1100])))
      .to.have.property('acc').that.equals(true));

    it('should set mag to true when bit 0 is 3', () =>
      expect(Status.CALIBRATION_STATUS.decode(Buffer.from([0b0000_0011])))
      .to.have.property('mag').that.equals(true));
  });
});
