import 'dart:async';
import 'dart:io';

import 'package:shared_models/shared_models.dart';
import 'package:shared_protocol/shared_protocol.dart';

import '../state/canvas_state_notifier.dart';
import '../state/connection_state.dart';

/// WebSocket server that accepts incoming connections from mobile drawing apps.
class WebSocketServer {
  final DrawSyncConnectionState connectionState;
  final CanvasStateNotifier canvasStateNotifier;

  HttpServer? _server;
  WebSocket? _client;
  Timer? _heartbeatTimer;

  WebSocketServer({
    required this.connectionState,
    required this.canvasStateNotifier,
  });

  Future<void> start() async {
    _server = await HttpServer.bind(
      InternetAddress.anyIPv4,
      ProtocolConstants.defaultPort,
    );
    connectionState.startListening();

    _server!.listen(_handleHttpRequest);
  }

  Future<void> _handleHttpRequest(HttpRequest request) async {
    if (!WebSocketTransformer.isUpgradeRequest(request)) {
      request.response
        ..statusCode = HttpStatus.forbidden
        ..write('WebSocket connections only')
        ..close();
      return;
    }

    // Only allow one connection at a time
    if (_client != null) {
      request.response
        ..statusCode = HttpStatus.serviceUnavailable
        ..write('Already connected')
        ..close();
      return;
    }

    final socket = await WebSocketTransformer.upgrade(request);
    _client = socket;

    socket.listen(
      (data) => _handleMessage(data as String, request),
      onDone: () => _handleDisconnect(),
      onError: (_) => _handleDisconnect(),
    );
  }

  void _handleMessage(String raw, HttpRequest request) {
    final message = ProtocolMessage.parse(raw);

    switch (message.type) {
      case MessageType.hello:
        final accept = ProtocolMessage.connectAccept(
          sessionId: DateTime.now().millisecondsSinceEpoch.toString(),
        );
        _client?.add(accept.toJsonString());
        _startHeartbeat();

      case MessageType.connectRequest:
        final payload = message.payload;
        final deviceId = payload?['deviceId'] as String? ?? 'unknown';
        final deviceName = payload?['deviceName'] as String? ?? 'Unknown';
        final address = request.connectionInfo?.remoteAddress.address ?? '';

        final device = Device(
          id: deviceId,
          name: deviceName,
          address: address,
          port: ProtocolConstants.defaultPort,
          status: DeviceStatus.online,
          lastSeen: DateTime.now().millisecondsSinceEpoch,
        );

        connectionState.onDeviceConnected(device);

        final accept = ProtocolMessage.connectAccept(
          sessionId: DateTime.now().millisecondsSinceEpoch.toString(),
        );
        _client?.add(accept.toJsonString());
        _startHeartbeat();

      case MessageType.strokeStart:
        _handleStrokeStart(message);

      case MessageType.strokeUpdate:
        _handleStrokeUpdate(message);

      case MessageType.strokeEnd:
        canvasStateNotifier.onStrokeEnd();

      case MessageType.clearCanvas:
        canvasStateNotifier.onClearCanvas();

      case MessageType.disconnect:
        _handleDisconnect();

      case MessageType.heartbeat:
        break;

      default:
        break;
    }
  }

  void _handleStrokeStart(ProtocolMessage message) {
    final payload = message.payload;
    if (payload == null) return;

    final color = payload['color'] as int? ?? 0xFF000000;
    final width = (payload['width'] as num?)?.toDouble() ?? 2.0;
    final toolType = payload['toolType'] as String? ?? 'pen';
    final x = (payload['x'] as num?)?.toDouble() ?? 0;
    final y = (payload['y'] as num?)?.toDouble() ?? 0;
    final pointTimestamp =
        payload['pointTimestamp'] as int? ??
        DateTime.now().millisecondsSinceEpoch;

    final tool = DrawingTool(
      type: ToolType.fromJson(toolType),
      color: color,
      width: width,
    );

    final point = StrokePoint(x: x, y: y, timestamp: pointTimestamp);
    canvasStateNotifier.onStrokeStart(tool, point);
  }

  void _handleStrokeUpdate(ProtocolMessage message) {
    final payload = message.payload;
    if (payload == null) return;

    final pointsData = payload['points'] as List<dynamic>?;
    if (pointsData == null) return;

    for (final raw in pointsData) {
      final p = raw as Map<String, dynamic>;
      final point = StrokePoint(
        x: (p['x'] as num).toDouble(),
        y: (p['y'] as num).toDouble(),
        timestamp:
            p['timestamp'] as int? ?? DateTime.now().millisecondsSinceEpoch,
        pressure: (p['pressure'] as num?)?.toDouble(),
      );
      canvasStateNotifier.onStrokeUpdate(point);
    }
  }

  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(
      ProtocolConstants.heartbeatInterval,
      (_) {
        if (_client != null) {
          _client!.add(ProtocolMessage.heartbeat().toJsonString());
        }
      },
    );
  }

  void _handleDisconnect() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;
    _client?.close();
    _client = null;
    connectionState.onDeviceDisconnected();
  }

  Future<void> stop() async {
    _handleDisconnect();
    await _server?.close(force: true);
    _server = null;
  }
}
