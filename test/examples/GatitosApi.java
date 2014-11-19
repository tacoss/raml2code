package org.gex.client.v1;
import retrofit.http.Body;
import retrofit.http.Path;
import retrofit.http.DELETE;
import retrofit.http.GET;
import retrofit.http.POST;
import retrofit.http.PUT;
import java.util.List;

import rx.Observable;
import com.pojos.v1.*;


public interface GatitosAPI {

  @GET("/v1/cats")
  Observable<Cats> getGatitos(
    @Query("search") String search);

  @POST("/v1/cats")
  Observable<Cat> postGatitos(
    @Body Cat cat);

  @GET("/v1/cats/{catId}")
  Observable<Cat> getGatitoById(
    @Path("catId") String catId, 
    @Query("filterBy") String filterBy);

  @PUT("/v1/cats/{catId}")
  Observable<Cat> putGatitoById(
    @Path("catId") String catId, 
    @Body Cat cat);

  @GET("/v1/cats/{catId}/mapping")
  Observable<Cat> getSingleContentTypeMapping(
    @Path("catId") String catId);

}
