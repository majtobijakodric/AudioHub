import 'package:uuid/uuid.dart';

import 'drawing_tool.dart';
import 'stroke_point.dart';

const _uuid = Uuid();

/// A complete drawing stroke composed of points drawn with a specific tool.
class Stroke {
  Stroke({
    String? id,
    required this.tool,
    List<StrokePoint>? points,
    required this.startTime,
    this.endTime,
  })  : id = id ?? _uuid.v4(),
        points = List<StrokePoint>.unmodifiable(points ?? const []);

  factory Stroke.fromJson(Map<String, dynamic> json) {
    return Stroke(
      id: json['id'] as String,
      tool: DrawingTool.fromJson(json['tool'] as Map<String, dynamic>),
      points: (json['points'] as List<dynamic>)
          .map((p) => StrokePoint.fromJson(p as Map<String, dynamic>))
          .toList(),
      startTime: json['startTime'] as int,
      endTime: json['endTime'] as int?,
    );
  }

  final String id;
  final DrawingTool tool;
  final List<StrokePoint> points;
  final int startTime;
  final int? endTime;

  /// Returns a new [Stroke] with the given [point] appended.
  Stroke addPoint(StrokePoint point) {
    return Stroke(
      id: id,
      tool: tool,
      points: [...points, point],
      startTime: startTime,
      endTime: endTime,
    );
  }

  /// Returns a new [Stroke] with [endTime] set.
  Stroke finish(int endTimestamp) {
    return Stroke(
      id: id,
      tool: tool,
      points: points,
      startTime: startTime,
      endTime: endTimestamp,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tool': tool.toJson(),
      'points': points.map((p) => p.toJson()).toList(),
      'startTime': startTime,
      if (endTime != null) 'endTime': endTime,
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Stroke &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'Stroke(id: $id, tool: $tool, points: ${points.length}, '
      'startTime: $startTime, endTime: $endTime)';
}
