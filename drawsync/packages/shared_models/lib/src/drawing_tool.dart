/// The type of drawing tool.
enum ToolType {
  pen,
  marker,
  highlighter,
  eraser;

  static ToolType fromJson(String value) {
    return ToolType.values.firstWhere(
      (e) => e.name == value,
      orElse: () => throw ArgumentError('Unknown ToolType: $value'),
    );
  }
}

/// Configuration for a drawing tool.
class DrawingTool {
  const DrawingTool({
    required this.type,
    required this.color,
    required this.width,
  });

  factory DrawingTool.fromJson(Map<String, dynamic> json) {
    return DrawingTool(
      type: ToolType.fromJson(json['type'] as String),
      color: json['color'] as int,
      width: (json['width'] as num).toDouble(),
    );
  }

  final ToolType type;

  /// ARGB color value as an integer.
  final int color;
  final double width;

  Map<String, dynamic> toJson() {
    return {
      'type': type.name,
      'color': color,
      'width': width,
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DrawingTool &&
          runtimeType == other.runtimeType &&
          type == other.type &&
          color == other.color &&
          width == other.width;

  @override
  int get hashCode => Object.hash(type, color, width);

  @override
  String toString() =>
      'DrawingTool(type: ${type.name}, color: $color, width: $width)';
}
