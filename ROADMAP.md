# ROADMAP — LAST COUNTY

## STAGES 1–14 ✅
Core sandbox, survival, mundo civilizado, perigo, crafting, clima, sociedade,
veículos, lore, construção modular e montagem de veículos.

## STAGE 15 — MUNDO, EXPLORAÇÃO E GAMEPLAY ✅

### Mundo
- mapa de 420×120 → **960×168 tiles**
- 11 regiões com terreno, cobertura, vegetação e infectados próprios
- perfis de terreno: colinas, planaltos, vale, serra com subida longa
- ravina com ponte, ledges e destroços no fundo
- cavernas com bocas na superfície e galerias profundas
- pedreira com galeria ligando ao bunker (entrada alternativa da Blackridge)
- riachos, penhascos em degraus, estrada principal + desvios
- camada de parede de fundo (interiores e cavernas deixam de ser buracos pretos)

### Exploração
- portas trancadas (chave ou arrombamento), tapumes, portões com energia
- porões, sótãos, mezaninos, decks de estacionamento, contêineres
- escadas de mão e passarelas: verticalidade real
- terminais que exigem energia e entregam chaves, registros e pistas
- quadro de chaves, bomba de combustível, fogueiras, alçapões
- containers podem estar vazios; loot raro tem marcação visual

### Objetivos e progressão
- sistema de objetivos que aparece sozinho conforme o mundo dá o motivo
- início fraco de propósito (faca, água, ataduras)
- ampliação permanente de mochila via armação
- Blackridge exige cartão + registros + proteção contra contaminação

### Infectados
- máquina de estados completa: dormente, vagando, investigando, procurando,
  perseguindo, perdendo o rastro
- audição com memória, grito que alerta o grupo
- infectados dormentes dentro dos prédios
- spawn sempre fora da câmera
- aparência e tipo por região

### Combate e furtividade
- agachar (`CTRL`), ruído por postura
- armas com alcance, velocidade, impacto, fôlego e ruído distintos
- golpe pelas costas / em dormente com dano multiplicado
- knockback proporcional à arma

### Eventos e mundo vivo
- hordas, acampamentos, tempestades, prédios energizados, bloqueios, caixas
- pássaros, animais ao longe, fumaça, folhas ao vento, relâmpagos

### Apresentação
- pipeline de arte procedural em `tools/` (tiles, sprites, props, itens, UI)
- renderizador de terreno com chunks, mistura de materiais, tufos e oclusão
- iluminação com propagação de luz do céu e fontes pontuais
- HUD desenhada no canvas; painéis com identidade única

### Ferramentas
- `tools/smoke.js` — boota o jogo e simula uma sessão inteira
- `tools/canvas.js` + `tools/render.js` — exporta frames reais em PNG
- `tools/inspect.js`, `tools/sheet.js` — revisão de arte

## STAGE 16 — CONSOLIDAÇÃO 1.0
- save/load persistente
- menu principal e opções
- mapa do mundo consultável
- áudio
- balanceamento de economia e dificuldade
- mais variação de layout por prédio
- acessibilidade

## STAGE 20 — CONTEÚDO E IMERSÃO NO MUNDO ✅
- estado de mundo por estrutura (state, loot, perigo, ambiente, eventos, segredos, energia, visitas, alerta)
- 35 materiais novos (natureza, cidade, industrial, metrô, Blackridge) + desgaste procedural no renderer
- 120 props novos; mobiliário por cômodo que reage ao estado
- 10 lugares novos, todas as construções antigas expandidas
- metrô, drenagem, mina em dois níveis, Blackridge com setores e nível -2
- 16 eventos locais que alteram o mundo
- luzes coloridas, emissores ambientais, sons por região
- validação de mundo (`tools/validate_world.js`) e caminho garantido do spawn à Blackridge

## STAGE 21 — PROGRESSÃO & GAMEPLAY CORE ✅
- progressão T0–T5 por materiais e descoberta
- loot profissional por local
- 105 itens e arsenal/equipamentos expandidos
- ataque principal no mouse
- mapa no `M` com fog of war e marcadores
- primeira camada de moradores na base

## STAGE 22 — BASE VIVA, NPCS & MUNDO DINÂMICO ✅
- profissões e postos de trabalho na base
- nível de assentamento e produção diária pequena
- estoque da base
- comandos de companheiro
- rádio com oportunidades temporárias e busca aproximada no mapa
- save/load persistente, autosave e restauração do seed/mundo
- integração de World State, veículos, NPCs, energia, containers e lore no save


## STAGE 23 — COMUNIDADE, OPERAÇÕES & ENDGAME ✅
- moral e traços dos moradores
- pedidos pessoais da base
- operações maiores pelo rádio
- eventos de condado que alteram o mundo
- operações e alertas no mapa
- campanha Blackridge em etapas
- consequências reais para transmitir/selar o arquivo
- persistência Stage 23 compatível com saves Stage 22

## STAGE 24 — COMBAT, MOTION & ANIMATION FOUNDATION ✅
- movimento desacelerado e com inércia controlada
- sprint com rampa, turn acceleration e desaceleração
- câmera mais pesada
- input buffer e cadeia leve de melee
- bloqueio de melee por paredes
- arquitetura central de estados de animação
- Cambaleante e Blindado como novos perfis de infectado
- compatibilidade mantida com sprites/roupas existentes

## STAGE 25 — VISUAL CHARACTER OVERHAUL
- redesenho do personagem principal
- animações completas usando os estados da Stage 24
- overlays de roupas/equipamentos mais bonitos
- infectados visualmente distintos por tipo e contexto
- armas/ferramentas melhor alinhadas às mãos
- polish de sombra, contato e leitura visual
- usar `CLAUDE_STAGE25_VISUAL_HANDOFF.md` e evitar refactor de gameplay

## STAGE 31 — SUSTENTO: COMIDA, CULTIVO, CLIMA E CAÇA ✅

### Comida & cozinha
- alimento perecível com frescor por lote, misturado por quantidade ao juntar
- calor acelera e frio retarda o estrago; comida vencida vira adubo
- geladeira como container refrigerado, dependente de um gerador ligado
- "alimentação": um único número lento que recompensa refeição preparada e variada
- comer cru ou passado é aposta, com mal-estar como consequência
- três estações de cozinha (fogo, fogão/cozinha, varal) e 14 receitas
- a cozinha da base converte estoque em refeição, uma panela por dia

### Cultivo
- canteiro com crescimento, água e vigor; um E faz a ação certa do momento
- cinco culturas com ciclo, sede, piso de frio e rendimento próprios
- toda colheita devolve semente
- chuva rega sozinha; calha de irrigação cuida dos vizinhos em 4 tiles
- estufa anula a geada, acelera 22% e economiza água
- morador com função de horta rega e colhe para o estoque todo dia
- composto fecha o ciclo: o que apodreceu alimenta o que vem

### Clima, estações e temperatura
- ciclo leve de 4 estações x 7 dias: temperatura base, sorteio do tempo e tom de cor
- 8 condições, cada uma declarando visibilidade, som, temperatura e escurecimento
- visibilidade corta para os dois lados: neblina esconde o jogador e o infectado
- chuva e vendaval abafam o ruído; neblina carrega som melhor
- chuva abaixo de 0,5 grau vira neve
- microclima por região: Mata Fria e Serra nevam, Baixada Seca levanta poeira

### Caça
- cinco espécies: coelho, galinha-do-mato, veado, javali e lobo
- enxergam mal e ouvem muito bem; javali revida e lobo caça à noite
- carcaça no chão, abate com lâmina, faca de abate rende 45% a mais
- pressão de caça esvazia a região e se recupera em alguns dias
- armadilha de laço rende sozinha enquanto o jogador faz outra coisa
- couro e pele viram quatro peças de roupa quentes feitas na própria base

### Infraestrutura
- save v31, com leitura de 22/23/27/28
- tools/gen_stage31_assets.js (57 assets) e tools/validate_stage31.js
- seção Stage 31 no smoke test, exercitando estrago, horta, clima, caça e geladeira
