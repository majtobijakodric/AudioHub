import 'package:flutter/foundation.dart';
import 'package:shared_models/shared_models.dart';

import '../network/discovery_client.dart';

class DeviceListState extends ChangeNotifier {
  final DiscoveryClient _discoveryClient;
  List<Device> _devices = [];
  bool _isScanning = false;

  DeviceListState(this._discoveryClient);

  List<Device> get devices => _devices;
  bool get isScanning => _isScanning;

  Future<void> scan() async {
    _isScanning = true;
    notifyListeners();

    try {
      _devices = await _discoveryClient.scan();
    } catch (_) {
      _devices = [];
    }

    _isScanning = false;
    notifyListeners();
  }
}
