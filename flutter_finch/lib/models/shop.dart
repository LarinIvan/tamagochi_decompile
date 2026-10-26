import 'package:equatable/equatable.dart';

enum ShopItemType { furniture, clothing, color, micropet }

class ShopItemModel extends Equatable {
  final String id;
  final String name;
  final ShopItemType type;
  final String slot;
  final String assetName;
  final String iconName;
  final int price;
  final bool isPurchased;

  const ShopItemModel({
    required this.id,
    required this.name,
    required this.type,
    required this.slot,
    required this.assetName,
    required this.iconName,
    required this.price,
    this.isPurchased = false,
  });

  ShopItemModel copyWith({
    String? id,
    String? name,
    ShopItemType? type,
    String? slot,
    String? assetName,
    String? iconName,
    int? price,
    bool? isPurchased,
  }) {
    return ShopItemModel(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      slot: slot ?? this.slot,
      assetName: assetName ?? this.assetName,
      iconName: iconName ?? this.iconName,
      price: price ?? this.price,
      isPurchased: isPurchased ?? this.isPurchased,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'type': type.name,
    'slot': slot,
    'assetName': assetName,
    'iconName': iconName,
    'price': price,
    'isPurchased': isPurchased,
  };

  factory ShopItemModel.fromJson(Map<String, dynamic> json) => ShopItemModel(
    id: json['id'] as String,
    name: json['name'] as String,
    type: ShopItemType.values.byName(json['type'] as String? ?? 'furniture'),
    slot: json['slot'] as String,
    assetName: json['assetName'] as String,
    iconName: json['iconName'] as String,
    price: json['price'] as int? ?? 100,
    isPurchased: json['isPurchased'] as bool? ?? false,
  );

  @override
  List<Object?> get props => [id, name, type, slot, assetName, iconName, price, isPurchased];
}
