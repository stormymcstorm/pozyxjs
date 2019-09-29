import {expect} from 'chai';
import * as Sensors from './SensorRegisters';

describe('Sensor Registers', () => {
    function POS_tests(name:string, address:number) {
        describe(name, () => {
            it(`should have the address 0x${address.toString(16)}`, () => {
                expect(Sensors[name]).to.have.property('address').that.equals(address);
            });

            it('should have a size of 4 bytes', () => {
                expect(Sensors[name]).to.have.property('size').that.equals(4);
            });

            it('should decode to x if bits 0-31 are equal to x', () => {
                const buf = Buffer.alloc(4);

                buf.writeInt32LE(10005, 0);

                expect(Sensors[name].decode(buf)).to.equal(10005);

                buf.writeInt32LE(-10005, 0);

                expect(Sensors[name].decode(buf)).to.equal(-10005);
            });

            it('should encode x where bits 0-31 are equal to x', () => {
                let bits = Sensors[name].encode(10005).readInt32LE(0);

                expect(bits).to.equal(10005);

                bits = Sensors[name].encode(-10005).readInt32LE(0);

                expect(bits).to.equal(-10005);
            });

            it('should throw for invalid position', () => {
                expect(() => Sensors[name].encode(Math.pow(2, 31))).to.throw();
                expect(() => Sensors[name].encode(-Math.pow(2, 31) - 1)).to.throw();
            });
        });
    }

    POS_tests('POS_X', 0x30);
    POS_tests('POS_Y', 0x34);
    POS_tests('POS_Z', 0x38);

    function POS_ERR_tests(name:string, address:number) {
        describe(name, () => {
            it(`should have the address 0x${address.toString(16)}`, () => {
                expect(Sensors[name]).to.have.property('address').that.equals(address);
            });

            it('should have a size of 2 bytes', () => {
                expect(Sensors[name]).to.have.property('size').that.equals(2);
            });

            it('should decode to x if bits 0-15 are equal to x', () => {
                const buf = Buffer.alloc(4);

                buf.writeInt16LE(10005, 0);

                expect(Sensors[name].decode(buf)).to.equal(10005);

                buf.writeInt16LE(-10005, 0);

                expect(Sensors[name].decode(buf)).to.equal(-10005);
            });
        });
    }

    POS_ERR_tests('POS_ERR_X', 0x3C);
    POS_ERR_tests('POS_ERR_Y', 0x3E);
    POS_ERR_tests('POS_ERR_Z', 0x40);
    POS_ERR_tests('POS_ERR_XY', 0x42);
    POS_ERR_tests('POS_ERR_XZ', 0x44);
    POS_ERR_tests('POS_ERR_YZ', 0x46);

    function INT16_readonly_sensor_test(name:string, address:number) {
        describe(name, () => {
            it(`should have the address 0x${address.toString(16)}`, () => {
                expect(Sensors[name]).to.have.property('address').that.equals(address);
            });

            it('should have a size of 2 bytes', () => {
                expect(Sensors[name]).to.have.property('size').that.equals(2);
            });

            it('should decode to x if bits 0-15 are equal to x', () => {
                const buf = Buffer.alloc(2);
                buf.writeInt16LE(15, 0);

                expect(Sensors[name].decode(buf)).to.equal(15);
            });
        });
    }

    INT16_readonly_sensor_test('MAX_LIN_ACC', 0x4E);
    INT16_readonly_sensor_test('ACCEL_X', 0x54);
    INT16_readonly_sensor_test('ACCEL_Y', 0x56);
    INT16_readonly_sensor_test('ACCEL_Z', 0x58);

    describe('PRESSURE', () => {
        it('should have the address 0x50', () => {
            expect(Sensors.PRESSURE).to.have.property('address').that.equals(0x50);
        });

        it('should have a size of 4 bytes', () => {
            expect(Sensors.PRESSURE).to.have.property('size').that.equals(4);
        });

        it('should decode to x if bits 0-31 are equal to x', () => {
            const buf = Buffer.alloc(4);
            buf.writeUInt32LE(1000,0);

            expect(Sensors.PRESSURE.decode(buf)).to.equal(1000);
        });
    });

    INT16_readonly_sensor_test('MAGN_X', 0x5A);
    INT16_readonly_sensor_test('MAGN_Y', 0x5C);
    INT16_readonly_sensor_test('MAGN_Z', 0x5E);

    INT16_readonly_sensor_test('GYRO_X', 0x60);
    INT16_readonly_sensor_test('GYRO_Y', 0x62);
    INT16_readonly_sensor_test('GYRO_Z', 0x64);

    INT16_readonly_sensor_test('EUL_HEADING', 0x66);
    INT16_readonly_sensor_test('EUL_ROLL', 0x68);
    INT16_readonly_sensor_test('EUL_PITCH', 0x6A);

    INT16_readonly_sensor_test('QUAT_W', 0x6C);
    INT16_readonly_sensor_test('QUAT_X', 0x6E);
    INT16_readonly_sensor_test('QUAT_Y', 0x70);
    INT16_readonly_sensor_test('QUAT_Z', 0x72);

    INT16_readonly_sensor_test('LIA_X', 0x74);
    INT16_readonly_sensor_test('LIA_Y', 0x76);
    INT16_readonly_sensor_test('LIA_Z', 0x78);

    INT16_readonly_sensor_test('GRAV_X', 0x7A);
    INT16_readonly_sensor_test('GRAV_Y', 0x7C);
    INT16_readonly_sensor_test('GRAV_Z', 0x7E);

    describe('TEMPERATURE', () => {
        it('should have the address 0x80', () => {
            expect(Sensors.TEMPERATURE).to.have.property('address').that.equals(0x80);
        });

        it('should have a size of 1 byte', () => {
            expect(Sensors.TEMPERATURE).to.have.property('size').that.equals(1);
        });

        it('should decode to x if bits 0-7 are equal to x', () => {
            expect(Sensors.TEMPERATURE.decode(Buffer.from([10]))).to.equal(10);
        });
    });
});