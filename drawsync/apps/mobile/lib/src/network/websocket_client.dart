import 'dart:async';
import 'dart:io';

import 'package:shared_protocol/shared_protocol.dart';

class WebSocketClient {
  WebSocket? _socket;
  bool _connected = false;
  Timer? _heartbeatTimer;
  final _messageController = StreamController<ProtocolMessage>.broadcast();

  bool get isConnected => _connected;
  Stream<ProtocolMessage> get messages => _messageController.stream;

  Future<bool> connect(String address, int port, {
    required String deviceId,
    required String deviceName,
  }) async {
    try {
      _socket = await WebSocket.connect('ws://$address:$port')
          .timeout(ProtocolConstants.connectionTimeout);

      _socket!.listen(
        (data) {
          if (data is String) {
            try {
              final message = ProtocolMessage.parse(data);
              _messageController.add(message);
            } catch (_) {}
          }
        },
        onDone: () {
          _connected = false;
          _stopHeartbeat();
        },
        onError: (_) {
          _connected = false;
          _stopHeartbeat();
        },
      );

      // Send hello
      sendMessage(ProtocolMessage.hello(
        deviceId: deviceId,
        deviceName: deviceName,
      ));

      // Send connect request
      sendMessage(ProtocolMessage.connectRequest(
        deviceId: deviceId,
        deviceName: deviceName,
      ));

      // Wait for connect accept
      final response = await messages
          .where((m) =>
              m.type == MessageType.connectAccept ||
              m.type == MessageType.connectReject)
          .first
          .timeout(ProtocolConstants.connectionTimeout);

      if (response.type == MessageType.connectAccept) {
        _connected = true;
        _startHeartbeat();
        return true;
      }
      return false;
    } catch (e) {
      _connected = false;
      return false;
    }
  }

  void sendMessage(ProtocolMessage message) {
    if (_socket != null) {
      _socket!.add(message.toJsonString());
    }
  }

  void _startHeartbeat() {
    _heartbeatTimer = Timer.periodic(
      ProtocolConstants.heartbeatInterval,
      (_) => sendMessage(ProtocolMessage.heartbeat()),
    );
  }

  void _stopHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;
  }

  Future<void> disconnect() async {
    _stopHeartbeat();
    _connected = false;
    try {
      sendMessage(ProtocolMessage.disconnect());
      await _socket?.close();
    } catch (_) {}
    _socket = null;
  }

  void dispose() {
    disconnect();
    _messageController.close();
  }
}
