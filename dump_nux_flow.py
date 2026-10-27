import re

with open('apps/finch/extracted_arm64/lib/arm64-v8a/libapp.so', 'rb') as f:
    data = f.read()

# Find all screen files
packages = set(re.findall(rb'package:finch/screen/[a-zA-Z0-9_\/]+\.dart', data))
nux_screens = []
for p in sorted(list(packages)):
    s = p.decode('utf-8')
    low = s.lower()
    if any(k in low for k in ['nux', 'onboard', 'quiz', 'survey', 'hatch', 'welcome', 'egg']):
        nux_screens.append(s)

print(f"Total NUX/Onboarding screens found: {len(nux_screens)}")
for s in nux_screens:
    print(" ", s)
