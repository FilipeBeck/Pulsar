# Pulsar
Biblioteca para criação de classes em Javascript, com suporte a heraça múltipla e escopo privado. Atualmente está sendo estendida em um framework de interface gráfica.

## Exemplo
```Javascript
Pulsar.class('Point', function($)
{
  // Propriedade pública (default), armazenada e variável
  $('public var').x = 0.0;
  $('public var').y = 0.0;

  // Construtor
  $('func').init = function(x, y)
  {
    this.x = x;
    this.y = y;
  }

  // Método público e de instância
  $('func').move = function(x,y)
  {
    this.x = x;
    this.y = y;
  }
})

Pulsar.class('Vectorial', function($)
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
  $('func').init = function(mod, angle) { ... }
})

Pulsar.class('Particle', 'Point', 'Vectorial', function($)
{
  $().init = function (x, y, mod, angle)
  {
    this.super('Point', 'init', x, y);
    this.super('Vectorial', 'init', mod, angle);
  }
}

var particle = new Particle(10.0, 20.0, 5.0, Math.PI / 4.0);
```
Documentação: [http://quasar.site11.com/pulsar/doc/]

Dependencia utilizada pelas animações em JS: Bezier.js [https://github.com/Pomax/bezierjs]
