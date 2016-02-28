# Pulsar
Biblioteca para criação de classes em Javascript, com suporte a heraça múltipla e escopo privado. Atualmente está sendo estendida em um framework de interface gráfica para ser usado no ambiente de execução Cordova.

## Exemplo
```Javascript
Pulsar.class('Point', Object, function($)
{ 
  // Propriedade pública (default), armazenada e variável
  $('public var').x = 0.0;
  $('public var').y = 0.0;
  
  // Construtor
  $().init = function(x, y)
  {
    this.x = x;
    this.y = y;
  }

  // Método público e de instância
  $('public').move = function(x,y)
  {
    this.x = x;
    this.y = y;
  }
})

Pulsar.class('Vectorial', Object, function($)
{
  // Propriedade pública e armazenada
  $('public var').mod = 0.0;
  $('public var').angle = 0.0;

  // Propriedade pública, computada e somente para leitura
  $('public var').dx = {
    get: function {
      return Math.cos(angle) * mod;
    }
  }
  $('public var').dy = {
    get: function {
      return Math.sin(angle) * mod;
    }
  }

  // Construtor
  $().init = function(mod, angle) { ... }
})

Pulsar.class('Particle', Point, Vectorial, function($)
{
  $().init = function (x, y, mod, angle)
  {
    this.super('Point', x, y);
    this.super('Vectorial', mod, angle);
  }
}

var particle = new Particle(10.0, 20.0, 5.0, Math.PI / 4.0);
```
Documentação: [http://quasar.site11.com/pulsar/index.html]