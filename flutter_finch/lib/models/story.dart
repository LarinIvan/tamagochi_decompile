import 'package:equatable/equatable.dart';

class StoryChoice extends Equatable {
  final String text;
  final String response;
  final String trait;

  const StoryChoice({
    required this.text,
    required this.response,
    required this.trait,
  });

  factory StoryChoice.fromJson(Map<String, dynamic> json) => StoryChoice(
    text: json['text'] as String? ?? '',
    response: json['response'] as String? ?? '',
    trait: json['trait'] as String? ?? 'Curiosity',
  );

  Map<String, dynamic> toJson() => {
    'text': text,
    'response': response,
    'trait': trait,
  };

  @override
  List<Object?> get props => [text, response, trait];
}

class StoryModel extends Equatable {
  final String id;
  final String title;
  final String text;
  final String question;
  final List<StoryChoice> choices;

  const StoryModel({
    required this.id,
    required this.title,
    required this.text,
    required this.question,
    required this.choices,
  });

  factory StoryModel.fromJson(Map<String, dynamic> json) => StoryModel(
    id: json['id'] as String? ?? '',
    title: json['title'] as String? ?? '',
    text: json['text'] as String? ?? '',
    question: json['question'] as String? ?? '',
    choices: (json['choices'] as List<dynamic>? ?? [])
        .map((c) => StoryChoice.fromJson(c as Map<String, dynamic>))
        .toList(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'text': text,
    'question': question,
    'choices': choices.map((c) => c.toJson()).toList(),
  };

  @override
  List<Object?> get props => [id, title, text, question, choices];
}
