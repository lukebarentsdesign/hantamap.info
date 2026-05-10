import re

with open('frontend/src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('--bg:       #ffffff;', '--bg:       #08090c;')
css = css.replace('--bg2:      #f8fafc;', '--bg2:      #11131a;')
css = css.replace('--bg3:      #f1f5f9;', '--bg3:      #1a1d26;')
css = css.replace('--border:   #e2e8f0;', '--border:   #2a2f3a;')
css = css.replace('--border2:  #cbd5e1;', '--border2:  #3d4558;')
css = css.replace('--text:     #0f172a;', '--text:     #f1f5f9;')
css = css.replace('--text2:    #475569;', '--text2:    #94a3b8;')
css = css.replace('--text3:    #64748b;', '--text3:    #64748b;')
css = css.replace('--accent:   #c2410c;', '--accent:   #e85d3c;')
css = css.replace('--accent2:  #ea580c;', '--accent2:  #ff7656;')
css = css.replace('--amber:    #b45309;', '--amber:    #c98a2b;')
css = css.replace('--amber-d:  rgba(217, 119, 6, 0.05);', '--amber-d:  rgba(201, 138, 43, 0.1);')
css = css.replace('--green:    #15803d;', '--green:    #16a34a;')
css = css.replace('--green-t:  #16a34a;', '--green-t:  #22c55e;')
css = css.replace('--red-d:    rgba(220, 38, 38, 0.04);', '--red-d:    rgba(232, 93, 60, 0.1);')

css = re.sub(r"--mono:.*?;", "--mono:     'DM Mono', system-ui, sans-serif;", css)

with open('frontend/src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Done')
