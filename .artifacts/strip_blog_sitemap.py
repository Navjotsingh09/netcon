import re

src = open('sitemap.xml').read()
parts = re.split(r'(<url>.*?</url>\s*)', src, flags=re.S)
out = ''.join(p for p in parts if '/resources/blog' not in p)
open('sitemap.xml', 'w').write(out)
print('blog urls left:', out.count('/resources/blog'))
