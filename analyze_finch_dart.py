import re
import os
import json

LIBAPP = 'apps/finch/extracted_arm64/lib/arm64-v8a/libapp.so'

print(f"Reading {LIBAPP}...")
with open(LIBAPP, 'rb') as f:
    data = f.read()

# 1. Package files
packages = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'package:finch/[^\x00\r\n\t \'\"<>]+', data))))
print(f"Total package:finch files: {len(packages)}")

# 2. BLoCs and Cubits
blocs = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'\b([A-Z][a-zA-Z0-9]+(?:Bloc|Cubit|State|Event))\b', data))))
print(f"Total BLoCs/Cubits/States: {len(blocs)}")

# 3. Screens and Views
views = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'\b([A-Z][a-zA-Z0-9]+(?:Screen|Page|View|Dialog|Sheet))\b', data))))
print(f"Total Views/Screens: {len(views)}")

# 4. Domain & Data Models
models = sorted(list(set(m.decode('utf-8', errors='ignore') for m in re.findall(rb'\b([A-Z][a-zA-Z0-9]+(?:Model|Entity|Repository|Service|Manager))\b', data))))
print(f"Total Models/Repositories/Services: {len(models)}")

# Save report
report = {
    "package_files_count": len(packages),
    "sample_packages": packages[:50],
    "all_packages": packages,
    "blocs_sample": blocs[:50],
    "views_sample": views[:50],
    "models_sample": models[:50]
}

os.makedirs('decompile_analysis', exist_ok=True)
with open('decompile_analysis/finch_symbols.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2, ensure_ascii=False)

print("Saved report to decompile_analysis/finch_symbols.json")
