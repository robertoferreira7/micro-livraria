const grpc = require('@grpc/grpc-js');
const path = require('path');
const protoLoader = require('@grpc/proto-loader');

// Define o caminho do .proto e a porta
const PROTO_PATH = path.resolve(__dirname, '../../proto/payments.proto');
const PORT = 3004; // Usando uma nova porta

// Configuração do protoLoader
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

// Carrega o pacote gRPC
const paymentsProto = grpc.loadPackageDefinition(packageDefinition);

// Cria o servidor gRPC
const server = new grpc.Server();

// Implementa a função 'ProcessPayment'
server.addService(paymentsProto.PaymentService.service, {
    ProcessPayment: (payload, callback) => {
        const { amount, card_number } = payload.request;
        
        console.log(`[Payment Service] Processing payment for ${amount} from card ${card_number}`);

        // SIMULAÇÃO: Aprovamos o pagamento
        const transactionId = 'tx_' + Date.now(); // Gera um ID falso
        
        callback(null, {
            success: true,
            transaction_id: transactionId,
            message: 'Payment Approved Successfully',
        });
    },
});

// Inicia o servidor na porta definida
server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Payment Service running at http://127.0.0.1:${PORT}`);
    }
);