import {Duplex} from 'stream';

import debug from 'debug'
import * as usb from 'usb';

const dbg = debug('COMMUSBStream');

/**
 * The type of the request (usually passed as bmREQUEST_TYPE).
 * Each value is a flag and are meant to be or-ed.
 * 
 * @see https://www.beyondlogic.org/usbnutshell/usb6.shtml
 */
export enum RequestType {
  // bit 7
  /**
   * Data should go from host to device
   */
  DIRECTION_OUT = 0 << 7,
  
  /**
   * Data should go from device to host
   */
  DIRECTION_IN = 1 << 7,
  
  // bit 6..5
  /**
   * Requests that are common to all usb devices
   */
  TYPE_STANDARD = 0 << 5,
  
  /**
   * Requests that are common to the class of usb device
   */
  TYPE_CLASS = 1 << 5,
  
  /**
   * Requests that are specific to the device
   */
  TYPE_VENDOR = 2 << 5,
  
  // bit 4..0
  /**
   * The device is the recipient of the request
   */
  RECIPIENT_DEVICE = 0,
  
  /**
   * The interface is the recipient of the request
   */
  RECIPIENT_INTERFACE = 1,
  
  /**
   * The endpoint is the recipient of the request
   */
  RECIPIENT_ENDPOINT = 2,
  
  /**
   * The recipient of the request is something else
   */
  RECIPIENT_OTHER = 3,
};

/**
 * The request to be made
 * 
 * @see https://www.beyondlogic.org/usbnutshell/usb6.shtml
 */
export enum Request {
  /**
   * Sets UART line settings
   */
  SET_LINE_CODING = 0x20,

  /**
   * Gets the URAT line settings
   */
  GET_LINE_CODING = 0x21,

  /**
   * Sets the state of the line
   */
  SET_CONTROL_LINE_STATE = 0x22,
};

/**
 * Line-character formating properties
 */
export interface LineCoding {
  /**
   * the baudrate to set
   */
  baudrate: number,

  /**
   * the stop bits to use for character formating
   * 0 - 1 stop bit
   * 1 - 1.5 stop bits
   * 2 - 2 stop bits
   */
  stopbits: number,

  /**
   * the parity to use
   * 0 - None
   * 1 - Odd
   * 2 - Even
   */
  parity: number,
  
  /**
   * the data bits to use (5, 6, 7, 8)
   */
  databits: number,
};

/**
 * A stream for communicating with USB devices from the COMM class
 */
export default class COMMUSBStream extends Duplex {
  private _device: usb.Device;
  private _commIface: usb.Interface;
  private _dataIface: usb.Interface;

  private _controlEndpoint: usb.InEndpoint;
  private _inEndpoint: usb.InEndpoint;
  private _outEndpoint: usb.OutEndpoint;

  private _reattachCOMMDriver = false;
  private _reattachDATADriver = false;
  private _isPolling = false;

  /**
   * Creates a new communication stream for the device
   * 
   * @param {usb.Device} device the usb device
   */
  constructor(device) {
    super({
      allowHalfOpen: false,
    });

    this._device = device;

    if (! this._device.interfaces)
      this._device.open();

    // get interfaces
    this._commIface = getCOMMIface(device);

    if (! this._commIface)
      throw new Error('Unable to find COMM interface');

    this._dataIface = getDATAIface(device, this._commIface);

    if (! this._dataIface)
      throw new Error('Unable to find DATA interface');

    if (! validateDataIface(this._dataIface))
      throw new Error('Found invalid DATA interface');

    // get endpoints
    this._controlEndpoint = <usb.InEndpoint> this._commIface.endpoints.find(e => e.direction == 'in');

    if (! this._controlEndpoint)
      throw new Error('Unable to find InEndpoint for the COMM interface');
    
    if (this._dataIface.endpoints[0].direction === 'in')
      [this._inEndpoint, this._outEndpoint] = <[usb.InEndpoint, usb.OutEndpoint]> this._dataIface.endpoints;
    else
      [this._outEndpoint, this._inEndpoint] = <[usb.OutEndpoint, usb.InEndpoint]> this._dataIface.endpoints;
    
    // detach kernel drivers for linux and mac systems
    if (process.platform != 'win32') {
      if (this._commIface.isKernelDriverActive()) {
        this._commIface.detachKernelDriver();
        this._reattachCOMMDriver = true;
      }

      if (this._dataIface.isKernelDriverActive()) {
        this._dataIface.detachKernelDriver();
        this._reattachDATADriver = true;
      }
    }

    // claim interfaces
    this._commIface.claim();
    this._dataIface.claim();

    // configure endpoints
    this._inEndpoint.timeout = 1000;
    this._outEndpoint.timeout = 1000;

    this._inEndpoint.on('error', err => this.emit('error', err));
    this._inEndpoint.on('data', data => this._setPolling(this.push(data)));
    this._outEndpoint.on('error', err => this.emit('error', err));

    this._controlEndpoint.on('data', data => dbg(`Got data from control: ${data}`));
    this._controlEndpoint.on('error', err => this.emit('error', err));
    this._controlEndpoint.startPoll();

    // setup detach listener
    usb.on('detach', device => {
      if (device == this._device) this.destroy(); // close stream
    });
  }

  /**
   * Sets the line coding, activates the line and starts polling for data
   * @param {LineCoding} lineCoding the line coding to set
   * @returns {Promise<void>}       resolved when the connection is initialized
   */
  public init(lineCoding: LineCoding) {
    return this.setLineCoding(lineCoding)
      .then(() => this.setLineState(true))
      .then(() => this.getLineCoding())
      .then(coding => {
        if (coding.baudrate != lineCoding.baudrate)
          throw new Error("Failed to set baudrate for serial connection");

        if (coding.stopbits != lineCoding.stopbits)
          throw new Error("Failed to set stopbits for serial connection");

        if (coding.parity != lineCoding.parity)
          throw new Error("Failed to set parity for serial connection");

        if (coding.databits != lineCoding.databits)
          throw new Error("Failed to set databits for serial connection");
      });
  }

  /**
   * Activates or deactivates the communication line
   * 
   * @param {boolean} active whether or not to activate
   */
  public setLineState(active: boolean): Promise<any> {
    return this.controlTransfer(
      RequestType.DIRECTION_OUT | RequestType.TYPE_CLASS | RequestType.RECIPIENT_INTERFACE,
      Request.SET_CONTROL_LINE_STATE,
      active ? 3 : 0,
      this._commIface.interfaceNumber,
      Buffer.alloc(0), // TODO: test this with null
    );
  }

  /**
   * Set the line coding
   * 
   * @param {LineCoding} lineCoding the line coding to set
   * @returns {Promise<null>}       resolved when the line coding is set
   */
  public setLineCoding(lineCoding: LineCoding): Promise<any> {
    dbg(`Setting line coding ${JSON.stringify(lineCoding)}`);
    
    let data = Buffer.alloc(7);
    
    data.writeInt32LE(lineCoding.baudrate, 0);
    data.writeInt8(lineCoding.stopbits, 4);
    data.writeInt8(lineCoding.parity, 5);
    data.writeInt8(lineCoding.databits, 6);

    return this.controlTransfer(
      RequestType.DIRECTION_OUT | RequestType.TYPE_CLASS | RequestType.RECIPIENT_INTERFACE,
      Request.SET_LINE_CODING,
      0,
      this._commIface.interfaceNumber,
      data
    );
  }

  /**
   * Gets the line coding
   * @returns {Promise<LineCoding>} resolved when the request is complete
   */
  public getLineCoding(): Promise<LineCoding> {
    dbg("Getting line coding");

    return this.controlTransfer(
      RequestType.DIRECTION_IN | RequestType.TYPE_CLASS | RequestType.RECIPIENT_INTERFACE,
      Request.GET_LINE_CODING,
      0,
      this._commIface.interfaceNumber,
      7
    )
      .then(data => ({
        baudrate: data.readInt32LE(0),
        stopbits: data.readInt8(4),
        parity: data.readInt8(5),
        databits: data.readInt8(6)
      }));
  }

  /**
   * Performs a USB control transfer with the device
   * 
   * @param {bitmap} requestType          the type of the request to make
   * @param {byte} request                the request to male
   * @param {word} value                  the value field
   * @param {word} index                  the index field
   * @param {Buffer|number} dataOrLength  the data to send or the length of the data to expect
   * @returns {Promise<Buffer|null>}      resolved when the control transfer is complete
   */
  public controlTransfer(requestType:RequestType, request:Request, value:number, index:number, dataOrLength:Buffer|number): Promise<Buffer> {
    assertOpen(this._device, "Attempted to perform a control transfer with a closed device");
    
    dbg(`Preforming control transfer {bmREQUEST_TYPE: ${requestType}, bRequest: ${request}, wValue: ${value}, wIndex: ${index}}`);

    return new Promise((resolve, reject) => this._device.controlTransfer(requestType, request, value, index, dataOrLength, 
      (err, buf) => {
      if (err) reject(err);
      else resolve(buf);
    }));
  }

  _read() {
    this._setPolling(true);
  }

  _write(data, enc, callback) {
    if (! Buffer.isBuffer(data))
      data = Buffer.from(data, enc);
    
    this._outEndpoint.transfer(data, callback);
  }

  _destroy(error, callback) {
    this.setLineState(false)
      .then(() => new Promise(resolve => this._inEndpoint.stopPoll(resolve)))
      .then(() => new Promise(resolve => this._controlEndpoint.stopPoll(resolve)))
      .then(() => {
        this._inEndpoint.removeAllListeners();
        this._outEndpoint.removeAllListeners();
        this._controlEndpoint.removeAllListeners();

        return new Promise((resolve, reject) => this._commIface.release(true, err => {
          if (err) reject(err);
          else resolve();
        }));
      })
      .then(() => new Promise((resolve, reject) => this._dataIface.release(true, err => {
        if (err) reject(err);
        else resolve();
      })))
      .then(() => {
        if (this._reattachCOMMDriver)
          this._commIface.attachKernelDriver();
        
        if (this._reattachDATADriver)
          this._dataIface.attachKernelDriver();
        
        this.emit('close');
        callback();
      })
      .catch(err => callback(err));
  }

  /**
   * Sets the polling of the in endpoint
   * 
   * @private
   * @param {boolean} polling whether or not to poll the in endpoint
   */
  _setPolling(polling) {
    if (polling == this._isPolling) return;

    if (polling)
      this._inEndpoint.startPoll();
    else
      this._inEndpoint.stopPoll();
    
    this._isPolling = polling;
  }
}

/**
 * Asserts that the given device is open
 * @param {usb.Device} device the device to assert that it is open
 * @param {string} msg        the error msg
 */
function assertOpen(device, msg) {
  if (! device.interfaces)
    throw new Error(msg || 'Device is not open');
}

/**
 * Gets the communication interface of the given device
 * 
 * @private
 * @param device            the device whose COMM interface to find
 * @returns {usb.Interface} the COMM interface or undefined if the device does not have one
 * 
 * @throws {Error}          thrown if the device has not yet been opened
 */
function getCOMMIface(device) {
  if (! device.interfaces)
    throw new Error('Attempted to find COMM interface on unopened device');

  return device.interfaces.find(i => i.descriptor.bInterfaceClass === usb.LIBUSB_CLASS_COMM);
}

/**
 * Gets the data interface of the given device
 * 
 * @private
 * @param device            the device whose DATA interface to find
 * @param commIface         the COMM interface that corresponds to the data interface to find
 * @returns {usb.Interface} the DATA interface or undefined if the device does not have one
 * 
 * @throws {Error}          thrown if the device has not yet been opened
 */
function getDATAIface(device, commIface) {
  if (! device.interfaces)
    throw new Error('Attempted to find DATA interface on unopened device');

  const extraDescriptors = commIface.descriptor.extra;

  let length = extraDescriptors.length;
  let pointer = 0;
  let dataIfaceId = -1;

  // check each descriptor for the one that describes the data interface
  while (length > 0) {
    const descriptorLength = extraDescriptors[pointer];

    if (descriptorLength >= 5 && extraDescriptors[pointer + 1] === 0x24 
      && extraDescriptors[pointer + 2] === 0x06 && extraDescriptors[pointer + 3] === commIface.interfaceNumber)
      dataIfaceId = extraDescriptors[pointer + 4];

    length -= descriptorLength;
    pointer += descriptorLength;
  }

  // check that the id is a data interface
  if (dataIfaceId == -1 ||  device.interfaces.length - 1 < dataIfaceId 
    || device.interfaces[dataIfaceId].descriptor.bInterfaceClass != usb.LIBUSB_CLASS_DATA) return;

  return device.interfaces[dataIfaceId];
}

/**
 * Checks if the given interface is a valid DATA interface
 * 
 * @private
 * @param dataIface   the DATA interface to validate
 * @returns {boolean} whether or not the given interface is a valid DATA interface
 */
function validateDataIface(dataIface) {
  return dataIface.descriptor.bInterfaceClass === usb.LIBUSB_CLASS_DATA
  && dataIface.endpoints.length === 2
  && dataIface.endpoints[0].transferType === usb.LIBUSB_TRANSFER_TYPE_BULK
  && dataIface.endpoints[1].transferType === usb.LIBUSB_TRANSFER_TYPE_BULK
  && dataIface.endpoints[1].direction != dataIface.endpoints[0].direction
}
