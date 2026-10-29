import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

with open('web/index.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

sections = re.findall(r'<section[^>]*id=["\']([^"\']+)["\']', html)
modals = re.findall(r'id=["\']([^"\']*(?:modal|drawer|dialog|popup|view)[^"\']*)["\']', html)
buttons = re.findall(r'<button[^>]*id=["\']([^"\']+)["\']', html)

print('Sections:', sections)
print('Modals/Views:', modals)
print('Buttons:', len(buttons))
