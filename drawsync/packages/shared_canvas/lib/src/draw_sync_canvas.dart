import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';

import 'draw_sync_painter.dart';

/// A stateless widget that renders all strokes from a [CanvasState].
class DrawSyncCanvas extends StatelessWidget {
  const DrawSyncCanvas({
    super.key,
    required this.canvasState,
    this.backgroundColor = Colors.white,
  });

  final CanvasState canvasState;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: CustomPaint(
        painter: DrawSyncPainter(
          canvasState: canvasState,
          backgroundColor: backgroundColor,
        ),
        size: Size.infinite,
      ),
    );
  }
}
