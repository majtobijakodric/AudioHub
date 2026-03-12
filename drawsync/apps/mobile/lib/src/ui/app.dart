import 'package:flutter/material.dart';

import 'screens/device_list_screen.dart';

class DrawSyncApp extends StatelessWidget {
  const DrawSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DrawSync',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: Colors.blue,
        brightness: Brightness.light,
        useMaterial3: true,
        appBarTheme: const AppBarTheme(centerTitle: true),
      ),
      home: const DeviceListScreen(),
    );
  }
}
