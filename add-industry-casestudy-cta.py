import os
import re

# Industries and case studies
cta_updates = [
    # Industries
    ('./industries/financial-services.html', 'Book a Network Health Check', 'industry_health_check', '/contact.html'),
    ('./industries/healthcare-clinics.html', 'Book a Network Health Check', 'industry_health_check', '/contact.html'),
    ('./industries/internal-it-teams.html', 'Book a Network Health Check', 'industry_health_check', '/contact.html'),
    ('./industries/legal-firms.html', 'Book a Network Health Check', 'industry_health_check', '/contact.html'),
    ('./industries/manufacturing.html', 'Book a Network Health Check', 'industry_health_check', '/contact.html'),
    ('./industries/multi-site-businesses.html', 'Book a Network Health Check', 'industry_health_check', '/contact.html'),
    ('./industries/professional-services.html', 'Book a Network Health Check', 'industry_health_check', '/contact.html'),
    ('./industries/recruitment-agencies.html', 'Book a Network Health Check', 'industry_health_check', '/contact.html'),
    ('./industries/index.html', 'Book a Network Health Check', 'industry_health_check', '#contact'),
    
    # Case studies
    ('./case-studies/antal-international.html', 'Book Your Network Assessment', 'case_study_detail_assessment', '/contact.html'),
    ('./case-studies/auriga-networks.html', 'Book Your Network Assessment', 'case_study_detail_assessment', '/contact.html'),
    ('./case-studies/harry-dobbs-design.html', 'Book Your Network Assessment', 'case_study_detail_assessment', '/contact.html'),
    ('./case-studies/nta-core-network-upgrade.html', 'Book Your Network Assessment', 'case_study_detail_assessment', '/contact.html'),
    ('./case-studies/senate-computers.html', 'Book Your Network Assessment', 'case_study_detail_assessment', '/contact.html'),
    ('./case-studies/index.html', 'Book Your Network Assessment', 'case_studies_assessment', '/contact.html'),
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
    
    # Pattern to find <a> tags with the specific href and text
    href_part = re.escape(href.replace('#', '').replace('.html', ''))
    pattern = r'(<a[^>]*href="[^"]*' + href_part + r'[^"]*"[^>]*?)(\s*>([^<]*' + re.escape(search_text) + r'[^<]*)<)'
    
    if re.search(pattern, content, re.IGNORECASE):
        if f'data-source-cta="{cta_id}"' not in content:
            replacement = r'\1 data-source-cta="' + cta_id + r'"\2'
            content = re.sub(pattern, replacement, content, flags=re.IGNORECASE, count=1)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated: {filepath}')
    else:
        # Try alternative pattern - looser matching
        alt_pattern = r'(<a[^>]*href="[^"]*' + href_part + r'[^"]*"[^>]*?>)([^<]*' + re.escape(search_text) + r'[^<]*?<)'
        if re.search(alt_pattern, content, re.IGNORECASE):
            if f'data-source-cta="{cta_id}"' not in content:
                replacement = r'\1 data-source-cta="' + cta_id + r'">\2'
                content = re.sub(alt_pattern, replacement, content, flags=re.IGNORECASE, count=1)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated (alt): {filepath}')
            else:
                print(f'Already has attribute: {filepath}')
        else:
            print(f'No match: {filepath}')

print('\nDone!')
