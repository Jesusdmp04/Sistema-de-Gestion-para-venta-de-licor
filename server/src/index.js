import app from './app'
const port = app.get('port');
app.listen(port)
console.log(`Servidor en ejecuciĆ³n en http://localhost:${port}`);