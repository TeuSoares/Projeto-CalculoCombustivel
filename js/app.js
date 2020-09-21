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
        url: 'index.html?a=x',
      },
      {
        path: '/historico/',
        url: 'historico.html?a=x',
        on:{
          pageInit:function(){
            historico();
          },
        },
      },
    ],
    // ... other parameters
  });
  var mainView = app.views.create('.view-main');

  if(window.openDatabase){
    // Criando banco de dados
    db = openDatabase("DB_COMBUSTIVEL","0.1","Base de dados local", 5*1021*1024);

    // Criando tabela tarefas
    db.transaction(function(query){
      query.executeSql("CREATE TABLE IF NOT EXISTS oleo (id INTEGER PRIMARY KEY AUTOINCREMENT, dataTroca date, dataPtroca date)");
    
      // Gravando configurações
      query.executeSql("CREATE TABLE IF NOT EXISTS abastecimento (id INTEGER PRIMARY KEY AUTOINCREMENT, dia date, valor INTEGER)");  // INTEGER = Inteiro
    
    });
  }

  function historico(){

    now = new Date;
    dias = new Array("Domingo","Segunda","terça","Quarta","Quinta","Sexta","Sábado");
    meses = new Array("Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez");

    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var today = now.getFullYear()+"-"+(month)+"-"+(day);

    $("#dia,#dataTarefa,#dataPtroca").val(today);

    $('#btn-oleo').click(function(){
      var dataTroca = $("#dataTroca").val();
      var dataPtroca = $("#dataPtroca").val();

      if(dataTroca == "" || dataPtroca == ""){
        app.dialog.alert("Os campos não podem ficar vazios","AVISO");
        return false;
      }

      if(dataTroca < today || dataPtroca < today){
        app.dialog.alert("A data não pode ser retroativa","AVISO");
        $("#dataTarefa,#dataPtroca").val(today);
        return false;
      }

      var notification = app.notification.create({
        title:'Troca de óleo',
        text:'Informações inseridas com sucesso',
        closeTimeout:3000,
      });
      // Inserindo informações no banco
      db.transaction(function(query){
        query.executeSql("INSERT INTO oleo (dataTroca,dataPtroca) VALUES (?,?)",[dataTroca,dataPtroca]);
        notification.open();
        $("#dataTarefa,#dataPtroca").val(today);
      });

    });

    $('#btn-combus').click(function(){
      var dia = $("#dia").val();
      var valorAbast = $("#valorAbast").val();

      if(dia == "" || valorAbast == ""){
        app.dialog.alert("Os campos não podem ficar vazios","AVISO");
        return false;
      }

      if(dia < today){
        app.dialog.alert("A data não pode ser retroativa","AVISO");
        $("#dia").val();
        return false;
      }

      var notification = app.notification.create({
        title:'Abastecimento',
        text:'Informações inseridas com sucesso',
        closeTimeout:3000,
      });
      // Inserindo informações no banco
      db.transaction(function(query){
        query.executeSql("INSERT INTO abastecimento (dia,valor) VALUES (?,?)",[dia,valorAbast]);
        notification.open();
        $("#dia").val(today);
        $("#valorAbast").val("");
      });

    });
  }

// Calculo combustivel

$(document).ready(function(){

  dados = "";
  db.transaction(function(query){
    query.executeSql("SELECT * FROM oleo",[],function(query,result){
      linha = result.rows;
      for(var i = 0; i < linha.length; i++){

        dataT = linha[i].dataTroca;    // formatando a data
        split = dataT.split('-');
        novaData = split[2]+"/"+split[1]+"/"+split[0];

        dataP = linha[i].dataPtroca;    // formatando a data
        split2 = dataP.split('-');
        novaData2 = split2[2]+"/"+split2[1]+"/"+split2[0];

        dados+='<tr>'; 
          dados+='<td class="label-cell">'+novaData+'</td>';
          dados+='<td class="label-cell">'+novaData2+'</td>';
        dados+='</tr>';
      }

      $(".resultOleo").html(dados);
    });
  });

  dados2 = "";
  resultGastos = "";
  db.transaction(function(query){
    query.executeSql("SELECT * FROM abastecimento",[],function(query,result){
      linha = result.rows;
      for(var i = 0; i < linha.length; i++){

        dataD = linha[i].dia;    // formatando a data
        split = dataD.split('-');
        novaData = split[2]+"/"+split[1];

        dados2+='<tr>'; 
        dados2+='<td class="label-cell">'+novaData+'</td>';
        dados2+='<td class="label-cell">R$ '+linha[i].valor+'</td>';
        dados2+='</tr>';

        resultGastos = 0 + linha[i].valor;
      }

      $(".resultCombus").html(dados2);
      $(".total-gastos").html("R$ "+resultGastos);
    });
  });

  $('.btn-calcular').click(function(){
    etanol = $('#etanol').val();
    gasolina = $('#gasolina').val();
    resultado = 0;
    men = "";

    // Verificar se foi digitado os valores
    if(etanol == "" || gasolina == ""){
      app.dialog.alert('Informe o preço do Etanol e Gasolina','AVISO');
      return false;
    }else if(etanol == 0 || gasolina == 0){
      app.dialog.alert('Os campos não podem ter valores 0','AVISO');
      return false;
    }

    if(etanol.length > 5 || gasolina.length > 5){
      app.dialog.alert('Os campos não podem ter mais de 4 dígitos','AVISO');
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
    $('#etanol, #gasolina,#dinheiro,#litros,#kml,#distancia,#valorCombus').val("");
    $('.mensagem, .porc').html("");
    $('.btn-calcular,#etanol,#gasolina').attr('disabled',false);
    $(".consumo, .totalLitros, .gastos").hide();
    desabilitar();
  });

  desabilitar();

  $('#dinheiro').on('input',function(){
    $('.btn-novo').attr('disabled',false);
    $('.btn-calcular,#etanol,#gasolina').attr('disabled',true);
    dinheiro = $('#dinheiro').val();

    if(dinheiro.length > 3){
      app.dialog.alert('Os campos não podem ter mais de 4 dígitos','AVISO');
      return false;
    }

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

    if(litros.length > 3){
      app.dialog.alert('Os campos não podem ter mais de 3 dígitos','AVISO');
      return false;
    }

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

    if(cidade == 0){
      app.dialog.alert('Os campos não podem ter valores 0','AVISO');
      return false;
    }

    if(litros != ""){
      resultCidade = litros * cidade;
    }
    $('.m-cidade').html(resultCidade.toFixed(2)+" Km na cidade");

    if(cidade == ""){
      $('.m-cidade').html("");
    }
  });

  // Verifica o valor do input pista
  $('#pista').on('input',function(){
    var pista = $('#pista').val();
    pista = parseFloat(pista);

    if(pista == 0){
      app.dialog.alert('Os campos não podem ter valores 0','AVISO');
      return false;
    }

    if(litros != ""){
      resultPista = litros * pista;
    }

    $('.m-pista').html(resultPista.toFixed(2)+" Km na pista");

  });

  $('.btn-viagem').click(function(){
    kml = $('#kml').val();
    distancia = $('#distancia').val();
    valorCombus = $('#valorCombus').val();

    // Verificar se foi digitado os valores
    if(kml == "" || distancia == "" || valorCombus == ""){
      app.dialog.alert('Os campos não podem ficar vazios','AVISO');
      return false;
    }else if(kml == 0 || distancia == 0 || valorCombus == 0){
      app.dialog.alert('Os campos não podem ter valores 0','AVISO');
      return false;
    }

    // Converter os valores do input
    kml = parseFloat(kml);
    distancia = parseFloat(distancia);
    valorCombus = parseFloat(valorCombus);

    combustivel = distancia / kml;

    gastos = combustivel * valorCombus;

    gastos = gastos.toFixed(2);

    $('.resultLitros').html(combustivel+"L");
    $('.resultGastos').html("R$ "+gastos);

    $('.totalLitros,.gastos').show();
  });

  $('#consumo,#distancia,#valorCombus').on('input',function(){
    $('.btn-novo').attr('disabled',false);
  });

});

function desabilitar(){
  // Desabilitar segunda parte
  $('.btn-novo,#dinheiro,#litros').attr('disabled',true);
  $('.litros-visible, .dinheiro-visible, .totalLitros, .gastos').hide();
}