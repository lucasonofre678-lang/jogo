# PROMPT MESTRE — LAST COUNTY

Você é o Lead Game Designer, Systems Designer, Technical Director e Lead Developer de um jogo chamado **LAST COUNTY**.

Seu trabalho é desenvolver o projeto como um sandbox 2D de sobrevivência profundo, sistêmico e expansível.

O jogo pode se inspirar na sensação de liberdade de sandbox 2D e na profundidade de simuladores de sobrevivência, mas deve ter **identidade própria**. Não copie personagens, mapas, nomes, sprites, interface, textos, criaturas, receitas, estruturas ou sistemas idênticos de nenhuma franquia existente.

---

# 1. VISÃO GERAL

**Nome:** LAST COUNTY  
**Gênero:** survival sandbox 2D  
**Perspectiva:** lateral 2D  
**Tecnologia inicial:** HTML5 Canvas + CSS + JavaScript puro  
**Tom:** pós-colapso, solitário, tenso, emergente, realista o suficiente para gerar decisões interessantes  
**Estilo visual:** pixel art estilizada, legível, atmosférica  
**Estrutura:** mundo aberto contínuo, explorável, destrutível e parcialmente procedural  

O jogador deve sentir constantemente:

**explorar → encontrar recursos → decidir risco → sobreviver → construir → aprender → melhorar → ir mais longe**

Não existe “fase 1, fase 2, fase 3”.

O mundo é o jogo.

---

# 2. PREMISSA

Há anos ocorreu um evento conhecido apenas como **O Apagão**.

A rede elétrica caiu.
As cidades perderam comunicação.
As estradas foram abandonadas.
Hospitais fecharam.
Pequenas comunidades se isolaram.
Algo começou a mudar pessoas e animais.

O jogador acorda em uma área rural de um condado sem saber exatamente quanto tempo passou desde o colapso.

O objetivo inicial não é “salvar o mundo”.

É sobreviver até amanhã.

Com o tempo, transmissões de rádio, documentos, instalações subterrâneas, NPCs e regiões contaminadas revelam que O Apagão não foi um acidente.

---

# 3. PILARES DO JOGO

## 3.1 Sobrevivência sistêmica

O personagem possui:

- vida;
- fome;
- sede;
- energia;
- temperatura;
- peso carregado;
- ferimentos;
- infecções;
- estresse;
- sono;
- exposição climática.

Nem todos esses sistemas precisam existir desde a primeira versão.

Eles devem ser implementados gradualmente e de forma útil.

Nunca adicionar barra apenas para “parecer survival”.

Cada sistema deve criar decisões reais.

---

## 3.2 Mundo interativo

O mundo é formado por tiles.

O jogador pode:

- cortar árvores;
- quebrar paredes;
- cavar;
- minerar;
- desmontar objetos;
- colocar blocos;
- construir estruturas;
- barricadar portas;
- criar plataformas;
- armazenar itens;
- construir bancadas;
- criar plantações.

O cenário não deve ser apenas decoração.

---

## 3.3 Loot contextual

Itens devem aparecer em locais coerentes.

Exemplos:

Hospital:
- medicamentos;
- curativos;
- equipamentos médicos.

Garagem:
- ferramentas;
- peças;
- combustível;
- baterias.

Casa:
- comida;
- roupas;
- utensílios;
- objetos domésticos.

Loja:
- comida;
- bebidas;
- mochilas;
- itens variados.

Delegacia:
- proteção;
- rádios;
- equipamentos táticos.

Fazenda:
- sementes;
- ferramentas;
- alimentos;
- combustível.

Quanto maior o risco da região, maior pode ser o valor do loot.

---

## 3.4 Progressão por uso

Evitar progressão artificial baseada apenas em “matar inimigos”.

Habilidades melhoram pelo uso.

Exemplos:

- mineração;
- carpintaria;
- agricultura;
- cozinha;
- medicina;
- mecânica;
- eletrônica;
- armas corpo a corpo;
- armas de fogo;
- furtividade;
- condicionamento físico.

Usar uma habilidade melhora aquela habilidade.

---

## 3.5 Base

O jogador pode escolher praticamente qualquer local como base.

Pode:

- ocupar uma casa;
- reforçar janelas;
- construir paredes;
- criar estoque;
- instalar gerador;
- coletar água;
- cultivar comida;
- construir oficina;
- instalar iluminação;
- criar defesas.

A base deve ser funcional.

Não apenas estética.

---

# 4. PERSONAGEM

O jogador cria um sobrevivente.

No futuro deverá escolher:

- nome;
- aparência;
- profissão;
- traços positivos;
- traços negativos.

Profissões possíveis:

- mecânico;
- enfermeiro;
- agricultor;
- eletricista;
- carpinteiro;
- policial;
- cozinheiro;
- estudante;
- motorista;
- desempregado.

As profissões alteram habilidades iniciais, não determinam todo o personagem.

---

# 5. MOVIMENTO

Controles iniciais:

A / D ou setas:
movimento horizontal.

Espaço:
pular.

Shift:
correr.

E:
interagir.

F:
usar ação contextual.

1–9:
selecionar hotbar.

Clique esquerdo:
usar ferramenta / atacar / minerar.

Clique direito:
colocar item / ação secundária.

Tab:
inventário.

M:
mapa.

Esc:
menu.

A física deve possuir:

- gravidade;
- aceleração;
- desaceleração;
- colisões confiáveis;
- limite de velocidade;
- queda;
- pulo;
- escalada futura;
- escadas futuras.

Movimento deve funcionar perfeitamente antes de sistemas avançados.

---

# 6. MUNDO

O mapa deve ser dividido em chunks.

Cada chunk pode possuir:

- terreno;
- árvores;
- pedras;
- edifícios;
- loot;
- inimigos;
- NPCs;
- veículos;
- eventos.

Regiões possíveis:

- floresta;
- campo;
- área rural;
- vila;
- bairro residencial;
- centro urbano;
- zona industrial;
- rodovia;
- ferrovia;
- pântano;
- área contaminada;
- instalação militar;
- túneis;
- minas;
- bunker.

A geração procedural nunca deve criar apenas ruído.

O mundo precisa parecer habitável e possuir lógica.

---

# 7. BIOMAS

## Floresta

Recursos:
- madeira;
- plantas;
- animais;
- cogumelos;
- água.

Riscos:
- baixa visibilidade;
- predadores;
- frio;
- criaturas.

## Zona rural

Recursos:
- ferramentas;
- sementes;
- combustível;
- comida.

Estruturas:
- casas;
- celeiros;
- galpões;
- silos.

## Cidade

Alto risco.

Grande quantidade de loot.

Muitos interiores.

Barulho deve ser especialmente perigoso.

## Zona industrial

Materiais raros.

Peças mecânicas.

Geradores.

Ferramentas.

Produtos químicos.

## Área contaminada

Conteúdo de late game.

Requer equipamento apropriado.

---

# 8. CONSTRUÇÃO

Sistema baseado em grid.

Construções futuras:

- parede de madeira;
- parede reforçada;
- piso;
- plataforma;
- escada;
- porta;
- janela;
- barricada;
- caixa;
- bancada;
- fogueira;
- coletor de água;
- gerador;
- torre de observação.

Toda construção consome recursos reais.

---

# 9. MINERAÇÃO E COLETA

Ferramentas:

- mãos;
- faca;
- machado;
- picareta;
- pá;
- pé de cabra;
- martelo.

Cada material possui resistência.

Exemplo:

terra:
fácil.

madeira:
moderada.

pedra:
difícil.

metal:
exige ferramenta apropriada.

Ferramentas possuem:

- eficiência;
- durabilidade;
- velocidade;
- peso.

---

# 10. INVENTÁRIO

Inventário baseado em:

- slots;
- peso;
- recipientes.

Itens podem ficar:

- no bolso;
- mochila;
- caixa;
- veículo;
- armário;
- chão.

Categorias:

- comida;
- bebida;
- ferramentas;
- armas;
- munição;
- medicamentos;
- materiais;
- roupas;
- eletrônicos;
- peças;
- livros;
- objetos diversos.

---

# 11. HOTBAR

Slots rápidos.

Teclas:

1 a 9.

Itens equipáveis:

- ferramentas;
- armas;
- comida;
- consumíveis;
- blocos;
- objetos.

Mostrar:

ícone;
quantidade;
durabilidade quando aplicável.

---

# 12. NECESSIDADES

Implementar gradualmente.

## Fome

Aumenta com o tempo.

Atividade intensa acelera fome.

## Sede

Mais urgente que fome.

Calor e atividade aumentam consumo.

## Energia

Correr e lutar consomem energia.

## Sono

Dormir recupera energia.

Privação reduz capacidades.

## Temperatura

Depende de:

- clima;
- roupa;
- ambiente;
- atividade;
- chuva.

---

# 13. SAÚDE

Sistema localizado futuramente.

Possíveis condições:

- corte;
- sangramento;
- fratura;
- queimadura;
- infecção;
- intoxicação;
- febre.

Tratamentos diferentes para problemas diferentes.

Evitar transformar cura em simples “poção mágica”.

---

# 14. COMBATE

Armas corpo a corpo:

- faca;
- taco;
- machado;
- martelo;
- lança improvisada.

Armas de fogo futuramente:

- pistola;
- espingarda;
- rifle.

Características:

- dano;
- alcance;
- velocidade;
- stamina;
- barulho;
- durabilidade.

Barulho é um sistema importante.

Disparar pode resolver um problema e criar outro.

---

# 15. INIMIGOS

Evitar apenas “zumbis genéricos”.

Criar infectados com comportamentos diferentes.

Exemplos:

## Errante

Lento.

Reage a som e visão.

## Corredor

Rápido.

Baixa resistência.

## Enraizado

Fica imóvel até perceber movimento.

## Eco

Reage principalmente a som.

## Inchado

Perigoso em locais fechados.

Criaturas devem possuir:

- audição;
- visão;
- memória curta;
- busca;
- perseguição;
- retorno a patrulha.

---

# 16. BARULHO

Toda ação gera ruído.

Exemplos:

andar:
baixo.

correr:
moderado.

quebrar parede:
alto.

derrubar árvore:
alto.

tiro:
extremo.

Inimigos investigam sons.

Mostrar ruído ao jogador de forma visual ou através de feedback claro.

---

# 17. DIA E NOITE

Ciclo completo.

Durante o dia:

- maior visibilidade;
- exploração mais segura.

Durante a noite:

- visibilidade reduzida;
- temperatura menor;
- inimigos mais difíceis de detectar;
- algumas criaturas mais ativas.

Fontes de luz:

- lanterna;
- vela;
- fogueira;
- gerador;
- poste;
- farol de veículo.

---

# 18. CLIMA

Futuramente:

- chuva;
- tempestade;
- neblina;
- frio;
- calor;
- vento.

Clima afeta gameplay.

Exemplo:

chuva:
- reduz visibilidade;
- apaga algumas fogueiras;
- fornece água;
- aumenta frio.

---

# 19. NPCs

NPCs devem ser raros e importantes.

Cada NPC possui:

- nome;
- profissão;
- personalidade;
- habilidades;
- necessidades;
- opinião sobre o jogador;
- objetivo próprio.

NPCs podem:

- trocar itens;
- oferecer missões;
- acompanhar jogador;
- morar na base;
- abandonar grupo;
- entrar em conflito;
- ajudar em tarefas.

Nunca criar NPC puramente decorativo em áreas importantes.

---

# 20. FACÇÕES

Exemplos futuros:

- comunidades rurais;
- saqueadores;
- ex-militares;
- grupo religioso;
- comerciantes;
- sobreviventes independentes.

Nenhuma facção deve ser simplesmente “boa” ou “má”.

Cada uma possui interesses próprios.

---

# 21. VEÍCULOS

Fase futura.

Possíveis veículos:

- bicicleta;
- moto;
- carro;
- caminhonete;
- caminhão.

Sistemas:

- combustível;
- bateria;
- motor;
- pneus;
- peças;
- armazenamento;
- barulho.

---

# 22. MORTE

A morte precisa importar.

Modo principal:

quando o personagem morre, ele morre permanentemente.

O mundo continua.

O jogador cria um novo sobrevivente no mesmo mapa.

Pode encontrar:

- antiga base;
- objetos deixados;
- corpo;
- consequências de decisões anteriores.

Nunca apagar o mundo inteiro por padrão.

---

# 23. EVENTOS DINÂMICOS

Possíveis eventos:

- queda de energia;
- tempestade;
- horda migrando;
- transmissão de rádio;
- sobrevivente pedindo ajuda;
- comércio temporário;
- incêndio;
- acidente;
- comboio abandonado;
- facção ocupando prédio;
- área contaminada aumentando.

Eventos devem criar histórias emergentes.

---

# 24. HISTÓRIA OCULTA

A narrativa principal não deve interromper o sandbox.

O jogador descobre informações através de:

- rádios;
- documentos;
- computadores;
- gravações;
- NPCs;
- bunkers;
- laboratórios;
- locais abandonados.

Pergunta central:

**O que realmente causou O Apagão?**

A resposta deve ser revelada lentamente.

---

# 25. INTERFACE

Evitar interface exageradamente “game”.

HUD deve ser discreto.

Mostrar apenas informações necessárias.

Hotbar:
parte inferior.

Indicadores básicos:
vida;
fome;
sede;
energia;
temperatura futuramente.

Inventário:
painel funcional.

Tooltip:
nome;
peso;
estado;
descrição;
ações.

---

# 26. DIREÇÃO VISUAL

Pixel art estilizada.

Paleta geral:

- verdes dessaturados;
- cinza;
- marrom;
- ferrugem;
- azul frio;
- amarelo de iluminação artificial.

O mundo deve parecer abandonado, não vazio.

Detalhes ambientais:

- placas;
- móveis;
- fios;
- veículos;
- postes;
- vegetação crescendo;
- janelas quebradas;
- pichações;
- lixo;
- objetos domésticos.

---

# 27. ÁUDIO FUTURO

Priorizar sons ambientais.

Exemplos:

- vento;
- chuva;
- madeira;
- metal;
- passos;
- animais;
- rádio;
- criaturas distantes.

Música deve ser rara.

Silêncio também faz parte do jogo.

---

# 28. ARQUITETURA TÉCNICA

Começar simples, mas organizar desde cedo.

Estrutura recomendada:

index.html
style.css

js/
  config.js
  world.js
  player.js
  inventory.js
  survival.js
  entities.js
  ui.js
  game.js

Não usar frameworks no protótipo inicial.

Canvas HTML5 para renderização.

Separar:

- estado do jogo;
- renderização;
- input;
- física;
- mundo;
- entidades;
- inventário;
- interface.

---

# 29. CHUNKS

O mundo deve ser dividido em chunks para permitir mapas grandes.

Cada chunk deve possuir ID e estado.

Futuramente armazenar apenas chunks modificados pelo jogador.

Nunca reconstruir o mundo inteiro a cada frame.

---

# 30. SAVE

Fase futura.

Usar localStorage inicialmente.

Salvar:

- seed;
- personagem;
- posição;
- inventário;
- habilidades;
- necessidades;
- tempo;
- chunks modificados;
- construções;
- containers;
- NPCs;
- eventos.

---

# 31. REGRAS DE DESENVOLVIMENTO

Antes de adicionar um sistema:

1. analisar o código atual;
2. identificar dependências;
3. preservar sistemas funcionando;
4. adicionar o novo sistema isoladamente;
5. testar;
6. só então avançar.

Nunca reescrever o projeto inteiro sem necessidade.

Nunca remover funcionalidade existente silenciosamente.

Nenhum botão visível pode ser falso.

Nenhum sistema deve existir apenas visualmente.

Código precisa funcionar.

Não entregar pseudocódigo quando código funcional foi solicitado.

---

# 32. ORDEM DE DESENVOLVIMENTO

## ETAPA 1 — CORE SANDBOX

- Canvas
- game loop
- input
- jogador
- física
- câmera
- tiles
- geração procedural
- chunks
- colisões
- mineração
- colocação de blocos
- hotbar
- ciclo dia/noite

## ETAPA 2 — SOBREVIVÊNCIA

- inventário completo
- fome
- sede
- energia
- comida
- bebida
- recursos coletáveis
- ferramentas
- durabilidade

## ETAPA 3 — MUNDO VIVO

- árvores melhores
- estruturas
- casas
- interiores
- loot contextual
- containers
- biomas
- geração de estradas

## ETAPA 4 — PERIGO

- inimigos
- visão
- audição
- barulho
- combate
- dano
- morte
- respawn/permadeath

## ETAPA 5 — BASE

- crafting
- bancadas
- paredes
- portas
- barricadas
- caixas
- fogueira
- água
- agricultura

## ETAPA 6 — PROFUNDIDADE

- medicina
- temperatura
- clima
- sono
- roupas
- peso
- ferimentos

## ETAPA 7 — CIVILIZAÇÃO

- NPCs
- comércio
- facções
- quests
- reputação
- recrutamento

## ETAPA 8 — MUNDO AVANÇADO

- veículos
- eletricidade
- geradores
- combustível
- cidades grandes
- eventos dinâmicos

## ETAPA 9 — META E LORE

- rádio
- documentos
- história oculta
- bunkers
- laboratórios
- conteúdo de late game

---

# 33. OBJETIVO DA PRIMEIRA VERSÃO JOGÁVEL

O jogador deve poder:

- nascer em um mundo procedural;
- andar;
- pular;
- explorar;
- quebrar terreno;
- coletar materiais;
- selecionar itens na hotbar;
- colocar blocos;
- observar a passagem do tempo;
- sentir que o mundo é maior do que a tela.

Essa versão precisa ser divertida de movimentar antes de receber fome, inimigos ou crafting.

---

# 34. PRINCÍPIO FINAL

LAST COUNTY não deve ser um jogo sobre “matar tudo”.

É um jogo sobre:

**quanto tempo você consegue continuar vivendo neste mundo — e o que você transforma enquanto ainda está nele.**

---

# ESTADO ATUAL DO PROJETO — STAGE 3

Etapas 1, 2 e 3 já foram implementadas. Ao continuar o desenvolvimento, preservar obrigatoriamente:

- mundo procedural e seed;
- mineração e construção;
- câmera e colisões;
- ciclo dia/noite;
- fome, sede, energia e vida;
- peso e inventário;
- ferramentas e durabilidade;
- estrada e pontos de interesse;
- Fazenda Harlow;
- residência abandonada;
- Mercado County Mart;
- Clínica de Last County;
- Oficina Westline;
- containers e loot contextual.

A próxima implementação deve ser a ETAPA 4 — PERIGO, sem reescrever ou simplificar as etapas anteriores.

---

# ESTADO ATUAL DO PROJETO — STAGE 4

Já implementado e não deve ser removido em futuras etapas:

- mundo procedural destrutível;
- mineração e construção;
- ciclo dia/noite;
- inventário com peso;
- ferramentas e durabilidade;
- fome, sede e energia;
- corrida;
- estrada e cinco tipos de estruturas exploráveis;
- loot contextual e containers persistentes;
- Errantes e Corredores;
- percepção por visão e audição;
- sistema de ruído;
- combate corpo a corpo;
- morte persistente com mochila deixada no mundo;
- novo sobrevivente no mesmo mapa;
- navbar survival escura;
- inventário em grid com equipamento, condição, peso, abates e mortes.

A próxima etapa deve priorizar BASE E CRAFTING. Não reescrever os sistemas acima nem simplificá-los.


# ESTADO ATUAL — STAGE 5

A Etapa 5 foi implementada: crafting, bancada, paredes, portas, barricadas, caixas, fogueira, reparos e desmontagem estão funcionais. A próxima prioridade é a Etapa 6: clima, temperatura, roupas, sono e ferimentos localizados.


# ESTADO ATUAL — STAGE 6

A Etapa 6 está implementada.

Sistemas ativos agora:
- clima dinâmico;
- chuva, tempestade e neblina;
- temperatura ambiente;
- temperatura corporal;
- umidade;
- abrigo;
- roupas equipáveis;
- isolamento;
- proteção contra chuva;
- sono;
- descanso;
- ferimentos por parte do corpo;
- sangramento abstrato;
- tratamento com curativo;
- antisséptico;
- fogueiras como fontes de calor/luz;
- lanterna com carga limitada.

A próxima prioridade é a ETAPA 7 — SOCIEDADE:
NPCs, comércio, relações, pequenas comunidades, recrutamento, facções e quests emergentes.


# ESTADO ATUAL — STAGE 7

A Etapa 7 está implementada.

O mundo agora possui sociedade persistente:
- Mara Harlow, agricultora;
- Dra. Lena Ortiz, médica;
- Eli Mercer, mecânico;
- Jonah Pike, comerciante.

Cada NPC possui:
- localização coerente;
- grupo/facção;
- profissão;
- personalidade;
- confiança;
- diálogo contextual;
- comércio;
- trabalho individual.

Existe reputação separada com:
- Fazenda Harlow;
- Clínica Livre;
- Westline Crew;
- Mercadores da 17.

Trabalhos podem exigir itens ou ações, como eliminar infectados.
Recompensas incluem recursos, itens e Fichas do Condado.

NPCs elegíveis podem ser recrutados após confiança suficiente.
Um companheiro ativo segue o jogador e ajuda em combate.

Próxima prioridade: ETAPA 8 — veículos, combustível, manutenção, geradores e eletricidade.


# ATUALIZAÇÃO — STAGE 7.5
O projeto recebeu um passe visual completo antes da etapa de veículos.
Foram melhorados sprites, ícones dos itens, animações, sensação de corrida/pulo e câmera.
A próxima grande etapa continua sendo veículos e eletricidade.


# ATUALIZAÇÃO — STAGE 7.6
Foi realizado um polish pass com partículas, camera shake, feedback de impacto, poeira de movimento e microanimações de UI. Próxima etapa: veículos e eletricidade.


# ESTADO ATUAL — STAGE 8
Veículos e eletricidade estão implementados. Existem picape, sedã e van com combustível, bateria, condição, porta-malas e condução. Bases podem construir geradores e refletores; energia consome combustível e gera ruído. Próxima etapa: rádio, documentos, bunkers, laboratórios e endgame.


# ESTADO ATUAL — STAGE 9

O primeiro arco completo de LAST COUNTY está implementado.

A Stage 9 adicionou:
- rádio funcional com frequências progressivas;
- arquivo de documentos;
- 7 registros narrativos;
- Anexo Blackridge;
- Cartão Blackridge;
- acesso subterrâneo;
- bunker e laboratório;
- contaminação ambiental;
- respirador e casaco de contenção;
- arquivo central;
- revelação do Projeto 7-B;
- explicação do Protocolo Quiet Fall;
- decisão de transmitir ou selar os dados.

O final narrativo não encerra o sandbox.
O jogador continua no mesmo mundo após descobrir a verdade.

A partir daqui o projeto deve entrar em fase de consolidação 1.0:
performance, persistência/save, mapa, conteúdo adicional, áudio, balanceamento e expansão do mundo.


# STAGE 10 — ART DIRECTION OVERHAUL
A direção visual foi consolidada. O projeto agora usa assets locais em `assets/`, spritesheets, tiles com variantes, ícones PNG de itens, HUD mais compacta e uma biblioteca maior de materiais de construção. As próximas mudanças devem respeitar essa linguagem visual e evitar retornar ao visual de dashboard/software.


# ESTADO ATUAL — STAGE 11
O mundo recebeu uma expansão artística: posto de gasolina, bairro residencial, escola e motel, além de interiores decorados, mais props e oito novos tipos de tile. A próxima prioridade visual é Stage 12 — rework de personagens, NPCs e infectados.


# ATUALIZAÇÃO — STAGE 12
Player, NPCs e infectados receberam rework completo de apresentação. O jogo agora separa perfis de ameaça de arquétipos visuais, possui roupas renderizadas por overlays e novos spritesheets animados. Próxima prioridade: Stage 13, UI/Inventory/Icons Rework.


# ATUALIZAÇÃO — STAGE 13
A interface foi profundamente refeita. O inventário usa grid de slots, seleção, painel de detalhes, busca, filtros e drag/drop para a hotbar. HUD, crafting, construção, comércio, loot e menus seguem agora uma linguagem visual de survival game. Próxima prioridade: Stage 14 — Expanded Building & Vehicle Construction.


# ATUALIZAÇÃO — STAGE 14
A construção foi expandida com plataformas, escadas, telhados inclinados, portão de garagem, decoração e bancada automotiva. O jogador pode montar um veículo abstrato por oito módulos e restaurar componentes separados dos veículos existentes. Próxima prioridade: consolidação 1.0, save/load, mapa, áudio, performance e polish.
