package org.gex.v1
import groovy.transform.*
/**
*A cat from Atoms catalog
**/
@CompileStatic
@Canonical
public class Cat implements Serializable {

  /* The unique identifier for a cat */
  Integer id

  /* Name of the cat */
  String name

  /* Something to play */
  Map toy

  /* Something to eat */
  Food food

  /* The owner of the cat. */
  Owner owner

  /* Errores al procesar la petición */
  List<Error> errors

}

class Food implements Serializable {

  /* what the cat eats */
  String name

}
