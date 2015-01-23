package org.gex.v1
import javax.ws.rs.*
import javax.ws.rs.core.*
import java.util.List
import java.util.Map
import org.gex.dto.v1.*

import org.glassfish.jersey.media.multipart.*
import static javax.ws.rs.core.MediaType.APPLICATION_JSON

@Path("/settings/{key}")
@Consumes(APPLICATION_JSON)
@Produces(APPLICATION_JSON)
interface SettingsResource {

  /***
   * @return Response This must be a valid genericMap JSON object.
   */
  @GET
  Response getSettings(
      @PathParam("key")String key);

  /***
   * @return Response This must be a valid genericMap JSON object.
   */
  @POST
  Response postSettings(
      @PathParam("key")String key,
      Map genericmap);

  /***
   * @return Response This must be a valid GenericArray JSON object.
   */
  @PUT
  Response putSettings(
      @PathParam("key")String key,
      List genericarray);

  /***
   * @return Response This must be a valid  JSON object.
   */
  @DELETE
  Response deleteSettings(
      @PathParam("key")String key);


}
