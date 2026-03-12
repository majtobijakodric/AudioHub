import 'package:flutter/material.dart';

import '../../network/discovery_client.dart';
import '../../network/websocket_client.dart';
import '../../state/connection_state.dart' as app_state;
import '../../state/device_list_state.dart';
import '../../state/drawing_state.dart';
import '../widgets/device_tile.dart';
import 'drawing_screen.dart';

class DeviceListScreen extends StatefulWidget {
  const DeviceListScreen({super.key});

  @override
  State<DeviceListScreen> createState() => _DeviceListScreenState();
}

class _DeviceListScreenState extends State<DeviceListScreen> {
  late final DiscoveryClient _discoveryClient;
  late final DeviceListState _deviceListState;

  @override
  void initState() {
    super.initState();
    _discoveryClient = DiscoveryClient();
    _deviceListState = DeviceListState(_discoveryClient);
    _deviceListState.addListener(_onStateChange);
    _deviceListState.scan();
  }

  void _onStateChange() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _deviceListState.removeListener(_onStateChange);
    _deviceListState.dispose();
    super.dispose();
  }

  Future<void> _onDeviceTap(device) async {
    final client = WebSocketClient();
    final connectionState = app_state.ConnectionState(client);
    final drawingState = DrawingState(client);

    final connected = await connectionState.connect(device);
    if (!connected) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to connect')),
        );
      }
      connectionState.dispose();
      return;
    }

    if (mounted) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => DrawingScreen(
            connectionState: connectionState,
            drawingState: drawingState,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('DrawSync'),
        actions: [
          if (_deviceListState.isScanning)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _deviceListState.scan,
            ),
        ],
      ),
      body: _deviceListState.devices.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.devices, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  Text(
                    _deviceListState.isScanning
                        ? 'Scanning for devices...'
                        : 'No devices found',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  if (!_deviceListState.isScanning) ...[
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: _deviceListState.scan,
                      child: const Text('Tap to scan'),
                    ),
                  ],
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _deviceListState.scan,
              child: ListView.separated(
                itemCount: _deviceListState.devices.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final device = _deviceListState.devices[index];
                  return DeviceTile(
                    device: device,
                    onTap: () => _onDeviceTap(device),
                  );
                },
              ),
            ),
    );
  }
}
