import os
import re
import json

LIBAPP = 'apps/finch/extracted_arm64/lib/arm64-v8a/libapp.so'

def extract_detailed_architecture():
    print("Reading libapp.so...")
    with open(LIBAPP, 'rb') as f:
        data = f.read()

    # Find Dart package paths
    packages = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'package:finch/[^\x00\r\n\t \'\"<>]+', data))))

    # Group by category
    categories = {}
    for p in packages:
        rel = p.replace('package:finch/', '')
        cat = rel.split('/')[0] if '/' in rel else 'root'
        categories.setdefault(cat, []).append(rel)

    # Find all Finch Models and their field hints
    # Pattern: ClassName.fromJson, ClassName.toJson, ClassName_Table
    classes = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'\b([A-Z][a-zA-Z0-9]+)\b', data))))
    finch_classes = [c for c in classes if any(c.startswith(prefix) for prefix in [
        'Bird', 'Birdhouse', 'Outfit', 'Inventory', 'Pet', 'Goal', 'Quest', 'Adventure', 
        'Reward', 'Story', 'Shop', 'Friend', 'TreeTown', 'Mood', 'SelfCare', 'Energy', 'Sound'
    ])]

    # Find all API/Database endpoints and tables
    tables = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'\b([A-Za-z0-9_]+Table)\b', data))))
    adapters = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'\b([A-Za-z0-9_]+Adapter)\b', data))))

    # Find all action/goals categories
    goal_types = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'GoalType\.[A-Za-z0-9_]+', data))))
    pet_stages = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'PetStage\.[A-Za-z0-9_]+', data))))
    personality_traits = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'PersonalityTrait\.[A-Za-z0-9_]+', data))))

    result = {
        "categories_count": {k: len(v) for k, v in categories.items()},
        "categories": categories,
        "finch_domain_classes": finch_classes,
        "drift_tables": tables,
        "hive_adapters": adapters,
        "goal_types": goal_types,
        "pet_stages": pet_stages,
        "personality_traits": personality_traits
    }

    os.makedirs('decompile_analysis', exist_ok=True)
    with open('decompile_analysis/finch_architecture_detailed.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print("Detailed architecture extracted!")
    print(f"Categories: {list(categories.keys())}")
    print(f"Finch domain classes count: {len(finch_classes)}")
    print(f"Drift SQLite tables: {len(tables)}")
    print(f"Hive adapters: {len(adapters)}")

if __name__ == '__main__':
    extract_detailed_architecture()
