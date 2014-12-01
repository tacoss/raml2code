package org.gex.v1
import javax.ws.rs.*
import javax.ws.rs.core.*
import org.gex.dto.v1.*

import org.glassfish.jersey.media.multipart.*
import static javax.ws.rs.core.MediaType.APPLICATION_JSON

@Path("/cats/{catId}/webFormCat")
@Consumes(APPLICATION_JSON)
@Produces(APPLICATION_JSON)
interface GatitopByIdFormResource {

  /***
   * @return Response This must be a valid Cat JSON object.
   */
  @POST
  Response postGatitopByIdForm(
    @PathParam("catId")String catId,
    @FormDataParam("name")String name);


}
