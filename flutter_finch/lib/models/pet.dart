import 'package:equatable/equatable.dart';

enum PetStage { baby, toddler, child, teen, adult }

class PetModel extends Equatable {
  final String id;
  final String name;
  final PetStage stage;
  final int energy;
  final int maxEnergy;
  final int rainbowStones;
  final int streakDays;
  final String colorTheme;
  final String activeAnimation;
  final bool isSleeping;
  final String? activeMicropet;
  final Map<String, int> personalityTraits;

  const PetModel({
    required this.id,
    required this.name,
    this.stage = PetStage.baby,
    this.energy = 35,
    this.maxEnergy = 100,
    this.rainbowStones = 250,
    this.streakDays = 1,
    this.colorTheme = 'Classic Grey',
    this.activeAnimation = 'Finch_Waiting_01.json',
    this.isSleeping = false,
    this.activeMicropet = 'CMP_Beaky_01.json',
    this.personalityTraits = const {
      'Curiosity': 15,
      'Compassion': 20,
      'Resilience': 10,
      'Logic': 12,
    },
  });

  PetModel copyWith({
    String? id,
    String? name,
    PetStage? stage,
    int? energy,
    int? maxEnergy,
    int? rainbowStones,
    int? streakDays,
    String? colorTheme,
    String? activeAnimation,
    bool? isSleeping,
    String? activeMicropet,
    Map<String, int>? personalityTraits,
  }) {
    return PetModel(
      id: id ?? this.id,
      name: name ?? this.name,
      stage: stage ?? this.stage,
      energy: energy ?? this.energy,
      maxEnergy: maxEnergy ?? this.maxEnergy,
      rainbowStones: rainbowStones ?? this.rainbowStones,
      streakDays: streakDays ?? this.streakDays,
      colorTheme: colorTheme ?? this.colorTheme,
      activeAnimation: activeAnimation ?? this.activeAnimation,
      isSleeping: isSleeping ?? this.isSleeping,
      activeMicropet: activeMicropet ?? this.activeMicropet,
      personalityTraits: personalityTraits ?? this.personalityTraits,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'stage': stage.name,
    'energy': energy,
    'maxEnergy': maxEnergy,
    'rainbowStones': rainbowStones,
    'streakDays': streakDays,
    'colorTheme': colorTheme,
    'activeAnimation': activeAnimation,
    'isSleeping': isSleeping,
    'activeMicropet': activeMicropet,
    'personalityTraits': personalityTraits,
  };

  factory PetModel.fromJson(Map<String, dynamic> json) => PetModel(
    id: json['id'] as String,
    name: json['name'] as String,
    stage: PetStage.values.byName(json['stage'] as String? ?? 'baby'),
    energy: json['energy'] as int? ?? 35,
    maxEnergy: json['maxEnergy'] as int? ?? 100,
    rainbowStones: json['rainbowStones'] as int? ?? 250,
    streakDays: json['streakDays'] as int? ?? 1,
    colorTheme: json['colorTheme'] as String? ?? 'Classic Grey',
    activeAnimation: json['activeAnimation'] as String? ?? 'Finch_Waiting_01.json',
    isSleeping: json['isSleeping'] as bool? ?? false,
    activeMicropet: json['activeMicropet'] as String?,
    personalityTraits: Map<String, int>.from(json['personalityTraits'] as Map? ?? {}),
  );

  @override
  List<Object?> get props => [
    id, name, stage, energy, maxEnergy, rainbowStones, streakDays, 
    colorTheme, activeAnimation, isSleeping, activeMicropet, personalityTraits
  ];
}
