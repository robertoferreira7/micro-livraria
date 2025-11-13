const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const path = require('path');
const protoLoader = require('@grpc/proto-loader');

// --- Definição dos caminhos dos Protos ---
const INVENTORY_PROTO_PATH = path.resolve(__dirname, '../../proto/inventory.proto');
const SHIPPING_PROTO_PATH = path.resolve(__dirname, '../../proto/shipping.proto');
const PAYMENTS_PROTO_PATH = path.resolve(__dirname, '../../proto/payments.proto');

// --- Configuração do Express ---
const app = express();
app.use(cors());
app.use(express.json()); // <-- MUITO IMPORTANTE: para ler o JSON do POST

// --- Configuração do gRPC Loader ---
const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

// --- Carregar Serviço INVENTORY ---
const inventoryPackageDefinition = protoLoader.loadSync(INVENTORY_PROTO_PATH, loaderOptions);
const inventoryProto = grpc.loadPackageDefinition(inventoryPackageDefinition);
const inventory = new inventoryProto.InventoryService(
    'localhost:3002', // Porta do serviço de inventário
    grpc.credentials.createInsecure()
);

// --- Carregar Serviço SHIPPING ---
const shippingPackageDefinition = protoLoader.loadSync(SHIPPING_PROTO_PATH, loaderOptions);
const shippingProto = grpc.loadPackageDefinition(shippingPackageDefinition);
const shipping = new shippingProto.ShippingService(
    'localhost:3001', // Porta do serviço de frete
    grpc.credentials.createInsecure()
);

// --- Carregar Serviço PAYMENTS (NOVO) ---
const paymentsPackageDefinition = protoLoader.loadSync(PAYMENTS_PROTO_PATH, loaderOptions);
const paymentsProto = grpc.loadPackageDefinition(paymentsPackageDefinition);
const payments = new paymentsProto.PaymentService(
    'localhost:3004', // Porta do novo serviço de pagamento
    grpc.credentials.createInsecure()
);


// ---------------------------------
// --- Rotas da API (Endpoints) ---
// ---------------------------------

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res, next) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res, next) => {
    shipping.GetShippingRate(
        {
            cep: req.params.cep,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.cep,
                    value: data.value,
                });
            }
        }
    );
});

/**
 * Retorna um produto específico via InventoryService
 */
app.get('/product/:id', (req, res, next) => {
    // Chama método do microsserviço.
    inventory.SearchProductByID({ id: req.params.id }, (err, product) => {
        // Se ocorrer algum erro de comunicação
        // com o microsserviço, retorna para o navegador.
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            // Caso contrário, retorna resultado do
            // microsserviço (um arquivo JSON) com os dados
            // do produto pesquisado
            res.json(product);
        }
    });
});

/**
 * Processa um pagamento via PaymentService (NOVO)
 */
app.post('/checkout', (req, res, next) => {
    // req.body contém o JSON enviado
    // (ex: { amount: 100.0, card_number: "...", ... })
    
    // Chama o método gRPC 'ProcessPayment'
    payments.ProcessPayment(req.body, (err, response) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Payment processing failed :(' });
        } else {
            // Retorna o JSON com o resultado da transação
            res.json(response);
        }
    });
});


// ---------------------------------
// --- Iniciar o Servidor ---
// ---------------------------------
const port = 3000;
app.listen(port, () => {
    console.log(`Controller Service running on http://127.0.0.1:${port}`);
});