import os
import re

filepath = r'c:\Users\Studio\Documents\Antigravity\Hantamap.info\hantavirus tracker complete.md'
base_dir = r'c:\Users\Studio\Documents\Antigravity\Hantamap.info'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find headers like ### backend/requirements.txt
# followed by a code block ```type ... ```
pattern = r'### ([\w\d\-./]+)\s+```(?:[\w\d]+)?\n(.*?)```'
matches = re.findall(pattern, content, re.DOTALL)

print(f"Found {len(matches)} files.")

for path, code in matches:
    full_path = os.path.join(base_dir, path.strip())
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Wrote {full_path}")
