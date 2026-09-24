# PROMPT PARA O CLAUDE — LAPIDAÇÃO DA STAGE 41

Você vai trabalhar sobre uma versão já funcional de **Last County Stage 41 — High-Risk Expeditions**. Não reescreva o projeto do zero e não remova sistemas existentes. Primeiro examine todos os arquivos, entenda a arquitetura e execute `node tools/smoke.js`, `node tools/validate_stage40.js` e `node tools/validate_stage41.js`.

## O que já está implementado

- Cinco expedições jogáveis, registradas em `js/stage41_expeditions.js`.
- Riscos progressivos de 1 a 5.
- Ambientes subterrâneos, portas, iluminação, props, containers e infectados.
- Loot garantido e progressivo.
- Integração com o mapa e o sistema de estruturas.
- Compatibilidade com saves antigos e save v41.
- Stage 40.2 e Greenwater preservados.

## Sua missão

Lapide profundamente essa atualização para que cada expedição pareça um local real do universo de Last County, não uma sala genérica de loot. Preserve a estrutura técnica atual e melhore cenário, leitura visual, descoberta, equilíbrio e ritmo.

### 1. Identidade visual de cada expedição

- Abrigo do Xerife: pequeno, improvisado, policial e rural. Evidências, mapas antigos, armários, área de descanso e sinais de resistência.
- Quarentena Harlow: triagem médica emergencial, divisórias, luzes de emergência, setor de isolamento e posto de segurança.
- Bunker Greenwater: abrigo civil autossuficiente, despensa, dormitórios, energia, sementes e uma pequena área de cultivo abandonada.
- Arsenal do Condado: arquitetura militar austera, anteparos, manutenção, corredores de serviço, depósito principal e rotas estreitas.
- Cofre Blackridge BR-7: extensão coerente do complexo existente, com pesquisa, segurança, equipamentos tecnológicos e integração física ao nível inferior de Blackridge.

Use apenas assets e sistemas coerentes com a direção artística pixel art atual. Se criar assets novos, mantenha escala, paleta, nitidez e nomenclatura do projeto.

### 2. Descoberta e preparação

- Adicione pistas ambientais e registros curtos que levem aos locais sem colocar marcadores gratuitos no mapa.
- Faça NPCs, rádios, bilhetes ou terminais sugerirem localização, risco e preparação necessária.
- O jogador deve entender visualmente o perigo antes de entrar.
- Não use textos longos ou janelas com aparência de software empresarial.
- Mostre o risco como linguagem do mundo: placas, símbolos, iluminação, obstáculos e ruídos.

### 3. Progressão e equilíbrio

- Mantenha a escada geral: pistola e ferramentas → espingarda e medicina → carabina e sobrevivência → equipamento profissional → tecnologia Blackridge.
- Evite excesso de munição e duplicação fácil de armas raras.
- O loot principal deve compensar o risco, mas não eliminar a necessidade de explorar outros sistemas.
- Faça o peso importar: o jogador não deve conseguir levar todas as recompensas sem veículo, mochila adequada ou viagens extras.
- Preserve a possibilidade de recuar, reorganizar equipamentos e voltar depois.

### 4. Desafios diferentes em cada local

- Não resolva todos os locais apenas aumentando a vida dos infectados.
- Varie escuridão, energia, portas, espaço de combate, rotas alternativas, barulho, contaminação fictícia do jogo e alarmes.
- Todos os desafios precisam ser legíveis e justos.
- Mantenha pelo menos uma rota de fuga ou alternativa por expedição.
- Não crie becos sem saída que prendam o jogador após carregar um save.

### 5. Consequências e revisitas

- Após o primeiro saque, permita que alguns locais sirvam como posto avançado, fonte de energia, abrigo temporário ou ponto de operação.
- Não transforme automaticamente todos em bases completas.
- Registre no save: descoberta, primeira entrada, cofre aberto, energia restaurada e conclusão.
- Containers saqueados não podem reaparecer cheios ao carregar o jogo.

### 6. Interface e feedback

- Crie uma apresentação discreta ao descobrir uma expedição: nome, classificação de risco e uma frase curta.
- Use a identidade visual desgastada e diegética de Last County.
- Melhore os prompts de interação das portas e entradas.
- O mapa deve diferenciar expedições comuns, subterrâneas e de alto risco depois que forem descobertas.
- Não polua a HUD durante exploração normal.

## Regras técnicas obrigatórias

- Não altere a largura de 1900 nem a altura de 184 sem necessidade comprovada.
- Não quebre Stage 39, Stage 40, Stage 40.2, Greenwater, Blackridge, modo criativo, inventário, veículos, energia, agricultura ou construção.
- Preserve compatibilidade com saves 40 e 41.
- Não renumere pontos antigos de interação de forma que saves existentes restaurem estados errados.
- Não substitua loot já saqueado em saves existentes.
- Não adicione bibliotecas externas nem dependência de servidor.
- O jogo precisa continuar funcionando ao abrir `index.html`.
- Faça alterações focadas; prefira ampliar `js/stage41_expeditions.js` e criar módulos Stage 41 claramente identificados.

## Validação obrigatória

Execute e corrija tudo até passar:

```bash
node tools/validate_stage39.js
node tools/validate_stage40.js
node tools/validate_stage41.js
node tools/validate_assets.js
node tools/smoke.js
node tools/validate_world.js 6
```

Depois, faça uma revisão visual real no navegador em pelo menos duas resoluções e visite as cinco expedições. Verifique entradas, colisões, escadas, portas, containers, iluminação, infectados, mapa, morte, salvamento e carregamento.

## Entrega

- Atualize `CHANGELOG_STAGE41.md` explicando apenas mudanças reais.
- Entregue um ZIP com a pasta raiz `jogo`, pronto para extrair por cima da instalação existente.
- Não entregue somente planos ou exemplos: implemente, teste e empacote.
