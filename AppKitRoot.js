import React from "react";

import {
  AppKitProvider,
  AppKit
} from "@reown/appkit-react-native";

import { appKit } from "./src/AppKitConfig";
import App from "./App";

export default function AppKitRoot() {
  return (
    <AppKitProvider instance={appKit}>
      <App />
      <AppKit />
    </AppKitProvider>
  );
}
