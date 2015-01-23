package org.gex.v1
import javax.ws.rs.*
import javax.ws.rs.core.*
import java.util.List
import java.util.Map
import org.gex.dto.v1.*

import org.glassfish.jersey.media.multipart.*
import static javax.ws.rs.core.MediaType.APPLICATION_JSON

@Path("/cats/{catId}/picture")
@Consumes(APPLICATION_JSON)
@Produces(APPLICATION_JSON)
interface GatitoByIdPictureResource {

  /***
   * @return Response This must be a valid Cat JSON object.
   */
  @POST
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  Response postGatitoByIdPicture(
    @PathParam("catId")String catId,
    @FormDataParam("file")InputStream file,
    @FormDataParam("file")FormDataContentDisposition fileData);


}
