(function () {
  'use strict';

  let isWebFullscreen = false;
  let webFullscreenBtn = null;
  let svgExpandNode = null;
  let svgCompressNode = null;

  // Função auxiliar para criar elementos SVG com segurança total no DOM (sem innerHTML)
  function createSvgIcon(pathD, rectX, rectY, rectW, rectH) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', pathD);
    svg.appendChild(path);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', rectX);
    rect.setAttribute('y', rectY);
    rect.setAttribute('width', rectW);
    rect.setAttribute('height', rectH);
    rect.setAttribute('rx', '1');
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', 'currentColor');
    rect.setAttribute('stroke-width', '1.5');
    svg.appendChild(rect);

    return svg;
  }

  // Instancia os nós SVG com as geometrias dos ícones
  function initIcons() {
    svgExpandNode = createSvgIcon(
      'M3 3h7v2H5v5H3V3zm18 0h-7v2h5v5h2V3zM3 21h7v-2H5v-5H3v7zm18 0h-7v-2h5v-5h2v7z',
      '7', '7', '10', '10'
    );
    svgCompressNode = createSvgIcon(
      'M10 10H3V8h5V3h2v7zm4 0h7V8h-5V3h-2v7zM10 14H3v2h5v5h2v-7zm4 0h7v2h-5v5h-2v-7z',
      '8', '8', '8', '8'
    );
  }

  // Função principal para alternar o estado de Web Fullscreen
  function toggleWebFullscreen(forceState) {
    if (typeof forceState === 'boolean') {
      isWebFullscreen = forceState;
    } else {
      isWebFullscreen = !isWebFullscreen;
    }

    const htmlEl = document.documentElement;
    if (isWebFullscreen) {
      htmlEl.classList.add('yt-web-fullscreen-active');
    } else {
      htmlEl.classList.remove('yt-web-fullscreen-active');
    }

    updateButtonUI();

    // Notifica o player do YouTube para recalcular o aspect ratio do vídeo imediatamente
    window.dispatchEvent(new Event('resize'));
  }

  // Atualiza aparência e tooltip do botão com troca segura de estilo de exibição dos nós SVG
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

  // Injeta o botão na barra de controles à direita do player
  function injectButton() {
    const rightControls = document.querySelector('.ytp-right-controls');
    if (!rightControls) return;

    // Se já estiver injetado, garante que a referência exista
    let existingBtn = document.getElementById('yt-web-fullscreen-btn');
    if (existingBtn) {
      webFullscreenBtn = existingBtn;
      updateButtonUI();
      return;
    }

    if (!svgExpandNode || !svgCompressNode) {
      initIcons();
    }

    // Cria o botão HTML
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

    // Insere antes do botão de Tela Cheia se possível, ou no final dos controles da direita
    const fullscreenBtn = rightControls.querySelector('.ytp-fullscreen-button');
    if (fullscreenBtn) {
      rightControls.insertBefore(button, fullscreenBtn);
    } else {
      rightControls.appendChild(button);
    }
  }

  // Verifica se o foco atual está em algum campo de texto para não disparar o atalho por engano
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

  // Escuta os atalhos de teclado
  function handleKeyDown(e) {
    if (isTyping(e)) return;

    // Tecla 'W' ou 'w' ou 'Shift + F' para alternar
    if (e.key === 'w' || e.key === 'W' || (e.shiftKey && (e.key === 'F' || e.key === 'f'))) {
      e.preventDefault();
      e.stopPropagation();
      toggleWebFullscreen();
    }

    // Tecla 'ESC' para sair se estiver ativado
    if (e.key === 'Escape' && isWebFullscreen) {
      e.preventDefault();
      e.stopPropagation();
      toggleWebFullscreen(false);
    }
  }

  // Observador de mutações do DOM para garantir injeção contínua ao navegar pelo YouTube
  function setupObserver() {
    const observer = new MutationObserver(() => {
      if (window.location.pathname.includes('/watch')) {
        injectButton();
      } else if (isWebFullscreen) {
        // Se saiu de um vídeo para outra página (ex: home do YouTube), reseta o modo
        toggleWebFullscreen(false);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Inicialização e listeners de eventos de navegação SPA do YouTube
  function init() {
    initIcons();
    injectButton();
    setupObserver();

    document.addEventListener('keydown', handleKeyDown, true);

    // Eventos específicos do YouTube SPA
    window.addEventListener('yt-navigate-finish', () => {
      if (window.location.pathname.includes('/watch')) {
        setTimeout(injectButton, 300);
      } else if (isWebFullscreen) {
        toggleWebFullscreen(false);
      }
    });

    // Repetidor leve inicial para casos de carregamento lento do player
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (document.querySelector('.ytp-right-controls')) {
        injectButton();
        clearInterval(checkInterval);
      }
      if (attempts > 20) clearInterval(checkInterval);
    }, 500);
  }

  // Executa ao carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
