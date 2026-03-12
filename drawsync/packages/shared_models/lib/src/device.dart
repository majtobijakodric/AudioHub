/// Connection status of a discovered device.
enum DeviceStatus {
  online,
  offline;

  static DeviceStatus fromJson(String value) {
    return DeviceStatus.values.firstWhere(
      (e) => e.name == value,
      orElse: () => throw ArgumentError('Unknown DeviceStatus: $value'),
    );
  }
}

/// A discovered device on the network.
class Device {
  const Device({
    required this.id,
    required this.name,
    required this.address,
    required this.port,
    required this.status,
    this.lastSeen,
  });

  factory Device.fromJson(Map<String, dynamic> json) {
    return Device(
      id: json['id'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      port: json['port'] as int,
      status: DeviceStatus.fromJson(json['status'] as String),
      lastSeen: json['lastSeen'] as int?,
    );
  }

  final String id;
  final String name;

  /// IP address of the device.
  final String address;
  final int port;
  final DeviceStatus status;

  /// Milliseconds since epoch when the device was last seen.
  final int? lastSeen;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'port': port,
      'status': status.name,
      if (lastSeen != null) 'lastSeen': lastSeen,
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Device &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'Device(id: $id, name: $name, address: $address, '
      'port: $port, status: ${status.name}, lastSeen: $lastSeen)';
}
