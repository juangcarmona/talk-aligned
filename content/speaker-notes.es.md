# Notas del ponente (español)

Borrador para que Juan lo reescriba con sus palabras. Es la versión en español de `speaker-notes.md` y la usa el modo ponente cuando la presentación está en español. Cada escena lleva un `##` con su ID y `[click]` marca un paso. Los datos salen de las fuentes de `outline.md`.

## title

Hola, soy Juan, Software Development Engineer en Plain Concepts. En los próximos cuarenta minutos vais a ver una regla de producto, los ficheros que la citan y el momento en que CI se da cuenta de que ha cambiado.

## origin

Esto no empezó como una teoría. Llevábamos tiempo haciendo Spec-Driven Development en Plain Concepts, en proyectos internos y para clientes que no puedo nombrar. Y de forma intuitiva sabíamos que no bastaba con volver a definir lo que queríamos en cada ciclo de SDD. [click] Porque veíamos derivas: lo que la IA pensaba que queríamos frente a lo que de verdad queríamos. Cada iteración obligaba a reestructurar. Retrabajo, una y otra vez. [click] Así que, cuando un cliente nos pidió una prueba de concepto de verdad, dijimos: vamos a hacerlo bien. Buenas bases de arquitectura y el MVP definido lo antes posible. Sí, ágil, todo lo que queráis. Pero ¿qué sabemos del producto que queremos construir? [click] Lo escribimos. Con lo que da el Markdown sencillo: ficheros simples y una estructura de carpetas. Y con lo que da el product engineering: actores, casos de uso, reglas de negocio. Y una definición de dominio, Domain-Driven Design. [click] Y los productos de nuestros clientes empezaron a derivar mucho menos y a avanzar mucho más rápido. Porque cada cambio con SDD era iterativo e incremental: SDD pasaba a entregar una porción de un producto que ya estaba definido.

## noise

Aquí tenéis el ruido en cinco segundos. Tres specs, tres redacciones, dos significados: treinta días desde la compra no es lo mismo que treinta días desde la entrega. [click] Un caso público real: Shillinq, una suite de contabilidad open source. 160 specs de OpenSpec y 273 cambios archivados. SDD en serio. Y la spec oficial del IVA prohíbe un servicio y, 380 líneas más abajo en el mismo fichero, lo exige. Las dos con MUST. Acabó con dos modelos del mismo formulario fiscal, el esquema equivocado en runtime y un agujero de seguridad. Se lo conté a los mantenedores y nadie contestó. [click] Una issue es una foto de un momento concreto. Las specs que nadie consolida van acumulando esas fotos. Hay mecanismos de sincronización, pero el contexto crece más de lo que la IA puede manejar. Y la validación comprueba la forma, no el significado.

## two-truths

Primera decisión: dos fuentes de verdad. La intención, lo que queremos construir, en docs/product. La arquitectura, cómo lo construimos, en docs/architecture. Están relacionadas y se citan, pero nunca se mezclan. [click] En mis propias herramientas está escrito: ProductShape es dueño de la intención de producto, ArcShape de la evidencia de arquitectura y Lighthouse de la baseline de entrega.

## artifacts

La intención no es un documento enorme. Son artefactos pequeños, cada uno con un ID estable: actores, journeys, casos de uso, reglas de negocio, términos, bounded contexts, requisitos funcionales y de calidad, restricciones y comportamiento estructurado. Cada relación se escribe una vez, en un solo artefacto, y el grafo se compila. [click] Aquí tenéis uno real de ArcShape. Su única regla de negocio dice que ArcShape debe citar la definición de producto aprobada y nunca copiarla. La herramienta de arquitectura, definida por una regla que dice que la arquitectura no es dueña de la verdad del producto.

## cite

Ahora, la idea central. La regla vive una sola vez. [click] Todo lo que depende de ella la cita: la sección de restricciones, los conceptos transversales, un backlog de implementación. [click] Una cita es una línea: el ID y un SHA-256 del contenido canónico. [click] ArcShape tiene 370 en 55 ficheros. Nadie reescribe la regla; todos apuntan a ella.

## drift

Mirad qué pasa cuando cambia. Esto es el release contract de ProductShape, el bloque exacto que CI ejecuta en cada release. Una regla, una cita. [click] El plazo pasa de 30 a 14 días. [click] Volvemos a verificar: stale, PRODUCT061, código de salida 1. El job falla. La deriva se detecta en vez de pasar en silencio. [click] Cuatro estados: current; stale; tampered, cuando alguien edita una copia incrustada; y unresolved, cuando el ID no existe. Por defecto, stale es un aviso; el repositorio decide convertirlo en error.

## change

¿Y cómo cambia una decisión? Con un Product Change: un fichero con el cambio y su motivo. La herramienta lo valida como overlay sin tocar la baseline. Una persona lo aprueba. Apply lo escribe, sin crear commits. Después, un PR normal, CI, y una persona hace el merge. [click] Apply no es aceptación; el merge sí. [click] Las herramientas comprueban la estructura. Las skills de IA redactan e interpretan el impacto. Las personas aprueban y hacen el merge. Ninguna herramienta aprueba ni hace merge, nunca.

## dogfooding

¿Funciona? ProductShape se define a sí mismo con su propia metodología: primer commit el 25 de julio, el mismo día que publiqué el artículo, y ahora va por la 0.22.1. ArcShape se definió con ella desde su primera baseline, CHG-INITIAL. Lighthouse también. [click] Y sé de gente que ya usa la metodología, al menos de forma conceptual, y algunos también con los mecanismos de verificación en sus proyectos.

## limits

La parte honesta. El impacto estructural no es impacto semántico. Si dos artefactos aceptados se contradicen, los dos validan. PDaC los pone en el mismo grafo, donde un revisor puede verlos, y eso es mejor que tenerlos a 380 líneas de distancia, pero no es una garantía. [click] Y no está terminado. Cómo encaja con los flujos SDD y con los agentic workflows está todavía por definir.

## url

Aquí está todo, con las fuentes. Preguntas.
