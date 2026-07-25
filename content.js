(function () {
  'use strict';

  console.log('%c[YouTube Web Fullscreen] Extensão pronta! Procurando controles do player...', 'color: #3ea6ff; font-weight: bold; font-size: 13px;');

  let isWebFullscreen = false;
  let webFullscreenBtn = null;
  let svgExpandNode = null;
  let svgCompressNode = null;

  // Função auxiliar para criar elementos SVG em conformidade com o padrão de 36x36 do YouTube
  function createSvgIcon(pathD) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('height', '100%');
    svg.setAttribute('version', '1.1');
    svg.setAttribute('viewBox', '0 0 36 36');
    svg.setAttribute('width', '100%');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', '#ffffff');
    path.setAttribute('d', pathD);
    svg.appendChild(path);

    return svg;
  }

  // Ícones nativos do YouTube no grid 36x36
  function initIcons() {
    // Ícone de expandir para preencher a janela (frame retangular com cantos de expansão)
    svgExpandNode = createSvgIcon(
      'M 10,11 H 26 V 25 H 10 Z M 12,13 V 23 H 24 V 13 Z M 7,7 H 14 V 9 H 9 V 14 H 7 Z M 22,7 H 29 V 14 H 27 V 9 H 22 Z M 7,22 H 9 V 27 H 14 V 29 H 7 Z M 27,22 H 29 V 29 H 22 V 27 H 27 Z'
    );
    // Ícone de comprimir para sair do preenchimento
    svgCompressNode = createSvgIcon(
      'M 10,11 H 26 V 25 H 10 Z M 12,13 V 23 H 24 V 13 Z M 11,11 H 13 V 7 H 7 V 13 H 9 V 9 H 11 Z M 25,11 H 23 V 7 H 29 V 13 H 27 V 9 H 25 Z M 11,25 H 13 V 29 H 7 V 23 H 9 V 27 H 11 Z M 25,25 H 23 V 29 H 29 V 23 H 27 V 27 H 25 Z'
    );
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

  // Atualiza tooltip e visibilidade do ícone
  function updateButtonUI() {
    if (!webFullscreenBtn || !svgExpandNode || !svgCompressNode) return;

    if (isWebFullscreen) {
      webFullscreenBtn.classList.add('active');
      svgExpandNode.style.display = 'none';
      svgCompressNode.style.display = 'block';
      webFullscreenBtn.setAttribute('title', 'Sair da Janela (W)');
      webFullscreenBtn.setAttribute('aria-label', 'Sair da Janela (W)');
    } else {
      webFullscreenBtn.classList.remove('active');
      svgExpandNode.style.display = 'block';
      svgCompressNode.style.display = 'none';
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

    // Se já estiver lá dentro, apenas garante estado
    let existingBtn = rightControls.querySelector('#yt-web-fullscreen-btn');
    if (existingBtn) {
      webFullscreenBtn = existingBtn;
      updateButtonUI();
      return;
    }

    if (!svgExpandNode || !svgCompressNode) {
      initIcons();
    }

    const button = document.createElement('button');
    button.id = 'yt-web-fullscreen-btn';
    button.className = 'ytp-button yt-web-fullscreen-btn';
    button.type = 'button';

    button.appendChild(svgExpandNode);
    button.appendChild(svgCompressNode);

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWebFullscreen();
    });

    webFullscreenBtn = button;
    updateButtonUI();

    // Insere imediatamente antes do botão de Tela Cheia ou no final dos controles
    const fullscreenBtn = rightControls.querySelector('.ytp-fullscreen-button');
    if (fullscreenBtn) {
      rightControls.insertBefore(button, fullscreenBtn);
    } else {
      rightControls.appendChild(button);
    }

    console.log('[YouTube Web Fullscreen] Ícone do player adicionado na barra de controles!');
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
    initIcons();
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

    // Intervalo de verificação para pegar o player assim que os controles carregarem
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
