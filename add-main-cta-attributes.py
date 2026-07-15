import os
import re

# Define CTAs to find and attribute mapping
# Each entry: (filepath, search_text, cta_id)
cta_updates = [
    # About page
    ('./about.html', 'BOOK A FREE', 'about_health_check', '/contact.html'),
    
    # Services landing and individual services
    ('./services/index.html', 'BOOK A FREE', 'services_landing_health_check', '#contact'),
    ('./services/business-continuity.html', 'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check', '#contact'),
    ('./services/firewall-network-security.html', 'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check', '#contact'),
    ('./services/managed-network-support.html', 'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check', '#contact'),
    ('./services/managed-wireless-lan.html', 'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check', '#contact'),
    ('./services/network-consultancy.html', 'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check', '#contact'),
    ('./services/network-design-deployment.html', 'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check', '#contact'),
    ('./services/network-installations.html', 'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check', '#contact'),
    ('./services/network-support.html', 'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check', '#contact'),
    ('./services/remote-access-vpn.html', 'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check', '#contact'),
    
    # Solutions
    ('./solutions/index.html', 'BOOK A NETWORK HEALTH CHECK', 'solutions_landing_health_check', '#contact'),
    ('./solutions/ai-ready-infrastructure.html', 'BOOK A NETWORK HEALTH CHECK', 'solution_hero_health_check', '/contact.html'),
    ('./solutions/cyber-security-review.html', 'BOOK A NETWORK HEALTH CHECK', 'solution_hero_health_check', '/contact.html'),
    ('./solutions/microsoft-365-network.html', 'BOOK A NETWORK HEALTH CHECK', 'solution_hero_health_check', '/contact.html'),
    ('./solutions/network-health-check.html', 'BOOK A NETWORK HEALTH CHECK', 'solution_hero_health_check', '/contact.html'),
]

os.chdir('/Users/navjotsinghhundal/Desktop/_Active/NetCon')

for filepath, search_text, cta_id, href in cta_updates:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f'File not found: {filepath}')
        continue
    
    original = content
    
    # Find <a> tags with href and search_text, add data-source-cta if not already present
    # Pattern: <a ...href="..."...>...search_text...</a>
    pattern = r'(<a[^>]*href="[^"]*' + re.escape(href.replace('#', '')) + r'[^"]*"[^>]*?)(\s*>([^<]*' + re.escape(search_text) + r'[^<]*)<)'
    
    # Check if data-source-cta already exists
    if re.search(pattern, content, re.IGNORECASE):
        # Check if it already has data-source-cta
        if f'data-source-cta="{cta_id}"' not in content:
            # Insert data-source-cta before the closing >
            replacement = r'\1 data-source-cta="' + cta_id + r'"\2'
            content = re.sub(pattern, replacement, content, flags=re.IGNORECASE, count=1)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated: {filepath}')
    else:
        print(f'No match found in: {filepath}')

print('\nDone!')
