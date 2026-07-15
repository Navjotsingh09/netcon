import os
import re

# Secondary CTAs (buttons that are not the main hero CTA)
secondary_ctas = [
    # Solutions secondary CTAs
    ('./solutions/ai-ready-infrastructure.html', 'Get a Network Security Review', 'solution_secondary_review', '/contact.html'),
    ('./solutions/cyber-security-review.html', 'Get a Security Assessment', 'solution_secondary_review', '/contact.html'),
    ('./solutions/microsoft-365-network.html', 'Assess Microsoft 365 Readiness', 'solution_secondary_readiness', '/contact.html'),
    ('./solutions/network-health-check.html', 'Book a Network Health Check', 'solution_secondary_health_check', '/contact.html'),
]

os.chdir('/Users/navjotsinghhundal/Desktop/_Active/NetCon')

for filepath, search_text, cta_id, href in secondary_ctas:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f'File not found: {filepath}')
        continue
    
    original = content
    
    # Find links with search_text that aren't already marked  
    # Use a looser pattern to match various whitespace/formatting
    pattern = r'(<a[^>]*href="[^"]*' + re.escape(href.replace('.html', '')) + r'[^"]*"[^>]*class="[^"]*btn[^"]*"[^>]*?)([^>]*>)([^<]*' + re.escape(search_text) + r'[^<]*<)'
    
    match = re.search(pattern, content, re.IGNORECASE)
    
    if not match:
        # Try simpler pattern
        pattern = r'(<a[^>]*href="[^"]*' + re.escape(href.replace('.html', '')) + r'[^"]*"[^>]*>)([^<]*' + re.escape(search_text) + r'[^<]*<)'
        match = re.search(pattern, content, re.IGNORECASE)
    
    if match:
        # Check if already has data-source-cta
        if f'data-source-cta="{cta_id}"' not in content:
            # Insert data-source-cta
            replacement = r'\1 data-source-cta="' + cta_id + r'"\2'
            content = re.sub(pattern, replacement, content, flags=re.IGNORECASE, count=1)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated: {filepath} - added {cta_id}')
        else:
            print(f'Already has {cta_id}: {filepath}')
    else:
        print(f'No match for "{search_text}" in {filepath}')

print('\nDone!')
