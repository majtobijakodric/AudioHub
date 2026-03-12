/// A single point within a drawing stroke.
class StrokePoint {
  const StrokePoint({
    required this.x,
    required this.y,
    required this.timestamp,
    this.pressure,
  });

  factory StrokePoint.fromJson(Map<String, dynamic> json) {
    return StrokePoint(
      x: (json['x'] as num).toDouble(),
      y: (json['y'] as num).toDouble(),
      timestamp: json['timestamp'] as int,
      pressure: (json['pressure'] as num?)?.toDouble(),
    );
  }

  final double x;
  final double y;
  final int timestamp;
  final double? pressure;

  Map<String, dynamic> toJson() {
    return {
      'x': x,
      'y': y,
      'timestamp': timestamp,
      if (pressure != null) 'pressure': pressure,
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is StrokePoint &&
          runtimeType == other.runtimeType &&
          x == other.x &&
          y == other.y &&
          timestamp == other.timestamp &&
          pressure == other.pressure;

  @override
  int get hashCode => Object.hash(x, y, timestamp, pressure);

  @override
  String toString() =>
      'StrokePoint(x: $x, y: $y, timestamp: $timestamp, pressure: $pressure)';
}
