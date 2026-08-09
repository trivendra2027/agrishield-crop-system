import React, { useState, useEffect } from 'react';
import { Bluetooth, BluetoothConnected, Wifi, Loader2, Server, Database } from 'lucide-react';
import { Card, Button, Input } from '../ui/index';

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID_RX = "4fafc202-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID_TX = "4fafc203-1fb5-459e-8fcc-c5c9c331914b";

const WebBluetoothConnector = ({ onTelemetryReceived }) => {
  const [device, setDevice] = useState(null);
  const [server, setServer] = useState(null);
  const [rxCharacteristic, setRxCharacteristic] = useState(null);
  const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [error, setError] = useState('');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

  const connectDevice = async () => {
    try {
      setStatus('connecting');
      setError('');
      
      const btDevice = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'AgriShield_BLE' }],
        optionalServices: [SERVICE_UUID]
      });

      btDevice.addEventListener('gattserverdisconnected', onDisconnected);
      setDevice(btDevice);

      const gattServer = await btDevice.gatt.connect();
      setServer(gattServer);

      const service = await gattServer.getPrimaryService(SERVICE_UUID);
      
      const rxChar = await service.getCharacteristic(CHARACTERISTIC_UUID_RX);
      setRxCharacteristic(rxChar);

      const txChar = await service.getCharacteristic(CHARACTERISTIC_UUID_TX);
      await txChar.startNotifications();
      txChar.addEventListener('characteristicvaluechanged', handleTelemetryNotification);

      setStatus('connected');
    } catch (err) {
      console.error(err);
      setStatus('disconnected');
      setError(err.message || 'Failed to connect');
    }
  };

  const onDisconnected = () => {
    setStatus('disconnected');
    setDevice(null);
    setServer(null);
    setRxCharacteristic(null);
  };

  const disconnectDevice = () => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
    }
  };

  const handleTelemetryNotification = (event) => {
    try {
      const value = event.target.value;
      const decoder = new TextDecoder('utf-8');
      const jsonString = decoder.decode(value);
      const data = JSON.parse(jsonString);
      if (onTelemetryReceived) {
        onTelemetryReceived(data);
      }
    } catch (err) {
      console.error("Failed to parse BLE telemetry:", err);
    }
  };

  const sendWifiCredentials = async (e) => {
    e.preventDefault();
    if (!rxCharacteristic || status !== 'connected') {
      setError("Must be connected via Bluetooth first.");
      return;
    }
    
    try {
      const payload = `WIFI:${ssid},${password}\n`;
      const encoder = new TextEncoder();
      await rxCharacteristic.writeValue(encoder.encode(payload));
      setSsid('');
      setPassword('');
      alert("Wi-Fi credentials sent to AgriShield Node successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to send Wi-Fi credentials.");
    }
  };

  return (
    <Card glass className="p-6 border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold flex items-center gap-3">
          {status === 'connected' ? (
            <BluetoothConnected className="text-blue-500 h-6 w-6" />
          ) : (
            <Bluetooth className="text-slate-500 h-6 w-6" />
          )}
          Direct Bluetooth Link
        </h2>
        
        {status === 'disconnected' && (
          <Button onClick={connectDevice} className="bg-blue-600 hover:bg-blue-700 text-white">
            Pair Device
          </Button>
        )}
        
        {status === 'connecting' && (
          <Button disabled variant="outline" className="opacity-70">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...
          </Button>
        )}
        
        {status === 'connected' && (
          <Button onClick={disconnectDevice} variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            Disconnect
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {status === 'connected' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" /> Live Telemetry Streaming
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Your browser is receiving live data directly from the ESP32 hardware. No internet required.
            </p>
          </div>

          <form onSubmit={sendWifiCredentials} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-500" /> Provision Wi-Fi Settings
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Send network credentials to the node securely over Bluetooth.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Network Name (SSID)</label>
                <Input 
                  value={ssid}
                  onChange={e => setSsid(e.target.value)}
                  placeholder="e.g. Farm-Network-5G"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Password</label>
                <Input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-2">
              Push Wi-Fi Configuration
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
};

export default WebBluetoothConnector;
