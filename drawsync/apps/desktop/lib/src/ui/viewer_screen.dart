import 'package:flutter/material.dart';
import 'package:shared_canvas/shared_canvas.dart';

import '../state/canvas_state_notifier.dart';
import '../state/connection_state.dart';

/// Main viewer screen showing connection status and the drawing canvas.
class ViewerScreen extends StatelessWidget {
  final DrawSyncConnectionState connectionState;
  final CanvasStateNotifier canvasStateNotifier;

  const ViewerScreen({
    super.key,
    required this.connectionState,
    required this.canvasStateNotifier,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          ListenableBuilder(
            listenable: connectionState,
            builder: (context, _) => _StatusBar(
              connectionState: connectionState,
            ),
          ),
          Expanded(
            child: ListenableBuilder(
              listenable: canvasStateNotifier,
              builder: (context, _) => DrawSyncCanvas(
                canvasState: canvasStateNotifier.canvasState,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBar extends StatelessWidget {
  final DrawSyncConnectionState connectionState;

  const _StatusBar({required this.connectionState});

  @override
  Widget build(BuildContext context) {
    final isConnected = connectionState.isConnected;
    final device = connectionState.connectedDevice;

    final String statusText;
    if (isConnected && device != null) {
      statusText = 'Connected: ${device.name}';
    } else if (connectionState.isListening) {
      statusText = 'Waiting for connection…';
    } else {
      statusText = 'Starting…';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: isConnected
          ? const Color(0x26009688)
          : const Color(0x1A9E9E9E),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isConnected ? Colors.greenAccent : Colors.grey,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            statusText,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}
