import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import routesArtistas from './routes/artistas';
import routesEventos from './routes/eventos';
import routesArtistasEventos from './routes/artistasEventos';
import routesIngressos from './routes/ingressos';
import routesMailer from './routes/mailer'; 

const app = express();
const port = 3000;

app.use(express.json());
app.use('/artistas', routesArtistas);
app.use('/eventos', routesEventos);
app.use('/artistas-eventos', routesArtistasEventos);
app.use('/ingressos', routesIngressos);
app.use('/mail', routesMailer); 

app.get('/', (req, res) => {
  res.send('API de Gestão de Eventos');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});