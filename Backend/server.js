const express = require('express');
const cors = require('cors');
const taskRoutes = require('./src/routes/taskRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/swagger/swagger.json');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/tasks', taskRoutes);

// Rota da documentação
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  console.log(`Documentação: http://localhost:${PORT}/api-docs`);
});