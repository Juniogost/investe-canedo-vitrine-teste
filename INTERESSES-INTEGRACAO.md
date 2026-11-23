# Piloto de interesse, integração somente em teste

Base: texto-e-analytics, commit a362e610c44858f4e221aa77f47bc033ec46af5c.
Nenhum arquivo existente alterado. Não inserir automaticamente no index de produção.

## Abrir
Servir este diretório por HTTP e abrir interesses-piloto.html. A página lê data.js existente, mas não carrega Analytics, pixels, scripts remotos ou imagens. Não envia requisições de coleta. Não usar para atendimento real ainda.

## Incluído
- Aceite separado para medição e ofertas semanais WhatsApp.
- Medição somente após aceite, em memória da aba, sem persistência.
- Tempo de um único cartão visível por vez (>=50%, mais visível e mais central como desempate), com pausa em aba oculta/inatividade >30s.
- IDs do catálogo, cliques locais, origem UTM por lista permitida sem texto pessoal.
- Interesse sugerido só após >=10s e vantagem de 20% sobre o segundo tipo. Isto é heurística explícita, não validação estatística.
- Interesse declarado separado da sugestão. Recusa de ofertas não impede navegação. Retirar medição apaga memória de navegação, preservando escolha independente de ofertas.
- Resumo visível para copiar manualmente. Link WhatsApp original existente, destino 5562981428585, sem reconstruir ou alterar texto. Copiar e colar é etapa manual, não automática.

## Bloqueios e limites
Não há endpoint/CRM, telefone, backend, armazenamento compartilhado, vínculo automático de lead, disparos, opt-out remoto ou métricas de venda. Fechar/recarregar perde o histórico e os aceites. Código de sessão local só acompanha o resumo copiado; não basta para CRM sem recepção real da mensagem. Prova de consentimento precisa ser arquivada no atendimento para uso real, o checkbox local não é suficiente.

A tipologia usa evidência explícita no cadastro atual: 3 apartamentos Tenda, 6 casas TCM, 3 loteamentos. 37 EBM são grupos comerciais de lançamentos, sem campo canônico de tipo. Ficam fora da sugestão até validar cadastro contra fonte. Flat e industrial estão disponíveis para interesse declarado, não há inventário validado dessas categorias neste catálogo. Não se deve concluir automaticamente que toda a EBM é apartamento.

O bloco existente Catálogo TCM mistura texto Tenda/Itá Nobre. O piloto não usa esse bloco, nem tenta corrigi-lo silenciosamente. O catálogo atual de teste já não contém os imports antigos que haviam misturado apartamentos/casas/lotes. Mudanças de taxonomia devem ser validadas separadamente.

## Integração recomendada, próxima etapa
1. Validar tipo canônico por property_id com fonte e responsável.
2. Integrar medição consentida aos cartões reais, sem inferir pelo título da seção.
3. Validar captura de UTM e IDs entre vitrine, portal e WhatsApp; o piloto é só uma aba, sem monitorar links externos.
4. Definir endpoint autenticado/seguro, política de retenção, campos do CRM para aceites e saída, acesso restrito.
5. Testar mensagem realmente recebida e gravada, sem chamar clique de lead. Produção só após OK.

## QA
node interesses-unit-test.cjs
QA de navegador externo qa.cjs: 49 cartões, 320/390/1280px, sem overflow/erros/requisições externas, sem medição antes do aceite, medição após aceite, consultas locais, escolha industrial, checkbox, retirada/apagamento, destino WhatsApp. Não testado em iPhone físico nem Safari. Não houve envio de WhatsApp.
