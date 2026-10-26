import 'package:equatable/equatable.dart';

enum GoalCategory { selfCare, mindfulness, body, social, general }

class GoalModel extends Equatable {
  final String id;
  final String title;
  final GoalCategory category;
  final int energyReward;
  final int stoneReward;
  final bool isCompleted;
  final String icon;

  const GoalModel({
    required this.id,
    required this.title,
    this.category = GoalCategory.selfCare,
    this.energyReward = 5,
    this.stoneReward = 20,
    this.isCompleted = false,
    this.icon = 'badge-checkmark.svg',
  });

  GoalModel copyWith({
    String? id,
    String? title,
    GoalCategory? category,
    int? energyReward,
    int? stoneReward,
    bool? isCompleted,
    String? icon,
  }) {
    return GoalModel(
      id: id ?? this.id,
      title: title ?? this.title,
      category: category ?? this.category,
      energyReward: energyReward ?? this.energyReward,
      stoneReward: stoneReward ?? this.stoneReward,
      isCompleted: isCompleted ?? this.isCompleted,
      icon: icon ?? this.icon,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'category': category.name,
    'energyReward': energyReward,
    'stoneReward': stoneReward,
    'isCompleted': isCompleted,
    'icon': icon,
  };

  factory GoalModel.fromJson(Map<String, dynamic> json) => GoalModel(
    id: json['id'] as String,
    title: json['title'] as String,
    category: GoalCategory.values.byName(json['category'] as String? ?? 'selfCare'),
    energyReward: json['energyReward'] as int? ?? 5,
    stoneReward: json['stoneReward'] as int? ?? 20,
    isCompleted: json['isCompleted'] as bool? ?? false,
    icon: json['icon'] as String? ?? 'badge-checkmark.svg',
  );

  @override
  List<Object?> get props => [id, title, category, energyReward, stoneReward, isCompleted, icon];
}
