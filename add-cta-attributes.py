import os
import re

# CTA pattern mapping based on file location and content
# Format: (file_pattern, text_pattern, cta_id)
cta_patterns = [
    # Home page CTAs
    (r'^./index\.html$', r'BOOK A FREE NETWORK HEALTH CHECK', 'hero_health_check'),
    (r'^./index\.html$', r'Get Expert Insight', 'solutions_panel_cta'),
    (r'^./index\.html$', r'Get a Free Network Assessment', 'scroll_banner_assessment'),
    
    # About page CTAs
    (r'^./about\.html$', r'BOOK A FREE NETWORK HEALTH CHECK', 'about_health_check'),
    (r'^./about\.html$', r'Get To Know More', 'about_consultation_cta'),
    
    # Services landing
    (r'^./services/index\.html$', r'BOOK A FREE NETWORK HEALTH CHECK', 'services_landing_health_check'),
    (r'^./services/index\.html$', r'REQUEST A CONSULTANCY BAND', 'services_landing_request_band'),
    
    # Individual service pages
    (r'^./services/[^/]+\.html$', r'BOOK A NETWORK HEALTH CHECK', 'service_hero_health_check'),
    (r'^./services/[^/]+\.html$', r'REQUEST A BAND', 'service_cta_band_request'),
    (r'^./services/[^/]+\.html$', r'REQUEST CONSULTANCY', 'service_cta_band_request'),
    
    # Solutions landing
    (r'^./solutions/index\.html$', r'BOOK A NETWORK HEALTH CHECK', 'solutions_landing_health_check'),
    (r'^./solutions/index\.html$', r'Book Your Network Assessment', 'solutions_landing_assessment'),
    
    # Individual solution pages
    (r'^./solutions/[^/]+\.html$', r'BOOK A NETWORK HEALTH CHECK', 'solution_hero_health_check'),
    (r'^./solutions/network-health-check\.html$', r'Book a Network Health Check', 'solution_secondary_health_check'),
    (r'^./solutions/cyber-security-review\.html$', r'Get a Security Assessment', 'solution_secondary_review'),
    (r'^./solutions/microsoft-365-network\.html$', r'Assess Microsoft 365 Readiness', 'solution_secondary_readiness'),
    (r'^./solutions/ai-ready-infrastructure\.html$', r'Get a Network Security Review', 'solution_secondary_review'),
    
    # Industries
    (r'^./industries/[^/]+\.html$', r'Book a Network Health Check', 'industry_health_check'),
    (r'^./industries/[^/]+\.html$', r'Get In Touch', 'industry_get_in_touch'),
    
    # Case studies
    (r'^./case-studies/index\.html$', r'Book Your Network Assessment', 'case_studies_assessment'),
    (r'^./case-studies/[^/]+\.html$', r'Book Your Network Assessment', 'case_study_detail_assessment'),
    (r'^./case-studies/[^/]+\.html$', r'REQUEST A CONSULTATION', 'case_studies_consultation'),
    
    # Blog
    (r'^./resources/blog/[^/]+\.html$', r'REQUEST A CONSULTATION', 'blog_consultation'),
    (r'^./resources/blog/[^/]+\.html$', r'Get Expert Guidance', 'blog_consultation'),
    
    # Downloads
    (r'^./resources/downloads\.html$', r'Download', 'downloads_inline_contact'),
]

def find_and_tag_ctas():
    root = '/Users/navjotsinghhundal/Desktop/_Active/NetCon'
    updated_count = 0
    
    for root_dir, dirs, files in os.walk(root):
        # Skip non-relevant directories
        dirs[:] = [d for d in dirs if d not in ['.git', '__pycache__', 'node_modules', '.vercel']]
        
        for fname in files:
            if not fname.endswith('.html'):
                continue
            
            filepath = os.path.join(root_dir, fname)
            rel_path = os.path.relpath(filepath, root)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except:
                continue
            
            original = content
            modified = False
            
            # Try each CTA pattern
            for file_pattern, text_pattern, cta_id in cta_patterns:
                if not re.match(file_pattern, rel_path):
                    continue
                
                # Look for links/buttons with this text
                # Pattern: find <a or <button with href or onclick containing contact, with the text
                patterns_to_try = [
                    # <a href="/contact.html" ...>Text</a>
                    (r'(<a[^>]*href="[^"]*contact[^"]*"[^>]*)>(' + re.escape(text_pattern) + r')<', 
                     r'\1 data-source-cta="' + cta_id + r'">' + r'\2' + '<'),
                    # <a href="/contact.html" ...>..Text..</a>
                    (r'(<a[^>]*href="[^"]*contact[^"]*"[^>]*)>([^<]*' + re.escape(text_pattern) + r'[^<]*)<',
                     r'\1 data-source-cta="' + cta_id + r'">' + r'\2' + '<'),
                    # For buttons without href but with contact context
                    (r'(<button[^>]*[^>]*)>([^<]*' + re.escape(text_pattern) + r'[^<]*)<',
                     r'\1 data-source-cta="' + cta_id + r'">' + r'\2' + '<'),
                ]
                
                for pattern, replacement in patterns_to_try:
                    if re.search(pattern, content, re.IGNORECASE):
                        new_content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
                        if new_content != content and 'data-source-cta="' in new_content:
                            content = new_content
                            modified = True
                            break
            
            if modified and content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_count += 1
                print(f'Updated: {rel_path}')
    
    print(f'\nTotal files updated: {updated_count}')

find_and_tag_ctas()
