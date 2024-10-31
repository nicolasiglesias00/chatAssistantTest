const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const app = express();

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    try {
        console.log('Recibiendo petición:', req.body);

        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            messages: req.body.messages,
            system: req.body.system
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            }
        });

        console.log('Respuesta de Anthropic:', response.data.content[0].text);

        // Enviamos respuesta exitosa con status 200
        res.status(200).json({
            success: true,
            data: response.data.content[0].text
        });

    } catch (error) {
        console.error('Error detallado:', error.response?.data || error.message);

        // Manejamos diferentes tipos de errores
        if (error.response) {
            // Error de la API de Anthropic
            res.status(error.response.status).json({
                success: false,
                error: error.response.data,
                message: error.response.data.error?.message || 'Error en la API de Anthropic'
            });
        } else if (error.request) {
            // Error de red
            res.status(503).json({
                success: false,
                error: 'Error de red',
                message: 'No se pudo conectar con el servicio'
            });
        } else {
            // Error general
            res.status(500).json({
                success: false,
                error: 'Error interno',
                message: error.message
            });
        }
    }
});

// Ruta de health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});