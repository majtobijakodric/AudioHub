import 'drawing_tool.dart';
import 'stroke.dart';
import 'stroke_point.dart';

/// The current state of the drawing canvas.
class CanvasState {
  CanvasState({
    List<Stroke>? strokes,
    this.activeStroke,
  }) : strokes = List<Stroke>.unmodifiable(strokes ?? const []);

  factory CanvasState.fromJson(Map<String, dynamic> json) {
    return CanvasState(
      strokes: (json['strokes'] as List<dynamic>)
          .map((s) => Stroke.fromJson(s as Map<String, dynamic>))
          .toList(),
      activeStroke: json['activeStroke'] != null
          ? Stroke.fromJson(json['activeStroke'] as Map<String, dynamic>)
          : null,
    );
  }

  final List<Stroke> strokes;
  final Stroke? activeStroke;

  /// Returns a new [CanvasState] with the given [stroke] added to completed
  /// strokes.
  CanvasState addStroke(Stroke stroke) {
    return CanvasState(
      strokes: [...strokes, stroke],
      activeStroke: activeStroke,
    );
  }

  /// Returns a new [CanvasState] with the given [point] appended to the
  /// active stroke.
  CanvasState addPointToActive(StrokePoint point) {
    if (activeStroke == null) {
      throw StateError('No active stroke to add a point to');
    }
    return CanvasState(
      strokes: strokes,
      activeStroke: activeStroke!.addPoint(point),
    );
  }

  /// Returns a new [CanvasState] with a new active stroke started using the
  /// given [tool] and initial [point].
  CanvasState startStroke(DrawingTool tool, StrokePoint point) {
    // If there is an existing active stroke, finish and archive it first.
    final updatedStrokes = activeStroke != null
        ? [...strokes, activeStroke!.finish(point.timestamp)]
        : List<Stroke>.of(strokes);

    return CanvasState(
      strokes: updatedStrokes,
      activeStroke: Stroke(
        tool: tool,
        points: [point],
        startTime: point.timestamp,
      ),
    );
  }

  /// Returns a new [CanvasState] where the active stroke is completed and
  /// moved to [strokes].
  CanvasState endStroke() {
    if (activeStroke == null) {
      return this;
    }
    final finished = activeStroke!.finish(
      activeStroke!.points.isNotEmpty
          ? activeStroke!.points.last.timestamp
          : activeStroke!.startTime,
    );
    return CanvasState(
      strokes: [...strokes, finished],
    );
  }

  /// Returns a new [CanvasState] with all strokes cleared.
  CanvasState clear() {
    return CanvasState();
  }

  Map<String, dynamic> toJson() {
    return {
      'strokes': strokes.map((s) => s.toJson()).toList(),
      if (activeStroke != null) 'activeStroke': activeStroke!.toJson(),
    };
  }

  @override
  String toString() =>
      'CanvasState(strokes: ${strokes.length}, '
      'activeStroke: ${activeStroke != null ? "yes" : "none"})';
}
