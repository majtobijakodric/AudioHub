import 'dart:async';
import 'dart:io';

import 'package:shared_models/shared_models.dart';
import 'package:shared_protocol/shared_protocol.dart';

class DiscoveryClient {
  RawDatagramSocket? _socket;
  bool _scanning = false;

  bool get isScanning => _scanning;

  Future<List<Device>> scan({Duration timeout = const Duration(seconds: 3)}) async {
    _scanning = true;
    final devices = <String, Device>{};

    try {
      _socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
      _socket!.broadcastEnabled = true;

      final completer = Completer<List<Device>>();

      _socket!.listen((event) {
        if (event == RawSocketEvent.read) {
          final datagram = _socket!.receive();
          if (datagram == null) return;

          final response = String.fromCharCodes(datagram.data);
          if (response.startsWith(ProtocolConstants.discoveryResponse)) {
            final parts = response.split(':');
            if (parts.length >= 3) {
              final port = int.tryParse(parts[1]) ?? ProtocolConstants.defaultPort;
              final name = parts.sublist(2).join(':');
              final address = datagram.address.address;
              final key = '$address:$port';

              devices[key] = Device(
                id: key,
                name: name,
                address: address,
                port: port,
                status: DeviceStatus.online,
                lastSeen: DateTime.now().millisecondsSinceEpoch,
              );
            }
          }
        }
      });

      // Send broadcast
      final message = ProtocolConstants.discoveryMessage;
      _socket!.send(
        message.codeUnits,
        InternetAddress('255.255.255.255'),
        ProtocolConstants.discoveryPort,
      );

      Timer(timeout, () {
        if (!completer.isCompleted) {
          completer.complete(devices.values.toList());
        }
      });

      final result = await completer.future;
      stopScan();
      return result;
    } catch (e) {
      stopScan();
      return [];
    }
  }

  void stopScan() {
    _scanning = false;
    _socket?.close();
    _socket = null;
  }
}
