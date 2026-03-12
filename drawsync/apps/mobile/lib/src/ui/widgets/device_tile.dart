import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';

class DeviceTile extends StatelessWidget {
  final Device device;
  final VoidCallback? onTap;

  const DeviceTile({super.key, required this.device, this.onTap});

  @override
  Widget build(BuildContext context) {
    final isOnline = device.status == DeviceStatus.online;

    return ListTile(
      leading: Icon(
        Icons.desktop_windows,
        color: isOnline ? Colors.green : Colors.grey,
        size: 32,
      ),
      title: Text(
        device.name,
        style: const TextStyle(fontWeight: FontWeight.w600),
      ),
      subtitle: Text(device.address),
      trailing: Container(
        width: 12,
        height: 12,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isOnline ? Colors.green : Colors.grey.shade400,
        ),
      ),
      onTap: isOnline ? onTap : null,
    );
  }
}
