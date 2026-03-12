import 'package:flutter/material.dart';

class StrokeWidthPicker extends StatelessWidget {
  final double selectedWidth;
  final ValueChanged<double> onWidthSelected;

  static const widths = [2.0, 5.0, 10.0];

  const StrokeWidthPicker({
    super.key,
    required this.selectedWidth,
    required this.onWidthSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: widths.map((width) {
        final isSelected = width == selectedWidth;
        return GestureDetector(
          onTap: () => onWidthSelected(width),
          child: Container(
            width: 36,
            height: 36,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isSelected
                  ? Colors.blue.withAlpha(51)
                  : Colors.transparent,
              border: Border.all(
                color: isSelected ? Colors.blue : Colors.grey,
                width: 1.5,
              ),
            ),
            child: Center(
              child: Container(
                width: width * 2,
                height: width * 2,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.black87,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
