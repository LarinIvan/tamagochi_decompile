import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../models/shop.dart';

abstract class ShopEvent extends Equatable {
  const ShopEvent();
  @override
  List<Object?> get props => [];
}

class ShopItemPurchased extends ShopEvent {
  final String itemId;
  const ShopItemPurchased(this.itemId);
  @override
  List<Object?> get props => [itemId];
}

class ShopState extends Equatable {
  final List<ShopItemModel> items;

  const ShopState({this.items = const []});

  ShopState copyWith({List<ShopItemModel>? items}) {
    return ShopState(items: items ?? this.items);
  }

  @override
  List<Object?> get props => [items];
}

class ShopBloc extends Bloc<ShopEvent, ShopState> {
  ShopBloc()
      : super(const ShopState(
          items: [
            ShopItemModel(
              id: 'item-bed-gothic',
              name: 'Готическая кровать',
              type: ShopItemType.furniture,
              slot: 'bed',
              assetName: 'gothic-bed.svg',
              iconName: 'gothic-bed-square-icon.svg',
              price: 150,
            ),
            ShopItemModel(
              id: 'item-lamp-gothic',
              name: 'Готическая лампа',
              type: ShopItemType.furniture,
              slot: 'lamp',
              assetName: 'gothic-lamp.svg',
              iconName: 'gothic-lamp-square-icon.svg',
              price: 90,
            ),
            ShopItemModel(
              id: 'item-door-gothic',
              name: 'Резная готическая дверь',
              type: ShopItemType.furniture,
              slot: 'door',
              assetName: 'gothic-door.svg',
              iconName: 'gothic-door-square-icon.svg',
              price: 120,
            ),
            ShopItemModel(
              id: 'item-window-gothic',
              name: 'Стрельчатое окно',
              type: ShopItemType.furniture,
              slot: 'window',
              assetName: 'gothic-window.svg',
              iconName: 'gothic-window-square-icon.svg',
              price: 140,
            ),
            ShopItemModel(
              id: 'item-rug-gothic',
              name: 'Пурпурный ковёр',
              type: ShopItemType.furniture,
              slot: 'rug',
              assetName: 'gothic-rug.svg',
              iconName: 'gothic-rug-square-icon.svg',
              price: 80,
            ),
            ShopItemModel(
              id: 'item-clock-gothic',
              name: 'Старинные часы',
              type: ShopItemType.furniture,
              slot: 'clock',
              assetName: 'gothic-clock.svg',
              iconName: 'gothic-clock-square-icon.svg',
              price: 110,
            ),
            ShopItemModel(
              id: 'item-hat-alps',
              name: 'Альпийская шляпа',
              type: ShopItemType.clothing,
              slot: 'hat',
              assetName: 'alps-hat.svg',
              iconName: 'alps-hat.svg',
              price: 130,
            ),
            ShopItemModel(
              id: 'item-glasses-heart',
              name: 'Очки-сердечки',
              type: ShopItemType.clothing,
              slot: 'glasses',
              assetName: 'groovy-heart-glasses.svg',
              iconName: 'groovy-heart-glasses.svg',
              price: 95,
            ),
          ],
        )) {
    on<ShopItemPurchased>((event, emit) {
      final updated = state.items.map((it) {
        if (it.id == event.itemId) {
          return it.copyWith(isPurchased: true);
        }
        return it;
      }).toList();
      emit(state.copyWith(items: updated));
    });
  }
}
