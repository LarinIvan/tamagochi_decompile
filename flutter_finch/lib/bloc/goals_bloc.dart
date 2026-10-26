import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../models/goal.dart';

abstract class GoalsEvent extends Equatable {
  const GoalsEvent();
  @override
  List<Object?> get props => [];
}

class GoalCompletedToggled extends GoalsEvent {
  final String goalId;
  const GoalCompletedToggled(this.goalId);
  @override
  List<Object?> get props => [goalId];
}

class GoalAdded extends GoalsEvent {
  final GoalModel goal;
  const GoalAdded(this.goal);
  @override
  List<Object?> get props => [goal];
}

class GoalsState extends Equatable {
  final List<GoalModel> goals;

  const GoalsState({this.goals = const []});

  int get completedCount => goals.where((g) => g.isCompleted).length;

  GoalsState copyWith({List<GoalModel>? goals}) {
    return GoalsState(goals: goals ?? this.goals);
  }

  @override
  List<Object?> get props => [goals];
}

class GoalsBloc extends Bloc<GoalsEvent, GoalsState> {
  GoalsBloc({List<GoalModel>? initialGoals})
      : super(GoalsState(
          goals: initialGoals ??
              const [
                GoalModel(
                  id: 'g-1',
                  title: 'Выпить стакан чистой воды',
                  category: GoalCategory.selfCare,
                  energyReward: 5,
                  stoneReward: 20,
                  icon: 'badge-checkmark.svg',
                ),
                GoalModel(
                  id: 'g-2',
                  title: 'Потянуться и размять шею',
                  category: GoalCategory.body,
                  energyReward: 5,
                  stoneReward: 20,
                  icon: 'badge-checkmark.svg',
                ),
                GoalModel(
                  id: 'g-3',
                  title: 'Осознанное дыхание 4-4-4',
                  category: GoalCategory.mindfulness,
                  energyReward: 10,
                  stoneReward: 35,
                  icon: 'badge-checkmark.svg',
                ),
                GoalModel(
                  id: 'g-4',
                  title: 'Сказать себе тёплые слова',
                  category: GoalCategory.selfCare,
                  energyReward: 5,
                  stoneReward: 20,
                  icon: 'badge-checkmark.svg',
                ),
                GoalModel(
                  id: 'g-5',
                  title: 'Проветрить комнату',
                  category: GoalCategory.general,
                  energyReward: 5,
                  stoneReward: 20,
                  icon: 'badge-checkmark.svg',
                ),
              ],
        )) {
    on<GoalCompletedToggled>((event, emit) {
      final updated = state.goals.map((g) {
        if (g.id == event.goalId) {
          return g.copyWith(isCompleted: !g.isCompleted);
        }
        return g;
      }).toList();
      emit(state.copyWith(goals: updated));
    });

    on<GoalAdded>((event, emit) {
      emit(state.copyWith(goals: [...state.goals, event.goal]));
    });
  }
}
