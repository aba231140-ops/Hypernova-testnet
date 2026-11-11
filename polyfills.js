
import { Buffer } from "buffer";

global.Buffer = Buffer;

let windowObj = {};

if (global.window) {
  windowObj = global.window;
}

if (!windowObj.location) {
  windowObj.location = {
    hostname: "hypernova.app",
    href: "https://hypernova.app"
  };
}

if (!windowObj.addEventListener) {
  windowObj.addEventListener = () => {};
}

if (!windowObj.removeEventListener) {
  windowObj.removeEventListener = () => {};
}

if (!windowObj.dispatchEvent) {
  windowObj.dispatchEvent = () => true;
}

global.window = windowObj;
