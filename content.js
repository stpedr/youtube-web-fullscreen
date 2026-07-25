(function () {
  'use strict';

  console.log('%c[YouTube Web Fullscreen] Extensão pronta!', 'color: #3ea6ff; font-weight: bold; font-size: 13px;');

  let isWebFullscreen = false;
  let webFullscreenBtn = null;
  let svgNode = null;
  let pathNode = null;

  // Vetores de ícones 24x24 perfeitamente desenhados
  const PATH_EXPAND = 'M3 3h7v2H5v5H3V3zm18 0h-7v2h5v5h2V3zM3 21h7v-2H5v-5H3v7zm18 0h-7v-2h5v-5h2v7z M7 7h10v10H7z';
  const PATH_COMPRESS = 'M10 10H3V8h5V3h2v7zm4 0h7V8h-5V3h-2v7zM10 14H3v2h5v5h2v-7zm4 0h7v2h-5v5h-2v-7z M7 7h10v10H7z';

  // Cria um único elemento SVG com viewBox 24x24
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

    console.log('[YouTube Web Fullscreen] Ícone do player adicionado e centralizado com sucesso!');
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
