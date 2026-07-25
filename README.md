# 🎬 YouTube Web Fullscreen - Extensão Firefox

Uma extensão leve e rápida para o **Mozilla Firefox** que faz o vídeo do YouTube preencher 100% da janela do navegador (**Web Fullscreen**), ocultando o cabeçalho, barra lateral e comentários do YouTube, mantendo as suas abas e barra de navegação do Firefox acessíveis.

---

## ⚡ Recursos

- 🔲 **Modo Preencher Janela**: O vídeo expande para 100% da viewport atual sem entrar na tela cheia do monitor (F11/Fullscreen nativo).
- 🔘 **Botão no Player**: Adiciona um botão dedicado na barra de controles do player do YouTube (ao lado do botão de Tela Cheia).
- ⌨️ **Atalhos Rápidos de Teclado**:
  - Pressione **`W`** (ou **`Shift + F`**) para ativar/desativar o preenchimento.
  - Pressione **`ESC`** para sair do modo a qualquer momento.
- 🔄 **Navegação SPA**: Funciona continuamente enquanto você navega entre vídeos no YouTube sem precisar recarregar a página.

---

## 🚀 Como Instalar no Mozilla Firefox

### Passo 1: Abrir a página de Depuração do Firefox
1. Abra o seu **Firefox**.
2. Na barra de endereços, digite `about:debugging` e pressione **Enter**.
3. No menu lateral esquerdo, clique em **Este Firefox** (ou *This Firefox*).

### Passo 2: Carregar a Extensão Temporária
1. Clique no botão **Carregar suplemento temporário...** (*Load Temporary Add-on...*).
2. Navegue até a pasta deste projeto:
   `C:\Users\pedro\Documents\antigravity\gallant-heisenberg`
3. Selecione o arquivo **`manifest.json`** e clique em **Abrir**.

---

## 🎮 Como Usar

1. Acesse [youtube.com](https://www.youtube.com) e abra qualquer vídeo.
2. Observe a barra de controles inferior direita do vídeo (ao lado do botão de Tela Cheia).
3. Clique no novo ícone **"Preencher Janela"** ou simplesmente pressione a tecla **`W`** no seu teclado.
4. O vídeo se expandirá para preencher toda a tela do navegador!

---

## 📁 Estrutura de Arquivos

```text
gallant-heisenberg/
├── manifest.json   # Manifesto da extensão (WebExtension V3)
├── content.js      # Script de injeção de controles e atalhos de teclado
├── content.css     # Estilos CSS de redimensionamento da janela
├── icons/          # Ícones da extensão (16px, 48px, 128px)
└── README.md       # Este guia de instruções
```
