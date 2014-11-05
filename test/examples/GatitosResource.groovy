package org.gex
import javax.ws.rs.Consumes
import javax.ws.rs.GET
import javax.ws.rs.POST
import javax.ws.rs.Path
import javax.ws.rs.PathParam
import javax.ws.rs.Produces
import javax.ws.rs.core.Context
import javax.ws.rs.core.Response
import javax.ws.rs.core.UriInfo



@Path("/cats")
public interface GatitosResource {

  /***
   * @return Response This must be a valid List<Cats> JSON object.
   */
  @GET
  public Response getGatitos();

  /***
   * @return Response This must be a valid Cat JSON object.
   */
  @POST
  public Response postGatitos(@Body Cat cat);


}