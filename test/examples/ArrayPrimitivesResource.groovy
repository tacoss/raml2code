package org.gex.v1
import javax.ws.rs.*
import javax.ws.rs.core.*
import org.gex.dto.v1.*

import org.glassfish.jersey.media.multipart.*
import static javax.ws.rs.core.MediaType.APPLICATION_JSON

@Path("/arrayprimitives")
@Consumes(APPLICATION_JSON)
@Produces(APPLICATION_JSON)
interface ArrayPrimitivesResource {

  /***
   * @return Response This must be a valid GenericArray JSON object.
   */
  @POST
  Response postArrayPrimitives(
      List<String> genericarray);


}
