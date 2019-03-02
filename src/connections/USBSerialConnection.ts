import COMMUSBStream from './COMMUSBStream';
import Connection from './Connection';

const POZYX_LINE_CODING = {
  baudrate: 115200,
  stopbits: 0, // 1 stop bit
  parity: 0, // no parity
  databits: 8,
}

const MAX_SERIAL_SIZE = 28;

const HEADER_SIZE = 5;
const DATA_HEADER_SIZE = 2;
const DATA_END_CHAR_CODE = '\r'.charCodeAt(0);

/**
 * A usb serial connection to a pozyx
 */
export default class USBSerialConnection implements Connection {
  public readonly isRemote = false;

  private _usb: COMMUSBStream;
  private _dataHandlerQueue: ((data: Buffer) => void)[] = [];

  /**
   * Creates a new serial connection with a pozyx device
   * @param device the usb device
   */
  constructor(device) {
    this._usb = new COMMUSBStream(device);

    this._usb.on('data', chunk => {
      if (this._dataHandlerQueue[0])
        this._dataHandlerQueue.pop()(chunk);
    });
  }

  public init() {
    return this._usb.init(POZYX_LINE_CODING);
  }

  public read(register: number, length: number): Promise<Buffer> {
    if (length > MAX_SERIAL_SIZE) {
      const nMsgs = (length / MAX_SERIAL_SIZE) >> 0; // truncate decimal places
      const proms: Promise<Buffer>[] = [];

      for (let i = 0; i < nMsgs; i++)
        proms.push(this.read(register + i * MAX_SERIAL_SIZE, MAX_SERIAL_SIZE));

      proms.push(this.read(register + nMsgs * MAX_SERIAL_SIZE, length - nMsgs * MAX_SERIAL_SIZE));
      
      return Promise.all(proms)
        .then(Buffer.concat);
    }

    return new Promise((resolve, reject) => {
      const lenString = length.toString();
      const buf = Buffer.allocUnsafe(HEADER_SIZE + lenString.length + 1);

      buf.write('R,', 0);
      buf.write(register.toString(16).padStart(2, '0'), 2); // write register in hex with two digits
      buf.write(',', 4);
      buf.write(lenString, 5);
      buf.write('\r', 5 + lenString.length);

      // add resolve to the queue
      this._dataHandlerQueue.unshift(resolve);

      this._usb.write(buf, err => {
        if (! err) return;
        
        // remove data handler
        const i = this._dataHandlerQueue.indexOf(resolve);
        if (i != -1)
          this._dataHandlerQueue.splice(i, 1);

        reject(err);
      });
    }).then(parseData);
  }

  public write(register: number, data: Buffer): Promise<any> {
    data = toBufferOfByteHexStrings(data);
    const length = data.length;

    if (length > MAX_SERIAL_SIZE) {
      const nMsgs = (length / MAX_SERIAL_SIZE) >> 0; // truncate decimal places
      const proms: Promise<any>[] = [];

      for (let i = 0; i < nMsgs; i++)
        proms.push(this.write(register + i * MAX_SERIAL_SIZE, data.slice(i * MAX_SERIAL_SIZE, (i + 1) * MAX_SERIAL_SIZE)));

      proms.push(this.write(register + nMsgs * MAX_SERIAL_SIZE, data.slice(nMsgs * MAX_SERIAL_SIZE)));
      
      return Promise.all(proms);
    }

    return new Promise((resolve, reject) => {
      const buf = Buffer.allocUnsafe(HEADER_SIZE + data.length + 1);

      buf.write('W,', 0);
      buf.write(register.toString(16).padStart(2, '0'), 2); // write register in hex with two digits
      buf.write(',', 4);
      
      data.copy(buf, 5);

      buf.write('\r', 5 + length);

      this._usb.write(buf, err => {
        if (err) reject(err);
        else resolve();
      })
    });
  }

  public call(register: number, params: Buffer, length: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (params.length > 14)
        throw new Error('functions params cannot exceed 14 bytes in length');

      params = toBufferOfByteHexStrings(params);
      const lenString = length.toString();

      const buf = Buffer.allocUnsafe(HEADER_SIZE + params.length + lenString.length + 2);

      buf.write('F,', 0);
      buf.write(register.toString(16).padStart(2, '0'), 2); // write register in hex with two digits
      buf.write(',', 4);
      
      params.copy(buf, 5);

      buf.write(',', 5 + params.length);
      buf.write(lenString, 6 + params.length);

      buf.write('\r', 6 + params.length + lenString.length);

      // add resolve to the queue
      this._dataHandlerQueue.unshift(resolve);

      this._usb.write(buf, err => {
        if (! err) return;
        
        // remove data handler
        const i = this._dataHandlerQueue.indexOf(resolve);
        if (i != -1)
          this._dataHandlerQueue.splice(i, 1);

        reject(err);
      });
    }).then(parseData);
  }
}

function toBufferOfByteHexStrings(data: Buffer) {
  const buf = Buffer.allocUnsafe(data.length * 2);

  for (let i = 0; i < data.length; i++)
    buf.write(data[i].toString(16).padStart(2, '0'), i * 2);

  return buf;
}

function fromBufferOfByteHexStrings(buf: Buffer) {
  return Buffer.from(buf.reduce((bytes, char) => {
    if (bytes.length == 0 || bytes[bytes.length - 1].length == 2) {
      bytes.push([char]);
    } else {
      bytes[bytes.length - 1].push(char);
    } 

    return bytes;
  }, [])
  .map(pair => parseInt(String.fromCodePoint(...pair), 16)));
}

function parseData(msg: Buffer) {
  if (msg.readUInt8(0) != 68)
    throw new Error('Malformed data message')

  const data = [];

  let end = msg.lastIndexOf(DATA_END_CHAR_CODE);

  if (end == -1)
    end = msg.length;

  return fromBufferOfByteHexStrings(msg.slice(DATA_HEADER_SIZE, end));
}
