import 'package:flutter/foundation.dart';
import 'package:shared_models/shared_models.dart';

/// Wraps [CanvasState] and notifies listeners on changes.
class CanvasStateNotifier extends ChangeNotifier {
  CanvasState _canvasState = CanvasState();

  CanvasState get canvasState => _canvasState;

  void onStrokeStart(DrawingTool tool, StrokePoint point) {
    _canvasState = _canvasState.startStroke(tool, point);
    notifyListeners();
  }

  void onStrokeUpdate(StrokePoint point) {
    if (_canvasState.activeStroke == null) return;
    _canvasState = _canvasState.addPointToActive(point);
    notifyListeners();
  }

  void onStrokeEnd() {
    if (_canvasState.activeStroke == null) return;
    _canvasState = _canvasState.endStroke();
    notifyListeners();
  }

  void onClearCanvas() {
    _canvasState = _canvasState.clear();
    notifyListeners();
  }
}
