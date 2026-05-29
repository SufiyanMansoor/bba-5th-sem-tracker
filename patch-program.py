from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = text.index('    const SUBJECTS = [')
end = text.index('    SUBJECTS.forEach(s => {', start)

replacement = r'''    const CURRENT_SEM_KEY = 'bba_current_sem_v1';
    const FREE_BOOKS_BY_CODE = {
      FA: FREE_BOOKS.fa, MATH: FREE_BOOKS.math, ECON: FREE_BOOKS.econ,
      MGT: FREE_BOOKS.mgt, MKT: FREE_BOOKS.mkt, COMM: FREE_BOOKS.comm
    };
    const PAPER_BY_CODE = {
      FA: 'fa', MATH: 'math', ECON: 'econ', MGT: 'mgt', MKT: 'mkt', COMM: 'comm',
      MAC: 'econ', BF: 'fa', CMA: 'fa', STAT: 'math', POM: 'mgt', HRM: 'mgt',
      FM: 'fa', MA: 'fa', MM: 'mkt', PDF: 'mgt', BRM: 'mgt', BLR: 'comm',
      SCM: 'mgt', CPP: 'fa', IB: 'mkt', SM: 'mgt'
    };

    let activeSemesterId = localStorage.getItem(CURRENT_SEM_KEY) || 's5';
    let SUBJECTS = [];
    let viewMode = 'course';

    function getSemester(id) {
      return BBA_PROGRAM.semesters.find(s => s.id === id) || BBA_PROGRAM.semesters[4];
    }

    function syncSubjects() {
      const sem = getSemester(activeSemesterId);
      SUBJECTS = sem.courses;
      SUBJECTS.forEach(s => {
        s.freeBook = FREE_BOOKS_BY_CODE[s.code] || null;
        s.topics.forEach(t => {
          if (FREE_TOPIC_PDF[t.id]) t.pdf = FREE_TOPIC_PDF[t.id];
        });
      });
      if (!activeSubjectId || !SUBJECTS.find(c => c.id === activeSubjectId)) {
        activeSubjectId = SUBJECTS[0]?.id;
      }
    }

    function getAllProgramTopics() {
      const topics = [];
      BBA_PROGRAM.semesters.forEach(sem => {
        sem.courses.forEach(c => c.topics.forEach(t => topics.push({ ...t, course: c, sem })));
      });
      return topics;
    }

    function getPaperTemplate(subject) {
      const key = PAPER_BY_CODE[subject.code] || 'mgt';
      return PAPER_TEMPLATES[key] || PAPER_TEMPLATES.mgt;
    }

    function switchSemester(semId) {
      activeSemesterId = semId;
      localStorage.setItem(CURRENT_SEM_KEY, semId);
      syncSubjects();
      viewMode = 'semester';
      renderSidebar();
      renderSemesterDashboard();
      updateSidebarProgress();
      closeSidebar();
    }

    function renderSemesterDashboard() {
      viewMode = 'semester';
      const sem = getSemester(activeSemesterId);
      const total = sem.courses.reduce((s, c) => s + c.topics.length, 0);
      const done = sem.courses.reduce((s, c) => s + getDoneCount(c.topics), 0);
      const pct = total ? Math.round((done / total) * 100) : 0;

      document.getElementById('subjectHeader').innerHTML = `
        <h2>${escapeHtml(sem.label)}</h2>
        <p class="sem-tip">${escapeHtml(sem.tip)}</p>
        <div class="subject-meta">
          <span>${sem.courses.length} Courses</span>
          <span>${total} Topics</span>
          <span class="countdown-badge">${pct}% this semester</span>
        </div>
        <div class="paper-clear-steps">
          <h3>📋 Paper clear roadmap — is semester ke liye</h3>
          <ol>
            <li><strong>Har subject</strong> kholo → syllabus topics check karo</li>
            <li><strong>YouTube + Free PDF</strong> se parho</li>
            <li><strong>Past papers</strong> log karo (📋 Past button)</li>
            <li><strong>Mock paper</strong> + timed exam practice</li>
            <li><strong>Exam date</strong> set karo — countdown dekho</li>
          </ol>
        </div>
      `;

      document.getElementById('statsRow').innerHTML = `
        <div class="stat-card"><div class="value">${BBA_PROGRAM.totalCourses}</div><div class="label">Total Courses (Degree)</div></div>
        <div class="stat-card"><div class="value done">${getOverallPct()}%</div><div class="label">Degree Progress</div></div>
        <div class="stat-card"><div class="value remaining">${total - done}</div><div class="label">Topics Left (Sem)</div></div>
      `;

      document.getElementById('toolsSection').innerHTML = '';
      document.getElementById('aiSection').innerHTML = '';

      document.getElementById('topicsContainer').innerHTML = `
        <h3 class="section-title">Subjects — click to open</h3>
        <div class="course-grid">${sem.courses.map(c => {
          const d = getDoneCount(c.topics);
          const t = c.topics.length;
          const cp = t ? Math.round((d / t) * 100) : 0;
          return `<button type="button" class="course-card" data-open-course="${c.id}">
            <span class="course-card-code">${c.code}</span>
            <span class="course-card-name">${escapeHtml(c.name)}</span>
            <span class="course-card-meta">${c.courseCode} · ${d}/${t} topics</span>
            <div class="mini-bar-wrap"><div class="mini-bar" style="width:${cp}%"></div></div>
          </button>`;
        }).join('')}</div>
        ${sem.id === 's8' ? renderElectivesHtml() : ''}
      `;

      document.querySelectorAll('[data-open-course]').forEach(btn => {
        btn.onclick = () => { viewMode = 'course'; switchSubject(btn.dataset.openCourse); };
      });
    }

    function renderElectivesHtml() {
      const e = BBA_PROGRAM.electives;
      return `<div class="free-books" style="margin-top:1.5rem">
        <h3>🎓 Semester 8 Electives (choose one specialization)</h3>
        <p><strong>Marketing:</strong> ${e.mkt.map(x => x.name).join(' · ')}</p>
        <p><strong>Finance:</strong> ${e.fin.map(x => x.name).join(' · ')}</p>
        <p><strong>HRM:</strong> ${e.hrm.map(x => x.name).join(' · ')}</p>
      </div>`;
    }

    syncSubjects();
    '''

text = text[:start] + replacement + text[end:]

# Update getTopicById
text = text.replace(
    '''    function getTopicById(topicId) {
      for (const s of SUBJECTS) {
        const t = s.topics.find(x => x.id === topicId);
        if (t) return { subject: s, topic: t };
      }
      return null;
    }''',
    '''    function getTopicById(topicId) {
      for (const sem of BBA_PROGRAM.semesters) {
        for (const s of sem.courses) {
          const t = s.topics.find(x => x.id === topicId);
          if (t) return { subject: s, topic: t, semester: sem };
        }
      }
      return null;
    }'''
)

text = text.replace(
    'function getTotalTopics() {\n      return SUBJECTS.reduce((sum, s) => sum + s.topics.length, 0);\n    }',
    'function getTotalTopics() {\n      return getAllProgramTopics().length;\n    }'
)

text = text.replace(
    '''    function getOverallPct() {
      const total = getTotalTopics();
      if (!total) return 0;
      const done = SUBJECTS.reduce((sum, s) => sum + getDoneCount(s.topics), 0);
      return Math.round((done / total) * 100);
    }''',
    '''    function getOverallPct() {
      const all = getAllProgramTopics();
      if (!all.length) return 0;
      const done = all.filter(x => isDone(x.id)).length;
      return Math.round((done / all.length) * 100);
    }'''
)

text = text.replace(
    'const tpl = PAPER_TEMPLATES[subject.id] || PAPER_TEMPLATES.fa;',
    'const tpl = getPaperTemplate(subject);'
)

text = text.replace(
    'const tpl = PAPER_TEMPLATES[subject.id] || PAPER_TEMPLATES.fa;\n      const important',
    'const tpl = getPaperTemplate(subject);\n      const important'
)

# Fix buildMockPaper and buildPaperAiPrompt - second occurrence
text = text.replace('PAPER_TEMPLATES[subject.id] || PAPER_TEMPLATES.fa', 'getPaperTemplate(subject)')

# renderSidebar update
old_sidebar = '''    function renderSidebar() {
      const nav = document.getElementById('subjectNav');
      nav.innerHTML = SUBJECTS.map(s => `
        <li>
          <button type="button" data-subject="${s.id}" class="${s.id === activeSubjectId ? 'active' : ''}">
            <span class="subject-code">${s.code}</span>
            <span class="subject-name">${s.name}</span>
            <div class="mini-bar-wrap"><div class="mini-bar" data-bar="${s.id}"></div></div>
            <span class="mini-pct" data-pct="${s.id}">0%</span>
          </button>
        </li>
      `).join('');

      nav.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          switchSubject(btn.dataset.subject);
          closeSidebar();
        });
      });
    }'''

new_sidebar = '''    function renderSidebar() {
      const nav = document.getElementById('subjectNav');
      let html = '<li class="sem-picker-wrap"><label class="sem-picker-label">My semester</label><select id="semesterSelect" class="semester-select">';
      BBA_PROGRAM.semesters.forEach(s => {
        html += `<option value="${s.id}" ${s.id === activeSemesterId ? 'selected' : ''}>${s.label}</option>`;
      });
      html += '</select></li>';
      html += '<li><button type="button" class="sem-overview-btn" id="btnSemOverview">📊 Semester overview</button></li>';
      html += SUBJECTS.map(s => {
        const semPct = getSubjectPct(s);
        return `<li><button type="button" data-subject="${s.id}" class="${s.id === activeSubjectId && viewMode === 'course' ? 'active' : ''}">
            <span class="subject-code">${s.code}</span>
            <span class="subject-name">${s.name}</span>
            <div class="mini-bar-wrap"><div class="mini-bar" data-bar="${s.id}"></div></div>
            <span class="mini-pct" data-pct="${s.id}">${semPct}%</span>
          </button></li>`;
      }).join('');

      nav.innerHTML = html;
      document.getElementById('semesterSelect').onchange = e => switchSemester(e.target.value);
      document.getElementById('btnSemOverview').onclick = () => { renderSemesterDashboard(); closeSidebar(); };
      nav.querySelectorAll('[data-subject]').forEach(btn => {
        btn.addEventListener('click', () => { viewMode = 'course'; switchSubject(btn.dataset.subject); closeSidebar(); });
      });
    }'''

text = text.replace(old_sidebar, new_sidebar)

text = text.replace(
    'function switchSubject(subjectId) {\n      activeSubjectId = subjectId;\n      document.querySelectorAll(\'.subject-nav button\').forEach(btn => {\n        btn.classList.toggle(\'active\', btn.dataset.subject === subjectId);\n      });\n      renderSubject(subjectId);\n    }',
    'function switchSubject(subjectId) {\n      activeSubjectId = subjectId;\n      viewMode = \'course\';\n      document.querySelectorAll(\'.subject-nav button[data-subject]\').forEach(btn => {\n        btn.classList.toggle(\'active\', btn.dataset.subject === subjectId);\n      });\n      renderSubject(subjectId);\n    }'
)

text = text.replace(
    '<h1>BBA 5th Sem Tracker</h1>',
    '<h1>BBA Full Program</h1>'
)
text = text.replace(
    '<title>BBA 5th Sem Tracker — Karachi University</title>',
    '<title>BBA Full Program Tracker — KU 8 Semesters</title>'
)

# Add CSS for new components before @media print
css_add = '''
    .semester-select {
      width: 100%;
      padding: 0.5rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      color: #fff;
      font-family: inherit;
      margin-bottom: 0.5rem;
    }

    .sem-picker-label { font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.25rem; }

    .sem-overview-btn {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 0.75rem;
      background: rgba(59,130,246,0.25);
      border: 1px solid rgba(59,130,246,0.5);
      color: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.8rem;
    }

    .sem-tip { color: var(--text-muted); margin: 0.5rem 0 1rem; font-size: 0.9rem; }

    .paper-clear-steps {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
    }

    .paper-clear-steps h3 { font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--navy); }
    .paper-clear-steps ol { padding-left: 1.25rem; font-size: 0.85rem; color: var(--text-muted); }
    .paper-clear-steps li { margin-bottom: 0.35rem; }

    .course-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }

    .course-card {
      text-align: left;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: box-shadow var(--transition), border-color var(--transition);
      font-family: inherit;
    }

    .course-card:hover { border-color: var(--accent); box-shadow: 0 4px 12px rgba(59,130,246,0.12); }

    .course-card-code { font-family: Outfit, sans-serif; font-weight: 700; color: var(--accent); display: block; }
    .course-card-name { font-size: 0.85rem; color: var(--navy); display: block; margin: 0.35rem 0; line-height: 1.3; }
    .course-card-meta { font-size: 0.75rem; color: var(--text-muted); }

    .degree-badge {
      text-align: center;
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 0.5rem;
    }
'''

text = text.replace('    @media print {', css_add + '\n    @media print {')

# Add script tag for syllabus-data
text = text.replace(
    '  <script>\n    const STORAGE_KEY',
    '  <script src="syllabus-data.js"></script>\n  <script>\n    const STORAGE_KEY'
)

# Init - render semester dashboard or course
text = text.replace(
    '''    renderSidebar();
    updateSidebarProgress();
    requestAnimationFrame(() => {
      updateSidebarProgress();
      renderSubject(activeSubjectId, false);
      if (window.initSmartFeatures) initSmartFeatures();
    });''',
    '''    renderSidebar();
    updateSidebarProgress();
    requestAnimationFrame(() => {
      updateSidebarProgress();
      if (viewMode === 'semester') renderSemesterDashboard();
      else renderSubject(activeSubjectId, false);
      if (window.initSmartFeatures) initSmartFeatures();
    });'''
)

# updateSidebarProgress for all courses in program
text = text.replace(
    '''      SUBJECTS.forEach(subject => {
        const bar = document.querySelector(`[data-bar="${subject.id}"]`);
        const label = document.querySelector(`[data-pct="${subject.id}"]`);
        const sp = getSubjectPct(subject);
        if (bar) bar.style.width = sp + '%';
        if (label) label.textContent = sp + '%';
      });''',
    '''      SUBJECTS.forEach(subject => {
        const bar = document.querySelector(`[data-bar="${subject.id}"]`);
        const label = document.querySelector(`[data-pct="${subject.id}"]`);
        const sp = getSubjectPct(subject);
        if (bar) bar.style.width = sp + '%';
        if (label) label.textContent = sp + '%';
      });
      const deg = document.getElementById('degreeBadge');
      if (deg) deg.textContent = `${getOverallPct()}% · ${BBA_PROGRAM.totalCourses} courses`;'''
)

text = text.replace(
    '<span class="label">Overall</span>',
    '<span class="label">Degree</span>\n            <span class="degree-badge" id="degreeBadge"></span>'
)

# FORMULA_SHEETS - extend keys by code
text = text.replace(
    "const hasFormula = !!FORMULA_SHEETS[subject.id];",
    "const hasFormula = !!FORMULA_SHEETS[subject.id] || !!FORMULA_SHEETS[PAPER_BY_CODE[subject.code]];"
)

text = text.replace(
    "document.getElementById('btnFormula').onclick = () => openFormulaModal(subject);",
    "document.getElementById('btnFormula').onclick = () => openFormulaModal(subject, PAPER_BY_CODE[subject.code] || subject.id);"
)

# openFormulaModal accept code key
text = text.replace(
    '''    function openFormulaModal(subject) {
      const html = FORMULA_SHEETS[subject.id];''',
    '''    function openFormulaModal(subject, sheetKey) {
      const html = FORMULA_SHEETS[sheetKey || subject.id];'''
)

path.write_text(text, encoding='utf-8')
print('patched index.html')
