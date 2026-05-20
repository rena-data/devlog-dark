/**
 * DevLog Dark — Tistory Skin Script
 * Dark/Light mode toggle + Mobile sidebar + Visitor bar
 */

(function () {
  'use strict';

  // ===== Dark / Light Mode Toggle =====
  var STORAGE_KEY = 'devlog-theme';
  var html = document.documentElement;
  var toggleBtn = document.getElementById('themeToggle');
  var themeIcon = document.getElementById('themeIcon');

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // localStorage unavailable
    }
    updateIcon(theme);
  }

  var themeLabel = document.getElementById('themeLabel');

  function updateIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'light') {
      themeIcon.className = 'fa-solid fa-sun';
      if (themeLabel) themeLabel.textContent = 'Light';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
      if (themeLabel) themeLabel.textContent = 'Dark';
    }
  }

  // Initialize theme: 1) localStorage → 2) OS 설정 감지 → 3) dark 기본
  var stored = getStoredTheme();
  if (stored === 'light' || stored === 'dark') {
    setTheme(stored);
  } else {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ===== Mobile Sidebar Toggle =====
  var sidebarToggle = document.getElementById('mobileSidebarToggle');
  var sidebarLeft = document.querySelector('.sidebar-left');
  var overlay = document.getElementById('mobileOverlay');

  function openSidebar() {
    if (sidebarLeft) sidebarLeft.classList.add('open');
    if (overlay) overlay.classList.add('active');
    if (sidebarToggle) {
      sidebarToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    }
  }

  function closeSidebar() {
    if (sidebarLeft) sidebarLeft.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (sidebarToggle) {
      sidebarToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      var isOpen = sidebarLeft && sidebarLeft.classList.contains('open');
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // ===== Visitor Chart — Custom Chart.js (using Tistory's chartData) =====
  function createVisitorChart() {
    var canvas = document.getElementById('visitorChartCustom');
    if (!canvas || typeof Chart === 'undefined') return false;
    var data = window.chartData;
    if (!data || !data.length) return false;

    var cs = getComputedStyle(document.documentElement);
    var accent = cs.getPropertyValue('--accent').trim() || '#7c3aed';
    var accentLt = cs.getPropertyValue('--accent-light').trim() || '#a78bfa';
    var textMuted = cs.getPropertyValue('--text-muted').trim() || '#6b7280';
    var borderLight = cs.getPropertyValue('--border-light').trim() || '#2d333b';
    var bgCard = cs.getPropertyValue('--bg-card').trim() || '#1c2333';

    var labels = data.map(function (d) { return new Date(d.timestamp).getDate(); });
    var counts = data.map(function (d) { return d.count; });

    // 첫 번째와 월 변경 지점에 월/일 표시
    var prevMon = -1;
    var xLabels = data.map(function (d, i) {
      var dt = new Date(d.timestamp);
      var mon = dt.getMonth() + 1;
      var day = dt.getDate();
      if (i === 0 || mon !== prevMon) { prevMon = mon; return mon + '/' + day; }
      prevMon = mon;
      return '' + day;
    });

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: xLabels,
        datasets: [{
          data: counts,
          borderColor: accentLt,
          borderWidth: 2,
          pointStyle: 'circle',
          pointRadius: 3,
          pointBackgroundColor: accent,
          pointBorderColor: accentLt,
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 2,
          pointHoverBackgroundColor: accent,
          pointHoverBorderColor: accentLt,
          fill: {
            target: 'origin',
            above: accentLt.indexOf('rgb') >= 0
              ? accentLt.replace(')', ',0.15)').replace('rgb', 'rgba')
              : accent + '1A'
          },
          tension: 0.3
        }]
      },
      options: {
        maintainAspectRatio: false,
        devicePixelRatio: 2,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: borderLight },
            ticks: {
              color: textMuted,
              font: { size: 9 },
              precision: 0,
              maxTicksLimit: 4
            }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: textMuted,
              font: { size: 9 }
            }
          }
        },
        layout: { padding: { left: 2, right: 6, bottom: 0, top: 4 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: bgCard,
            titleColor: textMuted,
            bodyColor: accentLt,
            borderColor: borderLight,
            borderWidth: 1,
            titleFont: { size: 10 },
            bodyFont: { size: 12, weight: '600' },
            padding: 8,
            displayColors: false,
            callbacks: {
              title: function (ctx) { return ctx[0].label; },
              label: function (ctx) { return ctx.parsed.y + ' visitors'; }
            }
          }
        }
      }
    });
    return true;
  }

  // Chart.js 로딩 대기 후 생성 (최대 5초)
  var chartAttempts = 0;
  var chartTimer = setInterval(function () {
    chartAttempts++;
    if (createVisitorChart() || chartAttempts > 20) {
      clearInterval(chartTimer);
    }
  }, 250);

  // ===== Profile Links — auto icon mapping =====
  var profileLinks = document.querySelectorAll('.profile-links a');
  var iconMap = {
    newpost: 'fa-solid fa-pen-to-square',
    manage: 'fa-solid fa-gear',
    linkedin: 'fa-brands fa-linkedin-in',
    github: 'fa-brands fa-github',
    instagram: 'fa-brands fa-instagram',
    facebook: 'fa-brands fa-facebook-f',
    twitter: 'fa-brands fa-x-twitter',
    youtube: 'fa-brands fa-youtube',
    tistory: 'fa-solid fa-blog',
    mail: 'fa-solid fa-envelope',
    email: 'fa-solid fa-envelope'
  };
  for (var pi = 0; pi < profileLinks.length; pi++) {
    var pLink = profileLinks[pi];
    var href = (pLink.href || '').toLowerCase();
    var title = (pLink.title || pLink.textContent || '').toLowerCase();
    var matched = false;
    for (var key in iconMap) {
      if (href.indexOf(key) !== -1 || title.indexOf(key) !== -1) {
        pLink.innerHTML = '<i class="' + iconMap[key] + '"></i>';
        matched = true;
        break;
      }
    }
    if (!matched) {
      pLink.innerHTML = '<i class="fa-solid fa-link"></i>';
    }
  }

  // ===== Smooth scroll for anchor links =====
  document.addEventListener('click', function (e) {
    var target = e.target.closest('a[href^="#"]');
    if (!target) return;
    var id = target.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ===== Back to Top Button =====
  var topBtn = document.getElementById('backToTop');
  if (topBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
    });
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Post Manage Dropdown =====
  var manageBtn = document.getElementById('postManageBtn');
  var manageMenu = document.getElementById('postManageMenu');
  var editLink = document.getElementById('postEditLink');
  var manageLink = document.getElementById('postManageLink');

  if (manageBtn && manageMenu) {
    // Get entry ID from Tistory's config
    var entryInfo = window.T && window.T.entryInfo;
    var entryId = entryInfo ? entryInfo.entryId : null;
    var blogUrl = window.TistoryBlog ? window.TistoryBlog.url : '';
    var isOwner = window.T && window.T.config && window.T.config.ROLE === 'owner';

    if (isOwner && entryId) {
      if (editLink) editLink.href = blogUrl + '/manage/newpost/' + entryId + '?type=post';

      var privateLink = document.getElementById('postPrivateLink');
      if (privateLink) {
        privateLink.addEventListener('click', function (e) {
          e.preventDefault();
          if (confirm('이 글을 비공개로 변경하시겠습니까?')) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', blogUrl + '/manage/post/visibility.json', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onload = function () { location.reload(); };
            xhr.send('entryId=' + entryId + '&visibility=0');
          }
        });
      }

      var deleteLink = document.getElementById('postDeleteLink');
      if (deleteLink) {
        deleteLink.addEventListener('click', function (e) {
          e.preventDefault();
          if (confirm('이 글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            window.location.href = blogUrl + '/manage/post/delete/' + entryId;
          }
        });
      }

      manageBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        manageMenu.classList.toggle('open');
      });

      document.addEventListener('click', function () {
        manageMenu.classList.remove('open');
      });
    } else {
      // Hide manage button for non-owners
      var postManage = document.getElementById('postManage');
      if (postManage) postManage.style.display = 'none';
    }
  }

  // ===== Single Post Body (shared ref) =====
  var singleBody = document.querySelector('.post-single .post-body');

  // ===== Reading Progress Bar (single post only) =====
  var progressBar = document.getElementById('readingProgress');
  if (progressBar && singleBody) {
    window.addEventListener('scroll', function () {
      var rect = singleBody.getBoundingClientRect();
      var total = singleBody.scrollHeight;
      var scrolled = -rect.top + window.innerHeight * 0.3;
      var pct = Math.min(Math.max(scrolled / total * 100, 0), 100);
      progressBar.style.width = pct + '%';
    });
  }

  // ===== Code Block Copy Button =====
  var codeBlocks = document.querySelectorAll('.post-body pre');
  for (var i = 0; i < codeBlocks.length; i++) {
    (function (pre) {
      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code') || pre;
        var text = code.textContent;
        navigator.clipboard.writeText(text).then(function () {
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(function () { btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy'; }, 1500);
        });
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    })(codeBlocks[i]);
  }

  // ===== Post Card Full Click (list items) =====
  var listCards = document.querySelectorAll('.post-list-item');
  for (var lc = 0; lc < listCards.length; lc++) {
    (function (card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return; // let actual links work normally
        var link = card.querySelector('.post-title a');
        if (link) link.click();
      });
    })(listCards[lc]);
  }

  // ===== TOC Auto Generation + Floating =====
  if (singleBody) {
    var tocContainer = document.getElementById('tocContainer');
    var headings = singleBody.querySelectorAll('h2, h3');
    if (tocContainer && headings.length >= 2) {
      var tocHtml = '<strong class="toc-title">Table of Contents</strong><ol class="toc-list">';
      for (var ti = 0; ti < headings.length; ti++) {
        var h = headings[ti];
        var id = 'toc-' + ti;
        h.id = id;
        var cls = h.tagName === 'H3' ? ' class="toc-h3"' : '';
        tocHtml += '<li' + cls + ' data-toc-id="' + id + '"><a href="#' + id + '">' + h.textContent + '</a></li>';
      }
      tocHtml += '</ol>';
      tocContainer.innerHTML = tocHtml;
      tocContainer.classList.add('has-items');

      // TOC trigger (화면 중앙 고정) + panel (사이드바 하단 기준)
      var tocTrigger = document.getElementById('tocTrigger');
      var postSingle = document.querySelector('.post-card.post-single');
      var sidebarRight = document.querySelector('.sidebar-right');
      var tocItems = tocContainer.querySelectorAll('.toc-list li');
      var tocHideTimer = null;

      function positionToc() {
        if (!tocTrigger || !postSingle) return;
        var contentRect = postSingle.getBoundingClientRect();
        // 트리거 아이콘: 본문 우측 라인, 화면 세로 중앙
        tocTrigger.style.left = (contentRect.right - 18) + 'px';

        // 패널: 트리거 우측, 화면 세로 중앙 (CSS top:50% + translateY(-50%))
        tocContainer.style.left = (contentRect.right + 20) + 'px';
      }

      // 호버로 패널 열기/닫기
      function showPanel() {
        clearTimeout(tocHideTimer);
        tocContainer.classList.add('toc-panel-open');
      }
      function hidePanel() {
        tocHideTimer = setTimeout(function () {
          tocContainer.classList.remove('toc-panel-open');
        }, 200);
      }

      tocTrigger.addEventListener('mouseenter', showPanel);
      tocTrigger.addEventListener('mouseleave', hidePanel);
      tocContainer.addEventListener('mouseenter', showPanel);
      tocContainer.addEventListener('mouseleave', hidePanel);

      positionToc();
      window.addEventListener('resize', positionToc);

      window.addEventListener('scroll', function () {
        var bodyRect = singleBody.getBoundingClientRect();
        if (tocTrigger) {
          if (bodyRect.top < 200 && bodyRect.bottom > 300) {
            tocTrigger.classList.add('toc-visible');
            positionToc();
          } else {
            tocTrigger.classList.remove('toc-visible');
            tocContainer.classList.remove('toc-panel-open');
          }
        }

        // Highlight active heading
        var activeIdx = -1;
        for (var si = 0; si < headings.length; si++) {
          if (headings[si].getBoundingClientRect().top <= 100) {
            activeIdx = si;
          }
        }
        for (var ai = 0; ai < tocItems.length; ai++) {
          if (ai === activeIdx) {
            tocItems[ai].classList.add('toc-active');
          } else {
            tocItems[ai].classList.remove('toc-active');
          }
        }
      });
    }
  }

  // ===== Font Size Controls =====
  var fontInc = document.getElementById('fontIncrease');
  var fontDec = document.getElementById('fontDecrease');
  if (fontInc && fontDec && singleBody) {
    var currentSize = 15;
    fontInc.addEventListener('click', function () {
      if (currentSize < 22) { currentSize += 1; singleBody.style.fontSize = currentSize + 'px'; }
    });
    fontDec.addEventListener('click', function () {
      if (currentSize > 12) { currentSize -= 1; singleBody.style.fontSize = currentSize + 'px'; }
    });
  }

  // ===== Image Lightbox =====
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && singleBody) {
    singleBody.addEventListener('click', function (e) {
      if (e.target.tagName === 'IMG') {
        lightboxImg.src = e.target.src;
        lightbox.classList.add('active');
      }
    });
    if (lightboxClose) lightboxClose.addEventListener('click', function () { lightbox.classList.remove('active'); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) lightbox.classList.remove('active'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lightbox.classList.remove('active'); });
  }

  // ===== Hot Badge (comment count >= 5) =====
  var commentCounts = document.querySelectorAll('.post-list-item .post-comment-count');
  for (var hi = 0; hi < commentCounts.length; hi++) {
    var num = parseInt(commentCounts[hi].textContent.replace(/\D/g, ''), 10) || 0;
    if (num >= 5) {
      var card = commentCounts[hi].closest('.post-list-item');
      var titleEl = card ? card.querySelector('.post-title') : null;
      if (titleEl) {
        var badge = document.createElement('span');
        badge.className = 'hot-badge';
        badge.textContent = 'HOT';
        titleEl.appendChild(badge);
      }
    }
  }

  // ===== Keyboard Shortcuts =====
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var si = document.querySelector('.search-box input');
      if (si) { si.focus(); si.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
    if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
      var tb = document.getElementById('themeToggle');
      if (tb) tb.click();
    }
  });

  // ===== Share Buttons =====
  var pageUrl = encodeURIComponent(window.location.href);
  var pageTitle = encodeURIComponent(document.title);

  var copyBtn = document.getElementById('shareCopyUrl');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(function () { copyBtn.innerHTML = '<i class="fa-solid fa-link"></i>'; }, 1500);
      });
    });
  }

  var twBtn = document.getElementById('shareTwitter');
  if (twBtn) {
    twBtn.href = 'https://twitter.com/intent/tweet?url=' + pageUrl + '&text=' + pageTitle;
  }

  var fbBtn = document.getElementById('shareFacebook');
  if (fbBtn) {
    fbBtn.href = 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl;
  }

  var liBtn = document.getElementById('shareLinkedin');
  if (liBtn) {
    liBtn.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl;
  }

  var kakaoBtn = document.getElementById('shareKakao');
  if (kakaoBtn) {
    kakaoBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var kakaoUrl = 'https://sharer.kakao.com/talk/friends/picker/link?url=' + pageUrl + '&app_key=javascript_key';
      // Fallback: use Kakao link scheme or simple share URL
      if (navigator.share) {
        navigator.share({ title: document.title, url: window.location.href });
      } else {
        window.open('https://accounts.kakao.com/login?continue=https://sharer.kakao.com/talk/friends/picker/link?url=' + pageUrl, '_blank', 'width=600,height=500');
      }
    });
  }

  var naverBtn = document.getElementById('shareNaver');
  if (naverBtn) {
    naverBtn.href = 'https://blog.naver.com/openapi/share?url=' + pageUrl + '&title=' + pageTitle;
  }

  // ===== NEW Badge (posts within 7 days) =====
  var listItems = document.querySelectorAll('.post-list-item');
  var now = new Date();
  for (var ni = 0; ni < listItems.length; ni++) {
    var dateEl = listItems[ni].querySelector('.post-date');
    if (!dateEl) continue;
    var dateText = dateEl.textContent.trim().replace(/\./g, '-').replace(/\s/g, '');
    var parts = dateText.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (parts) {
      var postDate = new Date(parts[1], parts[2] - 1, parts[3]);
      var diffDays = (now - postDate) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7 && diffDays >= 0) {
        var newBadge = document.createElement('span');
        newBadge.className = 'new-badge';
        newBadge.textContent = 'NEW';
        var titleEl2 = listItems[ni].querySelector('.post-title');
        if (titleEl2) titleEl2.appendChild(newBadge);
      }
    }
  }

  // ===== SVG Cat Character Follower =====
  if (!('ontouchstart' in window)) {
    var catEl = document.createElement('div');
    catEl.className = 'svg-cat';
    catEl.innerHTML =
      '<svg viewBox="0 0 64 50" width="64" height="50" xmlns="http://www.w3.org/2000/svg">' +
        '<path class="cat-tail" d="M54,22 Q62,14 58,6" fill="none" stroke="#E8922D" stroke-width="2.5" stroke-linecap="round"/>' +
        '<ellipse cx="38" cy="28" rx="16" ry="10" fill="#F4A030"/>' +
        '<ellipse cx="36" cy="31" rx="10" ry="5" fill="#FDE8B0"/>' +
        '<path d="M30,20 L32,25" stroke="#D4851C" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M36,19 L37,24" stroke="#D4851C" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M42,20 L42,25" stroke="#D4851C" stroke-width="1.5" stroke-linecap="round"/>' +
        '<rect class="cat-leg-bl" x="46" y="35" width="4" height="9" rx="2" fill="#E8922D"/>' +
        '<rect x="46" y="42" width="5" height="2.5" rx="1.2" fill="#FDE8B0"/>' +
        '<rect class="cat-leg-fl" x="26" y="35" width="4" height="9" rx="2" fill="#E8922D"/>' +
        '<rect x="25" y="42" width="5" height="2.5" rx="1.2" fill="#FDE8B0"/>' +
        '<rect class="cat-leg-br" x="50" y="35" width="4" height="9" rx="2" fill="#F4A030"/>' +
        '<rect x="50" y="42" width="5" height="2.5" rx="1.2" fill="#FDE8B0"/>' +
        '<rect class="cat-leg-fr" x="22" y="35" width="4" height="9" rx="2" fill="#F4A030"/>' +
        '<rect x="21" y="42" width="5" height="2.5" rx="1.2" fill="#FDE8B0"/>' +
        '<circle cx="16" cy="18" r="13" fill="#F4A030"/>' +
        '<path d="M12,6 L14,12" stroke="#D4851C" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M17,5.5 L17,11" stroke="#D4851C" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M22,7 L20,12" stroke="#D4851C" stroke-width="1.5" stroke-linecap="round"/>' +
        '<polygon points="5,12 3,1 12,8" fill="#F4A030"/>' +
        '<polygon points="6,10 5,4 10,8" fill="#FABD6E"/>' +
        '<polygon points="27,12 29,1 20,8" fill="#F4A030"/>' +
        '<polygon points="26,10 27,4 22,8" fill="#FABD6E"/>' +
        '<ellipse cx="10" cy="21" rx="5" ry="4" fill="#FDE8B0"/>' +
        '<ellipse cx="22" cy="21" rx="5" ry="4" fill="#FDE8B0"/>' +
        '<g class="cat-eyes-open">' +
          '<ellipse cx="11" cy="18" rx="3" ry="3.2" fill="white"/>' +
          '<ellipse cx="21" cy="18" rx="3" ry="3.2" fill="white"/>' +
          '<circle class="cat-pupil-l" cx="12" cy="18" r="2" fill="#2D2D2D"/>' +
          '<circle class="cat-pupil-r" cx="22" cy="18" r="2" fill="#2D2D2D"/>' +
          '<circle class="cat-highlight-l" cx="12.5" cy="17.2" r="0.7" fill="white"/>' +
          '<circle class="cat-highlight-r" cx="22.5" cy="17.2" r="0.7" fill="white"/>' +
        '</g>' +
        '<g class="cat-eyes-closed" style="display:none">' +
          '<path d="M8,18 Q11,20 14,18" fill="none" stroke="#2D2D2D" stroke-width="1.5" stroke-linecap="round"/>' +
          '<path d="M18,18 Q21,20 24,18" fill="none" stroke="#2D2D2D" stroke-width="1.5" stroke-linecap="round"/>' +
        '</g>' +
        '<ellipse cx="16" cy="22" rx="2" ry="1.5" fill="#F28C9A"/>' +
        '<path d="M16,23.5 Q13,26 11,24" fill="none" stroke="#C96A50" stroke-width="1" stroke-linecap="round"/>' +
        '<path d="M16,23.5 Q19,26 21,24" fill="none" stroke="#C96A50" stroke-width="1" stroke-linecap="round"/>' +
        '<line x1="1" y1="20" x2="8" y2="21" stroke="#D4851C" stroke-width="0.7"/>' +
        '<line x1="1" y1="23" x2="8" y2="23" stroke="#D4851C" stroke-width="0.7"/>' +
        '<line x1="24" y1="21" x2="31" y2="20" stroke="#D4851C" stroke-width="0.7"/>' +
        '<line x1="24" y1="23" x2="31" y2="23" stroke="#D4851C" stroke-width="0.7"/>' +
        '<text class="cat-zzz" x="28" y="6" font-size="7" font-weight="bold" fill="#F4A030" style="display:none">z</text>' +
      '</svg>';
    document.body.appendChild(catEl);

    var catSvg = catEl.querySelector('svg');
    var eyesOpen = catEl.querySelector('.cat-eyes-open');
    var eyesClosed = catEl.querySelector('.cat-eyes-closed');
    var catZzz = catEl.querySelector('.cat-zzz');
    var catTail = catEl.querySelector('.cat-tail');
    var pupilL = catEl.querySelector('.cat-pupil-l');
    var pupilR = catEl.querySelector('.cat-pupil-r');
    var hlL = catEl.querySelector('.cat-highlight-l');
    var hlR = catEl.querySelector('.cat-highlight-r');

    var catX = -80, catY = -80, catTX = -80, catTY = -80;
    var walkFrame = 0, walkTimer = 0, catIdle = false;
    var catHasMoved = false;

    catEl.style.display = 'none';
    document.addEventListener('mousemove', function (e) {
      if (!catHasMoved) {
        catHasMoved = true;
        catX = e.clientX;
        catY = e.clientY;
        catEl.style.display = '';
      }
      catTX = e.clientX;
      catTY = e.clientY;
    });

    function animateSvgCat() {
      catX += (catTX - catX) * 0.07;
      catY += (catTY - catY) * 0.07;
      catEl.style.left = catX + 'px';
      catEl.style.top = catY + 'px';

      var toMouse = catTX - catX;
      if (toMouse < -2) catEl.style.transform = 'translate(8px, 8px) scaleX(1)';
      else if (toMouse > 2) catEl.style.transform = 'translate(8px, 8px) scaleX(-1)';

      var dist = Math.abs(catTX - catX) + Math.abs(catTY - catY);
      catIdle = dist < 2;

      eyesOpen.style.display = catIdle ? 'none' : '';
      eyesClosed.style.display = catIdle ? '' : 'none';
      catZzz.style.display = catIdle ? '' : 'none';

      // Pupils follow mouse
      if (!catIdle) {
        var rect = catEl.getBoundingClientRect();
        var headCX = rect.left + 16, headCY = rect.top + 18;
        var dx = catTX - headCX, dy = catTY - headCY;
        var angle = Math.atan2(dy, dx);
        var maxR = 1.2;
        var px = Math.cos(angle) * maxR;
        var py = Math.sin(angle) * maxR;
        pupilL.setAttribute('cx', 11 + px);
        pupilL.setAttribute('cy', 18 + py);
        pupilR.setAttribute('cx', 21 + px);
        pupilR.setAttribute('cy', 18 + py);
        hlL.setAttribute('cx', 11.5 + px);
        hlL.setAttribute('cy', 17.2 + py);
        hlR.setAttribute('cx', 21.5 + px);
        hlR.setAttribute('cy', 17.2 + py);
      }

      walkTimer++;
      if (walkTimer % 10 === 0) walkFrame = (walkFrame + 1) % 2;
      var legs = catSvg.querySelectorAll('.cat-leg-fr, .cat-leg-bl');
      var legs2 = catSvg.querySelectorAll('.cat-leg-fl, .cat-leg-br');
      var shift = catIdle ? 0 : (walkFrame === 0 ? -2 : 2);
      legs.forEach(function (l) { l.setAttribute('y', 35 + shift); });
      legs2.forEach(function (l) { l.setAttribute('y', 35 - shift); });

      var tailWag = catIdle ? 14 : (walkFrame === 0 ? 6 : 14);
      catTail.setAttribute('d', 'M54,22 Q62,' + tailWag + ' 58,6');

      requestAnimationFrame(animateSvgCat);
    }
    animateSvgCat();
  }

})();
