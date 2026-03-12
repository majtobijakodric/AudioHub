import 'package:flutter/material.dart';

import 'viewer_screen.dart';
import '../state/canvas_state_notifier.dart';
import '../state/connection_state.dart';

/// Root MaterialApp with dark/clean theme.
class DrawSyncApp extends StatelessWidget {
  final DrawSyncConnectionState connectionState;
  final CanvasStateNotifier canvasStateNotifier;

  const DrawSyncApp({
    super.key,
    required this.connectionState,
    required this.canvasStateNotifier,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DrawSync Viewer',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorSchemeSeed: const Color(0xFF009688),
        useMaterial3: true,
      ),
      home: ViewerScreen(
        connectionState: connectionState,
        canvasStateNotifier: canvasStateNotifier,
      ),
    );
  }
}
