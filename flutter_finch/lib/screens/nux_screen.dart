import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/pet_bloc.dart';

class NuxScreen extends StatefulWidget {
  final VoidCallback onComplete;
  const NuxScreen({super.key, required this.onComplete});

  @override
  State<NuxScreen> createState() => _NuxScreenState();
}

class _NuxScreenState extends State<NuxScreen> {
  int _step = 1;
  final int _totalSteps = 8;

  // Survey Data
  String _intent = 'anxiety';
  final List<int> _gad7 = [1, 1, 1, 1];
  final List<int> _phq9 = [1, 1, 1, 1];
  String _chosenEgg = 'assets/images/egg-blue.svg';
  String _chosenTheme = 'Sky Blue';

  int _warmth = 0;
  bool _hatched = false;

  final TextEditingController _petNameController = TextEditingController(text: 'Бирби');
  final TextEditingController _humanNameController = TextEditingController(text: 'Друг');
  String _pronouns = 'Они / Их';

  static const List<String> gad7Questions = [
    'Чувство нервозности, тревоги или нахождения на взводе',
    'Неспособность остановить или контролировать беспокойство',
    'Трудности с расслаблением и внутренним покоем',
    'Чрезмерное беспокойство по самым разным поводам'
  ];

  static const List<String> phq9Questions = [
    'Мало интереса или удовольствия от привычных дел',
    'Чувство подавленности, грусти или безнадёжности',
    'Трудности с засыпанием или беспокойный сон',
    'Чувство усталости или нехватка жизненной энергии'
  ];

  static const List<String> freqOptions = [
    'Совсем нет',
    'Несколько дней',
    'Более 7 дней',
    'Почти каждый день'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF8F2),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            children: [
              // Progress Bar
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: _step / _totalSteps,
                  backgroundColor: const Color(0xFFE8E2D2),
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6C9A74)),
                  minHeight: 6,
                ),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: _buildCurrentStep(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_step) {
      case 1:
        return _buildStep1Welcome();
      case 2:
        return _buildStep2Gad7();
      case 3:
        return _buildStep3Phq9();
      case 4:
        return _buildStep4Plan();
      case 5:
        return _buildStep5Egg();
      case 6:
        return _buildStep6Hatch();
      case 7:
        return _buildStep7Name();
      case 8:
        return _buildStep8StarterGoals();
      default:
        return const SizedBox.shrink();
    }
  }

  // Step 1: Welcome & Intent
  Widget _buildStep1Welcome() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 10),
        Center(
          child: SvgPicture.asset('assets/icons/bird-baby.svg', width: 80, height: 80),
        ),
        const SizedBox(height: 16),
        const Text(
          'Добро пожаловать в Finch!',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
        ),
        const SizedBox(height: 8),
        const Text(
          'Finch — это ваш карманный питомец для бережной заботы о себе. Заботясь о птичке, вы заботитесь о себе каждый день.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: Color(0xFF666666), height: 1.4),
        ),
        const SizedBox(height: 24),
        const Text(
          'ЧТО ПРИВЕЛО ВАС В FINCH СЕГОДНЯ?',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF888888)),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: ListView(
            children: [
              _buildIntentCard('anxiety', 'Снизить тревогу и стресс', 'Обрести спокойствие и внутренний баланс'),
              _buildIntentCard('depression', 'Справиться с грустью и апатией', 'Маленькие бережные шаги к радости'),
              _buildIntentCard('habits', 'Привычки и продуктивность', 'Наладить режим дня и концентрацию'),
              _buildIntentCard('self_care', 'Доброта к себе и благодарность', 'Учиться ценить себя без критики'),
            ],
          ),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C9A74),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: () => setState(() => _step = 2),
          child: const Text('Продолжить', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        ),
      ],
    );
  }

  Widget _buildIntentCard(String value, String title, String subtitle) {
    final isSelected = _intent == value;
    return GestureDetector(
      onTap: () => setState(() => _intent = value),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF2F7F4) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF6C9A74) : const Color(0xFFE5DFD3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF2C3E50))),
            const SizedBox(height: 4),
            Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF777777))),
          ],
        ),
      ),
    );
  }

  // Step 2: GAD-7 Anxiety Assessment
  Widget _buildStep2Gad7() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildBadge('Клиническая оценка GAD-7'),
        const Text(
          'Оценка уровня тревожности',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
        ),
        const SizedBox(height: 6),
        const Text(
          'За последние 2 недели, как часто вас беспокоили следующие состояния?',
          style: TextStyle(fontSize: 12, color: Color(0xFF666666)),
        ),
        const SizedBox(height: 14),
        Expanded(
          child: ListView.builder(
            itemCount: gad7Questions.length,
            itemBuilder: (context, idx) {
              return _buildSurveyQuestion(idx, gad7Questions[idx], _gad7[idx], (val) {
                setState(() => _gad7[idx] = val);
              });
            },
          ),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C9A74),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: () => setState(() => _step = 3),
          child: const Text('Продолжить', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        ),
      ],
    );
  }

  // Step 3: PHQ-9 Depression & Mood
  Widget _buildStep3Phq9() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildBadge('Клиническая оценка PHQ-9'),
        const Text(
          'Энергия и настроение',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
        ),
        const SizedBox(height: 6),
        const Text(
          'За последние 2 недели, как часто вы ощущали следующие состояния?',
          style: TextStyle(fontSize: 12, color: Color(0xFF666666)),
        ),
        const SizedBox(height: 14),
        Expanded(
          child: ListView.builder(
            itemCount: phq9Questions.length,
            itemBuilder: (context, idx) {
              return _buildSurveyQuestion(idx, phq9Questions[idx], _phq9[idx], (val) {
                setState(() => _phq9[idx] = val);
              });
            },
          ),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C9A74),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: () => setState(() => _step = 4),
          child: const Text('Рассчитать план заботы', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        ),
      ],
    );
  }

  Widget _buildSurveyQuestion(int idx, String question, int currentVal, ValueChanged<int> onSelect) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5DFD3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${idx + 1}. $question', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Color(0xFF2C3E50))),
          const SizedBox(height: 10),
          Row(
            children: List.generate(4, (oIdx) {
              final isSel = currentVal == oIdx;
              return Expanded(
                child: GestureDetector(
                  onTap: () => onSelect(oIdx),
                  child: Container(
                    margin: EdgeInsets.only(right: oIdx < 3 ? 4 : 0),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSel ? const Color(0xFF6C9A74) : const Color(0xFFF7F4EB),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isSel ? const Color(0xFF6C9A74) : const Color(0xFFE5DFD3)),
                    ),
                    child: Text(
                      freqOptions[oIdx],
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w600,
                        color: isSel ? Colors.white : const Color(0xFF777777),
                      ),
                    ),
                  ),
                ),
              );
            }),
          )
        ],
      ),
    );
  }

  // Step 4: Plan Summary
  Widget _buildStep4Plan() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 20),
        Center(child: SvgPicture.asset('assets/icons/streak_star.svg', width: 64, height: 64)),
        const SizedBox(height: 16),
        const Text(
          'Ваш персональный план готов',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
        ),
        const SizedBox(height: 8),
        const Text(
          'Мы составили мягкий план поддержки на основе ваших ответов. Никакого давления — только маленькие бережные шаги.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: Color(0xFF666666), height: 1.4),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE5DFD3)),
          ),
          child: Column(
            children: [
              _buildPlanRow('assets/icons/badge-checkmark.svg', 'Микро-цели заботы (1–2 минуты)'),
              const Divider(height: 20, color: Color(0xFFF0EBE0)),
              _buildPlanRow('assets/icons/heart.svg', 'Трекер настроения и добрые мысли'),
              const Divider(height: 20, color: Color(0xFFF0EBE0)),
              _buildPlanRow('assets/icons/backpack.svg', 'Приключения и рост пернатого друга'),
            ],
          ),
        ),
        const Spacer(),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C9A74),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: () => setState(() => _step = 5),
          child: const Text('Встретить своего питомца', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        ),
      ],
    );
  }

  Widget _buildPlanRow(String icon, String text) {
    return Row(
      children: [
        SvgPicture.asset(icon, width: 18, height: 18),
        const SizedBox(width: 12),
        Expanded(child: Text(text, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF2C3E50)))),
      ],
    );
  }

  // Step 5: Choose Egg
  Widget _buildStep5Egg() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 20),
        const Text(
          'Выберите яйцо',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
        ),
        const SizedBox(height: 8),
        const Text(
          'Каждое яйцо хранит в себе птенца с уникальным окрасом перьев:',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: Color(0xFF666666)),
        ),
        const SizedBox(height: 36),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildEggCard('assets/images/egg-blue.svg', 'Sky Blue', 'Небесное'),
            _buildEggCard('assets/images/egg-green.svg', 'Matcha Green', 'Лесное'),
            _buildEggCard('assets/images/egg-red.svg', 'Blossom Pink', 'Цветочное'),
          ],
        ),
        const Spacer(),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C9A74),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: () => setState(() => _step = 6),
          child: const Text('Согреть яйцо', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        ),
      ],
    );
  }

  Widget _buildEggCard(String asset, String theme, String label) {
    final isSelected = _chosenEgg == asset;
    return GestureDetector(
      onTap: () => setState(() {
        _chosenEgg = asset;
        _chosenTheme = theme;
      }),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF2F7F4) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFF6C9A74) : const Color(0xFFE5DFD3),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected ? [BoxShadow(color: const Color(0xFF6C9A74).withOpacity(0.2), blurRadius: 8)] : [],
        ),
        child: Column(
          children: [
            SvgPicture.asset(asset, width: 64, height: 80),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF2C3E50))),
          ],
        ),
      ),
    );
  }

  // Step 6: Warm & Hatch
  Widget _buildStep6Hatch() {
    String crackAsset = '';
    if (_warmth >= 25 && _warmth < 50) crackAsset = 'assets/images/egg-crack-1.svg';
    if (_warmth >= 50 && _warmth < 75) crackAsset = 'assets/images/egg-crack-2.svg';
    if (_warmth >= 75 && _warmth < 100) crackAsset = 'assets/images/egg-crack-3.svg';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 10),
        Text(
          _hatched ? 'Птенец вылупился! 🐣' : 'Согрейте яйцо',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
        ),
        const SizedBox(height: 6),
        Text(
          _hatched ? '«Чирик! Я так рад появиться на свет и встретиться с тобой!»' : 'Нажимайте на яйцо, чтобы наполнить его теплом заботы!',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 13, color: Color(0xFF666666)),
        ),
        const SizedBox(height: 30),
        Center(
          child: GestureDetector(
            onTap: () {
              if (_hatched) return;
              setState(() {
                _warmth = (_warmth + 20).clamp(0, 100);
                if (_warmth >= 100) {
                  _hatched = true;
                }
              });
            },
            child: SizedBox(
              width: 140,
              height: 180,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (!_hatched) SvgPicture.asset(_chosenEgg, width: 140, height: 180),
                  if (!_hatched && crackAsset.isNotEmpty)
                    SvgPicture.asset(crackAsset, width: 60, height: 60),
                  if (_hatched)
                    SvgPicture.asset('assets/icons/bird-baby.svg', width: 120, height: 120),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        if (!_hatched)
          Center(
            child: SizedBox(
              width: 160,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: _warmth / 100,
                  backgroundColor: const Color(0xFFE8E2D2),
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFEAA64C)),
                  minHeight: 8,
                ),
              ),
            ),
          ),
        const Spacer(),
        if (_hatched)
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6C9A74),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () => setState(() => _step = 7),
            child: const Text('Познакомиться с малышом', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          ),
      ],
    );
  }

  // Step 7: Name & Pronouns
  Widget _buildStep7Name() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 10),
        const Text(
          'Как зовут вашего друга?',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
        ),
        const SizedBox(height: 6),
        const Text(
          'Придумайте имя для маленького питомца:',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: Color(0xFF666666)),
        ),
        const SizedBox(height: 18),
        TextField(
          controller: _petNameController,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5DFD3))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF6C9A74), width: 2)),
          ),
        ),
        const SizedBox(height: 16),
        const Text('МЕСТОИМЕНИЯ ПТИЧКИ:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF888888))),
        const SizedBox(height: 8),
        Row(
          children: ['Они / Их', 'Он / Его', 'Она / Её'].map((p) {
            final isSel = _pronouns == p;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _pronouns = p),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: isSel ? const Color(0xFFF2F7F4) : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isSel ? const Color(0xFF6C9A74) : const Color(0xFFE5DFD3), width: isSel ? 2 : 1),
                  ),
                  child: Text(p, textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: isSel ? const Color(0xFF6C9A74) : const Color(0xFF555555))),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 18),
        const Text('А КАК ПИТОМЦУ ОБРАЩАТЬСЯ К ВАМ?', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF888888))),
        const SizedBox(height: 8),
        TextField(
          controller: _humanNameController,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5DFD3))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF6C9A74), width: 2)),
          ),
        ),
        const Spacer(),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C9A74),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: () {
            final petBloc = context.read<PetBloc>();
            petBloc.add(PetNameChanged(_petNameController.text.trim()));
            petBloc.add(PetColorChanged(_chosenTheme));
            setState(() => _step = 8);
          },
          child: const Text('Продолжить', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        ),
      ],
    );
  }

  // Step 8: Baby Bird Speech & First Goals
  Widget _buildStep8StarterGoals() {
    final petName = _petNameController.text.trim();
    final ownerName = _humanNameController.text.trim();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE5DFD3)),
          ),
          child: Row(
            children: [
              SvgPicture.asset('assets/icons/bird-baby.svg', width: 44, height: 44),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  '«Чирик! Привет, $ownerName! Я $petName, и я так счастлив(а) начать это путешествие вместе с тобой!»',
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Color(0xFF6C9A74), height: 1.4),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Text('ВАШИ ПЕРВЫЕ ЦЕЛИ ЗАБОТЫ НА СЕГОДНЯ:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF888888))),
        const SizedBox(height: 10),
        _buildStarterGoalRow('Выпить стакан чистой воды'),
        _buildStarterGoalRow('Сделать один глубокий вдох'),
        _buildStarterGoalRow('Сказать себе тёплые слова'),
        const Spacer(),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C9A74),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          onPressed: widget.onComplete,
          child: const Text('Войти в домик ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        ),
      ],
    );
  }

  Widget _buildStarterGoalRow(String title) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5DFD3)),
      ),
      child: Row(
        children: [
          SvgPicture.asset('assets/icons/badge-checkmark.svg', width: 16, height: 16),
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF2C3E50)))),
        ],
      ),
    );
  }

  Widget _buildBadge(String text) {
    return Container(
      alignSelf: Alignment.centerLeft,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFE6F3E6),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF4A7C59))),
    );
  }
}
