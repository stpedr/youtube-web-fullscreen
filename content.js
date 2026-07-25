(function () {
  'use strict';

  console.log('%c[YouTube Web Fullscreen] Extensão pronta!', 'color: #3ea6ff; font-weight: bold; font-size: 13px;');

  let isWebFullscreen = false;
  let webFullscreenBtn = null;
  let svgNode = null;
  let pathNode = null;

  // Vetores de ícones 24x24 com desenho de monitor vazado no centro e cantos de expansão/compressão
  const PATH_EXPAND = 'M3 3h6v2H5v4H3V3zm18 0h-6v2h4v4h2V3zM3 21h6v-2H5v-4H3v6zm18 0h-6v-2h4v-4h2v6z M7 8h10v8H7zm2 2v4h6v-4H9z';
  const PATH_COMPRESS = 'M8 8H3v2h3v3h2V8zm8 0h5v2h-3v3h-2V8zM8 16H3v-2h3v-3h2v5zm8 0h5v-2h-3v-3h-2v5z M7 8h10v8H7zm2 2v4h6v-4H9z';

  // Cria o elemento SVG 24x24 perfeito
  function createSvgElement() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '22');
    svg.setAttribute('height', '22');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', '#ffffff');
    path.setAttribute('d', PATH_EXPAND);
    svg.appendChild(path);

    svgNode = svg;
    pathNode = path;
    return svg;
  }

  // Alterna entre o modo padrão e o modo Web Fullscreen
  function toggleWebFullscreen(forceState) {
    if (typeof forceState === 'boolean') {
      isWebFullscreen = forceState;
    } else {
      isWebFullscreen = !isWebFullscreen;
    }

    console.log('%c[YouTube Web Fullscreen] Modo: ' + (isWebFullscreen ? '100% JANELA' : 'NORMAL'), 'color: #ff0000; font-weight: bold;');

    const htmlEl = document.documentElement;
    if (isWebFullscreen) {
      htmlEl.classList.add('yt-web-fullscreen-active');
    } else {
      htmlEl.classList.remove('yt-web-fullscreen-active');
    }

    updateButtonUI();
    window.dispatchEvent(new Event('resize'));
  }

  // Atualiza tooltip e alterna o caminho do SVG
  function updateButtonUI() {
    if (!webFullscreenBtn || !pathNode) return;

    if (isWebFullscreen) {
      webFullscreenBtn.classList.add('active');
      pathNode.setAttribute('d', PATH_COMPRESS);
      webFullscreenBtn.setAttribute('title', 'Sair da Janela (W)');
      webFullscreenBtn.setAttribute('aria-label', 'Sair da Janela (W)');
    } else {
      webFullscreenBtn.classList.remove('active');
      pathNode.setAttribute('d', PATH_EXPAND);
      webFullscreenBtn.setAttribute('title', 'Preencher Janela (W)');
      webFullscreenBtn.setAttribute('aria-label', 'Preencher Janela (W)');
    }
  }

  // Encontra os controles da direita do player do YouTube
  function getRightControls() {
    return (
      document.querySelector('.ytp-right-controls') ||
      document.querySelector('#movie_player .ytp-right-controls') ||
      document.querySelector('.html5-video-player .ytp-right-controls')
    );
  }

  // Injeta o botão na barra de controles do player do YouTube
  function injectButton() {
    const rightControls = getRightControls();
    if (!rightControls) return;

    let existingBtn = document.getElementById('yt-web-fullscreen-btn');
    if (existingBtn) {
      if (rightControls.contains(existingBtn)) {
        webFullscreenBtn = existingBtn;
        updateButtonUI();
        return;
      } else {
        existingBtn.remove();
      }
    }

    const button = document.createElement('button');
    button.id = 'yt-web-fullscreen-btn';
    button.className = 'ytp-button yt-web-fullscreen-btn';
    button.type = 'button';

    const svg = createSvgElement();
    button.appendChild(svg);

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWebFullscreen();
    });

    webFullscreenBtn = button;
    updateButtonUI();

    const fullscreenBtn = rightControls.querySelector('.ytp-fullscreen-button');
    if (fullscreenBtn && fullscreenBtn.parentNode) {
      fullscreenBtn.parentNode.insertBefore(button, fullscreenBtn);
    } else {
      rightControls.appendChild(button);
    }

    console.log('[YouTube Web Fullscreen] Ícone do player adicionado e desenhado com sucesso!');
  }

  function isTyping(event) {
    const target = event.target;
    if (!target) return false;
    const tagName = target.tagName ? target.tagName.toLowerCase() : '';
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      target.isContentEditable ||
      target.getAttribute('contenteditable') === 'true' ||
      target.id === 'contenteditable-root'
    );
  }

  function handleKeyDown(e) {
    if (isTyping(e)) return;

    if (e.key === 'w' || e.key === 'W' || (e.shiftKey && (e.key === 'F' || e.key === 'f'))) {
      e.preventDefault();
      e.stopPropagation();
      toggleWebFullscreen();
    }

    if (e.key === 'Escape' && isWebFullscreen) {
      e.preventDefault();
      e.stopPropagation();
      toggleWebFullscreen(false);
    }
  }

  function setupObserver() {
    const observer = new MutationObserver(() => {
      if (window.location.pathname.includes('/watch')) {
        injectButton();
      } else if (isWebFullscreen) {
        toggleWebFullscreen(false);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    injectButton();
    setupObserver();

    document.addEventListener('keydown', handleKeyDown, true);

    window.addEventListener('yt-navigate-finish', () => {
      if (window.location.pathname.includes('/watch')) {
        setTimeout(injectButton, 300);
      } else if (isWebFullscreen) {
        toggleWebFullscreen(false);
      }
    });

    const interval = setInterval(() => {
      if (window.location.pathname.includes('/watch')) {
        injectButton();
      }
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
