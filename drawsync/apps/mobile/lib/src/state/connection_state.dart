import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:shared_models/shared_models.dart';

import '../network/websocket_client.dart';

class ConnectionState extends ChangeNotifier {
  final WebSocketClient _client;
  Device? _connectedDevice;
  SessionState _state = SessionState.idle;
  StreamSubscription? _messageSub;

  ConnectionState(this._client);

  Device? get connectedDevice => _connectedDevice;
  SessionState get state => _state;
  WebSocketClient get client => _client;
  bool get isConnected => _state == SessionState.connected;

  String get _deviceId => '${Platform.localHostname}-mobile';
  String get _deviceName => '${Platform.localHostname} Mobile';

  Future<bool> connect(Device device) async {
    _state = SessionState.connecting;
    _connectedDevice = device;
    notifyListeners();

    final success = await _client.connect(
      device.address,
      device.port,
      deviceId: _deviceId,
      deviceName: _deviceName,
    );

    if (success) {
      _state = SessionState.connected;
    } else {
      _state = SessionState.error;
      _connectedDevice = null;
    }
    notifyListeners();
    return success;
  }

  Future<void> disconnect() async {
    await _client.disconnect();
    _state = SessionState.disconnected;
    _connectedDevice = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _messageSub?.cancel();
    _client.dispose();
    super.dispose();
  }
}
