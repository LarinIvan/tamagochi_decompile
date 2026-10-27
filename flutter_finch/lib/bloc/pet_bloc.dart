import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../models/pet.dart';
import '../models/birdhouse.dart';

abstract class PetEvent extends Equatable {
  const PetEvent();
  @override
  List<Object?> get props => [];
}

class PetPettingTapped extends PetEvent {}
class PetToggleLightSwitch extends PetEvent {}
class PetNameChanged extends PetEvent {
  final String name;
  const PetNameChanged(this.name);
  @override
  List<Object?> get props => [name];
}

class PetColorChanged extends PetEvent {
  final String colorTheme;
  const PetColorChanged(this.colorTheme);
  @override
  List<Object?> get props => [colorTheme];
}
class PetMicropetSelected extends PetEvent {
  final String? micropetAsset;
  const PetMicropetSelected(this.micropetAsset);
  @override
  List<Object?> get props => [micropetAsset];
}
class PetAddEnergyAndStones extends PetEvent {
  final int energy;
  final int stones;
  const PetAddEnergyAndStones(this.energy, this.stones);
  @override
  List<Object?> get props => [energy, stones];
}
class PetStartAdventure extends PetEvent {}
class PetCompleteAdventure extends PetEvent {
  final String traitGained;
  const PetCompleteAdventure(this.traitGained);
  @override
  List<Object?> get props => [traitGained];
}

class PetState extends Equatable {
  final PetModel pet;
  final BirdhouseArrangement arrangement;
  final bool isAdventuring;
  final String? speechMessage;

  const PetState({
    required this.pet,
    required this.arrangement,
    this.isAdventuring = false,
    this.speechMessage = 'Привет, друг! Позаботимся о себе сегодня? 💖',
  });

  PetState copyWith({
    PetModel? pet,
    BirdhouseArrangement? arrangement,
    bool? isAdventuring,
    String? speechMessage,
  }) {
    return PetState(
      pet: pet ?? this.pet,
      arrangement: arrangement ?? this.arrangement,
      isAdventuring: isAdventuring ?? this.isAdventuring,
      speechMessage: speechMessage ?? this.speechMessage,
    );
  }

  @override
  List<Object?> get props => [pet, arrangement, isAdventuring, speechMessage];
}

class PetBloc extends Bloc<PetEvent, PetState> {
  PetBloc({
    PetModel? initialPet,
    BirdhouseArrangement? initialArrangement,
  }) : super(PetState(
          pet: initialPet ?? const PetModel(id: 'finch-1', name: 'Бирби'),
          arrangement: initialArrangement ?? const BirdhouseArrangement(),
        )) {
    on<PetPettingTapped>((event, emit) {
      emit(state.copyWith(
        speechMessage: 'Чирик! Спасибо за заботу и тепло!',
      ));
    });

    on<PetNameChanged>((event, emit) {
      emit(state.copyWith(
        pet: state.pet.copyWith(name: event.name),
      ));
    });

    on<PetToggleLightSwitch>((event, emit) {
      final isLight = !state.arrangement.isLightOn;
      emit(state.copyWith(
        arrangement: state.arrangement.copyWith(isLightOn: isLight),
        pet: state.pet.copyWith(
          isSleeping: !isLight,
          activeAnimation: !isLight ? 'Finch_Sleepy in Bed_01.json' : 'Finch_Waiting_01.json',
        ),
        speechMessage: !isLight ? 'Тссс... Сладких снов, Бирби отдыхает! 🌙' : 'Доброе утро! Прекрасный день для заботы о себе! ☀️',
      ));
    });

    on<PetColorChanged>((event, emit) {
      emit(state.copyWith(
        pet: state.pet.copyWith(colorTheme: event.colorTheme),
        speechMessage: 'Вау, мне очень идёт новый окрас!',
      ));
    });

    on<PetMicropetSelected>((event, emit) {
      emit(state.copyWith(
        pet: state.pet.copyWith(activeMicropet: event.micropetAsset),
        speechMessage: 'Мой маленький питомец рядом со мной!',
      ));
    });

    on<PetAddEnergyAndStones>((event, emit) {
      final newEnergy = (state.pet.energy + event.energy).clamp(0, state.pet.maxEnergy);
      final newStones = state.pet.rainbowStones + event.stones;
      emit(state.copyWith(
        pet: state.pet.copyWith(energy: newEnergy, rainbowStones: newStones),
      ));
    });

    on<PetStartAdventure>((event, emit) {
      if (state.pet.energy >= 30) {
        emit(state.copyWith(
          isAdventuring: true,
          pet: state.pet.copyWith(energy: state.pet.energy - 30),
          speechMessage: 'Я отправляюсь в путешествие за новыми открытиями! 🎒',
        ));
      }
    });

    on<PetCompleteAdventure>((event, emit) {
      final traits = Map<String, int>.from(state.pet.personalityTraits);
      traits[event.traitGained] = (traits[event.traitGained] ?? 0) + 5;
      emit(state.copyWith(
        isAdventuring: false,
        pet: state.pet.copyWith(
          personalityTraits: traits,
          streakDays: state.pet.streakDays + 1,
        ),
        speechMessage: 'Я вернулся из приключения и узнал много нового!',
      ));
    });
  }
}
