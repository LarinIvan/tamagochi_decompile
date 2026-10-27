import re
import json

with open('apps/finch/extracted_arm64/lib/arm64-v8a/libapp.so', 'rb') as f:
    data = f.read()

nux_steps = [
    'intro_step', 'survey_step', 'wellness_survey_step', 'pick_egg_step',
    'hatch_egg', 'name_bird_step', 'pick_bird_pronouns_step',
    'pick_bird_personality_type_step', 'name_human_step',
    'intro_goal_step', 'recurring_goal_step', 'subscription_free_to_use_step',
    'quiz'
]

step_strings = {}
for step in nux_steps:
    pattern = step.encode()
    matches = []
    for m in re.finditer(pattern, data):
        start = max(0, m.start() - 300)
        end = min(len(data), m.end() + 600)
        chunk = data[start:end]
        texts = re.findall(rb'[\x20-\x7e\xc0-\xff]{5,}', chunk)
        for t in texts:
            try:
                s = t.decode('utf-8').strip()
                if len(s) > 4 and not s.startswith('_') and not s.startswith('package:'):
                    matches.append(s)
            except:
                pass
    step_strings[step] = list(set(matches))[:25]

with open('decompile_analysis/nux_step_strings.json', 'w', encoding='utf-8') as f:
    json.dump(step_strings, f, indent=2, ensure_ascii=False)

print("Saved NUX step strings!")
for k, v in step_strings.items():
    print(f"=== {k} ({len(v)}) ===")
    for s in v[:8]:
        print(" ", s)
