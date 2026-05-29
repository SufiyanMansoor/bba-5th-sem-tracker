/* BBA All Semesters — extended smart features */
(function () {
  const SMART_KEY = 'bba5_smart_v1';
  const GUESS_IDS = [
    'fa-5','fa-6','fa-7','fa-8','fa-10','fa-2','fa-4',
    'math-3','math-4','math-6','math-8','math-9',
    'econ-1','econ-2','econ-5','econ-6','econ-7','econ-8',
    'mgt-3','mgt-4','mgt-5','mgt-6',
    'mkt-1','mkt-4','mkt-5','mkt-6','mkt-7','mkt-8',
    'comm-2','comm-3','comm-4','comm-7'
  ];

  const PAST_PAPER_LINKS = {
    fa: 'https://www.google.com/search?q=Karachi+University+BBA+financial+accounting+past+papers+PDF',
    math: 'https://www.google.com/search?q=KU+BBA+business+mathematics+past+papers',
    econ: 'https://www.google.com/search?q=KU+BBA+microeconomics+past+papers+PDF',
    mgt: 'https://www.google.com/search?q=KU+BBA+principles+of+management+past+papers',
    mkt: 'https://www.google.com/search?q=KU+BBA+marketing+past+papers+PDF',
    comm: 'https://www.google.com/search?q=KU+BBA+business+communication+past+papers'
  };

  let smart = loadSmart();
  let pomodoroTimer = null;
  let pomodoroSec = 25 * 60;
  let pomodoroMode = 'work';
  let sectionTimerInterval = null;
  let mockAnswerVisible = false;

  function A() { return window.BbaApp; }

  function loadSmart() {
    try {
      const raw = localStorage.getItem(SMART_KEY);
      return raw ? JSON.parse(raw) : defaultSmart();
    } catch { return defaultSmart(); }
  }

  function defaultSmart() {
    return {
      streak: { count: 0, lastDate: '' },
      notes: {},
      bookmarks: [],
      marks: {},
      mcq: {},
      settings: { dark: false, urdu: false, revisionOnly: false },
      pomodoro: { work: 25, break: 5 }
    };
  }

  function saveSmart() {
    localStorage.setItem(SMART_KEY, JSON.stringify(smart));
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function recordStudyToday() {
    const t = todayStr();
    if (smart.streak.lastDate === t) return;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toISOString().slice(0, 10);
    smart.streak.count = smart.streak.lastDate === yesterday ? smart.streak.count + 1 : 1;
    smart.streak.lastDate = t;
    saveSmart();
    updateStreakUI();
  }

  function updateStreakUI() {
    const el = document.getElementById('streakCount');
    if (el) el.textContent = smart.streak.count;
  }

  function applyDarkMode() {
    document.documentElement.setAttribute('data-theme', smart.settings.dark ? 'dark' : 'light');
    const btn = document.getElementById('btnDarkMode');
    if (btn) btn.textContent = smart.settings.dark ? '☀️ Light' : '🌙 Dark';
  }

  function getTopicTitle(topic) {
    if (smart.settings.urdu && topic.urdu) return topic.urdu;
    return topic.title;
  }

  function isBookmarked(id) { return smart.bookmarks.includes(id); }

  function toggleBookmark(id) {
    const i = smart.bookmarks.indexOf(id);
    if (i >= 0) smart.bookmarks.splice(i, 1);
    else smart.bookmarks.push(id);
    saveSmart();
    A().renderSubject(A().activeSubjectId, false);
  }

  function getNote(id) { return smart.notes[id] || ''; }

  function setNote(id, text) {
    if (text.trim()) smart.notes[id] = text.trim();
    else delete smart.notes[id];
    saveSmart();
  }

  function exportAllData() {
    const data = {
      progress: localStorage.getItem(A().STORAGE_KEY),
      pastPapers: localStorage.getItem(A().PAST_PAPER_KEY),
      examDates: localStorage.getItem(A().EXAM_DATES_KEY),
      timerMins: localStorage.getItem(A().TIMER_MINS_KEY),
      smart: localStorage.getItem(SMART_KEY),
      exported: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bba5-sem-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
    A().showToast('Backup downloaded');
  }

  function importAllData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.progress) localStorage.setItem(A().STORAGE_KEY, data.progress);
        if (data.pastPapers) localStorage.setItem(A().PAST_PAPER_KEY, data.pastPapers);
        if (data.examDates) localStorage.setItem(A().EXAM_DATES_KEY, data.examDates);
        if (data.timerMins) localStorage.setItem(A().TIMER_MINS_KEY, data.timerMins);
        if (data.smart) localStorage.setItem(SMART_KEY, data.smart);
        smart = loadSmart();
        location.reload();
      } catch {
        A().showToast('Invalid backup file');
      }
    };
    reader.readAsText(file);
  }

  function shareWhatsApp() {
    const pct = A().getOverallPct();
    const url = location.href.split('#')[0];
    const text = encodeURIComponent(
      `BBA All Semesters — study progress: ${pct}% complete!\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  function shareCompareLink() {
    const payload = btoa(JSON.stringify({
      n: 'Student',
      p: A().getOverallPct(),
      d: Object.keys(A().progress).length,
      t: Date.now()
    }));
    const url = `${location.href.split('#')[0]}#compare=${payload}`;
    navigator.clipboard.writeText(url).then(() => A().showToast('Compare link copied — send to friend'));
  }

  function parseCompareHash() {
    const m = location.hash.match(/compare=([A-Za-z0-9+/=]+)/);
    if (!m) return;
    try {
      const data = JSON.parse(atob(m[1]));
      const box = document.getElementById('compareResult');
      if (box) {
        box.innerHTML = `<strong>Friend progress:</strong> ${data.p}% (${data.d} topics done) · You: ${A().getOverallPct()}%`;
        box.style.display = 'block';
      }
    } catch (_) {}
  }

  function buildWeeklyPlan() {
    const items = A().SUBJECTS.map(s => {
      const days = A().getDaysUntilExam(s.id);
      const rem = s.topics.filter(t => !A().isDone(t.id)).length;
      return { s, days, rem };
    }).filter(x => x.rem > 0);

    if (!items.length) return '<p>All topics done — great job!</p>';

    const withExam = items.filter(x => x.days !== null && x.days > 0);
    if (!withExam.length) {
      return '<p>Set <strong>exam dates</strong> per subject for auto weekly plan. Until then, study 2 topics/day per subject:</p><ul>' +
        items.map(x => `<li><strong>${x.s.code}</strong>: 2 topics/day (${x.rem} left)</li>`).join('') + '</ul>';
    }

    const totalDays = Math.max(...withExam.map(x => x.days));
    let html = '<ol class="weekly-plan">';
    for (let d = 1; d <= Math.min(totalDays, 14); d++) {
      const daySubjects = withExam.filter((_, i) => (d + i) % withExam.length < Math.ceil(withExam.length / 2) || d <= 3);
      const picks = [];
      daySubjects.slice(0, 2).forEach(({ s }) => {
        const pending = s.topics.filter(t => !A().isDone(t.id));
        if (pending.length) picks.push(`${s.code}: ${pending[(d - 1) % pending.length].title.slice(0, 40)}…`);
      });
      if (picks.length) html += `<li><strong>Day ${d}</strong> — ${picks.join(' · ')}</li>`;
    }
    html += '</ol><p style="font-size:0.8rem;color:var(--text-muted)">Adjust based on your exam timetable.</p>';
    return html;
  }

  function getRevisionTopics(subject) {
    return subject.topics.filter(t =>
      t.important || A().getPastCount(t.id) > 0 || isBookmarked(t.id) || GUESS_IDS.includes(t.id)
    );
  }

  function getMcqs(topic) {
    if (topic.mcqs) return topic.mcqs;
    return [
      {
        q: `Main focus of "${topic.title}" for BBA exam?`,
        opts: ['Core syllabus — theory/numerical', 'Not in exams', 'Only assignment', 'Optional reading'],
        a: 0
      },
      {
        q: `Best prep for "${topic.title}":`,
        opts: ['Notes + past paper practice', 'Skip entirely', 'Only YouTube', 'Memorize without understanding'],
        a: 0
      }
    ];
  }

  function openQuizModal(topicId) {
    const info = A().getTopicById(topicId);
    if (!info) return;
    const mcqs = getMcqs(info.topic);
    let html = `<p><strong>${A().escapeHtml(info.topic.title)}</strong></p>`;
    mcqs.forEach((m, i) => {
      html += `<div class="quiz-q" data-qi="${i}"><p>${i + 1}. ${A().escapeHtml(m.q)}</p><div class="quiz-opts">`;
      m.opts.forEach((opt, j) => {
        html += `<label><input type="radio" name="q${i}" value="${j}"> ${A().escapeHtml(opt)}</label>`;
      });
      html += '</div></div>';
    });
    A().openModal('MCQ Quiz', html,
      '<button type="button" class="btn btn-primary" id="btnSubmitQuiz">Check answers</button>');
    document.getElementById('btnSubmitQuiz').onclick = () => {
      let correct = 0;
      mcqs.forEach((m, i) => {
        const sel = document.querySelector(`input[name="q${i}"]:checked`);
        if (sel && parseInt(sel.value, 10) === m.a) correct++;
      });
      if (!smart.mcq[topicId]) smart.mcq[topicId] = { best: 0, attempts: 0 };
      smart.mcq[topicId].attempts++;
      if (correct > smart.mcq[topicId].best) smart.mcq[topicId].best = correct;
      saveSmart();
      recordStudyToday();
      A().showToast(`Score: ${correct}/${mcqs.length}`);
    };
  }

  function openRevisionMode(subject) {
    const topics = getRevisionTopics(subject).filter(t => !A().isDone(t.id));
    const list = topics.length ? topics : getRevisionTopics(subject);
    A().openModal(`Revision — ${subject.name}`,
      `<p>★ Important · past papers · guess paper · pinned (${list.length} topics)</p>
       <ul class="revision-list">${list.map(t =>
         `<li>${A().escapeHtml(t.title)} ${isBookmarked(t.id) ? '📌' : ''}</li>`
       ).join('')}</ul>`,
      '<button type="button" class="btn btn-primary" id="btnRevFlash">🃏 Flashcards</button>');
    document.getElementById('btnRevFlash').onclick = () => {
      A().closeModal();
      A().openFlashcardsModal(subject, 'important');
    };
  }

  function openGuessPaper() {
    const topics = [];
    GUESS_IDS.forEach(id => {
      const info = A().getTopicById(id);
      if (info) topics.push(info);
    });
    A().openModal('Guess Paper 2026 — High probability',
      `<p>Based on ★ important + typical KU BBA pattern (${topics.length} topics):</p>
       <ol>${topics.map(x => `<li><strong>${x.subject.code}</strong> — ${A().escapeHtml(x.topic.title)}</li>`).join('')}</ol>`,
      '<button type="button" class="btn btn-copy" id="btnGuessCopy">📋 Copy list</button>');
    document.getElementById('btnGuessCopy').onclick = () => {
      const text = topics.map(x => `${x.subject.code}: ${x.topic.title}`).join('\n');
      navigator.clipboard.writeText(text);
      A().showToast('Guess list copied');
    };
  }

  function speakText(text) {
    if (!window.speechSynthesis) { A().showToast('TTS not supported'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }

  function toggleMockAnswers() {
    mockAnswerVisible = !mockAnswerVisible;
    const el = document.getElementById('mockAnswerKey');
    if (el) el.style.display = mockAnswerVisible ? 'block' : 'none';
    const btn = document.getElementById('btnToggleAnswers');
    if (btn) btn.textContent = mockAnswerVisible ? 'Hide answer outline' : 'Show answer outline';
  }

  function appendMockAnswerKey(subject) {
    const body = document.getElementById('modalBody');
    if (!body || !body.querySelector('#printablePaper')) return;
    if (document.getElementById('mockAnswerKey')) return;
    const div = document.createElement('div');
    div.id = 'mockAnswerKey';
    div.style.display = 'none';
    div.className = 'mock-answer-key';
    div.innerHTML = `<h5>Answer outline (self-check / use Claude)</h5><ol>${
      subject.topics.filter(t => t.important).slice(0, 8).map(t =>
        `<li><strong>${A().escapeHtml(t.title)}</strong> — key points, formula if any, 1 example.</li>`
      ).join('')
    }</ol>`;
    body.appendChild(div);
    const footer = document.getElementById('modalFooter');
    if (footer && !document.getElementById('btnToggleAnswers')) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn';
      b.id = 'btnToggleAnswers';
      b.textContent = 'Show answer outline';
      b.onclick = toggleMockAnswers;
      footer.prepend(b);
    }
  }

  const SECTION_PHASES = [
    { name: 'MCQ section', mins: 30 },
    { name: 'Short questions', mins: 45 },
    { name: 'Long / Numerical', mins: 75 }
  ];
  let sectionPhase = 0;
  let sectionSecLeft = 0;

  function startSectionTimer() {
    stopSectionTimer();
    sectionPhase = 0;
    sectionSecLeft = SECTION_PHASES[0].mins * 60;
    updateSectionUI();
    sectionTimerInterval = setInterval(() => {
      sectionSecLeft--;
      if (sectionSecLeft <= 0) {
        sectionPhase++;
        if (sectionPhase >= SECTION_PHASES.length) {
          stopSectionTimer();
          A().showToast('All sections complete!');
          return;
        }
        sectionSecLeft = SECTION_PHASES[sectionPhase].mins * 60;
        A().showToast(`Next: ${SECTION_PHASES[sectionPhase].name}`);
      }
      updateSectionUI();
    }, 1000);
  }

  function stopSectionTimer() {
    if (sectionTimerInterval) clearInterval(sectionTimerInterval);
    sectionTimerInterval = null;
  }

  function updateSectionUI() {
    const el = document.getElementById('sectionTimerDisplay');
    if (!el) return;
    const ph = SECTION_PHASES[sectionPhase];
    const m = Math.floor(sectionSecLeft / 60);
    const s = sectionSecLeft % 60;
    el.textContent = `${ph.name}: ${m}:${String(s).padStart(2, '0')}`;
  }

  function updatePomodoroUI() {
    const el = document.getElementById('pomodoroDisplay');
    if (!el) return;
    const m = Math.floor(pomodoroSec / 60);
    const s = pomodoroSec % 60;
    el.textContent = `${pomodoroMode === 'work' ? 'Study' : 'Break'} ${m}:${String(s).padStart(2, '0')}`;
  }

  function startPomodoro() {
    if (pomodoroTimer) clearInterval(pomodoroTimer);
    pomodoroMode = 'work';
    pomodoroSec = (smart.pomodoro.work || 25) * 60;
    document.getElementById('pomodoroWidget').classList.remove('hidden');
    updatePomodoroUI();
    pomodoroTimer = setInterval(() => {
      pomodoroSec--;
      if (pomodoroSec <= 0) {
        if (pomodoroMode === 'work') {
          pomodoroMode = 'break';
          pomodoroSec = (smart.pomodoro.break || 5) * 60;
          A().showToast('Break time!');
        } else {
          pomodoroMode = 'work';
          pomodoroSec = (smart.pomodoro.work || 25) * 60;
          recordStudyToday();
          A().showToast('Back to study!');
        }
      }
      updatePomodoroUI();
    }, 1000);
  }

  function stopPomodoro() {
    if (pomodoroTimer) clearInterval(pomodoroTimer);
    pomodoroTimer = null;
    document.getElementById('pomodoroWidget').classList.add('hidden');
  }

  async function enableNotifications() {
    if (!('Notification' in window)) { A().showToast('Notifications not supported'); return; }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { A().showToast('Notifications blocked'); return; }
    A().SUBJECTS.forEach(s => {
      const days = A().getDaysUntilExam(s.id);
      if (days !== null && days >= 0 && days <= 7) {
        new Notification('BBA All Semesters — Exam Soon', {
          body: `${s.name} exam in ${days} day(s)!`,
          icon: 'https://sufiyanmansoor.github.io/bba-all-semesters/favicon.ico'
        });
      }
    });
    A().showToast('Exam reminders checked');
  }

  function renderSmartHub() {
    const panel = document.getElementById('smartHubPanel');
    const main = document.getElementById('contentArea');
    if (!panel) return;
    const show = panel.classList.toggle('active');
    if (show) {
      main.style.display = 'none';
      panel.style.display = 'block';
      panel.innerHTML = `
        <div class="smart-hub-shell">
          <div class="smart-hub-head">
            <div>
              <h2 class="font-heading" style="font-size:1.5rem;color:var(--navy);margin:0">⚡ Smart Hub</h2>
              <p>Exam planning, marks, backup — sab ek jagah. Neeche har tool ka short faida likha hai.</p>
            </div>
            <button type="button" class="btn btn-primary" id="hubClose">← Dashboard</button>
          </div>
          <div id="compareResult" style="display:none;padding:0.75rem;background:#eff6ff;border-radius:8px;margin-bottom:1rem"></div>
          <div class="hub-grid">
            <div class="hub-card"><h4>📅 Weekly plan</h4>
              <p style="color:var(--text-muted);font-size:0.8rem">Baqi topics ÷ din — roz kitna parhna hai, auto suggest.</p>
              ${buildWeeklyPlan()}
            </div>
            <div class="hub-card"><h4>🎯 Guess paper 2026</h4>
              <p style="color:var(--text-muted);font-size:0.8rem">${GUESS_IDS.length} topics jo aksar paper / quiz mein aate hain.</p>
              <div class="hub-actions"><button type="button" class="btn btn-primary" id="hubGuess">View list</button></div>
            </div>
            <div class="hub-card"><h4>📊 Exam marks log</h4>
              <p style="color:var(--text-muted);font-size:0.8rem">Mid / Final marks save — weak subject identify karo.</p>
              ${A().SUBJECTS.map(s => {
                const m = smart.marks[s.id] || {};
                return `<div class="marks-row"><span>${s.code}</span>
                  Mid <input type="number" data-mid="${s.id}" value="${m.mid ?? ''}" placeholder="—" min="0" max="100">
                  Final <input type="number" data-fin="${s.id}" value="${m.final ?? ''}" placeholder="—" min="0" max="100"></div>`;
              }).join('')}
              <div class="hub-actions"><button type="button" class="btn btn-primary" id="hubSaveMarks">Save marks</button></div>
            </div>
            <div class="hub-card"><h4>💾 Backup & share</h4>
              <p style="color:var(--text-muted);font-size:0.8rem">Phone change? JSON export. Dosto se progress compare.</p>
              <div class="hub-actions">
                <button type="button" class="btn" id="hubExport">Export JSON</button>
                <button type="button" class="btn" id="hubImport">Import JSON</button>
                <input type="file" id="hubImportFile" accept=".json" hidden>
                <button type="button" class="btn" id="hubWhatsApp">WhatsApp</button>
                <button type="button" class="btn" id="hubCompare">Compare</button>
              </div>
            </div>
            <div class="hub-card"><h4>🍅 Pomodoro</h4>
              <p style="color:var(--text-muted);font-size:0.8rem">Focus blocks — ${smart.pomodoro.work}m study, ${smart.pomodoro.break}m break.</p>
              <div class="hub-actions"><button type="button" class="btn btn-primary" id="hubPomodoro">Start</button></div>
            </div>
            <div class="hub-card"><h4>🔔 Notifications</h4>
              <p style="color:var(--text-muted);font-size:0.8rem">Exam date ke qareeb reminder (browser allow karein).</p>
              <div class="hub-actions"><button type="button" class="btn" id="hubNotify">Check reminders</button></div>
            </div>
            <div class="hub-card"><h4>📁 Past papers search</h4>
              <p style="color:var(--text-muted);font-size:0.8rem">Google par KU past papers — har subject ek click.</p>
              <div class="hub-actions">
                ${A().SUBJECTS.map(s => `<a class="btn" href="${PAST_PAPER_LINKS[s.id] || '#'}" target="_blank" rel="noopener">${s.code}</a>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
      document.getElementById('hubGuess').onclick = openGuessPaper;
      document.getElementById('hubExport').onclick = exportAllData;
      document.getElementById('hubImport').onclick = () => document.getElementById('hubImportFile').click();
      document.getElementById('hubImportFile').onchange = e => { if (e.target.files[0]) importAllData(e.target.files[0]); };
      document.getElementById('hubWhatsApp').onclick = shareWhatsApp;
      document.getElementById('hubCompare').onclick = shareCompareLink;
      document.getElementById('hubPomodoro').onclick = startPomodoro;
      document.getElementById('hubNotify').onclick = enableNotifications;
      document.getElementById('hubSaveMarks').onclick = () => {
        A().SUBJECTS.forEach(s => {
          const mid = document.querySelector(`[data-mid="${s.id}"]`);
          const fin = document.querySelector(`[data-fin="${s.id}"]`);
          if (!smart.marks[s.id]) smart.marks[s.id] = {};
          if (mid.value) smart.marks[s.id].mid = parseInt(mid.value, 10);
          if (fin.value) smart.marks[s.id].final = parseInt(fin.value, 10);
        });
        saveSmart();
        A().showToast('Marks saved');
      };
      document.getElementById('hubClose').onclick = () => {
        panel.classList.remove('active');
        panel.style.display = 'none';
        main.style.display = '';
        if (A().viewMode === 'semester') A().renderSemesterDashboard();
        else A().renderSubject(A().activeSubjectId, false);
      };
      parseCompareHash();
    } else {
      main.style.display = '';
    }
  }

  function enhanceTopicCard(html, topic) {
    const pin = isBookmarked(topic.id) ? ' active' : '';
    const note = getNote(topic.id);
    const title = getTopicTitle(topic);
    const mcqScore = smart.mcq[topic.id];
    const scoreBadge = mcqScore ? `<span class="past-badge">Quiz ${mcqScore.best}/2</span>` : '';
    let out = html.replace(topic.title, title);
    const extra = `${scoreBadge}<button type="button" class="btn-pin${pin}" data-pin="${topic.id}" title="Pin">📌</button>
      <textarea class="topic-note" data-note="${topic.id}" placeholder="Your notes…" rows="2">${A().escapeHtml(note)}</textarea>
      <div class="topic-actions-extra">
        <button type="button" class="btn btn-past" data-quiz="${topic.id}">❓ Quiz</button>
        <button type="button" class="btn btn-past" data-speak="${topic.id}">🔊 Read</button>
      </div>`;
    return out.replace('<div class="topic-actions">', extra + '<div class="topic-actions">');
  }

  function bindTopicExtras() {
    document.querySelectorAll('[data-pin]').forEach(btn => {
      btn.onclick = e => { e.stopPropagation(); toggleBookmark(btn.dataset.pin); };
    });
    document.querySelectorAll('[data-quiz]').forEach(btn => {
      btn.onclick = () => { recordStudyToday(); openQuizModal(btn.dataset.quiz); };
    });
    document.querySelectorAll('[data-speak]').forEach(btn => {
      btn.onclick = () => {
        const info = A().getTopicById(btn.dataset.speak);
        if (info) speakText(getTopicTitle(info.topic));
      };
    });
    document.querySelectorAll('.topic-note').forEach(ta => {
      ta.onblur = () => setNote(ta.dataset.note, ta.value);
    });
  }

  function patchApp() {
    const app = A();
    const origRenderCard = app.renderTopicCard;
    app.renderTopicCard = function (topic) {
      if (smart.settings.revisionOnly) {
        const sub = app.SUBJECTS.find(s => s.id === app.activeSubjectId);
        if (sub && !getRevisionTopics(sub).some(t => t.id === topic.id)) return '';
      }
      return enhanceTopicCard(origRenderCard.call(app, topic), topic);
    };
    const origBind = app.bindTopicCheckboxes;
    app.bindTopicCheckboxes = function () {
      origBind.call(app);
      bindTopicExtras();
    };
    const origToggle = app.toggleTopic;
    app.toggleTopic = function (id) {
      origToggle.call(app, id);
      recordStudyToday();
    };
    const origOpenMock = app.openMockPaperModal;
    app.openMockPaperModal = function (subject) {
      mockAnswerVisible = false;
      origOpenMock.call(app, subject);
      setTimeout(() => appendMockAnswerKey(subject), 50);
    };
    const origTools = app.renderToolsSection;
    app.renderToolsSection = function (subject) {
      origTools.call(app, subject);
      const grid = document.querySelector('#toolsSection .tools-grid');
      if (grid && !document.getElementById('btnRevision')) {
        const extras = document.createElement('div');
        extras.className = 'tools-grid';
        extras.style.marginTop = '0.5rem';
        extras.innerHTML = `
          <button type="button" class="btn" id="btnRevision">🎯 Revision mode</button>
          <button type="button" class="btn" id="btnSectionTimer">⏱ Section timer</button>
          <span id="sectionTimerDisplay" style="font-size:0.85rem;font-weight:600"></span>
        `;
        document.getElementById('toolsSection').appendChild(extras);
        document.getElementById('btnRevision').onclick = () => openRevisionMode(subject);
        document.getElementById('btnSectionTimer').onclick = startSectionTimer;
      }
      if (!document.getElementById('toggleRevision')) {
        const row = document.createElement('label');
        row.className = 'revision-toggle';
        row.innerHTML = `<input type="checkbox" id="toggleRevision" ${smart.settings.revisionOnly ? 'checked' : ''}> Show only revision topics on page`;
        document.getElementById('toolsSection').prepend(row);
        document.getElementById('toggleRevision').onchange = e => {
          smart.settings.revisionOnly = e.target.checked;
          saveSmart();
          app.renderSubject(app.activeSubjectId, false);
        };
      }
    };
  }

  const URDU_TITLES = {
    'fa-5': 'انکم سٹیٹمنٹ — آمدنی و اخراجات',
    'fa-6': 'بیلنس شیٹ — اثاثے، واجبات، ایکویٹی',
    'fa-7': 'کیش فلو سٹیٹمنٹ',
    'math-4': 'بریک ایون تجزیہ',
    'econ-1': 'طلب و رسد — توازن',
    'econ-2': 'لچکداری (Elasticity)',
    'mgt-5': 'قیادت کے نظریات',
    'mgt-6': 'حوصلہ افزائی — Maslow وغیرہ',
    'mkt-5': 'STP — سیگمنٹیشن، ٹارگٹنگ',
    'comm-4': 'میمو فارمیٹ'
  };

  function applyUrduTitles() {
    A().SUBJECTS.forEach(s => {
      s.topics.forEach(t => {
        if (URDU_TITLES[t.id]) t.urdu = URDU_TITLES[t.id];
      });
    });
  }

  window.initSmartFeatures = function () {
    applyUrduTitles();
    patchApp();
    applyDarkMode();
    updateStreakUI();
    parseCompareHash();

    document.getElementById('btnSmartHub')?.addEventListener('click', renderSmartHub);
    document.getElementById('btnDarkMode')?.addEventListener('click', () => {
      smart.settings.dark = !smart.settings.dark;
      saveSmart();
      applyDarkMode();
    });
    document.getElementById('btnUrdu')?.addEventListener('click', () => {
      smart.settings.urdu = !smart.settings.urdu;
      saveSmart();
      document.getElementById('btnUrdu').textContent = smart.settings.urdu ? 'EN' : 'اردو';
      A().renderSubject(A().activeSubjectId, false);
    });
    document.getElementById('pomodoroStop')?.addEventListener('click', stopPomodoro);

    const orig = A().renderSubject;
    A().renderSubject = function (id, anim) {
      orig.call(A(), id, anim);
      bindTopicExtras();
    };
  };
})();
