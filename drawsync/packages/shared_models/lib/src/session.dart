import 'device.dart';

/// State of a drawing session.
enum SessionState {
  idle,
  connecting,
  connected,
  disconnected,
  error;

  static SessionState fromJson(String value) {
    return SessionState.values.firstWhere(
      (e) => e.name == value,
      orElse: () => throw ArgumentError('Unknown SessionState: $value'),
    );
  }
}

/// An active drawing session with a remote device.
class Session {
  const Session({
    required this.id,
    required this.device,
    required this.state,
    required this.startTime,
  });

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      id: json['id'] as String,
      device: Device.fromJson(json['device'] as Map<String, dynamic>),
      state: SessionState.fromJson(json['state'] as String),
      startTime: json['startTime'] as int,
    );
  }

  final String id;
  final Device device;
  final SessionState state;
  final int startTime;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'device': device.toJson(),
      'state': state.name,
      'startTime': startTime,
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Session &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'Session(id: $id, device: $device, state: ${state.name}, '
      'startTime: $startTime)';
}
