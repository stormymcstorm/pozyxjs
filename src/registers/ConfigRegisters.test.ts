import {expect} from 'chai';
import * as Config from './ConfigRegisters';

describe('Config Registers', () => {
    describe('INT_MASK', () => {
        it('should have the address 0x10', () => {
            expect(Config.INT_MASK).to.have.property('address').that.equals(0x10);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.INT_MASK).to.have.property('size').that.equals(1);
        });

        it('should decode to mask where err,pos,imu,rx_data and func are false if bits0-7 are 0', () => {
            const mask = Config.INT_MASK.decode(Buffer.from([0b00000000]));

            expect(mask).to.have.property('err').that.is.false;
            expect(mask).to.have.property('pos').that.is.false;
            expect(mask).to.have.property('imu').that.is.false;
            expect(mask).to.have.property('rx_data').that.is.false;
            expect(mask).to.have.property('func').that.is.false;
        });

        it('should decode to mask where err is true if bit 0 is 1', () => {
            const mask = Config.INT_MASK.decode(Buffer.from([0b00000001]));

            expect(mask).property('err').to.be.true;
        });

        it('should decode to mask where pos is true if bit 1 is 1', () => {
            const mask = Config.INT_MASK.decode(Buffer.from([0b00000010]));

            expect(mask).property('pos').to.be.true;
        });

        it('should decode to mask where imu is true if bit 2 is 1', () => {
            const mask = Config.INT_MASK.decode(Buffer.from([0b00000100]));

            expect(mask).property('imu').to.be.true;
        });

        it('should decode to mask where rx_data is true if bit 3 is 1', () => {
            const mask = Config.INT_MASK.decode(Buffer.from([0b00001000]));

            expect(mask).property('rx_data').to.be.true;
        });

        it('should decode to mask where func is true if bit 4 is 1', () => {
            const mask = Config.INT_MASK.decode(Buffer.from([0b00010000]));

            expect(mask).property('func').to.be.true;
        });

        it('should decode to mask where pin is 1 if bit 7 is 1', () => {
            const mask = Config.INT_MASK.decode(Buffer.from([0b10000000]));

            expect(mask).property('pin').to.be.equal(1);
        });

        it('should decode to mask where pin is 0 if bit 7 is 0', () => {
            const mask = Config.INT_MASK.decode(Buffer.from([0b00000000]));

            expect(mask).property('pin').to.be.equal(0);
        });

        it('should encode {err:true, ...} to 1 at bit 0', () => {
            const buf = Config.INT_MASK.encode({
                err: true,
                pos: false,
                imu: false,
                rx_data: true,
                func: false,
                pin: 0
            });

            expect(buf.readUInt8(0) & 1).to.equal(1);
        });

        it('should encode {pos:true, ...} to 1 at bit 1', () => {
            const buf = Config.INT_MASK.encode({
                err: false,
                pos: true,
                imu: false,
                rx_data: false,
                func: true,
                pin: 0
            });

            expect(buf.readUInt8(0) >> 1 & 1).to.equal(1);
        });

        it('should encode {imu:true, ...} to 1 at bit 2', () => {
            const buf = Config.INT_MASK.encode({
                err: false,
                pos: false,
                imu: true,
                rx_data: false,
                func: true,
                pin: 0
            });

            expect(buf.readUInt8(0) >> 2 & 1).to.equal(1);
        });

        it('should encode {rx_data:true, ...} to 1 at bit 3', () => {
            const buf = Config.INT_MASK.encode({
                err: true,
                pos: false,
                imu: false,
                rx_data: true,
                func: false,
                pin: 0
            });

            expect(buf.readUInt8(0) >> 3 & 1).to.equal(1);
        });

        it('should encode {func:true, ...} to 1 at bit 4', () => {
            const buf = Config.INT_MASK.encode({
                err: true,
                pos: false,
                imu: false,
                rx_data: true,
                func: true,
                pin: 0
            });

            expect(buf.readUInt8(0) >> 4 & 1).to.equal(1);
        });

        it('should encode {pin:1, ...} to 1 at bit 7', () => {
            const buf = Config.INT_MASK.encode({
                err: true,
                pos: false,
                imu: false,
                rx_data: true,
                func: true,
                pin: 1
            });

            expect(buf.readUInt8(0) >> 7 & 1).to.equal(1);
        });

        it('should encode {pin:0, ...} to 1 at bit 7', () => {
            const buf = Config.INT_MASK.encode({
                err: true,
                pos: false,
                imu: false,
                rx_data: true,
                func: true,
                pin: 0
            });

            expect(buf.readUInt8(0) >> 7 & 1).to.equal(0);
        });
    });

    describe('INT_CONFIG', () => {
        it('should have the address 0x11', () => {
            expect(Config.INT_CONFIG).to.have.property('address').that.equals(0x11);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.INT_CONFIG).to.have.property('size').that.equals(1);
        });

        it('should decode to mask where open, active and latch are false if bits0-7 are 0', () => {
            const mask = Config.INT_CONFIG.decode(Buffer.from([0b00000000]));

            expect(mask).to.have.property('open').that.is.false;
            expect(mask).to.have.property('active').that.is.false;
            expect(mask).to.have.property('latch').that.is.false;
        });

        it('should decode to mask where open is true if bit 3 is 1', () => {
            const mask = Config.INT_CONFIG.decode(Buffer.from([1 << 3]));

            expect(mask).property('open').to.be.true;
        });

        it('should decode to mask where active is true if bit 4 is 1', () => {
            const mask = Config.INT_CONFIG.decode(Buffer.from([1 << 4]));

            expect(mask).property('active').to.be.true;
        });

        it('should decode to mask where latch is true if bit 5 is 1', () => {
            const mask = Config.INT_CONFIG.decode(Buffer.from([1 << 5]));

            expect(mask).property('latch').to.be.true;
        });

        it('should decode to mask where pin is equal to bit0-2', () => {
            const mask = Config.INT_CONFIG.decode(Buffer.from([5]));

            expect(mask).property('pin').to.be.equal(5);
        });

        it('should encode {open:true, ...} to 1 at bit 3', () => {
            const buf = Config.INT_CONFIG.encode({
                open: true,
                active: false,
                latch: false,
                pin: 3
            });

            expect(buf.readUInt8(0) >> 3 & 1 ).to.equal(1);
        });

        it('should encode {active:true, ...} to 1 at bit 4', () => {
            const buf = Config.INT_CONFIG.encode({
                open: false,
                active: true,
                latch: false,
                pin: 3
            });

            expect(buf.readUInt8(0) >> 4 & 1 ).to.equal(1);
        });

        it('should encode {latch:true, ...} to 1 at bit 5', () => {
            const buf = Config.INT_CONFIG.encode({
                open: false,
                active: false,
                latch: true,
                pin: 3
            });

            expect(buf.readUInt8(0) >> 5 & 1 ).to.equal(1);
        });

        it('should encode {pin:x, ...} to x at bit 0-2', () => {
            const buf = Config.INT_CONFIG.encode({
                open: true,
                active: false,
                latch: false,
                pin: 3
            });

            expect(buf.readUInt8(0) & 0b111).to.equal(3);
        });
    });

    describe('POS_FILTER', () => {
        it('should have the address 0x14', () => {
            expect(Config.POS_FILTER).to.have.property('address').that.equals(0x14);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.POS_FILTER).to.have.property('size').that.equals(1);
        });

        it('should decode to PositionFilter of NONE when bit0-3 are equal to 0', () => {
            const [filter] = Config.POS_FILTER.decode(Buffer.from([0]));

            expect(filter).to.equal(Config.PositionFilter.NONE);
        });

        it('should decode to PositionFilter of FIR when bit0-3 are equal to 1', () => {
            const [filter] = Config.POS_FILTER.decode(Buffer.from([1]));

            expect(filter).to.equal(Config.PositionFilter.FIR);
        });

        it('should decode to PositionFilter of MOVING_AVERAGE when bit0-3 are equal to 3', () => {
            const [filter] = Config.POS_FILTER.decode(Buffer.from([3]));

            expect(filter).to.equal(Config.PositionFilter.MOVING_AVERAGE);
        });

        it('should decode to PositionFilter of MOVING_MEDIAN when bit0-3 are equal to 4', () => {
            const [filter] = Config.POS_FILTER.decode(Buffer.from([4]));

            expect(filter).to.equal(Config.PositionFilter.MOVING_MEDIAN);
        });

        it('should decode to strength of x when bit4-7 are equal to x', () => {
            const [_, strength] = Config.POS_FILTER.decode(Buffer.from([(10 << 4) + 1]));

            expect(strength).to.equal(10);
        });

        it('should encode PositionFilter.NONE to 0 at bit0-3', () => {
            const buf = Config.POS_FILTER.encode([Config.PositionFilter.NONE, 0]);

            expect(buf.readUInt8(0) & 0b1111).to.equal(0);
        });

        it('should encode PositionFilter.FIR to 1 at bit0-3', () => {
            const buf = Config.POS_FILTER.encode([Config.PositionFilter.FIR, 0]);

            expect(buf.readUInt8(0) & 0b1111).to.equal(1);
        });

        it('should encode PositionFilter.MOVING_AVERAGE to 3 at bit0-3', () => {
            const buf = Config.POS_FILTER.encode([Config.PositionFilter.MOVING_AVERAGE, 0]);

            expect(buf.readUInt8(0) & 0b1111).to.equal(3);
        });

        it('should encode PositionFilter.MOVING_MEDIAN to 4 at bit0-3', () => {
            const buf = Config.POS_FILTER.encode([Config.PositionFilter.MOVING_MEDIAN, 0]);

            expect(buf.readUInt8(0) & 0b1111).to.equal(4);
        });

        it('should encode strength of x to x at bit4-7', () => {
            const buf = Config.POS_FILTER.encode([0, 11]);

            expect(buf.readUInt8(0) >> 4 & 0b1111).to.equal(11);
        });

        it('should throw for invalid strength', () => {
            expect(() => Config.POS_FILTER.encode([0, 17])).to.throw();
            expect(() => Config.POS_FILTER.encode([0, -1])).to.throw();
        });

        it('should throw for invalid filter', () => {
            expect(() => Config.POS_FILTER.encode([2, 0])).to.throw();
            expect(() => Config.POS_FILTER.encode([-1, 0])).to.throw();
            expect(() => Config.POS_FILTER.encode([5, 0])).to.throw();
        });

        // it('should encode {open:true, ...} to 1 at bit 3', () => {
        //     const buf = Config.INT_CONFIG.encode({
        //         open: true,
        //         active: false,
        //         latch: false,
        //         pin: 3
        //     });

        //     expect(buf.readUInt8(0) >> 3 & 1 ).to.equal(1);
        // });

        // it('should encode {active:true, ...} to 1 at bit 4', () => {
        //     const buf = Config.INT_CONFIG.encode({
        //         open: false,
        //         active: true,
        //         latch: false,
        //         pin: 3
        //     });

        //     expect(buf.readUInt8(0) >> 4 & 1 ).to.equal(1);
        // });

        // it('should encode {latch:true, ...} to 1 at bit 5', () => {
        //     const buf = Config.INT_CONFIG.encode({
        //         open: false,
        //         active: false,
        //         latch: true,
        //         pin: 3
        //     });

        //     expect(buf.readUInt8(0) >> 5 & 1 ).to.equal(1);
        // });

        // it('should encode {pin:x, ...} to x at bit 0-2', () => {
        //     const buf = Config.INT_CONFIG.encode({
        //         open: true,
        //         active: false,
        //         latch: false,
        //         pin: 3
        //     });

        //     expect(buf.readUInt8(0) & 0b111).to.equal(3);
        // });
    });

    describe('CONFIG_LEDS', () => {
        it('should have the address 0x15', () => {
            expect(Config.CONFIG_LEDS).to.have.property('address').that.equals(0x15);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.CONFIG_LEDS).to.have.property('size').that.equals(1);
        });

        it('should decode to leds[0] = true if bit 0 is 1', () => {
            const {leds} = Config.CONFIG_LEDS.decode(Buffer.from([0b00000001]));

            expect(leds[0]).to.be.true;
        });

        it('should decode to leds[1] = true if bit 1 is 1', () => {
            const {leds} = Config.CONFIG_LEDS.decode(Buffer.from([0b00000010]));

            expect(leds[1]).to.be.true;
        });

        it('should decode to leds[2] = true if bit 2 is 1', () => {
            const {leds} = Config.CONFIG_LEDS.decode(Buffer.from([0b00000100]));

            expect(leds[2]).to.be.true;
        });

        it('should decode to leds[3] = true if bit 3 is 1', () => {
            const {leds} = Config.CONFIG_LEDS.decode(Buffer.from([0b00001000]));

            expect(leds[3]).to.be.true;
        });

        it('should decode to led_rx = true if bit 4 is 1', () => {
            const {led_rx} = Config.CONFIG_LEDS.decode(Buffer.from([0b00010000]));

            expect(led_rx).to.be.true;
        });

        it('should decode to led_tx = true if bit 4 is 1', () => {
            const {led_tx} = Config.CONFIG_LEDS.decode(Buffer.from([0b00100000]));

            expect(led_tx).to.be.true;
        });

        it('should encode leds[0] = true to a 1 at bit 0', () => {
            const bits = Config.CONFIG_LEDS.encode({
                leds: [true, false, false, false],
                led_rx: true,
                led_tx: true
            }).readUInt8(0);

            expect(bits & 1).to.equal(1);
        });

        it('should encode leds[1] = true to a 1 at bit 1', () => {
            const bits = Config.CONFIG_LEDS.encode({
                leds: [false, true, false, false],
                led_rx: true,
                led_tx: true
            }).readUInt8(0);

            expect(bits >> 1 & 1).to.equal(1);
        });

        it('should encode leds[2] = true to a 1 at bit 2', () => {
            const bits = Config.CONFIG_LEDS.encode({
                leds: [false, false, true, false],
                led_rx: true,
                led_tx: true
            }).readUInt8(0);

            expect(bits >> 2 & 1).to.equal(1);
        });

        it('should encode leds[3] = true to a 1 at bit 3', () => {
            const bits = Config.CONFIG_LEDS.encode({
                leds: [false, false, false, true],
                led_rx: true,
                led_tx: true
            }).readUInt8(0);

            expect(bits >> 3 & 1).to.equal(1);
        });

        it('should encode led_rx = true to a 1 at bit 4', () => {
            const bits = Config.CONFIG_LEDS.encode({
                leds: [false, false, false, false],
                led_rx: true,
                led_tx: false
            }).readUInt8(0);

            expect(bits >> 4 & 1).to.equal(1);
        });

        it('should encode led_tx = true to a 1 at bit 5', () => {
            const bits = Config.CONFIG_LEDS.encode({
                leds: [false, false, false, false],
                led_rx: false,
                led_tx: true
            }).readUInt8(0);

            expect(bits >> 5 & 1).to.equal(1);
        });
    });

    describe('POS_ALG', () => {
        it('should have the address 0x16', () => {
            expect(Config.POS_ALG).to.have.property('address').that.equals(0x16);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.POS_ALG).to.have.property('size').that.equals(1);
        });

        it('should decode to PositionAlgorithm.UWB_ONLY when bit 0-3 is 0', () => {
            const [alg] = Config.POS_ALG.decode(Buffer.from([0]));

            expect(alg).to.equal(Config.PositionAlgorithm.UWB_ONLY);
        });

        it('should decode to PositionAlgorithm.TRACKING when bit 0-3 is 4', () => {
            const [alg] = Config.POS_ALG.decode(Buffer.from([4]));

            expect(alg).to.equal(Config.PositionAlgorithm.TRACKING);
        });

        it('should decode to PositionDimension.D_2 when bit 4-5 is 2', () => {
            const [_, dim] = Config.POS_ALG.decode(Buffer.from([2 << 4]));

            expect(dim).to.equal(Config.PositionDimension.D_2);
        });

        it('should decode to PositionDimension.D_2_5 when bit 4-5 is 1', () => {
            const [_, dim] = Config.POS_ALG.decode(Buffer.from([1 << 4]));

            expect(dim).to.equal(Config.PositionDimension.D_2_5);
        });

        it('should decode to PositionDimension.D_3 when bit 4-5 is 3', () => {
            const [_, dim] = Config.POS_ALG.decode(Buffer.from([3 << 4]));

            expect(dim).to.equal(Config.PositionDimension.D_3);
        });

        it('should throw for invalid algorithm', () => {
            expect(() => Config.POS_ALG.encode([2, 0])).to.throw();
        });

        it('should throw for invalid dimension', () => {
            expect(() => Config.POS_ALG.encode([0, 0])).to.throw();
            expect(() => Config.POS_ALG.encode([0, 4])).to.throw();
        });
    });

    describe('POS_NUM_ANCHORS', () => {
        it('should have the address 0x17', () => {
            expect(Config.POS_NUM_ANCHORS).to.have.property('address').that.equal(0x17);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.POS_NUM_ANCHORS).to.have.property('size').that.equal(1);
        });

        it('should decode to a num of x if bit 0-3 are equal to x', () => {
            const [num] = Config.POS_NUM_ANCHORS.decode(Buffer.from([4]));

            expect(num).to.equal(4);
        });

        it('should decode to a mode of true if bit 4-7 are equal to 1', () => {
            const [_, mode] = Config.POS_NUM_ANCHORS.decode(Buffer.from([1 << 4]));

            expect(mode).to.be.true;
        });

        it('should decode to a mode of false if bit 4-7 are equal to 0', () => {
            const [_, mode] = Config.POS_NUM_ANCHORS.decode(Buffer.from([0 << 4]));

            expect(mode).to.be.false;
        });

        it('should encode num = x to a bit 0-3 being equal to x', () => {
            const bits = Config.POS_NUM_ANCHORS.encode([5, false]).readUInt8(0);

            expect(bits & 0b1111).to.equal(5);
        });

        it('should encode mode = true to a bit 4-7 being equal to 1', () => {
            const bits = Config.POS_NUM_ANCHORS.encode([3, true]).readUInt8(0);

            expect(bits >> 4 & 0b1111).to.equal(1);
        });

        it('should encode mode = false to a bit 4-7 being equal to 0', () => {
            const bits = Config.POS_NUM_ANCHORS.encode([3, false]).readUInt8(0);

            expect(bits >> 4 & 0b1111).to.equal(0);
        });

        it('should throw for invalid number of anchors', () => {
            expect(() => Config.POS_NUM_ANCHORS.encode([2, false])).to.throw();
            expect(() => Config.POS_NUM_ANCHORS.encode([16, false])).to.throw();
        });
        
    });

    describe('POS_INTERVAL', () => {
        it('should have the address 0x18', () => {
            expect(Config.POS_INTERVAL).to.have.property('address').that.equal(0x18);
        });

        it('should have a size of 2 bytes', () => {
            expect(Config.POS_INTERVAL).to.have.property('size').that.equal(2);
        });

        it('should decode to x if bits 0-15 are equal to x', () => {
            const buf = Buffer.alloc(2);
            buf.writeUInt16LE(1120, 0);

            expect(Config.POS_INTERVAL.decode(buf)).to.equal(1120);
        });

        it('should encode x to bits 0-15 being equal to x', () => {
            const buf = Config.POS_INTERVAL.encode(1120);

            expect(buf.readUInt16LE(0)).to.equal(1120);
        });

        it('should throw for invalid interval', () => {
            expect(() => Config.POS_INTERVAL.encode(10)).to.not.throw();
            expect(() => Config.POS_INTERVAL.encode(9)).to.throw();
            expect(() => Config.POS_INTERVAL.encode(60000)).to.not.throw();
            expect(() => Config.POS_INTERVAL.encode(60001)).to.throw();
        });
    });

    describe('NETWORK_ID', () => {
        it('should have the address 0x1A', () => {
            expect(Config.NETWORK_ID).to.have.property('address').that.equal(0x1A);
        });

        it('should have a size of 2 bytes', () => {
            expect(Config.NETWORK_ID).to.have.property('size').that.equals(2);
        });

        it('should decode to x if bits 0-15 are equal to x', () => {
            const buf = Buffer.alloc(2);
            buf.writeUInt16LE(0x6a17, 0);

            expect(Config.NETWORK_ID.decode(buf)).to.equal(0x6a17);
        });

        it('should encode x where bits 0-15 are equal to x', () => {
            const buf = Config.NETWORK_ID.encode(0x6a17);

            expect(buf.readUInt16LE(0)).to.equal(0x6a17);
        });
    });

    describe('UWB_CHANNEL', () => {
        it('should have the address 0x1c', () => {
            expect(Config.UWB_CHANNEL).to.have.property('address').that.equals(0x1c);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.UWB_CHANNEL).to.have.property('size').that.equals(1);
        });

        it('should decode to x if bits 0-7 are equal to x', () => {
            const channel = Config.UWB_CHANNEL.decode(Buffer.from([7]));

            expect(channel).to.equal(7);
        });

        it('should encode x where bits 0-7 are equal to x', () => {
            const bits = Config.UWB_CHANNEL.encode(7).readUInt8(0);

            expect(bits).to.equal(7);
        });

        it('should throw for invalid channel', () => {
            expect(() => Config.UWB_CHANNEL.encode(0)).to.throw();
            expect(() => Config.UWB_CHANNEL.encode(1)).to.not.throw();
            expect(() => Config.UWB_CHANNEL.encode(2)).to.not.throw();
            expect(() => Config.UWB_CHANNEL.encode(3)).to.not.throw();
            expect(() => Config.UWB_CHANNEL.encode(4)).to.not.throw();
            expect(() => Config.UWB_CHANNEL.encode(5)).to.not.throw();
            expect(() => Config.UWB_CHANNEL.encode(6)).to.throw();
            expect(() => Config.UWB_CHANNEL.encode(7)).to.not.throw();
            expect(() => Config.UWB_CHANNEL.encode(8)).to.throw();
        });
    });

    describe('UWB_RATES', () => {
        it('should have the address 0x1D', () => {
            expect(Config.UWB_RATES).to.have.property('address').that.equals(0x1D);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.UWB_RATES).to.have.property('size').that.equals(1);
        });

        it('should decode to bitrate = x if bits 0-5 are equal to x', () => {
            const [bitrate] = Config.UWB_RATES.decode(Buffer.from([2]));

            expect(bitrate).to.equal(2);
        });

        it('should decode to prf = x if bits 6-7 are equal to x', () => {
            const [_, prf] = Config.UWB_RATES.decode(Buffer.from([2 << 6]));

            expect(prf).to.equal(2);
        });

        it('should encode bitrate = x where bits 0-5 are equal to x', () => {
            const bits = Config.UWB_RATES.encode([2, 1]).readUInt8(0);

            expect(bits & 0b11111).to.equal(2);
        });

        it('should encode prf = x where bits 6-7 are equal to x', () => {
            const bits = Config.UWB_RATES.encode([0, 2]).readUInt8(0);

            expect(bits >> 6 & 0b11).to.equal(2);
        });

        it('should throw for invalid bitrate', () => {
            expect(() => Config.UWB_RATES.encode([-1, 1])).to.throw();
            expect(() => Config.UWB_RATES.encode([0, 1])).to.not.throw();
            expect(() => Config.UWB_RATES.encode([1, 1])).to.not.throw();
            expect(() => Config.UWB_RATES.encode([2, 1])).to.not.throw();
            expect(() => Config.UWB_RATES.encode([3, 1])).to.throw();
        });

        it('should throw for invalid prf', () => {
            expect(() => Config.UWB_RATES.encode([1, 0])).to.throw();
            expect(() => Config.UWB_RATES.encode([1, 1])).to.not.throw();
            expect(() => Config.UWB_RATES.encode([1, 2])).to.not.throw();
            expect(() => Config.UWB_RATES.encode([1, 3])).to.throw();
        });
    });

    describe('UWB_PLEN', () => {
        it('should have the address 0x1E', () => {
            expect(Config.UWB_PLEN).to.have.property('address').that.equals(0x1E);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.UWB_PLEN).to.have.property('size').that.equals(1);
        });

        it('should decode to x if bits 0-7 are equal to x', () => {
            const channel = Config.UWB_PLEN.decode(Buffer.from([0x0c]));

            expect(channel).to.equal(0x0c);
        });

        it('should encode x where bits 0-7 are equal to x', () => {
            const bits = Config.UWB_PLEN.encode(0x0c).readUInt8(0);

            expect(bits).to.equal(0x0c);
        });

        it('should throw for invalid plen', () => {
            expect(() => Config.UWB_PLEN.encode(1)).to.throw();
            expect(() => Config.UWB_PLEN.encode(0x0c)).to.not.throw();
            expect(() => Config.UWB_PLEN.encode(0x28)).to.not.throw();
            expect(() => Config.UWB_PLEN.encode(0x18)).to.not.throw();
            expect(() => Config.UWB_PLEN.encode(0x08)).to.not.throw();
            expect(() => Config.UWB_PLEN.encode(0x34)).to.not.throw();
            expect(() => Config.UWB_PLEN.encode(0x24)).to.not.throw();
            expect(() => Config.UWB_PLEN.encode(0x14)).to.not.throw();
            expect(() => Config.UWB_PLEN.encode(0x04)).to.not.throw();
        });
    });

    describe('UWB_GAIN', () => {
        it('should have the address 0x1F', () => {
            expect(Config.UWB_GAIN).to.have.property('address').that.equals(0x1F);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.UWB_GAIN).to.have.property('size').that.equals(1);
        });

        it('should decode to x if bits 0-7 are equal to x', () => {
            const channel = Config.UWB_GAIN.decode(Buffer.from([1]));

            expect(channel).to.equal(1);
        });

        it('should encode x where bits 0-7 are equal to x', () => {
            const bits = Config.UWB_GAIN.encode(1).readUInt8(0);

            expect(bits).to.equal(1);
        });

        it('should throw for invalid gain', () => {
            expect(() => Config.UWB_GAIN.encode(0)).to.not.throw();
            expect(() => Config.UWB_GAIN.encode(67)).to.not.throw();
            expect(() => Config.UWB_GAIN.encode(-1)).to.throw();
            expect(() => Config.UWB_GAIN.encode(68)).to.throw();
        });
    });

    describe('UWB_XTALTRIM', () => {
        it('should have the address 0x20', () => {
            expect(Config.UWB_XTALTRIM).to.have.property('address').that.equals(0x20);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.UWB_XTALTRIM).to.have.property('size').that.equals(1);
        });

        it('should decode to x if bits 0-4 are equal to x', () => {
            const channel = Config.UWB_XTALTRIM.decode(Buffer.from([1]));

            expect(channel).to.equal(1);
        });

        it('should encode x where bits 0-4 are equal to x', () => {
            const bits = Config.UWB_XTALTRIM.encode(1).readUInt8(0);

            expect(bits).to.equal(1);
        });

        it('should throw for invalid trim', () => {
            expect(() => Config.UWB_XTALTRIM.encode(0)).to.not.throw();
            expect(() => Config.UWB_XTALTRIM.encode(15)).to.not.throw();
            expect(() => Config.UWB_XTALTRIM.encode(-1)).to.throw();
            expect(() => Config.UWB_XTALTRIM.encode(16)).to.throw();
        });
    });

    describe('RANGE_PROTOCOL', () => {
        it('should have the address 0x21', () => {
            expect(Config.RANGE_PROTOCOL).to.have.property('address').that.equals(0x21);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.RANGE_PROTOCOL).to.have.property('size').that.equals(1);
        });

        it('should decode to RangeProtocol.PRECISION if bits 0-7 are equal to 0', () => {
            const channel = Config.RANGE_PROTOCOL.decode(Buffer.from([0]));

            expect(channel).to.equal(Config.RangeProtocol.PRECISION);
        });

        it('should decode to RangeProtocol.FAST if bits 0-7 are equal to 1', () => {
            const channel = Config.RANGE_PROTOCOL.decode(Buffer.from([1]));

            expect(channel).to.equal(Config.RangeProtocol.FAST);
        });

        it('should encode RangeProtocol.PRECISION where bits 0-7 are equal to 0', () => {
            const bits = Config.RANGE_PROTOCOL.encode(Config.RangeProtocol.PRECISION).readUInt8(0);

            expect(bits).to.equal(0);
        });

        it('should encode RangeProtocol.FAST where bits 0-7 are equal to 1', () => {
            const bits = Config.RANGE_PROTOCOL.encode(Config.RangeProtocol.FAST).readUInt8(0);

            expect(bits).to.equal(1);
        });

        it('should throw for invalid protocol', () => {
            expect(() => Config.RANGE_PROTOCOL.encode(Config.RangeProtocol.PRECISION)).to.not.throw();
            expect(() => Config.RANGE_PROTOCOL.encode(Config.RangeProtocol.PRECISION)).to.not.throw();
            expect(() => Config.RANGE_PROTOCOL.encode(2)).to.throw();
        });
    });

    describe('OPERATION_MODE', () => {
        it('should have the address 0x22', () => {
            expect(Config.OPERATION_MODE).to.have.property('address').that.equals(0x22);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.OPERATION_MODE).to.have.property('size').that.equals(1);
        });

        it('should decode to OperationMode.TAG if bits 0 is equal to 0', () => {
            const channel = Config.OPERATION_MODE.decode(Buffer.from([0]));

            expect(channel).to.equal(Config.OperationMode.TAG);
        });

        it('should decode to OperationMode.ANCHOR if bits 0 is equal to 1', () => {
            const channel = Config.OPERATION_MODE.decode(Buffer.from([1]));

            expect(channel).to.equal(Config.OperationMode.ANCHOR);
        });

        it('should encode OperationMode.TAG where bit 0 is equal to 0', () => {
            const bits = Config.OPERATION_MODE.encode(Config.OperationMode.TAG).readUInt8(0);

            expect(bits).to.equal(0);
        });

        it('should encode OperationMode.ANCHOR where bit 0 is equal to 1', () => {
            const bits = Config.OPERATION_MODE.encode(Config.OperationMode.ANCHOR).readUInt8(0);

            expect(bits).to.equal(1);
        });

        it('should throw for invalid mode', () => {
            expect(() => Config.OPERATION_MODE.encode(Config.OperationMode.TAG)).to.not.throw();
            expect(() => Config.OPERATION_MODE.encode(Config.OperationMode.ANCHOR)).to.not.throw();
            expect(() => Config.OPERATION_MODE.encode(2)).to.throw();
        });
    });

    describe('SENSORS_MODE', () => {
        it('should have the address 0x23', () => {
            expect(Config.SENSORS_MODE).to.have.property('address').that.equals(0x23);
        });

        it('should have a size of 1 byte', () => {
            expect(Config.SENSORS_MODE).to.have.property('size').that.equals(1);
        });

        it('should decode to SensorMode.OFF if bits 0-3 is equal to 0', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([0]));

            expect(channel).to.equal(Config.SensorMode.OFF);
        });

        it('should decode to SensorMode.ACC_ONLY if bits 0-3 is equal to 1', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([1]));

            expect(channel).to.equal(Config.SensorMode.ACC_ONLY);
        });

        it('should decode to SensorMode.MAG_ONLY if bits 0-3 is equal to 2', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([2]));

            expect(channel).to.equal(Config.SensorMode.MAG_ONLY);
        });

        it('should decode to SensorMode.GYRO_ONLY if bits 0-3 is equal to 3', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([3]));

            expect(channel).to.equal(Config.SensorMode.GYRO_ONLY);
        });

        it('should decode to SensorMode.ACC_MAG if bits 0-3 is equal to 4', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([4]));

            expect(channel).to.equal(Config.SensorMode.ACC_MAG);
        });

        it('should decode to SensorMode.ACC_GYRO if bits 0-3 is equal to 5', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([5]));

            expect(channel).to.equal(Config.SensorMode.ACC_GYRO);
        });

        it('should decode to SensorMode.MAG_GYRO if bits 0-3 is equal to 6', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([6]));

            expect(channel).to.equal(Config.SensorMode.MAG_GYRO);
        });

        it('should decode to SensorMode.AMG if bits 0-3 is equal to 7', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([7]));

            expect(channel).to.equal(Config.SensorMode.AMG);
        });

        it('should decode to SensorMode.IMU if bits 0-3 is equal to 8', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([8]));

            expect(channel).to.equal(Config.SensorMode.IMU);
        });

        it('should decode to SensorMode.COMPASS if bits 0-3 is equal to 9', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([9]));

            expect(channel).to.equal(Config.SensorMode.COMPASS);
        });

        it('should decode to SensorMode.M4G if bits 0-3 is equal to 10', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([10]));

            expect(channel).to.equal(Config.SensorMode.M4G);
        });

        it('should decode to SensorMode.NDOF_FMC_OFF if bits 0-3 is equal to 11', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([11]));

            expect(channel).to.equal(Config.SensorMode.NDOF_FMC_OFF);
        });

        it('should decode to SensorMode.NDOF if bits 0-3 is equal to 12', () => {
            const channel = Config.SENSORS_MODE.decode(Buffer.from([12]));

            expect(channel).to.equal(Config.SensorMode.NDOF);
        });

        it('should encode SensorMode.OFF where bits 0-3 is equal to 0', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.OFF).readUInt8(0);

            expect(bits).to.equal(0);
        });

        it('should encode SensorMode.ACC_ONLY where bits 0-3 is equal to 1', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.ACC_ONLY).readUInt8(0);

            expect(bits).to.equal(1);
        });

        it('should encode SensorMode.MAG_ONLY where bits 0-3 is equal to 2', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.MAG_ONLY).readUInt8(0);

            expect(bits).to.equal(2);
        });

        it('should encode SensorMode.GYRO_ONLY where bits 0-3 is equal to 3', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.GYRO_ONLY).readUInt8(0);

            expect(bits).to.equal(3);
        });

        it('should encode SensorMode.ACC_MAG where bits 0-3 is equal to 4', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.ACC_MAG).readUInt8(0);

            expect(bits).to.equal(4);
        });

        it('should encode SensorMode.ACC_GYRO where bits 0-3 is equal to 5', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.ACC_GYRO).readUInt8(0);

            expect(bits).to.equal(5);
        });

        it('should encode SensorMode.MAG_GYRO where bits 0-3 is equal to 6', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.MAG_GYRO).readUInt8(0);

            expect(bits).to.equal(6);
        });

        it('should encode SensorMode.AMG where bits 0-3 is equal to 7', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.AMG).readUInt8(0);

            expect(bits).to.equal(7);
        });

        it('should encode SensorMode.IMU where bits 0-3 is equal to 8', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.IMU).readUInt8(0);

            expect(bits).to.equal(8);
        });

        it('should encode SensorMode.COMPASS where bits 0-3 is equal to 9', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.COMPASS).readUInt8(0);

            expect(bits).to.equal(9);
        });

        it('should encode SensorMode.M4G where bits 0-3 is equal to 10', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.M4G).readUInt8(0);

            expect(bits).to.equal(10);
        });

        it('should encode SensorMode.NDOF_FMC_OFF where bits 0-3 is equal to 11', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.NDOF_FMC_OFF).readUInt8(0);

            expect(bits).to.equal(11);
        });

        it('should encode SensorMode.NDOF where bits 0-3 is equal to 12', () => {
            const bits = Config.SENSORS_MODE.encode(Config.SensorMode.NDOF).readUInt8(0);

            expect(bits).to.equal(12);
        });

        it('should throw for invalid mode', () => {
            expect(() => Config.SENSORS_MODE.encode(0)).to.not.throw();
            expect(() => Config.SENSORS_MODE.encode(12)).to.not.throw();
            expect(() => Config.SENSORS_MODE.encode(-1)).to.throw();
            expect(() => Config.SENSORS_MODE.encode(13)).to.throw();
        });
    });

    GPIO_test('CONFIG_GPIO1', 0x27);
    GPIO_test('CONFIG_GPIO2', 0x28);
    GPIO_test('CONFIG_GPIO3', 0x29);
    GPIO_test('CONFIG_GPIO4', 0x2a);
});

function GPIO_test(name: string, address: number) {
    describe(name, () => {
        it(`should have the address ${address}`, () => {
            expect(Config[name]).to.have.property('address').that.equals(address);
        });

        it('should have a size of 1 byte', () => {
            expect(Config[name]).to.have.property('size').that.equals(1);
        });

        it('should decode to mode = x if bits 0-2 are equal to x', () => {
            const [mode] = Config[name].decode(Buffer.from([1]));

            expect(mode).to.equal(1);
        });

        it('should decode to pull = x if bits 3-4 are equal to x', () => {
            const [_, pull] = Config[name].decode(Buffer.from([1 << 3]));

            expect(pull).to.equal(1);
        });

        it('should encode mode = x where bits 0-2 are equal to x', () => {
            const bits = Config[name].encode([1, 0]).readUInt8(0);

            expect(bits & 0b111).to.equal(1);
        });

        it('should encode pull = x where bits 3-4 are equal to x', () => {
            const bits = Config[name].encode([0, 1]).readUInt8(0);

            expect(bits >> 3 & 0b11).to.equal(1);
        });

        it('should throw for invalid mode', () => {
            expect(() => Config[name].encode([0, 0])).to.not.throw();
            expect(() => Config[name].encode([1, 0])).to.not.throw();
            expect(() => Config[name].encode([2, 0])).to.not.throw();
            expect(() => Config[name].encode([-1, 0])).to.throw();
            expect(() => Config[name].encode([3, 0])).to.throw();
        });

        it('should throw for invalid pull', () => {
            expect(() => Config[name].encode([0, 0])).to.not.throw();
            expect(() => Config[name].encode([0, 1])).to.not.throw();
            expect(() => Config[name].encode([0, 2])).to.not.throw();
            expect(() => Config[name].encode([0, -1])).to.throw();
            expect(() => Config[name].encode([0, 3])).to.throw();
        });
    });
}