# Microsserviço de Pagamentos (Payments)

Este é um microsserviço simulado de pagamentos, parte do projeto [micro-livraria](https://github.com/robertoferreira7/micro-livraria).

Seu objetivo é expor uma interface gRPC para processar pagamentos.

##Funcionalidade Principal

Este serviço define e implementa a função `ProcessPayment` através de gRPC (veja `proto/payments.proto`).

* **Serviço:** `PaymentService`
* **Função:** `ProcessPayment(PaymentRequest) returns (PaymentResponse)`
* **Porta gRPC:** `3004`

Ele recebe detalhes de um cartão e um valor, e retorna uma resposta simulada de sucesso com um ID de transação.

## Como Executar (Docker)

Este serviço foi projetado para ser executado como um contêiner Docker.

**1. Compilar a Imagem:**
A partir da raiz do projeto, use o `payments.Dockerfile` para compilar a imagem:
```bash
docker build -t micro-livraria/payments -f payments.Dockerfile ./
