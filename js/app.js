var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'Calculadora de Combustível',
    // App id
    id: 'com.myapp.test',
    // Enable swipe panel
    panel: {
      swipe: 'left',
    },
    // Add default routes
    routes: [
      {
        path: '/home/',
        url: 'index.html',
      },
    ],
    // ... other parameters
  });
  var mainView = app.views.create('.view-main');

  // Inicializando o JS
  $(document).ready(function(){
    $('#btn-calcular').click(function(){
      var peso = $('#peso').val();
      var altura = $('#altura').val();

      if(peso == "" || altura == ""){
        app.dialog.alert('Digite o peso e altura','AVISO');
        return false;
      }

      // Converter os textos para Float
      peso = parseFloat(peso);
      altura = parseFloat(altura);

      resultIMC = peso / (altura * altura);
      resultIMC = resultIMC.toFixed(2);

      $('#peso').val("");
      $('#altura').val("");
      
      var men = "";
      // Verificando a classificação do IMC
      if(resultIMC <= 18.5){
        men = "Cuidado! Você está muito abaixo do peso.";
        color = "#990000";
      }else if(resultIMC >18.5 && resultIMC <=24.99){
        men = "Parabéns! Peso ideal (continue assim).";
        color = "#4cd964";
      }else if(resultIMC >24.99 && resultIMC <=29.99){
        men = "Olha só! Você esta um pouco acima do peso.";
        color = "#ff9800";
      }else if(resultIMC >29.99 && resultIMC <=34.99){
        men = "Atenção! Obesidade grau I, Comece a fazer mais exercícios.";
        color = "#7b5208";
      }else if(resultIMC >34.99 && resultIMC <=39.99){
        men = "Atenção! Obesidade grau II(Severa). Procure um médico urgente.";
        color = "#17a1e4";
      }else{
        men = "Atenção! Obesidade grau III(Mórbida). Procure um médico urgente.";
        color = "#990000";
      }

      // app.dialog.alert('Seu IMC é '+ resultIMC.replace('.',',') +'<br><br>'+ men,'AVISO');
    
      demoGauge.update({
        value:resultIMC / 50,
        borderColor: color,
        labelText:"Indice de Massa Corporal",
        valueText: resultIMC.replace('.',',')
      })
    
      $('.men').html(men);

    });
  });

  // Init top demo gauge
var demoGauge = app.gauge.create({
  el: '.demo-gauge',
  type: 'semicircle',
  value: 0.5,
  size: 250,
  borderColor: '#2196f3',
  borderWidth: 10,
  valueText: '50%',
  valueFontSize: 41,
  valueTextColor: '#2196f3',
  labelText: '?',
});

// Calculo combustivel

$(document).ready(function(){
  $('.btn-calcular').click(function(){
    etanol = $('#etanol').val();
    gasolina = $('#gasolina').val();
    resultado = 0;
    men = "";

    // Verificar se foi digitado os valores
    if(etanol == "" || gasolina == ""){
      app.dialog.alert('Informe o preço do Etanol e Gasolina','AVISO');
      return false;
    }

    // Converter os valores do input
    etanol = parseFloat(etanol);
    gasolina = parseFloat(gasolina);

    porcentagem = etanol / gasolina;
    porcentagem = porcentagem.toFixed(2);

    if(porcentagem > 0.7){
      resultado = "Gasolina";
      men = "O Etanol custa "+(porcentagem*100).toFixed(0)+"% ";
    }else{
      resultado = "Etanol";
      men = "A Gasolina custa "+(porcentagem*100).toFixed(0)+"% ";
    }
    $('.mensagem').html(resultado);
    $('.porc').html(men+ "comparado a "+resultado);

    $('#dinheiro,#litros').attr('disabled',false);
    //app.dialog.alert(porcentagem);
  });

  // Acionando botão novo
  $('.btn-novo').click(function(){
    $('#etanol, #gasolina,#dinheiro,#litros').val("");
    $('.mensagem, .porc').html("");
    $('.btn-calcular,#etanol,#gasolina').attr('disabled',false);
    desabilitar();
  });

  desabilitar();

  $('#dinheiro').on('input',function(){
    $('.btn-novo').attr('disabled',false);
    $('.btn-calcular,#etanol,#gasolina').attr('disabled',true);
    dinheiro = $('#dinheiro').val();

    if(dinheiro > 0){
      $('#litros').attr('disabled', true);
      dinheiro = parseFloat(dinheiro);

      if(resultado == "Gasolina"){
        litros = dinheiro / gasolina;
      }else{
        litros = dinheiro / gasolina;
      }

      $('.litros-visible').show();
      $('#lb_litros').html(litros.toFixed(2).replace('.',','));
      $('.result').html(resultado);
      $('.consumo').show();

    }else{
      $('#litros').attr('disabled', false);
      $('.litros-visible').hide();
      $('.consumo').hide();
      $('#cidade,#pista').val("");
    }
  });

  // Iniciando a função litros
  $('#litros').on('input',function(){
    $('.btn-novo').attr('disabled',false);
    $('.btn-calcular,#etanol,#gasolina').attr('disabled',true);

    litros = $('#litros').val();
    if(litros > 0){
      $('#dinheiro').attr('disabled',true);
      litros = parseFloat(litros);

      if(resultado == "Gasolina"){
        dinheiro = litros * gasolina;
      }else{
        dinheiro = litros * etanol;
      }
      $('.dinheiro-visible').show();
      $('#lb_dinheiro').html(dinheiro.toFixed(2).replace('.',',')+' de '+ resultado);
      $('.consumo').show();

    }else{
      $('#dinheiro').attr('disabled',false);
      $('.dinheiro-visible').hide();
      $('.consumo').hide();
      $('#cidade,#pista').val("");
    }

  });

  $('.consumo').hide();

  // Verifica o valor do input cidade
  $('#cidade').on('input',function(){
    var cidade = $('#cidade').val();
    cidade = parseFloat(cidade);

    if(litros != ""){
      resultCidade = litros * cidade;
    }
    $('.m-cidade').html(resultCidade.toFixed(2)+" Km na cidade");
  });

  // Verifica o valor do input pista
  $('#pista').on('input',function(){
    var pista = $('#pista').val();
    pista = parseFloat(pista);

    if(litros != ""){
      resultPista = litros * pista;
    }
    $('.m-pista').html(resultPista.toFixed(2)+" Km na pista");
  });

});

function desabilitar(){
  // Desabilitar segunda parte
  $('.btn-novo,#dinheiro,#litros').attr('disabled',true);
  $('.litros-visible, .dinheiro-visible').hide();
}