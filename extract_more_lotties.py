import zipfile
import os

APK = 'apps/finch/com.finch.finch.apk'
OUT_DIR = 'web/assets/animations'

targets = [
    'assets/flutter_assets/assets/animations/npcs/NPC_MrPrickles.json',
    'assets/flutter_assets/assets/animations/npcs/NPC_Robin.json',
    'assets/flutter_assets/assets/animations/npcs/NPC_DaFinchie.json',
    'assets/flutter_assets/assets/animations/npcs/NPC_Sass.json',
    'assets/flutter_assets/assets/animations/StreakCelebration_Birb_01.json',
    'assets/flutter_assets/assets/animations/Rainbow_Stone_01.json',
    'assets/flutter_assets/assets/animations/Rainbow_Stone_02.json',
    'assets/flutter_assets/assets/animations/PlusHearts_01.json',
    'assets/flutter_assets/assets/animations/PlusSparkles_01.json',
    'assets/flutter_assets/assets/animations/PlusSparkles_02.json',
    'assets/flutter_assets/assets/animations/heart-bubbling.json',
    'assets/flutter_assets/assets/animations/emotes/heart.json',
    'assets/flutter_assets/assets/animations/emotes/sparkle.json',
    'assets/flutter_assets/assets/animations/emotes/big sweat.json',
    'assets/flutter_assets/assets/animations/emotes/sadness.json',
    'assets/flutter_assets/assets/animations/naked_bird_lottie.json'
]

print("Extracting additional authentic Lottie animations...")
with zipfile.ZipFile(APK, 'r') as z:
    for target in targets:
        try:
            data = z.read(target)
            basename = os.path.basename(target).replace(' ', '_')
            dest = os.path.join(OUT_DIR, basename)
            with open(dest, 'wb') as f:
                f.write(data)
            print(f"  Extracted: {basename} ({len(data)} bytes)")
        except KeyError:
            print(f"  Missing: {target}")

print("Extraction complete!")
