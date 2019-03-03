import USBSerialConnection from './connections/USBSerialConnection';
import Pozyx from "./Pozyx";
import * as usb from 'usb';

export {USBSerialConnection, Pozyx};

export function getFirstPozyxSerial(): Pozyx {
  const device = usb.getDeviceList().find(d => d.deviceDescriptor.idVendor == 0x0483);

  if (! device) return;

  return new Pozyx(new USBSerialConnection(device));
}
