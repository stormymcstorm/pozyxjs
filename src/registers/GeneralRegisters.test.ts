import {expect} from 'chai';
import * as General from './GeneralRegisters';

describe('General Registers', () => {
    describe('DEVICE_LIST_SIZE', () => {
        it('should have the address 0x81', () => {
            expect(General.DEVICE_LIST_SIZE).to.have.property('address').that.equals(0x81);
        });

        it('should have size of 1 byte', () => {
            expect(General.DEVICE_LIST_SIZE).to.have.property('size').that.equals(1);
        });

        it('should decode to first byte in buffer', () => {
            expect(General.DEVICE_LIST_SIZE.decode(Buffer.from([1,2,3]))).to.equal(1);
        })
    });

    describe('RX_NETWORK_ID', () => {
        it('should have the address 0x82', () => {
            expect(General.RX_NETWORK_ID).to.have.property('address').that.equals(0x82);
        });

        it('should have a size of 2 bytes', () => {
            expect(General.RX_NETWORK_ID).to.have.property('size').that.equals(2);
        });

        it('should decode to network id', () => {
            const  buf = Buffer.alloc(3);

            buf.writeUInt16LE(0x54, 0);
            buf.writeUInt8(1, 2);

            expect(General.RX_NETWORK_ID.decode(buf)).to.equal(0x54);
        });
    });

    describe('RX_DATA_LEN', () => {
        it('should have the address 0x84', () => {
            expect(General.RX_DATA_LEN).to.have.property('address').that.equals(0x84);
        });

        it('should have a size of 1 byte', () => {
            expect(General.RX_DATA_LEN).to.have.property('size').that.equals(1);
        });

        it('should decode to the first byte', () => {
            expect(General.RX_DATA_LEN.decode(Buffer.from([1,2,3]))).to.equal(1);
        });
    }); 

    GPIO_Test('GPIO1', 0x85);
    GPIO_Test('GPIO2', 0x86);
    GPIO_Test('GPIO3', 0x87);
    GPIO_Test('GPIO4', 0x88);
});

function GPIO_Test(name: string, address: number) {
    describe(name, () => {
        it(`should have the address 0x${address.toString(16)}`, () => {
            expect(General[name]).to.have.property('address').that.equals(address);
        });

        it('should have a size of 1 byte', () => {
            expect(General[name]).to.have.property('size').that.equals(1);
        });

        it('should decode to true if the first byte is 1', () => {
            expect(General[name].decode(Buffer.from([1,2,3]))).to.be.true;
        });

        it('should decode to false if the first byte is 0', () => {
            expect(General[name].decode(Buffer.from([0,2,3]))).to.be.false;
        });

        it('should encode to 1 for true', () => {
            const buf: Buffer = General[name].encode(true);

            expect(buf.readUInt8(0)).to.equal(1);
        });

        it('should encode to 0 for false', () => {
            const buf: Buffer = General[name].encode(false);

            expect(buf.readUInt8(0)).to.equal(0);
        });
    });
}