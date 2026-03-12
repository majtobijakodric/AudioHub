import 'dart:convert';

import 'message_type.dart';

class ProtocolMessage {
  ProtocolMessage({
    required this.type,
    this.id,
    required this.timestamp,
    this.payload,
  });

  factory ProtocolMessage.hello({
    required String deviceId,
    required String deviceName,
    String protocolVersion = '1.0',
  }) {
    return ProtocolMessage(
      type: MessageType.hello,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: {
        'deviceId': deviceId,
        'deviceName': deviceName,
        'protocolVersion': protocolVersion,
      },
    );
  }

  factory ProtocolMessage.heartbeat() {
    return ProtocolMessage(
      type: MessageType.heartbeat,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );
  }

  factory ProtocolMessage.deviceStatus({
    required String deviceId,
    required String status,
  }) {
    return ProtocolMessage(
      type: MessageType.deviceStatus,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: {
        'deviceId': deviceId,
        'status': status,
      },
    );
  }

  factory ProtocolMessage.connectRequest({
    required String deviceId,
    required String deviceName,
  }) {
    return ProtocolMessage(
      type: MessageType.connectRequest,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: {
        'deviceId': deviceId,
        'deviceName': deviceName,
      },
    );
  }

  factory ProtocolMessage.connectAccept({
    required String sessionId,
  }) {
    return ProtocolMessage(
      type: MessageType.connectAccept,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: {
        'sessionId': sessionId,
      },
    );
  }

  factory ProtocolMessage.connectReject({String? reason}) {
    return ProtocolMessage(
      type: MessageType.connectReject,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: reason != null ? {'reason': reason} : null,
    );
  }

  factory ProtocolMessage.strokeStart({
    required String strokeId,
    required int color,
    required double width,
    required String toolType,
    required double x,
    required double y,
    required int pointTimestamp,
  }) {
    return ProtocolMessage(
      type: MessageType.strokeStart,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: {
        'strokeId': strokeId,
        'color': color,
        'width': width,
        'toolType': toolType,
        'x': x,
        'y': y,
        'pointTimestamp': pointTimestamp,
      },
    );
  }

  factory ProtocolMessage.strokeUpdate({
    required String strokeId,
    required List<Map<String, dynamic>> points,
  }) {
    return ProtocolMessage(
      type: MessageType.strokeUpdate,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: {
        'strokeId': strokeId,
        'points': points,
      },
    );
  }

  factory ProtocolMessage.strokeEnd({
    required String strokeId,
  }) {
    return ProtocolMessage(
      type: MessageType.strokeEnd,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: {
        'strokeId': strokeId,
      },
    );
  }

  factory ProtocolMessage.clearCanvas() {
    return ProtocolMessage(
      type: MessageType.clearCanvas,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );
  }

  factory ProtocolMessage.disconnect({String? reason}) {
    return ProtocolMessage(
      type: MessageType.disconnect,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: reason != null ? {'reason': reason} : null,
    );
  }

  factory ProtocolMessage.error({
    required String message,
    String? code,
  }) {
    return ProtocolMessage(
      type: MessageType.error,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      payload: {
        'message': message,
        if (code != null) 'code': code,
      },
    );
  }

  factory ProtocolMessage.fromJson(Map<String, dynamic> json) {
    return ProtocolMessage(
      type: MessageType.fromString(json['type'] as String),
      id: json['id'] as String?,
      timestamp: json['timestamp'] as int,
      payload: json['payload'] != null
          ? Map<String, dynamic>.from(json['payload'] as Map)
          : null,
    );
  }

  final MessageType type;
  final String? id;
  final int timestamp;
  final Map<String, dynamic>? payload;

  Map<String, dynamic> toJson() {
    return {
      'type': type.name,
      if (id != null) 'id': id,
      'timestamp': timestamp,
      if (payload != null) 'payload': payload,
    };
  }

  String toJsonString() => jsonEncode(toJson());

  static ProtocolMessage parse(String raw) {
    final json = jsonDecode(raw) as Map<String, dynamic>;
    return ProtocolMessage.fromJson(json);
  }

  @override
  String toString() =>
      'ProtocolMessage(type: ${type.name}, id: $id, timestamp: $timestamp)';
}
