# zoop-api
Nodejs Server - Zoop Api

## Tecnologias
* Nodejs
* Zoop API
* SQLITE

## Descrição
O app faz requisições HTTP para o server que está integrado com a API de pagamento da ZoopAPI. 
* Ao carregar, o app requisita ao servidor um novo Buyer (comprador) que será salvo no cache do celular (buyer_id)
* **Recarga:** para inserir créditos na plataforma, o app tokeniza um cartão (de teste) e retorna para o servidor o token gerado (**compliance**). O server relaciona o card_token com o buyer_id através da API da Zoop. Posteriormente, o valor (amount) de recarga é depositado via "**Transação de Cartão Não Presente (crédito)**" na wallet de um SELLER_MASTER (representa o seller do app) - 4% de taxa"- que, logo em seguida, deposita este valor na **wallet** do Buyer através de uma **transação P2P** 
* **Transações P2P:** Toda transação entre um Buyer e SELLER_SLAVE (representa um loja/comerciante/microempreendedor) é feita através de p2p através do SERVER e do APP.

## Vocabulário
* **card_token**: id de um cartão tokenizado;
* **buyer**: utiliza os QR Codes para pagamento
* **SELLER_MASTER_ID**: representa o seller (vendedor) da plataforma no sistema. Foi utilizado um valor já cadastrado na ZOOP
* **SELLER_SLAVE_ID**: representa um comerciante/microempreendedor que recebe o pagamento do buyer. ID utilizado já cadastrado na ZOOP.


## Modo de Usar
* git clone link_repositorio
* cd repositorio_local_na_maquina
* npm install
* npm start ou node server.js
* Browser --> locahost:3004


# Entidades

**Token:**
- uuid
- expire_time
- limit_money_ammout
- limit_used_times

**Wallet:**
- id
- tokens[]
- zoop_buyer_id
- saldo: {timestamp, ammount}
