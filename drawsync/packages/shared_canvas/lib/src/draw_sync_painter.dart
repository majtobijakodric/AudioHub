import 'dart:ui' show BlendMode, Canvas, Paint, PaintingStyle, Path, StrokeCap, StrokeJoin;

import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';

/// Custom painter that renders all strokes from a [CanvasState].
class DrawSyncPainter extends CustomPainter {
  DrawSyncPainter({
    required this.canvasState,
    this.backgroundColor = Colors.white,
  });

  final CanvasState canvasState;
  final Color backgroundColor;

  @override
  void paint(Canvas canvas, Size size) {
    for (final stroke in canvasState.strokes) {
      _drawStroke(canvas, stroke);
    }
    if (canvasState.activeStroke != null) {
      _drawStroke(canvas, canvasState.activeStroke!);
    }
  }

  void _drawStroke(Canvas canvas, Stroke stroke) {
    if (stroke.points.length < 2) {
      if (stroke.points.length == 1) {
        final point = stroke.points.first;
        final paint = _buildPaint(stroke.tool);
        canvas.drawCircle(
          Offset(point.x, point.y),
          paint.strokeWidth / 2,
          paint,
        );
      }
      return;
    }

    final paint = _buildPaint(stroke.tool);
    final path = Path();
    final points = stroke.points;

    path.moveTo(points[0].x, points[0].y);

    for (var i = 1; i < points.length; i++) {
      final prev = points[i - 1];
      final curr = points[i];
      final midX = (prev.x + curr.x) / 2;
      final midY = (prev.y + curr.y) / 2;
      path.quadraticBezierTo(prev.x, prev.y, midX, midY);
    }

    final last = points.last;
    path.lineTo(last.x, last.y);

    canvas.drawPath(path, paint);
  }

  Paint _buildPaint(DrawingTool tool) {
    final paint = Paint()
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke
      ..isAntiAlias = true;

    switch (tool.type) {
      case ToolType.pen:
        paint.color = Color(tool.color);
        paint.strokeWidth = tool.width;
      case ToolType.marker:
        paint.color = Color(tool.color);
        paint.strokeWidth = tool.width * 1.5;
      case ToolType.highlighter:
        final baseColor = Color(tool.color);
        paint.color = baseColor.withValues(alpha: 0.4);
        paint.strokeWidth = tool.width;
        paint.blendMode = BlendMode.srcOver;
      case ToolType.eraser:
        paint.color = backgroundColor;
        paint.strokeWidth = tool.width;
        paint.blendMode = BlendMode.srcOver;
    }

    return paint;
  }

  @override
  bool shouldRepaint(covariant DrawSyncPainter oldDelegate) {
    return oldDelegate.canvasState != canvasState ||
        oldDelegate.backgroundColor != backgroundColor;
  }
}
