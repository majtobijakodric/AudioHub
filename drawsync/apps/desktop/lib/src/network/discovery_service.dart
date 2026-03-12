import 'dart:io';

import 'package:shared_protocol/shared_protocol.dart';

/// Broadcasts presence on LAN via UDP so mobile devices can discover this desktop.
class DiscoveryService {
  RawDatagramSocket? _socket;
  final int _serverPort;
  final String _deviceName;

  DiscoveryService({
    required int serverPort,
    required String deviceName,
  })  : _serverPort = serverPort,
        _deviceName = deviceName;

  Future<void> start() async {
    _socket = await RawDatagramSocket.bind(
      InternetAddress.anyIPv4,
      ProtocolConstants.discoveryPort,
    );
    _socket!.broadcastEnabled = true;

    _socket!.listen((RawSocketEvent event) {
      if (event == RawSocketEvent.read) {
        final datagram = _socket!.receive();
        if (datagram == null) return;

        final message = String.fromCharCodes(datagram.data);
        if (message == ProtocolConstants.discoveryMessage) {
          final response =
              '${ProtocolConstants.discoveryResponse}:$_serverPort:$_deviceName';
          _socket!.send(
            response.codeUnits,
            datagram.address,
            datagram.port,
          );
        }
      }
    });
  }

  void stop() {
    _socket?.close();
    _socket = null;
  }
}
