package org.gex.v1
import groovy.transform.*
import javax.validation.constraints.*
/**
*A cat from Atoms catalog
**/
@CompileStatic
@Canonical
public class Cat implements Serializable {

  /* The unique identifier for a cat */
  @NotNull
  Integer id

  /* Name of the cat */
  @NotNull
  String name

  /* Something to play */
  Map toy

  /* The age of the cat */
  Integer age

  /* The weight of the cat */
  BigDecimal weight

  /* Something to eat */
  Food food

  /* The owner of the cat. */
  Owner owner

  /* Errores al procesar la petición */
  @NotNull
  List<Error> errors

}

class Food implements Serializable {

  /* what the cat eats */
  String name

}
