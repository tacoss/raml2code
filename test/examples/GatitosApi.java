package org.gex.client.v1;
import retrofit.http.*;
import java.util.List;

import rx.Observable;
import retrofit.mime.TypedFile;
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

  @POST("/v1/cats/{catId}/picture")
  Observable<Cat> postGatitoByIdPicture(
    @Path("catId") String catId,
    @Part("file") TypedFile file);

  @POST("/v1/cats/{catId}/webFormCat")
  Observable<Cat> postGatitopByIdForm(
    @Path("catId") String catId,
    @Field("name") String name);

}
