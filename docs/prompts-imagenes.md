# Prompts para recursos fotográficos de ANCELCRIS

Durante la mejora de UX/UI **no se generaron imágenes**: la sesión de trabajo no contaba con una
herramienta de generación. El sitio usa solo recursos existentes del repositorio, optimizados en
`img/optimizadas/`. Este documento deja prompts listos para producir recursos editoriales en el futuro.

## Criterios obligatorios

- **Primero, fotos reales.** Para la portada y "Sobre nosotros" lo ideal es fotografiar el local
  real. Los prompts son una alternativa para escenas genéricas.
- **No generar fachadas** ni carteles que puedan confundirse con el local real de ANCELCRIS.
- **No generar envases ni etiquetas.** Los productos de marca se muestran solo con fotos fieles del
  artículo (las de `img/<categoria>/`). En escenas generadas, los productos deben verse sin marcas
  legibles.
- **Sin texto incrustado** en ninguna imagen (los títulos los pone el HTML).
- **Dirección fotográfica común:** luz cálida natural, tonos madera/crema, acentos mostaza y verde
  azulado (paleta del sitio: `#1c1d1f`, `#f2c14e`, `#0d6b61`, `#faf7f0`), poca profundidad de campo,
  encuadre limpio con espacio libre para superponer texto cuando corresponda.
- **Documentar la procedencia** (herramienta, fecha, prompt) en la sección de créditos del README.

## Exportación y conexión con el sitio

1. Exportar el original en la proporción indicada.
2. Generar variantes WebP (calidad ~72) a los anchos indicados y un JPEG de respaldo (calidad ~74).
3. Guardarlas en `img/optimizadas/` con el patrón `<nombre>-<ancho>.webp`.
4. Actualizar el `srcset`, `width` y `height` del `<picture>` correspondiente. **No agregar rutas
   hasta que los archivos existan.**

## 1. Portada (alternativa a la foto del local)

- **Ubicación:** `index.html` → sección `.portada` (hoy usa `img/optimizadas/portada-*`).
- **Proporción / tamaño:** 16:9, original 2400 × 1350 px. Variantes: 640, 1024, 1600 (WebP) y 1280 (JPEG).
- **Composición:** el texto va a la izquierda sobre un degradado oscuro: dejar el tercio izquierdo
  con poco detalle.

> Fotografía editorial de un almacén de barrio argentino por la tarde, estanterías de madera con
> frascos, paquetes y latas sin marcas legibles, mostrador con una balanza antigua y una canasta de
> pan, luz cálida que entra de costado, ambiente ordenado y familiar, poca profundidad de campo,
> tercio izquierdo en penumbra y despejado, sin personas, sin texto, sin carteles, sin logotipos,
> estilo fotográfico realista, tonos crema, madera y mostaza.

## 2. "Sobre nosotros"

- **Ubicación:** `index.html` → `#nosotros` (hoy usa `img/optimizadas/nosotros-*`, derivada de
  `img/interior.jpg`, que parece una foto de banco de imágenes).
- **Recomendación:** reemplazarla por una foto real del interior o del mostrador del local.
- **Proporción / tamaño:** 16:10, original 1600 × 1000 px. Variantes: 640 y 960.

> Detalle de un mostrador de almacén familiar argentino: manos atendiendo detrás del mostrador
> envolviendo un pedido en papel madera, frascos de vidrio con golosinas sueltas, una libreta y un
> lápiz, luz cálida de interior, sin rostros visibles, sin marcas ni texto legibles, fotografía
> realista, tonos cálidos.

## 3. Envíos a domicilio

- **Ubicación:** `index.html` → `#envios` (hoy usa `img/optimizadas/envios-*`, derivada de
  `img/envios.jpg`).
- **Proporción / tamaño:** 16:9, original 1920 × 1080 px. Variantes: 640 y 1280.

> Bolsa de compras de papel madera llena de productos de almacén genéricos (pan, frutas, frascos y
> paquetes sin marcas) apoyada en el umbral de una puerta de casa, luz de tarde, fondo suave,
> sin personas, sin texto ni logotipos, fotografía realista, tonos cálidos.

## 4. Menú de comidas (serie coherente)

- **Ubicación:** `img/menu/<archivo>` (referenciado desde `data/menu.json`). Hoy las fotos tienen
  estilos, fondos y ángulos distintos.
- **Proporción / tamaño:** 4:3, 1200 × 900 px por plato (la tarjeta usa `object-fit: cover`).
- **Importante:** conviene fotografiar los platos reales que prepara la casa de comidas; si se
  generan, mantener el mismo nombre de archivo o actualizar el campo `img` del JSON.

Plantilla común (reemplazar `{plato}`):

> Fotografía cenital a 45 grados de {plato} casero argentino servido en un plato blanco simple
> sobre una mesa de madera clara, mantel de lino crema, luz natural cálida de ventana lateral,
> porción realista, fondo despejado, sin texto, sin logotipos, estilo gastronómico realista y
> coherente para una serie.

| Archivo actual | `{plato}` |
| --- | --- |
| `ñoquis.jpg` | ñoquis de papa con salsa de tomate |
| `pollo_con_papas.jpg` | cuarto de pollo al horno con papas |
| `sandwich_milanesa.jpg` | sándwich de milanesa en pan francés |
| `choripan.jpg` | choripán en pan francés con chimichurri |
| `hamburguesa.jpg` | hamburguesa completa |
| `raviolesConSalsa.jpg` | ravioles con salsa de tomate |
| `pureConMilanesa.jpg` | milanesa con puré de papas |
| `sandwichDeFiambre.jpg` | sándwich de jamón y queso |
| `tortillaDePapas.jpg` | tortilla de papas |
