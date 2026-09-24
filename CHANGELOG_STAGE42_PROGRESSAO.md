# Stage 42 — Progression & Crafting 2.0

Integrada junto com a Stage 42 de zumbis (ver `CHANGELOG_STAGE42_ZUMBIS.md`). As defesas novas dela (sensor de perímetro e sirene de desvio) entram no T3 da jornada.

Espinha dorsal: **machado → bancada → metal → oficina e energia → armamento → expedições → Blackridge.**

## Jornada guiada
- Sete etapas, cada uma com objetivo curto, checklist, próximo desbloqueio e onde procurar:
  1. Sobrevivente perdido
  2. Abrigo provisório
  3. Ferramentas metálicas
  4. Oficina e energia
  5. Bancada de armamento
  6. Expedições de alto risco
  7. Blackridge
- A etapa atual é sempre o primeiro objetivo da HUD. Os antigos objetivos "Sair do improviso", "Dominar a metalurgia" etc., e os duplicados de ferramenta e abrigo, foram absorvidos por ela.
- Concluir uma etapa mostra o que foi liberado e qual é a próxima.
- No inventário, a jornada aparece no topo da coluna da direita. A fabricação de campo, que antes começava recolhida, agora abre por padrão e mostra quantas receitas estão prontas.

## Níveis que seguem o que você fez
- Os tiers deixaram de subir só porque um item passou pela mochila. Agora cada um corresponde a uma conquista:
  - **T1 Abrigo:** bancada construída.
  - **T2 Metal:** Manual de ferramentas metálicas, ou fornalha + lingote de ferro.
  - **T3 Oficina & Energia:** Projeto de energia da base.
  - **T4 Armamento:** Manual do armeiro.
  - **T5 Blackridge:** Protocolo técnico BR-7.

## Três tipos de receita
- **Conhecidas:** disponíveis desde o início.
  - O machado e a picareta improvisados passam a ser feitos à mão com madeira e pedra, sem bancada e sem pregos.
  - Pregos (1 sucata = 6) e a mochila de pano também saem sem bancada.
- **Aprendidas por prática:** as habilidades de uso da Stage 31 liberam algumas receitas mesmo sem o manual:
  - Construção 2: machadinha;
  - Mineração 2: picareta de aço;
  - Construção 3: marreta;
  - Coleta 3: pé de cabra resistente;
  - Mecânica 2: kit de manutenção.
- **Projetos encontrados:** quatro manuais novos, cada um em dois ou três lugares do mundo. Ao aprender um, as outras cópias desaparecem.

| Projeto | Onde procurar |
|---|---|
| Manual de ferramentas metálicas | Oficina Westline, Posto Route 17, Fazenda Harlow |
| Projeto de energia da base | Subestação North County, Armazém Westline, Bunker Civil Greenwater |
| Manual do armeiro | Delegacia de North County, Abrigo do Xerife, Bombeiros de Westline |
| Protocolo técnico BR-7 | Cofre BR-7, Estoque do setor B |

## Construções por etapa
- Estruturas de metal pedem o T2. Gerador, rede, baterias, refrigeração, bomba, estufa, oficina automotiva e portão reforçado pedem o T3. A nova Bancada de armamento pede o T4.
- Na tela de construção, o que está bloqueado aparece como tal, com o motivo.
- A bancada simples ficou mais barata para o início: 10 madeiras, 4 pedras e 4 pregos, sem sucata. O baú custa 6 madeiras e 2 pregos.

## Armas de fogo: restauração, não fabricação
- Saíram as receitas que montavam a carabina civil, a carabina compacta e a pistola de segurança a partir de sucata.
- Entraram 11 restaurações feitas na **Bancada de armamento com energia**. Todas exigem uma estrutura de arma danificada, mais peças, molas, kits ou componentes de precisão:
  - pistola;
  - revólver;
  - espingarda;
  - carabina civil;
  - carabina compacta;
  - espingarda de serviço;
  - submetralhadora compacta;
  - pistola de segurança;
  - carabina policial;
  - dois protótipos Blackridge.
- Peças de arma, molas e módulos passam a ser feitos na bancada de armamento. O kit de manutenção não depende mais de peças de arma.

## Onde as coisas estão
- Cada receita diz de onde vem o material que falta (por exemplo, "SUCATA: carros abandonados, garagens e oficinas"). Quando nada falta, mostra em que outras receitas o item é usado.
- Ferramentas e armas encontradas em casas, garagens, acampamentos e oficinas vêm gastas: 22% a 70% da condição. Delegacia, bombeiros, indústria, expedições e o crafting entregam equipamento inteiro.

## Mapa do condado 2.0
- Zoom de 1× a 6× com a roda do mouse ou os botões, arrastar para mover e botão para centralizar em você. O mapa abre centrado no jogador.
- Relevo em camadas: superfície, estrada, terra e rocha. Cada região tem o nome escrito no topo depois de descoberta.
- Os locais aparecem com cor por tipo (moradia, comércio, cívico e saúde, segurança, indústria, rural, subsolo, Blackridge) e uma legenda.
- Os rótulos nunca se sobrepõem, e mais nomes aparecem conforme o zoom aumenta.
- Os locais subterrâneos descobertos aparecem em corte.
- Os lugares da etapa atual da jornada são sombreados como "PRÓXIMA ETAPA", com precisão de região, sem pino exato.
- O painel lateral mostra a etapa, o objetivo, onde procurar e o próximo desbloqueio.
- Quando você está fora da área visível, uma seta na borda indica sua direção.
- Os marcadores continuam funcionando com zoom, e arrastar não cria marcador.

## Compatibilidade
- O save (v42, junto com a população de zumbis) ganha um bloco `journey42` com os projetos aprendidos, as tarefas concluídas e o tier alcançado. A chave `stage42` pertence ao sistema de zumbis; saves da build só de progressão, que usavam `stage42`, também são lidos.
- Saves anteriores não perdem nada: o tier calculado pelas regras antigas e as construções já erguidas (por exemplo, um gerador) definem o piso, os projetos correspondentes são concedidos e as etapas anteriores são marcadas como feitas.
- Armas e construções que o jogador já tem continuam funcionando.

## Correção
- A versão 2.0 carregava `stage39-survival.css`, que não estava mais na pasta, e o painel de sustentabilidade ficava sem estilo. O arquivo foi restaurado.

## Validação
- Passam: `validate_stage27`, `validate_stage28`, `validate_stage29`, `validate_stage30`, `validate_stage30_ui_merge`, `validate_stage39`, `validate_stage40`, `validate_stage41`, `validate_stage41_1`, `validate_stage42_progression` (6 seeds), `validate_stage42` (zumbis), `validate_assets`, `smoke` e `validate_world 6`.
- O smoke ganhou testes da jornada, dos projetos, da restauração com e sem energia, das ferramentas gastas, da migração de saves e do zoom do mapa.
- Revisão visual no Chrome em 1280×720 e 1920×1080: HUD, inventório, construções e mapa, sem erros de console.
- O `validate_stage31` continua falhando como antes: ele exige `version:31` no save.
