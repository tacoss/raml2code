package org.gex.v1
import javax.ws.rs.*
import javax.ws.rs.core.*
import org.gex.dto.v1.*

import org.glassfish.jersey.media.multipart.*
import retrofit.mime.TypedFile
import static javax.ws.rs.core.MediaType.APPLICATION_JSON

@Path("/cats/{catId}")
@Consumes(APPLICATION_JSON)
@Produces(APPLICATION_JSON)
interface GatitoByIdResource {

  /***
   * @return Response This must be a valid Cat JSON object.
   */
  @GET
  Response getGatitoById(
    @PathParam("catId")String catId,
    @QueryParam("filterBy")String filterBy);

  /***
   * @return Response This must be a valid Cat JSON object.
   */
  @PUT
  Response putGatitoById(
    @PathParam("catId")String catId,
    Cat cat);


}
