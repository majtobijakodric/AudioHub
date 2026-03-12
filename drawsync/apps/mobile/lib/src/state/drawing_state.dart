import 'package:flutter/foundation.dart';
import 'package:shared_models/shared_models.dart';
import 'package:shared_protocol/shared_protocol.dart';
import 'package:uuid/uuid.dart';

import '../network/websocket_client.dart';

class DrawingState extends ChangeNotifier {
  final WebSocketClient _client;
  final _uuid = const Uuid();

  CanvasState _canvasState = CanvasState();
  DrawingTool _currentTool = const DrawingTool(
    type: ToolType.pen,
    color: 0xFF000000,
    width: 5.0,
  );
  String? _activeStrokeId;

  DrawingState(this._client);

  CanvasState get canvasState => _canvasState;
  DrawingTool get currentTool => _currentTool;

  void setTool(DrawingTool tool) {
    _currentTool = tool;
    notifyListeners();
  }

  void setColor(int color) {
    _currentTool = DrawingTool(
      type: _currentTool.type,
      color: color,
      width: _currentTool.width,
    );
    notifyListeners();
  }

  void setWidth(double width) {
    _currentTool = DrawingTool(
      type: _currentTool.type,
      color: _currentTool.color,
      width: width,
    );
    notifyListeners();
  }

  void startStroke(double x, double y) {
    _activeStrokeId = _uuid.v4();
    final now = DateTime.now().millisecondsSinceEpoch;
    final point = StrokePoint(x: x, y: y, timestamp: now);

    _canvasState = _canvasState.startStroke(_currentTool, point);
    notifyListeners();

    _client.sendMessage(ProtocolMessage.strokeStart(
      strokeId: _activeStrokeId!,
      color: _currentTool.color,
      width: _currentTool.width,
      toolType: _currentTool.type.name,
      x: x,
      y: y,
      pointTimestamp: now,
    ));
  }

  void updateStroke(double x, double y) {
    if (_activeStrokeId == null) return;

    final now = DateTime.now().millisecondsSinceEpoch;
    final point = StrokePoint(x: x, y: y, timestamp: now);

    _canvasState = _canvasState.addPointToActive(point);
    notifyListeners();

    _client.sendMessage(ProtocolMessage.strokeUpdate(
      strokeId: _activeStrokeId!,
      points: [point.toJson()],
    ));
  }

  void endStroke() {
    if (_activeStrokeId == null) return;

    _canvasState = _canvasState.endStroke();
    notifyListeners();

    _client.sendMessage(ProtocolMessage.strokeEnd(
      strokeId: _activeStrokeId!,
    ));
    _activeStrokeId = null;
  }

  void clearCanvas() {
    _canvasState = _canvasState.clear();
    _activeStrokeId = null;
    notifyListeners();

    _client.sendMessage(ProtocolMessage.clearCanvas());
  }
}
