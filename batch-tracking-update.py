import os
import re

dirs = ['services', 'solutions', 'industries', 'resources', 'resources/blog', 'case-studies']
count = 0

for d in dirs:
  if not os.path.isdir(d):
    continue
  for fname in os.listdir(d):
    if not fname.endswith('.html'):
      continue
    fpath = os.path.join(d, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
      content = f.read()
    
    if 'form-source-tracking' in content:
      continue
    
    original = content
    content = re.sub(
      r'(<div id="site-contact"></div>\s*\n\s*)<script src="/js/contact\.js"></script>',
      r'\1<script src="/js/form-source-tracking.js"></script>\n  <script src="/js/contact.js"></script>',
      content
    )
    
    is_different = not (content == original)
    if is_different:
      with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
      count = count + 1
      print(f'Updated: {fpath}')

print(f'Total: {count} files')
