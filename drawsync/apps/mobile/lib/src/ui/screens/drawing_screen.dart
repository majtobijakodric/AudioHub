import 'package:flutter/material.dart';
import 'package:shared_canvas/shared_canvas.dart';

import '../../state/connection_state.dart' as app_state;
import '../../state/drawing_state.dart';
import '../widgets/color_picker.dart';
import '../widgets/stroke_width_picker.dart';

class DrawingScreen extends StatefulWidget {
  final app_state.ConnectionState connectionState;
  final DrawingState drawingState;

  const DrawingScreen({
    super.key,
    required this.connectionState,
    required this.drawingState,
  });

  @override
  State<DrawingScreen> createState() => _DrawingScreenState();
}

class _DrawingScreenState extends State<DrawingScreen> {
  @override
  void initState() {
    super.initState();
    widget.drawingState.addListener(_onStateChange);
    widget.connectionState.addListener(_onConnectionChange);
  }

  void _onStateChange() {
    if (mounted) setState(() {});
  }

  void _onConnectionChange() {
    if (!widget.connectionState.isConnected && mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Disconnected')),
      );
    }
  }

  @override
  void dispose() {
    widget.drawingState.removeListener(_onStateChange);
    widget.connectionState.removeListener(_onConnectionChange);
    widget.connectionState.disconnect();
    widget.connectionState.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final drawing = widget.drawingState;
    final deviceName = widget.connectionState.connectedDevice?.name ?? 'Device';

    return Scaffold(
      appBar: AppBar(
        title: Text(deviceName),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: drawing.clearCanvas,
            tooltip: 'Clear canvas',
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: TouchDrawingCanvas(
              canvasState: drawing.canvasState,
              onStrokeStart: drawing.startStroke,
              onStrokeUpdate: drawing.updateStroke,
              onStrokeEnd: drawing.endStroke,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(26),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: ColorPicker(
                      selectedColor: drawing.currentTool.color,
                      onColorSelected: drawing.setColor,
                    ),
                  ),
                  const SizedBox(width: 16),
                  StrokeWidthPicker(
                    selectedWidth: drawing.currentTool.width,
                    onWidthSelected: drawing.setWidth,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
