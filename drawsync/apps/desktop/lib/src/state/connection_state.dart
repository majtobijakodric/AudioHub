import 'package:flutter/foundation.dart';
import 'package:shared_models/shared_models.dart';

/// Tracks connection status and currently connected device.
class DrawSyncConnectionState extends ChangeNotifier {
  bool _isListening = false;
  Device? _connectedDevice;
  SessionState _sessionState = SessionState.idle;

  bool get isListening => _isListening;
  Device? get connectedDevice => _connectedDevice;
  SessionState get sessionState => _sessionState;
  bool get isConnected => _connectedDevice != null;

  void startListening() {
    _isListening = true;
    _sessionState = SessionState.idle;
    notifyListeners();
  }

  void onDeviceConnected(Device device) {
    _connectedDevice = device;
    _sessionState = SessionState.connected;
    notifyListeners();
  }

  void onDeviceDisconnected() {
    _connectedDevice = null;
    _sessionState = SessionState.disconnected;
    notifyListeners();
  }
}
