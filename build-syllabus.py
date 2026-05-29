import re, json

with open('index.html', encoding='utf-8') as f:
    html = f.read()

topics_by_id = {}
for m in re.finditer(r"\{ id: '([^']+)', title: '([^']+)', type: '([^']+)', important: (true|false)", html):
    topics_by_id[m.group(1)] = {
        'title': m.group(2), 'type': m.group(3), 'important': m.group(4) == 'true'
    }

TOC = [
    ('s1', 1, 1, 'Year 1 — Semester 1', 'Foundation — start strong', [
        ('301', 'BE1', 'Business English I (Grammar)'),
        ('311', 'GEO', 'Commercial Geography'),
        ('321', 'SS', 'Study Skills'),
        ('331', 'ISL', 'Islamic Studies / Ethical Behavior'),
        ('341', 'ITB', 'Introduction to Business'),
        ('351', 'CAB', 'Computer Application in Business'),
    ]),
    ('s2', 1, 2, 'Year 1 — Semester 2', 'Communication and Pakistan context', [
        ('302', 'BE2', 'Business English II (Composition)'),
        ('312', 'MB', 'Money & Banking'),
        ('322', 'HI', 'History of Ideas'),
        ('332', 'PS', 'Pakistan Studies'),
        ('342', 'HB', 'Human Behavior'),
        ('352', 'MC', 'Mass Communication'),
    ]),
    ('s3', 2, 3, 'Year 2 — Semester 3', 'Logic, leadership, entrepreneurship', [
        ('401', 'LOG', 'Logic'),
        ('411', 'OCP', 'Oral Communication & Presentation Skills'),
        ('421', 'ENT', 'Entrepreneurship'),
        ('431', 'IR', 'International Relations'),
        ('441', 'LSR', 'Leadership and Social Responsibility'),
        ('451', 'SME', 'Small & Medium Enterprise (SME)'),
    ]),
    ('s4', 2, 4, 'Year 2 — Semester 4', 'Ethics, e-business, accounting base', [
        ('402', 'EB', 'E Business'),
        ('412', 'BECG', 'Business Ethics and Corporate Governance'),
        ('422', 'PP', 'Public Policy'),
        ('432', 'SC', 'Speech Communication'),
        ('442', 'CD', 'Community Development'),
        ('452', 'PA', 'Principles of Accounting'),
    ]),
    ('s5', 3, 5, 'Year 3 — Semester 5', 'Core papers — priority semester', [
        ('501', 'FA', 'Financial Accounting'),
        ('511', 'MATH', 'Basic Mathematics'),
        ('521', 'ECON', 'Micro Economics'),
        ('531', 'MGT', 'Principles of Management'),
        ('541', 'MKT', 'Principles of Marketing'),
        ('551', 'COMM', 'Business Communication'),
    ]),
    ('s6', 3, 6, 'Year 3 — Semester 6', 'Macro, finance, stats, HRM', [
        ('502', 'MAC', 'Macro Economics'),
        ('512', 'BF', 'Introduction to Business Finance'),
        ('522', 'CMA', 'Cost & Managerial Accounting'),
        ('532', 'STAT', 'Statistics'),
        ('542', 'POM', 'Production & Operation Management'),
        ('552', 'HRM', 'Human Resource Management'),
    ]),
    ('s7', 4, 7, 'Year 4 — Semester 7', 'Advanced specialization', [
        ('601', 'FM', 'Financial Management'),
        ('611', 'MA', 'Managerial Accounting'),
        ('621', 'MM', 'Marketing Management'),
        ('631', 'PDF', 'Project Development, Evaluation and Feasibility'),
        ('641', 'BRM', 'Business Research Methods'),
        ('651', 'BLR', 'Business Law and Regulations'),
    ]),
    ('s8', 4, 8, 'Year 4 — Semester 8', 'Strategy + electives — graduation', [
        ('602', 'SCM', 'Supply Chain Management'),
        ('612', 'CPP', 'Corporate Performance and Planning'),
        ('622', 'IB', 'International Business'),
        ('632', 'SM', 'Strategic Management'),
        ('el1', 'EL1', 'Elective I'),
        ('el2', 'EL2', 'Elective II'),
    ]),
]

S5_PREFIX = {'501': 'fa', '511': 'math', '521': 'econ', '531': 'mgt', '541': 'mkt', '551': 'comm'}


def generic_topics(name, prefix):
    items = [
        ('Syllabus units (KU PDF)', True, 'theory'),
        ('Midterm preparation', True, 'theory'),
        ('Final exam preparation', True, 'theory'),
        ('Past papers (3+ years)', True, 'theory'),
        ('Key definitions & short notes', False, 'theory'),
    ]
    out = []
    for i, (title, imp, typ) in enumerate(items, 1):
        tid = f'{prefix}-{i}'
        q = name.replace(' ', '+')
        out.append({
            'id': tid, 'title': title, 'type': typ, 'important': imp,
            'yt': f'https://www.youtube.com/results?search_query={q}+urdu+BBA+lecture',
            'pdf': f'https://www.google.com/search?q={q}+KU+BBA+notes+PDF'
        })
    return out


def get_s5_topics(code):
    prefix = S5_PREFIX[code]
    topics = []
    for tid, data in sorted(topics_by_id.items()):
        if tid.startswith(prefix + '-'):
            q = data['title'].replace(' ', '+')
            topics.append({
                'id': tid, 'title': data['title'], 'type': data['type'],
                'important': data['important'],
                'yt': f'https://www.youtube.com/results?search_query={q}+urdu+BBA',
                'pdf': f'https://www.google.com/search?q={q}+PDF+notes+BBA'
            })
    return topics


program = {
    'university': 'Karachi University Business School',
    'program': 'BS(BBA) Four Years — 144 Credit Hours',
    'totalCredits': 144,
    'totalCourses': 48,
    'electives': {
        'mkt': [
            {'code': 'BA-BS-MKT-642', 'name': 'Global Marketing'},
            {'code': 'BA-BS-MBM-652', 'name': 'Brand Marketing'}
        ],
        'fin': [
            {'code': 'BA-BS-FIN-662', 'name': 'Corporate Finance'},
            {'code': 'BA-BS-FIN-672', 'name': 'Treasury & Fund Management'}
        ],
        'hrm': [
            {'code': 'BA-BS-HRM-682', 'name': 'Leading & Team Work'},
            {'code': 'BA-BS-HRM-692', 'name': 'Talent Management'}
        ]
    },
    'semesters': []
}

for sid, year, sem, label, tip, courses in TOC:
    sem_obj = {
        'id': sid, 'year': year, 'semester': sem,
        'label': label, 'tip': tip, 'courses': []
    }
    for code, short, name in courses:
        prefix = f'{sid}-{short.lower()}'
        if sid == 's5' and code in S5_PREFIX:
            topics = get_s5_topics(code)
        else:
            topics = generic_topics(name, prefix)
        sem_obj['courses'].append({
            'id': prefix,
            'code': short,
            'name': name,
            'courseCode': f'BA-BS-{code}' if not code.startswith('el') else 'Elective',
            'credits': 3,
            'topics': topics
        })
    program['semesters'].append(sem_obj)

with open('syllabus-data.js', 'w', encoding='utf-8') as f:
    f.write('/* KU BS(BBA) full program */\nconst BBA_PROGRAM = ')
    json.dump(program, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print('OK', sum(len(s['courses']) for s in program['semesters']), 'courses')
