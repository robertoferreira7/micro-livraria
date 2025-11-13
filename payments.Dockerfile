# Imagem base derivada do Node
FROM node

# Diretório de trabalho
WORKDIR /app

# Comando para copiar os arquivos para a pasta /app da imagem
# (Copia tudo, incluindo a pasta /services/payments)
COPY . /app

# Comando para instalar as dependências
RUN npm install

# Comando para inicializar (executar) a aplicação
# ESTA LINHA É A ÚNICA MUDANÇA!
CMD ["node", "/app/services/payments/index.js"]