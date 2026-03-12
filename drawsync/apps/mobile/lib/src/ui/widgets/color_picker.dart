import 'package:flutter/material.dart';

class ColorPicker extends StatelessWidget {
  final int selectedColor;
  final ValueChanged<int> onColorSelected;

  static const colors = [
    0xFF000000, // Black
    0xFFE53935, // Red
    0xFF1E88E5, // Blue
    0xFF43A047, // Green
    0xFFFB8C00, // Orange
    0xFF8E24AA, // Purple
  ];

  const ColorPicker({
    super.key,
    required this.selectedColor,
    required this.onColorSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: colors.map((color) {
        final isSelected = color == selectedColor;
        return GestureDetector(
          onTap: () => onColorSelected(color),
          child: Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              color: Color(color),
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected ? Colors.white : Colors.transparent,
                width: 3,
              ),
              boxShadow: isSelected
                  ? [BoxShadow(color: Color(color).withAlpha(128), blurRadius: 6)]
                  : null,
            ),
          ),
        );
      }).toList(),
    );
  }
}
