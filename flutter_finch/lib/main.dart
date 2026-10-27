import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'bloc/pet_bloc.dart';
import 'bloc/goals_bloc.dart';
import 'bloc/shop_bloc.dart';
import 'models/pet.dart';
import 'models/birdhouse.dart';
import 'screens/nux_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FinchApp());
}

class FinchApp extends StatelessWidget {
  const FinchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<PetBloc>(create: (_) => PetBloc()),
        BlocProvider<GoalsBloc>(create: (_) => GoalsBloc()),
        BlocProvider<ShopBloc>(create: (_) => ShopBloc()),
      ],
      child: MaterialApp(
        title: 'Finch: Self-Care Pet',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          fontFamily: 'Rubik',
          scaffoldBackgroundColor: const Color(0xFFF7F4EB),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF6C9A74),
            primary: const Color(0xFF6C9A74),
            secondary: const Color(0xFFEAA64C),
          ),
          useMaterial3: true,
        ),
        home: const FinchMainScaffold(),
      ),
    );
  }
}

class FinchMainScaffold extends StatefulWidget {
  const FinchMainScaffold({super.key});

  @override
  State<FinchMainScaffold> createState() => _FinchMainScaffoldState();
}

class _FinchMainScaffoldState extends State<FinchMainScaffold> {
  int _currentIndex = 0;
  bool _hasCompletedNux = false;

  @override
  Widget build(BuildContext context) {
    if (!_hasCompletedNux) {
      return NuxScreen(
        onComplete: () {
          setState(() {
            _hasCompletedNux = true;
          });
        },
      );
    }

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: const FinchHUDAppBar(),
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: const [
          FinchHomeScreen(),
          FinchGoalsScreen(),
          FinchBagScreen(),
          FinchShopScreen(),
          FinchTreeTownScreen(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 10,
              offset: const Offset(0, -4),
            )
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, 'assets/icons/home_button_full.svg', 'Домик'),
                _buildNavItem(1, 'assets/icons/goals.svg', 'Цели'),
                _buildNavItem(2, 'assets/icons/backpack.svg', 'Гардероб'),
                _buildNavItem(3, 'assets/icons/shop.svg', 'Магазин'),
                _buildNavItem(4, 'assets/icons/tree.svg', 'Друзья'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, String iconPath, String label) {
    final isSelected = _currentIndex == index;
    final color = isSelected ? const Color(0xFF6C9A74) : const Color(0xFF9E9E9E);
    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SvgPicture.asset(
              iconPath,
              width: 26,
              height: 26,
              colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class FinchHUDAppBar extends StatelessWidget {
  const FinchHUDAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PetBloc, PetState>(
      builder: (context, state) {
        final pet = state.pet;
        return SafeArea(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                SvgPicture.asset('assets/icons/activities-settings.svg', width: 24, height: 24),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      pet.name,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Text(
                      'Малыш • ${pet.colorTheme}',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 11),
                    ),
                  ],
                ),
                const Spacer(),
                _buildPill('assets/icons/streak_star.svg', '${pet.streakDays}'),
                const SizedBox(width: 8),
                _buildPill('assets/icons/energy.svg', '${pet.energy}/${pet.maxEnergy}'),
                const SizedBox(width: 8),
                _buildPill('assets/icons/rainbow-stone.svg', '${pet.rainbowStones}'),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPill(String iconPath, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 4,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SvgPicture.asset(iconPath, width: 16, height: 16),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}

// ==================== SCREENS ====================

class FinchHomeScreen extends StatelessWidget {
  const FinchHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PetBloc, PetState>(
      builder: (context, state) {
        final room = state.arrangement;
        return SingleChildScrollView(
          child: Column(
            children: [
              // Birdhouse Room
              Container(
                margin: const EdgeInsets.all(16),
                height: 380,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: room.isLightOn ? const Color(0xFFF9F6F0) : const Color(0xFF2C3240),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 16)
                  ],
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Wall
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: SvgPicture.asset('assets/images/${room.wallpaper}', fit: BoxFit.cover),
                      ),
                    ),
                    // Window
                    Positioned(
                      top: 40,
                      left: 36,
                      child: SvgPicture.asset('assets/images/${room.window}', width: 85),
                    ),
                    // Clock
                    Positioned(
                      top: 30,
                      child: SvgPicture.asset('assets/images/${room.clock}', width: 44),
                    ),
                    // Door
                    Positioned(
                      top: 70,
                      right: 32,
                      child: SvgPicture.asset('assets/images/${room.door}', width: 75),
                    ),
                    // Rug on floor
                    Positioned(
                      bottom: 20,
                      child: SvgPicture.asset('assets/images/${room.rug}', width: 220),
                    ),
                    // Bed
                    Positioned(
                      bottom: 30,
                      left: 20,
                      child: SvgPicture.asset('assets/images/${room.bed}', width: 110),
                    ),
                    // Lamp (Clickable Light Switch!)
                    Positioned(
                      bottom: 70,
                      right: 36,
                      child: GestureDetector(
                        onTap: () => context.read<PetBloc>().add(PetToggleLightSwitch()),
                        child: SvgPicture.asset('assets/images/${room.lamp}', width: 50),
                      ),
                    ),
                    // Speech Bubble
                    if (state.speechMessage != null)
                      Positioned(
                        top: 110,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.95),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6)],
                          ),
                          child: Text(
                            state.speechMessage!,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                    // Pet Avatar
                    Positioned(
                      bottom: 45,
                      child: GestureDetector(
                        onTap: () => context.read<PetBloc>().add(PetPettingTapped()),
                        child: SizedBox(
                          width: 170,
                          height: 170,
                          child: SvgPicture.asset('assets/icons/bird-pet-face-new.svg'),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Adventure Call to Action Button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: ElevatedButton.icon(
                  onPressed: state.pet.energy >= 30
                      ? () => context.read<PetBloc>().add(PetStartAdventure())
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6C9A74),
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(52),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  icon: SvgPicture.asset('assets/icons/backpack.svg', width: 20, colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn)),
                  label: Text('Отправить в приключение (${state.pet.energy}/30 ⚡)'),
                ),
              ),

              const SizedBox(height: 16),

              // Mood Check-in Card
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Как вы себя чувствуете сейчас?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF2C3E50))),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(10)),
                          child: const Text('+20 💎', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF4A7C59))),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildMoodBtn(context, 'assets/icons/bird-heart-eyes.svg', 'Отлично', 'Замечательно! Запомни это светлое чувство! 🌟'),
                        _buildMoodBtn(context, 'assets/icons/bird-baby.svg', 'Хорошо', 'Здорово! Пусть день продолжает радовать! 🌿'),
                        _buildMoodBtn(context, 'assets/icons/bird-head-side.svg', 'Норма', 'Спокойный день — это прекрасно! ☁️'),
                        _buildMoodBtn(context, 'assets/icons/batfinch-head-calm.svg', 'Так себе', 'Позволь себе отдохнуть и не спешить ☕'),
                        _buildMoodBtn(context, 'assets/icons/big-sweat-drop.svg', 'Тяжело', 'Я рядом. Мы справимся со всем вместе 🫂'),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Feed Goals Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Цели заботы на сегодня', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF2C3E50))),
                    Text('${context.watch<GoalsBloc>().state.goals.where((g) => g.isCompleted).length}/${context.watch<GoalsBloc>().state.goals.length}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // Feed Goals Preview
              BlocBuilder<GoalsBloc, GoalsState>(
                builder: (context, goalsState) {
                  return ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: goalsState.goals.length,
                    itemBuilder: (context, idx) {
                      final goal = goalsState.goals[idx];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFF0EBE0)),
                        ),
                        child: ListTile(
                          dense: true,
                          leading: SvgPicture.asset('assets/icons/${goal.icon}', width: 22),
                          title: Text(goal.title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, decoration: goal.isCompleted ? TextDecoration.lineThrough : null)),
                          subtitle: Text('+${goal.energyReward} ⚡  +${goal.rainbowStonesReward} 💎', style: const TextStyle(fontSize: 11, color: Color(0xFFEAA64C), fontWeight: FontWeight.bold)),
                          trailing: IconButton(
                            icon: Icon(goal.isCompleted ? Icons.check_circle : Icons.circle_outlined, color: goal.isCompleted ? const Color(0xFF6C9A74) : Colors.grey),
                            onPressed: () {
                              context.read<GoalsBloc>().add(ToggleGoalCompleted(goal.id));
                              if (!goal.isCompleted) {
                                context.read<PetBloc>().add(PetAddEnergyAndStones(goal.energyReward, goal.rainbowStonesReward));
                              }
                            },
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMoodBtn(BuildContext context, String svg, String label, String response) {
    return GestureDetector(
      onTap: () {
        context.read<PetBloc>().add(const PetAddEnergyAndStones(0, 20));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response),
            backgroundColor: const Color(0xFF6C9A74),
            duration: const Duration(seconds: 2),
          ),
        );
      },
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF7F4EB),
              borderRadius: BorderRadius.circular(12),
            ),
            child: SvgPicture.asset(svg, width: 28, height: 28),
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF555555))),
        ],
      ),
    );
  }
}

class FinchGoalsScreen extends StatelessWidget {
  const FinchGoalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<GoalsBloc, GoalsState>(
      builder: (context, state) {
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: state.goals.length,
          itemBuilder: (context, index) {
            final goal = state.goals[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)],
              ),
              child: ListTile(
                leading: SvgPicture.asset('assets/icons/${goal.icon}', width: 28),
                title: Text(
                  goal.title,
                  style: TextStyle(
                    decoration: goal.isCompleted ? TextDecoration.lineThrough : null,
                    color: goal.isCompleted ? Colors.grey : Colors.black87,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Text('+${goal.energyReward} ⚡  +${goal.stoneReward} 💎'),
                trailing: Checkbox(
                  value: goal.isCompleted,
                  activeColor: const Color(0xFF6C9A74),
                  onChanged: (_) {
                    context.read<GoalsBloc>().add(GoalCompletedToggled(goal.id));
                    if (!goal.isCompleted) {
                      context.read<PetBloc>().add(PetAddEnergyAndStones(goal.energyReward, goal.stoneReward));
                    }
                  },
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class FinchBagScreen extends StatelessWidget {
  const FinchBagScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Окрас питомца', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          children: [
            _buildColorChip(context, 'Classic Grey', Colors.grey.shade400),
            _buildColorChip(context, 'Sky Blue', Colors.lightBlue.shade300),
            _buildColorChip(context, 'Blossom Pink', Colors.pink.shade200),
            _buildColorChip(context, 'Matcha Green', Colors.green.shade300),
            _buildColorChip(context, 'Honey Yellow', Colors.amber.shade300),
          ],
        ),
      ],
    );
  }

  Widget _buildColorChip(BuildContext context, String name, Color color) {
    return ActionChip(
      avatar: CircleAvatar(backgroundColor: color, radius: 8),
      label: Text(name),
      onPressed: () => context.read<PetBloc>().add(PetColorChanged(name)),
    );
  }
}

class FinchShopScreen extends StatelessWidget {
  const FinchShopScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ShopBloc, ShopState>(
      builder: (context, state) {
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F1EC),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  SvgPicture.asset('assets/icons/shop.svg', width: 40),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Лавка Мистера Приклза', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text('Уютная мебель и одежда для питомца', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const FixedCrossAxisCountDelegate(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.82,
              ),
              itemCount: state.items.length,
              itemBuilder: (context, index) {
                final item = state.items[index];
                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6)],
                  ),
                  child: Column(
                    children: [
                      Expanded(
                        child: SvgPicture.asset('assets/images/${item.iconName}'),
                      ),
                      const SizedBox(height: 6),
                      Text(item.name, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                      const SizedBox(height: 6),
                      ElevatedButton(
                        onPressed: item.isPurchased ? null : () {
                          context.read<ShopBloc>().add(ShopItemPurchased(item.id));
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFEAA64C),
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(32),
                        ),
                        child: Text(item.isPurchased ? 'Куплено' : '${item.price} 💎', style: const TextStyle(fontSize: 11)),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }
}

class FinchTreeTownScreen extends StatelessWidget {
  const FinchTreeTownScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF5F1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              SvgPicture.asset('assets/icons/tree.svg', width: 36),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Дерево друзей (Tree Town)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text('Отправляй лучи добра (Good Vibes)!', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _buildFriendCard('Робин', 'Малыш • Классический серый', 'assets/icons/bird-baby.svg'),
        _buildFriendCard('Пип', 'Малыш • Небесно-голубой', 'assets/icons/bird-baby.svg'),
        _buildFriendCard('Санни', 'Малыш • Медово-жёлтый', 'assets/icons/bird-baby.svg'),
      ],
    );
  }

  Widget _buildFriendCard(String name, String desc, String iconPath) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6)],
      ),
      child: Row(
        children: [
          SvgPicture.asset(iconPath, width: 40),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              Text(desc, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
          const Spacer(),
          ElevatedButton.icon(
            onPressed: () {},
            icon: SvgPicture.asset('assets/icons/heart.svg', width: 14),
            label: const Text('Добро', style: TextStyle(fontSize: 12)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFDE8E9),
              foregroundColor: const Color(0xFFE55353),
              elevation: 0,
            ),
          ),
        ],
      ),
    );
  }
}
