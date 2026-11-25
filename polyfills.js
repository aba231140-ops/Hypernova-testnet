import { Buffer } from "buffer";

global.Buffer = Buffer;

// Sur le navigateur, on conserve le vrai objet window.
// Sur Android, on crée uniquement un petit objet de compatibilité
// si window n'existe pas.
if (typeof window === "undefined") {
  global.window = {
    location: {
      hostname: "hypernova.app",
      href: "https://hypernova.app"
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  };
}
