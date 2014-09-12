package org.gex
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

  /* Name of the owner */
  String ownerName

}
