# WiseBuddy - Site de Teste para Google Tag Manager

Este é um site React desenvolvido para testar eventos do Google Tag Manager (GTM) baseado na documentação do projeto WiseBuddy - Assessor Virtual de Investimentos.

## 🎯 Objetivo

O site simula um aplicativo completo de assessoria de investimentos com todas as funcionalidades principais, permitindo testar diversos tipos de eventos GTM em um ambiente controlado.

## 🚀 Funcionalidades

### Páginas Implementadas
- **Login** - Autenticação de usuários
- **Cadastro** - Registro de novos usuários
- **Suitability** - Teste de perfil de investidor
- **Home** - Dashboard principal
- **Chat** - Conversa com assistente virtual
- **Recomendação** - Visualização de carteiras sugeridas
- **Histórico** - Sessões e recomendações anteriores
- **Perfil** - Edição de dados pessoais
- **Planos** - Visualização e contratação de planos
- **Pagamento** - Processamento de pagamentos
- **Cartões** - Gerenciamento de métodos de pagamento

### Eventos GTM Implementados

#### Eventos de Usuário
- `user_register` - Cadastro de novo usuário
- `user_login` - Login do usuário
- `user_logout` - Logout do usuário

#### Eventos de Suitability
- `suitability_start` - Início do teste de perfil
- `suitability_complete` - Conclusão do teste

#### Eventos de Chat
- `chat_start` - Início de conversa
- `chat_message` - Envio de mensagem
- `chat_end` - Fim da conversa

#### Eventos de Recomendação
- `recommendation_request` - Solicitação de recomendação
- `recommendation_view` - Visualização de recomendação
- `recommendation_invest_click` - Clique para investir

#### Eventos de Planos
- `plan_view` - Visualização de plano
- `plan_select` - Seleção de plano

#### Eventos de Pagamento
- `payment_start` - Início do pagamento
- `payment_success` - Pagamento aprovado
- `payment_failed` - Pagamento recusado

#### Eventos de Cartão
- `card_add` - Adição de cartão
- `card_remove` - Remoção de cartão

#### Eventos Gerais
- `page_view` - Visualização de página
- `error` - Erros do sistema

## 🔧 Configuração do GTM

### 1. Substitua o ID do GTM
No arquivo `index.html`, substitua `GTM-XXXXXXX` pelo seu ID real do Google Tag Manager:

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','SEU-GTM-ID-AQUI');</script>
<!-- End Google Tag Manager -->
```

### 2. Configure as Tags no GTM
Crie tags personalizadas para capturar os eventos enviados via `dataLayer.push()`.

## 💳 Dados de Teste

Para testar o sistema de pagamento, use apenas os seguintes dados:

- **Número do Cartão:** 9999 9999 9999 9999
- **CVV:** 999
- **Data de Vencimento:** 25/12
- **Nome:** Qualquer nome

## 👤 Usuários de Teste

Para fazer login, use:
- **E-mail:** joao.silva@email.com
- **Senha:** qualquer senha

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de UI
- **Lucide React** - Ícones
- **Vite** - Build tool

## 📁 Estrutura do Projeto

```
src/
├── components/ui/     # Componentes de UI (shadcn/ui)
├── data/             # Arquivos JSON simulando banco de dados
├── pages/            # Páginas da aplicação
├── utils/            # Utilitários (auth, GTM, dataService)
├── App.jsx           # Componente principal com roteamento
└── main.jsx          # Ponto de entrada
```

## 🚀 Como Executar

### Desenvolvimento
```bash
pnpm install
pnpm run dev
```

### Produção
```bash
pnpm run build
pnpm run preview
```

## 📊 Monitoramento GTM

Todos os eventos são logados no console do navegador para facilitar o debug. Abra as ferramentas de desenvolvedor e vá para a aba Console para ver os eventos sendo disparados.

## 🔒 Segurança

Este é um projeto de teste. Em produção:
- Implemente validação real de cartão de crédito
- Use autenticação JWT real
- Conecte a um banco de dados real
- Implemente criptografia adequada

## 📝 Notas

- O sistema simula todas as operações localmente usando localStorage
- Os dados são resetados a cada refresh da página
- Todos os pagamentos são simulados e sempre aprovados
- As recomendações de investimento são estáticas para fins de teste

