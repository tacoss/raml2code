package org.gex.v1
import javax.ws.rs.*
import javax.ws.rs.core.*
import java.util.List
import java.util.Map
import org.gex.dto.v1.*

import org.glassfish.jersey.media.multipart.*
import static javax.ws.rs.core.MediaType.APPLICATION_JSON

@Path("/cats")
@Consumes(APPLICATION_JSON)
@Produces(APPLICATION_JSON)
interface GatitosResource {

  /***
   * @return Response This must be a valid Cats JSON object.
   */
  @GET
  Response getGatitos(
    @QueryParam("search")String search);

  /***
   * @return Response This must be a valid Cat JSON object.
   */
  @POST
  Response postGatitos(
    Cat cat);


}
