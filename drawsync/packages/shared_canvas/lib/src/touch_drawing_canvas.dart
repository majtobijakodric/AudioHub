import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';

import 'draw_sync_canvas.dart';

/// Wraps [DrawSyncCanvas] with gesture detection for touch/mouse input.
class TouchDrawingCanvas extends StatelessWidget {
  const TouchDrawingCanvas({
    super.key,
    required this.canvasState,
    this.backgroundColor = Colors.white,
    this.onStrokeStart,
    this.onStrokeUpdate,
    this.onStrokeEnd,
  });

  final CanvasState canvasState;
  final Color backgroundColor;
  final void Function(double x, double y)? onStrokeStart;
  final void Function(double x, double y)? onStrokeUpdate;
  final VoidCallback? onStrokeEnd;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: _handlePanStart,
      onPanUpdate: _handlePanUpdate,
      onPanEnd: _handlePanEnd,
      child: DrawSyncCanvas(
        canvasState: canvasState,
        backgroundColor: backgroundColor,
      ),
    );
  }

  void _handlePanStart(DragStartDetails details) {
    final local = details.localPosition;
    onStrokeStart?.call(local.dx, local.dy);
  }

  void _handlePanUpdate(DragUpdateDetails details) {
    final local = details.localPosition;
    onStrokeUpdate?.call(local.dx, local.dy);
  }

  void _handlePanEnd(DragEndDetails details) {
    onStrokeEnd?.call();
  }
}
