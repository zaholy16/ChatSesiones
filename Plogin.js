/***************************************
* MOndragón Delgado Mezly Zahory       *
* 4 - C                                *
* Actividad 4                          *
***************************************/

//Se incluyen los paquetes, se crean las variables y se solicitan los modulos instalados:
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
//Inicializr express para el manejo de aplicaciones web:
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const { response } = require('express');

//Conexión a la base de datos
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'nodelogin'
});

//Usaremos estos paquetes de express
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: true 
}));
app.use(bodyParser.json());

//Mostramos el html al cliente
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/Plogin.html')); 
    //El cliente se conecta, se mustra la página de inicio de sesión, y se envia el archivo login.html.
});

//Si no esta registrado, lo manda al Pregistro.html, para que se registre
app.get('/registro', function(request, response){
    response.sendFile(path.join(__dirname + '/Pregistro.html'));
});

//Se auntentica 
app.post('/auth', function(request, response) {
    var username = request.body.username; //Obtenemos el nombre de usuario.
    var password = request.body.password; //Obtenemos la contraseña. 

    if (username && password) { //Validamos
        //Hacemos la consulta para verificar el usuario y contraseña.
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (results.length > 0) { // Que si hay resultados (usuarios) en existencia
                request.session.loggedin = true; // Se asigna a loggedin como TRUE
                request.session.username = username; // Se asina el nombre de usuario a una variable de sesión.
                response.redirect('/chat'); //Se redirecciona a /home
            }else {
            response.send('Usuarios y/o contraseña incorrectos!'); //Si no hay usuarios, se manda mensaje.
        }
        response.end(); // Terminamos el proceso
    });
    } else {
        response.send('Ingresa usuario y contraseña!'); // Si se encuentran vacios los campos se manda mensaje.
        response.end(); // Fin del proceso.
    }
});

//Se registra
app.post('/regis', (request, response)=>{
    var username = request.body.username; //Obtenemos el nombre de usuario.
    var password = request.body.password; //Obtenemos la contraseña. 
    var email = request.body.email;

    if(username && password && email)
    {
        //validar si ya existe
        connection.query('SELECT * FROM accounts WHERE username = ? or email = ?', [username, email], function(err, results, fields){
            if(results.length > 0){ //si hay resultados, es q si existen usuarios duplicados, entonces mandamos una alerta
                response.send("ERROR. Ya existe un usuario y/o correo igual");
            }else{
                connection.query('INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)', [username, password, email], function(err,results, fields){
                    if(!err){ //es que los datos no son iguales y se registra
                        response.send("Registro existoso")
                    }
                    else{
                        response.send("ERROR. Algo malo pasó :C")
                    }
                });
            }
        })
    }
})

//aqui va a ir lo de CHAT//
app.get('/chat', function(request, response) {
    if (request.session.loggedin) { // Se verifica la variable de sesión loggedin sea TRUE
        response.sendFile(path.join(__dirname + '/Pchat.html'));
        //response.send('Bienvenido de nuevo, ' + request.session.username + '! <br><br> <a href="/logout" class="btn btn-success">Cerrar sesión</a>'); // Si es TRUE mostramos mensaje con el nombre de usuario de la sesión.
    }else {
        response.send('Iniciar sesión de nuevo, por favor!'); // Si loggedin es FALSO solicitamos que inicie sesión de nuevo.
    }
});

io.on('connection', function(socket){
    console.log('Un usuario se ha conectado');

    socket.on('mjsNuevo', function(data){

        socket.broadcast.emit('mensaje', {
            usuario: username,
            mensaje: data
        });

        socket.emit('mensaje', {
            usuario: username,
            mensaje: data
        });
    });
});

//Cerrar sesión 
app.get('/logout', function (request, response) {
  request.session.destroy();
  response.send('Sesión terminada correctamente <br><br> <a href="/" class="btn btn-success">Inicar sesión de nuevo.</a>');
});

//La aplicación web necesita escuchar en un puerto, para propósitos de prueba se utilizará el puerto 3000:
app.listen(3001, function(){
    console.log('Puesto en marcha el server en puerto 3001');
});