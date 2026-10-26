import zipfile, os, json, urllib.parse

web_dir = 'web'
os.makedirs(f'{web_dir}/assets/animations', exist_ok=True)
os.makedirs(f'{web_dir}/assets/audio', exist_ok=True)
os.makedirs(f'{web_dir}/assets/icons', exist_ok=True)
os.makedirs(f'{web_dir}/assets/images', exist_ok=True)
os.makedirs(f'{web_dir}/data', exist_ok=True)

apk_path = 'apps/finch/com.finch.finch.apk'

with zipfile.ZipFile(apk_path, 'r') as z:
    # 1. Extract Lottie animations
    key_anims = [
        'CB01_Full_01.1_Naked.json',
        'CB01_Emoji_Clap_01.json',
        'CB01_Emoji_Head_01.json',
        'CB01_Emoji_FullBody_01.json',
        'Effects_Solo_Hearts_01.json',
        'Effects_Solo_Confetti_01.json',
        'Effects_Solo_Sparkles_01.json',
        'Finch_Waiting_01.json',
        'Finch_Waiting_02.json',
        'Finch_Awake%20in%20Bed_01.json',
        'Finch_Sleepy%20in%20Bed_01.json',
        'Finch_Brush%20Teeth_01.json',
        'Finch_Wash%20Face_01.json',
        'Finch_Stretching_01.json',
        'CMP_Cat_01.json',
        'CMP_Beaky_01.json',
        'CMP_Droplet_01.json',
        'CMP_Flower_01.json',
        'CMP_Star_01.json'
    ]
    
    extracted_anims = 0
    for anim in key_anims:
        apk_name = f'assets/flutter_assets/assets/animations/{anim}'
        dest_name = urllib.parse.unquote(anim)
        if apk_name in z.namelist():
            with z.open(apk_name) as src, open(f'{web_dir}/assets/animations/{dest_name}', 'wb') as dst:
                dst.write(src.read())
            extracted_anims += 1
            
    print(f'Extracted {extracted_anims} key animations')

    # 2. Extract audio files
    key_audio = [
        'babyChirpHappy.m4a',
        'babyChirp_softened.m4a',
        'bellChimes.m4a',
        'boopty.m4a',
        'breathe_in.m4a',
        'breathe_hold.m4a',
        'breathe_out.m4a',
        'bubbles.m4a',
        'eggHatch.m4a',
        'fairyBonus.m4a',
        'floaty-magic.m4a'
    ]
    extracted_audio = 0
    for aud in key_audio:
        apk_name = f'assets/flutter_assets/assets/audio/{aud}'
        if apk_name in z.namelist():
            with z.open(apk_name) as src, open(f'{web_dir}/assets/audio/{aud}', 'wb') as dst:
                dst.write(src.read())
            extracted_audio += 1
    print(f'Extracted {extracted_audio} key audio files')

    # 3. Extract sample icons & images
    for name in z.namelist():
        if name.startswith('assets/flutter_assets/assets/icons/') and name.endswith('.svg'):
            base = os.path.basename(name)
            with z.open(name) as src, open(f'{web_dir}/assets/icons/{base}', 'wb') as dst:
                dst.write(src.read())
        elif name.startswith('assets/flutter_assets/assets/images/') and name.endswith('.svg'):
            base = os.path.basename(name)
            with z.open(name) as src, open(f'{web_dir}/assets/images/{base}', 'wb') as dst:
                dst.write(src.read())

    # 4. Parse bird-pet-stories.tsv to JSON
    raw_tsv = z.read('assets/flutter_assets/assets/text/bird-pet-stories.tsv').decode('utf-8')
    lines = [l.split('\t') for l in raw_tsv.strip().split('\n')]
    
    header = lines[2]
    stories = []
    for r in lines[3:]:
        if len(r) >= 14 and r[0].strip().isdigit():
            story = {
                'id': int(r[0].strip()),
                'growth_stage': r[1].strip() if len(r) > 1 else 'Baby',
                'arc': r[2].strip() if len(r) > 2 else '',
                'location': r[3].strip() if len(r) > 3 else '',
                'title': r[4].strip() if len(r) > 4 else '',
                'emoji': r[7].strip() if len(r) > 7 else '🐣',
                'prompt': r[8].strip(' "\'').replace('\\"', '"') if len(r) > 8 else '',
                'trait1': r[9].strip() if len(r) > 9 else 'Curiosity',
                'choice1': r[10].strip(' "\'') if len(r) > 10 else '',
                'trait2': r[11].strip() if len(r) > 11 else 'Compassion',
                'choice2': r[12].strip(' "\'') if len(r) > 12 else '',
                'reply1': r[13].strip(' "\'').replace('\\"', '"') if len(r) > 13 else '',
                'reply2': r[14].strip(' "\'').replace('\\"', '"') if len(r) > 14 and r[14].strip() else (r[13].strip(' "\'') if len(r) > 13 else '')
            }
            if story['title'] and story['prompt'] and story['choice1']:
                stories.append(story)
                
    with open(f'{web_dir}/data/stories.json', 'w', encoding='utf-8') as f:
        json.dump(stories, f, ensure_ascii=False, indent=2)
    print(f'Converted {len(stories)} stories to stories.json')
