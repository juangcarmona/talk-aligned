# Notas del ponente (español)

Borrador para que Juan lo reescriba con sus palabras. Es la versión en español de `speaker-notes.md` y la usa el modo ponente cuando la presentación está en español. Cada escena lleva un `##` con su ID y `[click]` marca un paso. Los datos salen de las fuentes de `outline.md`.

## title

Hola, soy Juan, Software Development Engineer en Plain Concepts. En los próximos cuarenta minutos vais a ver una regla de producto, los ficheros que la citan y el momento en que CI se da cuenta de que ha cambiado.

## lifecycle

Este es el ciclo de vida del software, de izquierda a derecha: de una idea al mantenimiento. Y aquí estamos hoy: en desarrollo. [click] Aquí es donde va la inversión en IA: asistentes de código, generadores de tests, bots de revisión, copilotos de CI, análisis de incidencias. Desarrollo, DevOps, operaciones. Vuestro terreno. Útil, y cada vez más saturado. [click] Cuanto más se automatiza la implementación, más se mueve el cuello de botella a la izquierda. Al producto: para quién es, qué comportamiento debe existir, qué reglas lo gobiernan. Ahí está la siguiente oportunidad.

## fragments

Y a la izquierda hay un batiburrillo. Decisiones de producto en Jira. Conversaciones en Slack o Teams. Razonamientos largos en documentos, o en alguna página de Confluence. La mitad en reuniones que nadie apuntó. El resto en comentarios de código y en la cabeza de dos ingenieros senior. La IA no tiene un modelo de producto. Tiene fragmentos. Y tiene que reconstruir el significado a partir de esos fragmentos en cada invocación, sin garantía de reconstruir el mismo dos veces.

## direction

Antes de las herramientas, unas palabras sobre las personas y la IA. Ningún equipo de desarrollo puede construir sin rumbo. Un equipo sin rumbo es un barco sin faro: construye a lo loco. Y el vibe coding acelera el desastre: construir a lo loco, muy rápido. [click] Con rumbo es distinto. Una dirección clara nos permite resolver los problemas de hoy sin perder de vista el destino. Cada decisión sigue resolviendo el problema de hoy, pero sin perder de vista el destino, directa o indirectamente. Eso es lo que tiene un equipo que conoce el producto: dirección, una guía, un roadmap.

## sdd-rocks

Y en el lado de la implementación, hoy tenemos un rumbo: SDD. Levantad la mano: ¿quién conoce Spec-Driven Development? ¿Y quién lo usa? SDD mola. Fue la respuesta a la deriva desde el lado de la implementación, y funciona.

## noise

Funciona. Pero ¿qué pasa a escala? Tomemos una regla: la devolución del dinero. Un concepto, una regla. Y con muchas specs, lo que pasa es que la misma regla acaba escrita de formas distintas. [click] Billing: las devoluciones se emiten para compras hechas en los últimos 30 días. Desde la compra. [click] Checkout: 30 días desde la entrega. [click] Support: menos de un mes. Un concepto, una regla, y tres specs que apuntan en tres direcciones distintas. Mirad las palabras: el mismo verbo, devolver; pero compra, entrega o pedido; 30 días o un mes. Cada una fue la foto de lo que alguien quería en ese momento. [click] Eso, a escala, genera ruido. Ahora multiplicad. Ciento sesenta specs, cada una redefinida y reconstruida en su propio ciclo, cada una dejando artefactos que nadie consolida. Algunas apuntan en sentido contrario.

## shillinq

Esto es un caso real: Shillinq, una suite de contabilidad open source hecha con SDD. 160 specs de OpenSpec, 273 cambios archivados. Su spec del IVA prohíbe un servicio y, 380 líneas más abajo en el mismo fichero, lo exige. Las dos con MUST. Lo encontré en una búsqueda rápida, y podéis comprobarlo vosotros mismos: el QR abre el fichero, en estas líneas. Se lo conté a los mantenedores y nadie contestó. [click] Y la validación comprueba la forma, no el significado.

## before

Eso, en las specs. ¿Y en el código? Cada punto es un bloque de tokens de código. A la izquierda, el backlog. Sin definición de producto: esto es lo que tenemos en la cabeza al empezar, una nube. [click] Ticket 101, añadir al carrito. Un ciclo SDD. Se escribe algo, según cómo entendimos el ticket. [click] Siguientes tickets: checkout y pago. Otro ciclo, otra lectura, y casi todo se vuelve a mover. El ticket anterior se reabre. No es solo caos: es incertidumbre. Pide lo mismo dos veces y te sale otro código. [click] Tres tickets más. Se deshace, se rehace, un pequeño incremento. [click] Aquí tiramos tres features. No encajaban con lo que ahora entendíamos. [click] Los últimos tickets. Parece una arquitectura, pero no lo es: piezas sueltas, lo transversal en varios sitios a la vez, unas features que se mezclan con otras. Cinco ciclos reconstruyéndolo todo. [click] Esto es una señal de alarma. El indeterminismo lleva a la deriva, la deriva al retrabajo, y el retrabajo vuelve a empezar el ciclo. Un equipo que no conoce el producto solo ve el ticket que tiene delante.

## not-truth

Así que volvemos al principio: SDD mola. [click] Pero las specs nunca deberían ser nuestra fuente de verdad. [click] Por este bucle. La IA necesita definir y volver a definir: entidades, reglas de negocio, la devolución. Los modelos de lenguaje son indeterministas por naturaleza, así que cada redefinición sale un poco distinta, y esas pequeñas variaciones se van concatenando: eso es la deriva. La deriva se acumula en divergencia: versiones de la misma regla que significan cosas distintas, como en Shillinq. Y con versiones divergentes en su contexto, la IA vuelve a redefinir. Y vuelta a empezar.

## two-truths

Así que SDD se queda, pero con una buena fuente de verdad. Dos, de hecho. Como ingenieros de software sabemos que la arquitectura hay que bocetarla cuanto antes, y luego evoluciona. Con el producto, igual: bocetar pronto lo que queremos, un MVP sobre el que iterar. La intención, qué construimos, en docs/product. La arquitectura, cómo lo construimos, en docs/architecture. Relacionadas, citándose, nunca confundidas. Y SDD se alimenta de ellas: sus specs, sus agentes y su código leen las dos. Esa es su fuente de verdad. [hover en specs, agentes, código: cada fichero cita producto y arquitectura; no todo cita a las dos]

## after

Ahora el mismo sistema con el producto definido, y un backlog que empieza por la arquitectura. El futuro ya se intuye: el contorno está ahí, un poco difuso, antes de escribir nada. [click] Ticket 101: autenticación y autorización. Atraviesa todas las slices. [click] Lo cross-cutting: logs, validación, gestión de errores. [click] El modelo de dominio, domain-driven design: el lenguaje que van a compartir todas las slices. [click] Y la infraestructura: datos, CI/CD. Estos primeros tickets sientan las bases de una vertical slice architecture. [click] Ahora las slices, una a una. Añadir al carrito y checkout: cada una aterriza en su vertical, encima de lo que ya hay. [click] Pago y cancelación. Lo construido no se mueve; los tickets anteriores siguen terminados. [click] Pedir una devolución y aprobarla. Es un pinta y colorea. [click] Catálogo, búsqueda, seguimiento, historial: terminado. [click] La dirección nos da una guía, y la guía nos lleva a la entrega.

## graph

Esto es una tienda pequeña de demo que he definido para esta charla, compilada por ProductShape. Primero los actores: cliente, agente de soporte, servicio de pago. [click] Los journeys que siguen. [click] Los casos de uso: seis comandos y cuatro consultas. [click] Las reglas de negocio y el dominio: términos y bounded contexts. Aquí está nuestro plazo de devolución. [click] Y los requisitos y el comportamiento, los ejemplos Given/When/Then de los que saldrán los tests. Cada relación se escribe una vez, en un solo artefacto. Puedo moverme por él: esto es el producto, no un documento sobre el producto.

## product-code

Zoom out. A la izquierda, el producto. A la derecha, su código: el sistema por vertical slices, una feature por caso de uso. Un caso de uso es su feature. El cliente toca la presentación de todas las features en las que participa. El plazo de devolución vive en el dominio de dos features. Una restricción lo atraviesa todo. Cuando el producto es un grafo, se ve dónde cae cada decisión en el código.

## cite

Ahora la idea central, sobre la tienda de demo. El plazo de devolución vive una sola vez: BR-REFUND-001, 30 días desde la entrega. [click] Todo lo que depende de él lo cita: la spec de OpenSpec, la skill del agente, el código y el test. [click] Cada cita es una línea: pdac:cite, el ID y un digest SHA-256 del contenido canónico de la regla. En Markdown es un comentario; el código y el test citan con un pequeño ledger al lado. [click] Cuatro citas de la regla, cuatro current. Nadie reescribe la regla; todos apuntan a ella.

## drift

Ahora la cambiamos. La misma regla, las mismas cuatro citas, todas current. Verify: seis citas en el repositorio, todas current, exit cero. [click] Finanzas quiere 14 días. Eso es un Product Change, CHG-REFUND-002: cambia la regla y sus dos ejemplos. La herramienta lo valida como overlay, una persona lo aprueba y apply lo escribe. Apply no hace commit: te dice que abras un pull request para que una persona lo acepte. [click] Volvemos a verificar. El digest ya no coincide, así que una a una pasan a stale: la spec, la skill del agente, el código y el test, y también los escenarios end-to-end. PRODUCT061, exit 1. El job falla. La deriva se detecta en vez de colarse. [click] Cuatro estados: current; stale; tampered, cuando alguien edita una copia incrustada; y unresolved, cuando el ID no existe.

## change

¿Y quién decide ese cambio? Tres pasos. La IA propone: un agente puede redactar CHG-REFUND-002, de 30 a 14 días. [click] El código valida: el overlay da 0 errores, y verify nos dice que seis citas se han quedado stale. [click] Y una persona acepta, con el merge. Apply escribe el cambio y no hace ningún commit: abre un pull request para que una persona lo acepte. Ninguna herramienta aprueba ni hace merge, nunca.

## trust

Las citas evitan la deriva en la documentación: specs, skills, código y tests apuntan a la misma regla, y CI sabe cuándo alguno se queda atrás. Pero eso es la documentación. A nivel funcional: ¿lo que se ha implementado es lo que tenía que implementar? [click] Dicho de otra forma: ¿podemos fiarnos de la IA? Ahí es donde entran los tests. Y la pregunta es si esto añade fiabilidad.

## tests

Y esto cambia el testing. Antes, la pirámide de siempre: pocos tests end-to-end, porque eran caros de escribir y, sobre todo, de mantener. [click] Ahora, si producto y arquitectura se mantienen al día y son nuestra fuente de verdad, un agente puede generar los e2e desde los escenarios y mantenerlos. La forma cambia. Los unitarios siguen siendo la base. [click] Alejémonos y volvamos a la devolución, en el grafo. Cambió la regla de negocio: BR-REFUND-001 pasó de 30 a 14 días. Como es un grafo, sé qué comportamientos estructurados ilustran esa regla: SB-REFUND-001, devolución el último día, y SB-REFUND-002, devolución un día tarde. Los dos cambian con ella: el último día pasa del 31 al 15 de marzo, y el día tarde del 1 de abril al 16 de marzo. Los dos están stale, y también los e2e que los siguen. [hover en la regla: se iluminan los dos comportamientos y todos sus tests; hover en cada comportamiento: solo sus tests] SB-CANCEL-001 no cambia: ilustra otra regla, y sigue current. Y aquí abajo, el ciclo de vida: la definición de producto puede, y debe, ir directamente a la validación. No tengo que mirar todos los comportamientos ni todos los e2e. Solo los que alcanza el cambio. [click] Esa es la cadena: cambia el producto, cambia el comportamiento estructurado, los e2e que guía quedan stale, y como están stale sé que tengo que cambiarlos. Eso nos permite mantener la implementación de los e2e de forma automatizada, con IA y dirigida por el producto.

## closing

Para cerrar. Robert C. Martin, Uncle Bob, el autor de Clean Code, dijo esto en julio: «My current strategy is to not read any of the code written by my agents». Generó bastante revuelo. [click] Entonces, si ya no leemos el código, ¿qué leemos? [click] La intención. El producto y la arquitectura, nuestras dos fuentes de verdad, y los tests que los siguen. Eso es lo que tenemos que mantener vivo, citar y verificar. [click] Y siendo honestos: las herramientas comprueban la forma. Si dos artefactos aceptados se contradicen, los dos validan. El significado sigue siendo nuestro trabajo.

## url

Aquí está todo, con las fuentes. Preguntas.
