abstract final class ProtocolConstants {
  static const String protocolVersion = '1.0';
  static const Duration heartbeatInterval = Duration(seconds: 5);
  static const Duration connectionTimeout = Duration(seconds: 10);
  static const int defaultPort = 8765;
  static const int discoveryPort = 8766;
  static const String discoveryMessage = 'DRAWSYNC_DISCOVER';
  static const String discoveryResponse = 'DRAWSYNC_HERE';
}
