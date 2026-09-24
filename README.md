# LAST COUNTY — Stage 24: Combat, Motion & Animation Foundation

A Stage 24 mantém todo o conteúdo, progressão, comunidade e endgame da Stage 23, mas muda o **feeling central**: movimento mais deliberado, sprint progressivo, câmera com mais peso, melee com input buffer/chain, linha física para golpes e uma arquitetura completa de animações pronta para o overhaul gráfico da Stage 25.

A arte principal ainda é a da versão anterior de propósito. Leia `CLAUDE_STAGE25_VISUAL_HANDOFF.md` antes de redesenhar personagem ou infectados.

Survival sandbox 2D em um condado rural pós-apagão. A build atual preserva a
progressão T0–T5, mapa, base viva, operações, Blackridge/endgame e toda a expansão
visual das versões anteriores, agora com uma camada de controle e animação pensada
para um combate mais deliberado e para o próximo overhaul gráfico.

## Como rodar

Abra `index.html` em um navegador. Não há dependências externas nem build.

Para validar o projeto sem navegador:

```
node tools/smoke.js          # boota o jogo inteiro e simula uma sessão
node tools/validate_world.js 6   # tiles, sprites, props enterrados, acessibilidade (6 seeds)
node tools/render.js out.png 110 11 12 [tileY]   # frame real em PNG (tileY: subsolo)
for f in js/*.js; do node --check "$f"; done
```

## Loop de jogo

```
EXPLORAR → ENCONTRAR RECURSOS → ENFRENTAR OU EVITAR → VOLTAR PARA A BASE
   → CRAFTAR / CONSTRUIR → DESBLOQUEAR ÁREAS → VEÍCULO / NPC / INFORMAÇÃO
   → REGIÕES MAIS PERIGOSAS
```

O jogador começa com pouco: uma faca, um pouco de água e ataduras. Ferramentas,
capacidade de carga, energia e transporte são coisas que o condado precisa
entregar.

## Mundo

960×168 tiles divididos em 11 regiões com terreno, vegetação e infectados
próprios:

Mata Fria · Pastagem Harlow · Corredor Rural · Entroncamento 17 · Bairro Cedar
Row · Centro de North County · Distrito Cívico · Baixada Seca · Zona Industrial
Westline · Serra Oeste · Complexo Blackridge

Verticalidade e caminhos alternativos:

- ravina com ponte, ledges e destroços no fundo
- serra com subida longa e mirante
- cavernas com bocas na superfície e galerias profundas
- pedreira com galeria que liga ao bunker da Blackridge (entrada secreta)
- porões, sótãos, mezaninos, decks de estacionamento e contêineres empilháveis
- escadas de mão (`TILE.LADDER`) e passarelas (`TILE.CATWALK`) em todo o mapa

## Exploração

Cada prédio pode esconder algo. As interações de `E` incluem:

| Situação | O que exige |
|---|---|
| Porta trancada | chave específica **ou** arrombar com pé de cabra (barulho) |
| Porta com tapume | pé de cabra, machado ou martelo, vários golpes |
| Portão de garagem / doca | energia na área **ou** força bruta |
| Terminal | energia; entrega registros, chaves e pistas |
| Quadro de chaves | chave de quarto do motel |
| Alçapão / elevador | desce para porões, bunker e galerias |
| Bomba de combustível | energia + recipiente |
| Fogueira | 1 madeira; aquece, cozinha e ilumina |
| Cama | dormir até o amanhecer (se não houver ameaça) |
| Barril de chuva | enche garrafas durante a chuva |

Nem todo container tem loot — alguns estão vazios, outros guardam o material
raro da região.

## Objetivos

Metas aparecem sozinhas quando o mundo as torna relevantes (sede, uma porta que
você não consegue abrir, um veículo sem combustível) e se resolvem sozinhas
quando você resolve o problema. Ficam no canto superior direito, no máximo três
por vez.

## Infectados

Estados: dormente → vagando → investigando ruído → procurando → perseguindo →
perdendo o rastro → vagando.

- som importa: correr, minerar, arrombar, gerador e motor atraem
- agachar (`CTRL`) deixa você quase silencioso
- o primeiro grito de perseguição chama os infectados próximos
- muitos já estão parados dentro dos prédios até serem incomodados
- spawn sempre fora da câmera
- tipos: Errante, Corredor, Observador, Pesado
- aparências por região: civil, trabalhador, paciente, socorrista, rural, técnico Blackridge

## Combate

Armas têm alcance, velocidade, impacto, custo de fôlego e ruído próprios:

| Arma | Perfil |
|---|---|
| Faca | rápida, silenciosa, alcance curto, ótima pelas costas |
| Pé de cabra | rápido, versátil, arromba portas |
| Machado | dano alto, golpe lento |
| Martelo | impacto e knockback altos |
| Picareta | equilibrada, barulhenta |

Golpes pelas costas ou em infectados dormentes causam dano multiplicado.

## Eventos de mundo

Horda na estrada · acampamento recente · tempestade ou neblina · prédio com
gerador ligado (luz + barulho + loot) · bloqueio na estrada · caixa lacrada
vigiada. Sempre fora da câmera, com intervalos longos.

## Base

Bancada, fogueira, cama, armazenamento, gerador, luz, barril de chuva, bancada
automotiva e defesas. Dormir pula a noite; o gerador religa portões e terminais
da área inteira.

## Sistemas preservados

Survival completo (fome, sede, energia, sono, temperatura, molhado,
contaminação, ferimentos), clima, inventário com peso, crafting em seis
categorias, construção modular, containers, NPCs com confiança/quests/comércio,
companheiros, reputação de facção, veículos com combustível/bateria/condição/
porta-malas, montagem modular de veículos, eletricidade, rádio, arquivo de lore
e as decisões finais da Blackridge.

## Pipeline de assets

Toda a arte é gerada por código em `tools/` (sem assets de terceiros):

```
node tools/gen_tiles.js      # biblioteca base de materiais × 3 variações
node tools/gen_sprites.js    # player, 25 roupas, matriz de infectados, NPCs
node tools/gen_props.js      # 196 props de cenário (+ js/decor_data.js com os tamanhos)
node tools/gen_items.js      # ícones-base de item
python tools/gen_stage21_assets.py # ícones de item da Stage 21 (as roupas saem do Node desde a Stage 25)
node tools/gen_ui.js         # HUD, filtros, módulos, cartões de construção
node tools/gen_portraits.js  # retratos de diálogo
```

`tools/canvas.js` implementa um Canvas2D em software para que
`tools/render.js` consiga exportar frames reais do jogo em PNG.
`tools/preview_sheet.js` monta contact sheets com linha de chão para revisar
poses de personagem sem abrir o jogo:

```
node tools/preview_sheet.js out.png 4 13 player
FW=32 FH=56 GROUND=54 node tools/preview_sheet.js out.png 6 8 npc_mara
```

`node tools/gen_sprites.js` reporta `frame bounds: OK` quando nenhuma pose
ultrapassa a célula do seu frame, e `node tools/validate_assets.js` confere que
todo índice de frame pedido pelas animações existe na sheet correspondente.

## Stage 20 — mundo dentro do mapa

**Estado de mundo por estrutura** (`structures.js`): cada estrutura recebe
`state` (intacta, saqueada, barricada, infestada, danificada), `lootProfile`,
`dangerLevel`, `ambientProfile`, `eventPool`, `secretRooms`, `powered`,
`discovered`, `visits` e `alert`. O estado muda o mobiliário (prateleiras
vazias, armários abertos, barricadas, entulho, rachaduras), o loot, a
quantidade de infectados e o desgaste das paredes.

**Interiores**: `construct()` devolve cômodos; `dressBuilding()` mobilia cada
um por tema (sala, cozinha, quarto, banheiro, lavanderia, enfermaria,
laboratório, sala de aula, arquivo, celas, sala técnica...) e troca o
acabamento (papel de parede, azulejo, carpete, piso comercial). Casas têm sótão
e porão; prédios de laje têm cobertura com caixa d'água, antenas e acesso.

**Lugares novos**: Trilha do Cervo, Posto Florestal Harlow (torre de vigia),
Lavoura Harlow, Trailer do Parque, Cemitério da Capela, Residencial Pine Court
(4 andares, cada apartamento com um destino), Hospital Regional Harlow (ala
isolada, ala saqueada, ala infestada, laboratório só pela escada externa,
casa de máquinas que religa o prédio), Bombeiros de Westline, Estação Central
(metrô sob o centro), Galeria de drenagem (do Cedar Row ao metrô), mina com
nível inferior, desabamento e poço até a Blackridge, Blackridge com
alojamento, pátio de energia, três setores e nível -2 com a Sala Zero.

**Histórias ambientais**: famílias que fugiram, mesa posta com rádio, abrigo
barricado, carro na trilha, macas no corredor, quarentena lacrada, bagagem na
plataforma, mecânico que não terminou o serviço, contêiner habitado.

**Eventos locais** (`events.js`, a partir do `eventPool`): rádio, luzes
piscando, queda de energia, luz de emergência, setor acordando, barulho em
outro cômodo, alarme, sino, estoque destravando, gerador ligando, máquina,
estrondo metálico, horda no túnel, desabamento, falha de contenção, energia
parcial. Todos alteram algo (energia, portas, luzes, infectados, rocha).

**Ambientação**: variantes procedurais de tile (desgaste, musgo, ferrugem,
manchas de infiltração, sujeira, trepadeiras) guiadas pelo estado; luzes
coloridas (quente, fria, vermelha de emergência) que dependem de
`structure.powered`; fumaça, vapor, goteiras, poeira, moscas, vaga-lumes,
brasas; papéis ao vento no centro; interferência na Blackridge; sons por
região.

**Caminhos**: portas nas paredes externas (os prédios eram caixas fechadas),
portas dos fundos, pilares/postes atrás do plano de jogo, e `fixPaths()` que
percorre o mapa a partir do spawn e prende uma escada onde o caminho sem
ferramentas para.


## Stage 21 — progressão e controles

Progressão por descoberta/material: `T0 Improviso → T1 Sucata → T2 Metalurgia →
T3 Industrial → T4 Emergência → T5 Blackridge`. O crafting mostra o tier e os
objetivos emergentes indicam o próximo degrau. Equipamentos profissionais vêm dos
locais coerentes: Bombeiros, Delegacia, Hospital, oficina/indústria e Blackridge.

Controles centrais: `LMB` ataque/disparo, `RMB` golpe pesado ou mirar, `R` recarrega,
`M` abre o mapa com fog of war e marcadores. `J/K` continuam como alternativas.
Veja `CHANGELOG_STAGE21.md` para a lista completa.

## Stage 22 — Base Viva, NPCs e expedições por rádio

A base agora possui estações funcionais (rádio, cozinha comunitária, enfermaria e
posto de vigia), moradores trabalham de acordo com a profissão e geram pequenos
suprimentos. O rádio da base capta oportunidades temporárias ligadas a locais
reais; depois de ouvir a transmissão, uma área aproximada aparece no mapa.

Companheiros recebem comandos **SEGUIR / ESPERAR / EVITAR COMBATE / BASE**.
O painel de Pessoas também mostra nível da base, estações, moradores, estoque e
controles de save.

Persistência: `F6` salva, `F9` carrega e existe autosave. O slot preserva seed,
terreno alterado, construções, loot, veículos, NPCs, World State, mapa, rádio,
base, energia, sobrevivência e progresso de lore. Veja `CHANGELOG_STAGE22.md`.

## Stage 23 — Comunidade, operações e endgame

- NPCs com traços, moral e memória curta.
- Pedidos pessoais de moradores da base.
- Operações emergentes com risco, prazo e objetivo real no mapa.
- Eventos maiores: migração de horda e falhas regionais de energia.
- Marcadores de operação/evento no mapa `M`.
- Blackridge em uma sequência clara de etapas e com consequências após o Arquivo Central.
- Save v23 com compatibilidade de leitura para saves v22.

Consulte `CHANGELOG_STAGE23.md` para a lista completa.

## Stage 24 — Combat, Motion & Animation Foundation

- movimento mais lento e deliberado, com aceleração/desaceleração e sprint progressivo
- câmera com menos snap e look-ahead mais moderado
- clique de melee em buffer durante a recuperação e cadeia leve de 3 golpes
- paredes sólidas bloqueiam ataques corpo a corpo
- alvo infectado sob o cursor tem prioridade sobre mineração
- estados de animação do player e infectados centralizados em `js/animation.js`
- layouts de sprites, overlays de roupa e anchors da mão preparados para a Stage 25
- infectados com aceleração/pacing mais legível
- novos perfis Cambaleante e Blindado, ainda usando arte temporária
- handoff visual em `CLAUDE_STAGE25_VISUAL_HANDOFF.md`

## Stage 25 — Visual Character Overhaul

- rig paramétrico único (`tools/character.js`) com poses resolvidas por IK: player, roupas, infectados e NPCs compartilham proporção, peso e luz
- frames do player/infectado de 32×56 para 48×64; player de 12 para 65 frames, infectados de 8 para 33
- caminhada e corrida com ciclos de passada distintos, bacia que cai no contato e pé plantado na linha do chão
- agachamento, pulo, queda, aterrissagem, escalada, mira, tiro, recarga, mineração e dano com arte própria
- melee em windup/ativo/recuperação com transferência de peso real e recuperação mais cara no golpe pesado
- arma na mão ancorada por frame (`PLAYER_HAND_FRAMES`), lida do mesmo solver que desenhou a arte
- 25 roupas em camadas reconhecíveis: civil, policial, bombeiro, paramédico, mineiro, industrial e Blackridge
- infectados por contexto × forma (63 sheets): Errante, Corredor, Observador, Pesado, Berrador, Contido, Cambaleante e Blindado com silhuetas distintas
- sombras de contato em dois níveis para player e infectados
- validação de arte no pipeline: limites de frame na geração e faixa de frames na validação de assets
- gameplay da Stage 24 preservado: nada de movimento, combate, IA, progressão, inventário, crafting, veículos, mapa, base, save/load ou eventos foi reescrito

Consulte `CHANGELOG_STAGE25.md` para a lista completa.

## Stage 31 — Sustento: comida, cultivo, clima e caça

A base deixa de depender só do que sobrou nas prateleiras do condado. A regra do
estágio inteiro foi não transformar nada disso em micro-gestão: o jogador ganhou
**um** número novo para acompanhar, e ele anda devagar.

### Comida
- alimento fresco tem frescor de 0 a 100, que cai com o tempo e com o calor
- `perishable`, `preserved` e `nutrition` governam tudo; o resto acontece sozinho
- o frescor aparece no painel do item (FRESCO / BOM / PASSANDO / QUASE ESTRAGADO)
- lotes se misturam por quantidade — ninguém precisa rastrear pedaço por pedaço
- comida no zero vira **Comida estragada**, que ainda serve de adubo
- comer cru ou passado é aposta: mal-estar custa vida, fôlego e alimentação

### Cozinha
- **Geladeira**: container refrigerado que só conserva de verdade com um gerador
  ligado por perto (16% do decaimento); sem energia ainda é uma caixa isolada
- **Fogão a lenha** e a Cozinha comunitária liberam as refeições preparadas
- **Varal de secagem** cura carne, ervas e couro sem depender de energia
- 14 receitas de cozinha, nenhuma acima de T1
- **Alimentação**: barra lenta que sobe com refeição preparada e variada, e vale
  26% menos fome, mais fôlego, mais calor e uma regeneração lenta de vida
- o morador de suprimentos cozinha de verdade: uma panela por dia do estoque

### Cultivo
- **Canteiro** com crescimento, água e vigor; `E` faz a ação certa do momento
- cinco culturas — batata, milho, feijão, tomate e trigo — e toda colheita
  devolve semente
- a chuva rega sozinha; a **Calha de irrigação** cuida dos vizinhos em 4 tiles
- a **Estufa** anula a geada, acelera 22% e economiza água
- moradores com perfil agrícola assumem a **Horta da base**: regam e colhem para
  o estoque todo dia, enquanto o jogador está longe

### Clima e estações
- ciclo leve de 4 estações × 7 dias: temperatura base, sorteio do tempo, tom de cor
- 8 condições, cada uma declarando visibilidade, som, temperatura e escurecimento
- a visibilidade corta para os dois lados: na neblina ninguém vê ninguém
- chuva e vendaval abafam passos, tiros e gritos; neblina carrega som melhor
- chuva abaixo de 0,5 °C vira neve
- microclima por região: Mata Fria e Serra nevam, a Baixada Seca levanta poeira

### Caça
- coelho, galinha-do-mato, veado, javali e lobo
- enxergam mal e ouvem muito bem — agachar, chuva e vento são do caçador
- javali revida quando ferido; lobo caça o jogador à noite
- carcaça no chão, abate com lâmina, **Faca de abate** rende 45% a mais
- a pressão de caça esvazia a região e se recupera em alguns dias
- **Armadilha de laço** rende sozinha enquanto você faz outra coisa
- couro e pele viram casaco, capuz, luvas e botas feitos na própria base

Consulte `CHANGELOG_STAGE31.md` para a lista completa.
