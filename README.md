# Descritivo do Sistema de Gerenciamento Financeiro

## Visão Geral do Projeto

O projeto é uma aplicação React de gerenciamento financeiro pessoal que permite aos usuários controlar transações, criar planejamentos orçamentários e visualizar seu desempenho financeiro ao longo do tempo. A aplicação está estruturada em torno do conceito de meses, permitindo que os usuários visualizem e gerenciem suas finanças mês a mês.

Esta estrutura organiza o código em:

- **components**: Componentes de UI reutilizáveis
- **hooks**: Custom hooks para lógica de negócios
- **pages**: Principais páginas da aplicação
- **services**: Configurações e serviços externos

## Estrutura do Firebase

A aplicação utiliza o Firebase Firestore como banco de dados, com a seguinte estrutura de coleções:

### Collection: transactions

**Descrição**: Armazena todas as transações financeiras registradas pelo usuário.

```json
{
  "transactionId": "string",
  "userId": "string",
  "descricao": "string",
  "valor": "number",
  "tipo": "string",
  "categoria": "string",
  "data": "timestamp",
  "mesReferencia": "string",
  "createdAt": "timestamp"
}
```

### Collection: fechamentos

**Descrição**: Armazena o saldo final de cada mês quando o usuário fecha o período.

```json
{
  "fechamentoId": "string",
  "userId": "string",
  "mesReferencia": "string",
  "saldoFinal": "number",
  "dataFechamento": "timestamp"
}
```

### Collection: planejamentos

**Descrição**: Armazena o planejamento financeiro do próximo mês após o fechamento do atual.

```json
{
  "planejamentoId": "string",
  "userId": "string",
  "mesReferencia": "string",
  "categorias": [
    {
      "nome": "string",
      "valorPlanejado": "number",
      "tipo": "string"
    }
  ],
  "dataCriacao": "timestamp"
}
```

## Funcionalidades Principais

### 1. Gerenciamento de Transações

- Registro e visualização de receitas e despesas
- Categorização de transações
- Cálculo automático de saldo atual
- Fechamento de mês com registro do saldo final
- Histórico completo de transações

### 2. Planejamento Financeiro

- Criação de orçamentos mensais
- Definição de limites por categoria
- Configuração de categorias personalizadas
- Suporte para categorias de entrada e saída
- Sugestões inteligentes baseadas em transações anteriores

### 3. Dashboard e Visualização

- Exibição clara do saldo atual
- Interface dividida em abas para transações e planejamento
- Visualização gráfica de gastos vs. planejado
- Seletores para navegação entre meses
- Indicadores visuais para meses fechados

### 4. Fluxo de Dados e Persistência

- Armazenamento em Firebase Firestore
- Atualizações em tempo real com Firestore listeners
- Autenticação integrada de usuários
- Separação clara entre dados de diferentes usuários
- Estrutura de dados relacional (transações, planejamentos, fechamentos mensais)

## Arquitetura do Sistema

### Dashboard (Componente Principal)

O Dashboard (`Dashboard.js`) atua como o componente central da aplicação, orquestrando os diferentes aspectos da experiência do usuário. Ele:

- Integra os custom hooks para gerenciar dados (transações, planejamento, autenticação)
- Controla a navegação entre abas (transações e planejamento)
- Gerencia o estado de exibição de formulários
- Implementa a seleção e navegação entre meses
- Condiciona a interface com base no status do mês (aberto ou fechado)

### Gerenciamento de Transações

O hook `useTransactions.js` gerencia toda a lógica relacionada às transações financeiras:

- Busca transações do Firestore baseadas no mês selecionado
- Organiza as transações por data (mais recentes primeiro)
- Calcula o saldo atual baseado no saldo inicial e nas transações
- Atualiza o saldo em tempo real conforme transações são adicionadas/modificadas
- Detecta e respeita o status de fechamento do mês

### Exibição do Saldo

O componente `BalanceCard.js` exibe informações financeiras essenciais:

- Mostra o saldo atual ou final de forma destacada
- Adapta a exibição com base no status do mês (aberto ou fechado)
- Exibe informações adicionais como saldo inicial ou data de fechamento
- Oferece feedback visual através de um design gradiente distintivo

### Sistema de Planejamento

O componente `PlanejamentoForm.js` implementa a criação e edição de planejamentos financeiros:

- Permite adicionar, editar e remover categorias orçamentárias
- Suporta tanto categorias de receita quanto de despesa
- Sugere categorias baseadas no histórico de transações do usuário
- Verifica e atualiza planejamentos existentes para o mês selecionado
- Valida dados antes de salvar no Firebase

## Fluxo de Trabalho do Usuário

1. **Login e Autenticação**

   - O usuário faz login usando o sistema de autenticação
   - A aplicação carrega os dados específicos do usuário logado

2. **Visão do Dashboard**

   - O usuário visualiza seu saldo atual e informações do mês selecionado
   - Pode navegar entre diferentes meses usando o seletor de mês
   - Alterna entre as abas de transações e planejamento

3. **Gerenciamento de Transações**

   - Visualiza a lista de transações do mês selecionado
   - Adiciona novas transações através do botão flutuante
   - Fecha o mês atual para finalizar as transações e registrar o saldo final

4. **Planejamento Financeiro**

   - Cria ou edita o planejamento para o mês atual
   - Define categorias e valores planejados
   - Acompanha o progresso de gastos em relação ao planejado
   - Visualiza comparações entre valores planejados e realizados

5. **Análise e Monitoramento**
   - Acompanha a evolução do saldo ao longo do tempo
   - Compara diferentes meses para identificar padrões
   - Verifica o desempenho em relação ao planejamento

## Tecnologias Utilizadas

- **Frontend**: React.js com Hooks para gerenciamento de estado
- **UI Framework**: Material-UI (MUI) para componentes e estilos
- **Backend**: Firebase (Firestore para banco de dados, Authentication)
- **Armazenamento**: Estrutura NoSQL com coleções para transações e planejamentos
- **Estado**: Gerenciamento de estado através de React Hooks personalizados

## Considerações de Design

- Interface limpa e intuitiva com foco na usabilidade
- Feedback visual claro para o usuário (cores, gradientes, ícones)
- Design responsivo adaptável a diferentes tamanhos de tela
- Arquitetura modular e extensível
- Separação clara entre lógica de negócios e componentes de UI

## Integração com Firebase

A aplicação se integra profundamente com o Firebase, utilizando:

1. **Firestore Database**: Para armazenar transações, planejamentos e fechamentos mensais
2. **Firebase Authentication**: Para gerenciamento de usuários e controle de acesso
3. **Realtime Updates**: Através de listeners (onSnapshot) para manter a interface sincronizada
4. **Security Rules**: Para garantir que usuários só acessem seus próprios dados

O modelo de dados no Firestore foi projetado para facilitar consultas por mês e por usuário, permitindo que a aplicação escale de forma eficiente.
