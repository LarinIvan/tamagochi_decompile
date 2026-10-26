import 'package:equatable/equatable.dart';

class BirdhouseArrangement extends Equatable {
  final String wallpaper;
  final String floor;
  final String window;
  final String door;
  final String bed;
  final String lamp;
  final String rug;
  final String clock;
  final bool isLightOn;

  const BirdhouseArrangement({
    this.wallpaper = 'woodsy-wall.svg',
    this.floor = 'woodsy-doormat.svg',
    this.window = 'woodsy-window.svg',
    this.door = 'woodsy-door.svg',
    this.bed = 'woodsy-bed.svg',
    this.lamp = 'woodsy-lamp.svg',
    this.rug = 'woodsy-rug.svg',
    this.clock = 'woodsy-clock.svg',
    this.isLightOn = true,
  });

  BirdhouseArrangement copyWith({
    String? wallpaper,
    String? floor,
    String? window,
    String? door,
    String? bed,
    String? lamp,
    String? rug,
    String? clock,
    bool? isLightOn,
  }) {
    return BirdhouseArrangement(
      wallpaper: wallpaper ?? this.wallpaper,
      floor: floor ?? this.floor,
      window: window ?? this.window,
      door: door ?? this.door,
      bed: bed ?? this.bed,
      lamp: lamp ?? this.lamp,
      rug: rug ?? this.rug,
      clock: clock ?? this.clock,
      isLightOn: isLightOn ?? this.isLightOn,
    );
  }

  Map<String, dynamic> toJson() => {
    'wallpaper': wallpaper,
    'floor': floor,
    'window': window,
    'door': door,
    'bed': bed,
    'lamp': lamp,
    'rug': rug,
    'clock': clock,
    'isLightOn': isLightOn,
  };

  factory BirdhouseArrangement.fromJson(Map<String, dynamic> json) => BirdhouseArrangement(
    wallpaper: json['wallpaper'] as String? ?? 'woodsy-wall.svg',
    floor: json['floor'] as String? ?? 'woodsy-doormat.svg',
    window: json['window'] as String? ?? 'woodsy-window.svg',
    door: json['door'] as String? ?? 'woodsy-door.svg',
    bed: json['bed'] as String? ?? 'woodsy-bed.svg',
    lamp: json['lamp'] as String? ?? 'woodsy-lamp.svg',
    rug: json['rug'] as String? ?? 'woodsy-rug.svg',
    clock: json['clock'] as String? ?? 'woodsy-clock.svg',
    isLightOn: json['isLightOn'] as bool? ?? true,
  );

  @override
  List<Object?> get props => [wallpaper, floor, window, door, bed, lamp, rug, clock, isLightOn];
}
