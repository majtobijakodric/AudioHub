enum MessageType {
  hello,
  heartbeat,
  deviceStatus,
  connectRequest,
  connectAccept,
  connectReject,
  strokeStart,
  strokeUpdate,
  strokeEnd,
  clearCanvas,
  disconnect,
  error;

  static MessageType fromString(String value) {
    return MessageType.values.firstWhere(
      (e) => e.name == value,
      orElse: () => throw ArgumentError('Unknown MessageType: $value'),
    );
  }
}
