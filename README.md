# Duda Retratos com Supabase

Site leve em HTML/CSS/JS, com painel admin e salvamento global no Supabase.

## Arquivos principais

- `index.html`: site público
- `admin.html`: painel admin
- `supabase-config.js`: onde você coloca a URL e a anon key do Supabase
- `supabase.sql`: SQL para criar tabela, bucket e permissões
- `data.js`: conteúdo inicial do site
- `assets/images/pre-wedding`: fotos internas de pré-wedding

## Senha do painel

`asd123`

## Como configurar Supabase

1. Crie um projeto no Supabase.
2. Vá em SQL Editor e rode todo o arquivo `supabase.sql`.
3. Vá em Project Settings > Data API.
4. Copie Project URL e anon public key.
5. Abra `supabase-config.js` e cole nos campos:

```js
const SUPABASE_URL = "SUA_PROJECT_URL";
const SUPABASE_ANON_KEY = "SUA_ANON_KEY";
```

6. Suba os arquivos para GitHub Pages, Netlify, Vercel ou rode localmente.

## Rodar local no Termux

```bash
cd dudaretratos-supabase
python -m http.server 3000 --bind 0.0.0.0
```

Abrir:

```txt
http://localhost:3000
```

Admin:

```txt
http://localhost:3000/admin.html
```

## Fotos com nomes únicos

Todo upload feito pelo admin usa nomes no padrão:

```txt
dudaretratos-categoria-data-random.ext
```

Exemplo:

```txt
dudaretratos-pre-wedding-1779123456789-a1b2c3d.jpg
```

## Observação de segurança

Este projeto usa senha simples no front-end para facilitar o uso pelo celular. O SQL deixa leitura/escrita públicas para permitir edição apenas com a anon key. Para uso profissional com segurança forte, o ideal é trocar para Supabase Auth com login por e-mail e políticas RLS vinculadas ao usuário autenticado.
