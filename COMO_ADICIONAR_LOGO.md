# Como Adicionar sua Logo ao BarberPro

Este guia mostra como adicionar a logo da sua barbearia ao sistema.

## 📁 Pastas Criadas

As seguintes pastas foram criadas para você armazenar as imagens:

```
public/
└── assets/
    └── images/         👈 Coloque suas imagens aqui
        └── README.md

src/
└── assets/
    └── images/         👈 Alternativa para imagens importadas
```

## 🎨 Preparando a Logo

### Formatos Recomendados

1. **SVG** (Recomendado) - Escalável, sem perda de qualidade
2. **PNG** - Com fundo transparente
3. **WebP** - Para melhor performance

### Tamanhos Sugeridos

- **Logo ícone** (circular): 512x512px
- **Logo completa**: 200-400px de largura
- **Favicon**: 64x64px

## 📋 Passo a Passo

### 1. Adicione os Arquivos

Copie suas imagens para a pasta `public/assets/images/`:

```
public/assets/images/
├── logo.svg          # Logo principal
├── logo-icon.png     # Ícone/logo circular
└── favicon.ico       # Ícone do navegador
```

### 2. Atualize o Código

#### Para a Tela de Login

Edite o arquivo `src/pages/Login.tsx` na linha ~158:

**Antes:**
```tsx
<Scissors className="w-10 h-10 text-white" />
```

**Depois:**
```tsx
<img
  src="/Projeto-barbearia/assets/images/logo-icon.png"
  alt="Logo"
  className="w-12 h-12 object-contain"
/>
```

#### Para a Sidebar (Menu Lateral)

Edite o arquivo `src/components/layout/Sidebar.tsx` na linha ~123:

**Antes:**
```tsx
<Sparkles className="w-7 h-7 text-white" />
```

**Depois:**
```tsx
<img
  src="/Projeto-barbearia/assets/images/logo-icon.png"
  alt="Logo"
  className="w-8 h-8 object-contain"
/>
```

#### Para a Área do Cliente

Edite o arquivo `src/pages/ClienteDashboard.tsx` na linha ~29:

**Antes:**
```tsx
<Scissors className="w-5 h-5 text-gray-900" />
```

**Depois:**
```tsx
<img
  src="/Projeto-barbearia/assets/images/logo-icon.png"
  alt="Logo"
  className="w-5 h-5 object-contain"
/>
```

### 3. Adicione o Favicon

Edite o arquivo `index.html` na raiz do projeto:

```html
<head>
  <!-- ... -->
  <link rel="icon" type="image/x-icon" href="/Projeto-barbearia/assets/images/favicon.ico">
  <title>BarberPro - Gestão Profissional</title>
</head>
```

## 🎯 Exemplo Completo

### Login com Logo em SVG

```tsx
{/* Logo */}
<motion.div
  animate={{
    backgroundColor: selectedRole === 'client' ? '#2563eb' : '#D4AF37'
  }}
  transition={{ duration: 0.3 }}
  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
>
  <img
    src="/Projeto-barbearia/assets/images/logo-icon.svg"
    alt="BarberPro Logo"
    className="w-12 h-12 object-contain filter brightness-0 invert"
  />
</motion.div>
```

**Nota:** O `filter brightness-0 invert` torna a logo branca se ela for escura.

## 🔧 Alternativa: Importar Imagens

Se preferir importar as imagens (melhor para otimização):

1. Coloque a imagem em `src/assets/images/`
2. Importe no componente:

```tsx
import logoIcon from '@/assets/images/logo-icon.png'

// Depois use:
<img src={logoIcon} alt="Logo" className="w-12 h-12" />
```

## ✅ Checklist

- [ ] Logo ícone adicionada em `public/assets/images/`
- [ ] Logo atualizada em `src/pages/Login.tsx`
- [ ] Logo atualizada em `src/components/layout/Sidebar.tsx`
- [ ] Logo atualizada em `src/pages/ClienteDashboard.tsx`
- [ ] Favicon adicionado no `index.html`
- [ ] Testado em diferentes tamanhos de tela

## 🎨 Dicas de Design

1. **Fundo Transparente**: Use PNG ou SVG com fundo transparente
2. **Cores**: A logo será exibida em branco sobre fundos coloridos (azul ou dourado)
3. **Simplicidade**: Logos simples funcionam melhor em tamanhos pequenos
4. **Contraste**: Certifique-se de que a logo seja visível sobre os fundos azul e dourado

## 🛠️ Ferramentas Úteis

- [Remove.bg](https://remove.bg) - Remover fundo de imagens
- [Favicon.io](https://favicon.io) - Gerar favicon
- [TinyPNG](https://tinypng.com) - Comprimir imagens
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Otimizar SVG

## 💡 Precisa de Ajuda?

Se a logo não aparecer:
1. Verifique se o caminho está correto: `/Projeto-barbearia/assets/images/logo.png`
2. Confirme que a pasta `public` existe na raiz do projeto
3. Limpe o cache do navegador (Ctrl + Shift + R)
4. Execute `npm run build` novamente
