import 'dart:io';

import 'package:flutter/material.dart';
import 'package:shared_protocol/shared_protocol.dart';

import 'src/network/discovery_service.dart';
import 'src/network/websocket_server.dart';
import 'src/state/canvas_state_notifier.dart';
import 'src/state/connection_state.dart';
import 'src/ui/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final connectionState = DrawSyncConnectionState();
  final canvasStateNotifier = CanvasStateNotifier();

  final deviceName = Platform.localHostname;

  final discoveryService = DiscoveryService(
    serverPort: ProtocolConstants.defaultPort,
    deviceName: deviceName,
  );

  final webSocketServer = WebSocketServer(
    connectionState: connectionState,
    canvasStateNotifier: canvasStateNotifier,
  );

  await discoveryService.start();
  await webSocketServer.start();

  runApp(DrawSyncApp(
    connectionState: connectionState,
    canvasStateNotifier: canvasStateNotifier,
  ));
}
